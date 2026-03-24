import { NextResponse } from "next/server";
import { isApiKeyValid } from "@/lib/apiKeys/validateApiKey";

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ valid: false }, { status: 400 });
  }

  const key = typeof request.headers.get("x-api-key") === "string" ? request.headers.get("x-api-key").trim() : "";
  if (!key) {
    return NextResponse.json({ valid: false }, { status: 400 });
  }

  const { valid, error } = await isApiKeyValid(key);

  if (error) {
    console.error("github-summarizer Supabase error", error);
    return NextResponse.json({ valid: false }, { status: 500 });
  }

  async function getReadmeContent(githubUrl) {
    try {
      // Parse the repo owner and name from the githubUrl
      // Support only https://github.com/:owner/:repo or https://github.com/:owner/:repo/...
      const match = githubUrl.match(/^https:\/\/github\.com\/([^/]+)\/([^/]+)(\/|$)/i);
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

  const githubUrl = typeof body.githubUrl === "string" ? body.githubUrl.trim() : "";
  if (!githubUrl) {
    console.error("github-summarizer: missing githubUrl in request body");
    return NextResponse.json({ message: "Error in GitHub Summarizer" }, { status: 500 });
  }

  try {
    const readmeContentResult = await getReadmeContent(githubUrl);
    // console.log("GitHub Summarizer readmeContent:", readmeContentResult);

    if (readmeContentResult && !readmeContentResult.error) {
      const { content } = readmeContentResult;

      const { summarizeReadme } = await import("@/lib/github-summarizer/chain");
      const summaryResult = await summarizeReadme(content);

      return NextResponse.json(
        { summary: summaryResult.summary, cool_facts: summaryResult.cool_facts },
        { status: 200 }
      );

    } else {
      console.error("github-summarizer: readme fetch error", readmeContentResult.error);
      return NextResponse.json({ message: "Error in GitHub Summarizer (fetch)" }, { status: 500 });
    }
  } catch (err) {
    console.error("github-summarizer: unexpected error", err);
    return NextResponse.json({ message: "Error in GitHub Summarizer" }, { status: 500 });
  }

}
