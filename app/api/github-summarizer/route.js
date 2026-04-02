import { NextResponse } from "next/server";
import {
  apiKeyMessages,
  incrementApiKeyUsageAndCheckLimit,
  validateApiKey,
} from "@/lib/apiKeys/validateApiKey";
import {
  fetchGithubRepoInfo,
  parseGithubRepoUrl,
} from "@/lib/github-summarizer/get-repo-info";

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON body" }, { status: 400 });
  }

  const key = typeof request.headers.get("x-api-key") === "string" ? request.headers.get("x-api-key").trim() : "";
  if (!key) {
    return NextResponse.json({ message: apiKeyMessages.invalid }, { status: 400 });
  }

  const githubUrl = typeof body.githubUrl === "string" ? body.githubUrl.trim() : "";
  if (!githubUrl) {
    console.error("github-summarizer: missing githubUrl in request body");
    return NextResponse.json({ message: "Missing or invalid githubUrl in request body" }, { status: 400 });
  }

  const validated = await validateApiKey(key);
  if (!validated.ok) {
    if (validated.code === "unavailable") {
      return NextResponse.json({ message: validated.message }, { status: 503 });
    }
    if (validated.code === "error") {
      console.error("github-summarizer validate API key", validated.error);
      return NextResponse.json({ message: validated.message }, { status: 500 });
    }
    return NextResponse.json({ message: validated.message }, { status: 401 });
  }

  const usageResult = await incrementApiKeyUsageAndCheckLimit(key);
  if (!usageResult.ok) {
    if (usageResult.code === "rate_limited") {
      return NextResponse.json({ message: usageResult.message, error: "rate limit" }, { status: 429 });
    }
    if (usageResult.code === "unavailable") {
      return NextResponse.json({ message: usageResult.message }, { status: 503 });
    }
    if (usageResult.code === "error") {
      console.error("github-summarizer usage increment", usageResult.error);
      return NextResponse.json({ message: usageResult.message }, { status: 500 });
    }
    return NextResponse.json({ message: usageResult.message }, { status: 500 });
  }

  const parsed = parseGithubRepoUrl(githubUrl);
  if (!parsed) {
    return NextResponse.json({ message: "Invalid GitHub repo URL" }, { status: 400 });
  }

  try {
    const repoFetch = await fetchGithubRepoInfo(parsed.owner, parsed.repo);

    if (repoFetch && !repoFetch.error) {
      const { content, meta } = repoFetch;

      const { summarizeReadme } = await import("@/lib/github-summarizer/chain");
      const summaryResult = await summarizeReadme(content);

      return NextResponse.json(
        {
          summary: summaryResult.summary,
          cool_facts: summaryResult.cool_facts,
          stars: meta.stars,
          latest_version: meta.latest_version,
          website_url: meta.website_url,
          license: meta.license,
        },
        { status: 200 }
      );
    }

    console.error("github-summarizer: repo fetch error", repoFetch.error);
    return NextResponse.json({ message: "Error in GitHub Summarizer (fetch)" }, { status: 500 });
  } catch (err) {
    console.error("github-summarizer: unexpected error", err);
    return NextResponse.json({ message: "Error in GitHub Summarizer" }, { status: 500 });
  }
}
