/**
 * 최소 GitHub Contents API 래퍼.
 * - 파일 한 개 GET / PUT (commit) 만 지원하면 portfolio CRUD 에 충분.
 * - 외부 의존성 (octokit) 없이 fetch 사용.
 *
 * 필요한 환경변수
 *   GITHUB_TOKEN   — repo scope PAT
 *   GITHUB_OWNER   — "didrod205"
 *   GITHUB_REPO    — "dabin"
 *   GITHUB_BRANCH  — "main" (기본값)
 */

const API = "https://api.github.com";

function cfg() {
  const token = process.env.GITHUB_TOKEN;
  const owner = process.env.GITHUB_OWNER;
  const repo = process.env.GITHUB_REPO;
  const branch = process.env.GITHUB_BRANCH || "main";
  if (!token || !owner || !repo) {
    throw new Error(
      "GitHub backend not configured. Set GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO."
    );
  }
  return { token, owner, repo, branch };
}

function authHeader(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28"
  } as const;
}

export async function getJsonFile<T>(path: string): Promise<{
  data: T;
  sha: string;
} | null> {
  const { token, owner, repo, branch } = cfg();
  const url = `${API}/repos/${owner}/${repo}/contents/${encodeURI(path)}?ref=${encodeURIComponent(branch)}`;
  const res = await fetch(url, { headers: authHeader(token), cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`GitHub GET ${path} failed: ${res.status}`);
  const json = (await res.json()) as { content: string; sha: string; encoding: string };
  const buf = Buffer.from(json.content, json.encoding === "base64" ? "base64" : "utf8");
  const data = JSON.parse(buf.toString("utf8")) as T;
  return { data, sha: json.sha };
}

export async function putJsonFile(
  path: string,
  data: unknown,
  message: string,
  prevSha?: string
): Promise<{ sha: string }> {
  const { token, owner, repo, branch } = cfg();
  const body = {
    message,
    branch,
    content: Buffer.from(JSON.stringify(data, null, 2) + "\n", "utf8").toString("base64"),
    sha: prevSha
  };
  const url = `${API}/repos/${owner}/${repo}/contents/${encodeURI(path)}`;
  const res = await fetch(url, {
    method: "PUT",
    headers: { ...authHeader(token), "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GitHub PUT ${path} failed: ${res.status} ${text}`);
  }
  const json = (await res.json()) as { content: { sha: string } };
  return { sha: json.content.sha };
}
