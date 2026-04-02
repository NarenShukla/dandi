/**
 * Parse https://github.com/:owner/:repo URLs.
 * @param {string} url
 * @returns {{ owner: string; repo: string } | null}
 */
export function parseGithubRepoUrl(url) {
  const match = url.match(/^https:\/\/github\.com\/([^/]+)\/([^/]+)(\/|$)/i);
  if (!match) return null;
  return { owner: match[1], repo: match[2] };
}

function githubHeaders(accept = "application/vnd.github.v3+json") {
  const headers = { Accept: accept };
  const token = process.env.GITHUB_TOKEN;
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

/**
 * @param {Record<string, unknown>} repoJson
 */
function buildRepoMeta(repoJson) {
  const homepage =
    typeof repoJson.homepage === "string" && repoJson.homepage.trim()
      ? repoJson.homepage.trim()
      : null;
  const licenseObj = repoJson.license && typeof repoJson.license === "object" ? repoJson.license : null;
  const license =
    (licenseObj && typeof licenseObj.spdx_id === "string" && licenseObj.spdx_id
      ? licenseObj.spdx_id
      : null) ||
    (licenseObj && typeof licenseObj.name === "string" && licenseObj.name ? licenseObj.name : null);

  return {
    stars: typeof repoJson.stargazers_count === "number" ? repoJson.stargazers_count : 0,
    website_url: homepage,
    license,
  };
}

/**
 * @param {Response} releaseRes
 * @param {Response} tagsRes
 */
async function resolveLatestVersion(releaseRes, tagsRes) {
  if (releaseRes.ok) {
    const data = await releaseRes.json();
    const tag = typeof data.tag_name === "string" ? data.tag_name : null;
    const name = typeof data.name === "string" ? data.name : null;
    return tag || name || null;
  }
  if (tagsRes.ok) {
    const tags = await tagsRes.json();
    if (Array.isArray(tags) && tags[0] && typeof tags[0].name === "string") return tags[0].name;
  }
  return null;
}

/**
 * Fetches repo metadata, README, and latest version (release or tag) in parallel.
 * @param {string} owner
 * @param {string} repo
 * @returns {Promise<{ error: string; content: null; meta?: never } | { error: null; content: string; meta: { stars: number; latest_version: string | null; website_url: string | null; license: string | null } }>}
 */
export async function fetchGithubRepoInfo(owner, repo) {
  try {
    const o = encodeURIComponent(owner);
    const r = encodeURIComponent(repo);
    const base = `https://api.github.com/repos/${o}/${r}`;
    const headersJson = githubHeaders();
    const headersRaw = githubHeaders("application/vnd.github.v3.raw");

    const [repoRes, readmeRes, releaseRes, tagsRes] = await Promise.all([
      fetch(base, { headers: headersJson }),
      fetch(`${base}/readme`, { headers: headersRaw }),
      fetch(`${base}/releases/latest`, { headers: headersJson }),
      fetch(`${base}/tags?per_page=1`, { headers: headersJson }),
    ]);

    if (!repoRes.ok) {
      return {
        error: `Failed to fetch repo: ${repoRes.status} ${repoRes.statusText}`,
        content: null,
      };
    }

    const repoJson = await repoRes.json();
    const metaBase = buildRepoMeta(repoJson);

    if (!readmeRes.ok) {
      return {
        error: `Failed to fetch README: ${readmeRes.status} ${readmeRes.statusText}`,
        content: null,
      };
    }

    const content = await readmeRes.text();
    const latest_version = await resolveLatestVersion(releaseRes, tagsRes);

    return {
      error: null,
      content,
      meta: {
        ...metaBase,
        latest_version,
      },
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { error: message, content: null };
  }
}
