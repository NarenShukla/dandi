import { NextResponse } from "next/server";
import {
  apiKeyMessages,
  incrementApiKeyUsageAndCheckLimit,
  validateApiKey,
} from "@/lib/apiKeys/validateApiKey";

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

  async function getReadmeContent(url) {
    try {
      // Parse the repo owner and name from the githubUrl
      // Support only https://github.com/:owner/:repo or https://github.com/:owner/:repo/...
      const match = url.match(/^https:\/\/github\.com\/([^/]+)\/([^/]+)(\/|$)/i);
      if (!match) {
        return { error: "Invalid GitHub repo URL", content: null };
      }
      const owner = match[1];
      const repo = match[2];

      // Use the GitHub API to fetch the README
      // No authentication - subject to public unauth throttling
      const apiUrl = `https://api.github.com/repos/${owner}/${repo}/readme`;

      const res = await fetch(apiUrl, {
        headers: {
          Accept: "application/vnd.github.v3.raw",
        },
      });

      if (!res.ok) {
        return { error: `Failed to fetch README: ${res.status} ${res.statusText}`, content: null };
      }

      const content = await res.text();
      return { content, error: null };
    } catch (err) {
      return { error: err.message || "Unknown error", content: null };
    }
  }

  try {
    const readmeContentResult = await getReadmeContent(githubUrl);

    if (readmeContentResult && !readmeContentResult.error) {
      const { content } = readmeContentResult;

      const { summarizeReadme } = await import("@/lib/github-summarizer/chain");
      const summaryResult = await summarizeReadme(content);

      return NextResponse.json(
        { summary: summaryResult.summary, cool_facts: summaryResult.cool_facts },
        { status: 200 }
      );
    }

    console.error("github-summarizer: readme fetch error", readmeContentResult.error);
    return NextResponse.json({ message: "Error in GitHub Summarizer (fetch)" }, { status: 500 });
  } catch (err) {
    console.error("github-summarizer: unexpected error", err);
    return NextResponse.json({ message: "Error in GitHub Summarizer" }, { status: 500 });
  }
}
