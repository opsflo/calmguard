const GITHUB_API = 'https://api.github.com';

/**
 * GitHub REST API fetch wrapper — server-side only.
 * Injects auth headers (when token provided) and the required GitHub API version header.
 * Works without token for public repos (unauthenticated — lower rate limits).
 *
 * NEVER call this from client components — GITHUB_TOKEN must stay server-side.
 *
 * @param path - API path (e.g. "/repos/owner/repo/contents/file.json")
 * @param options - Standard fetch options plus optional `token` field
 */
export function githubFetch(
  path: string,
  options: RequestInit & { token?: string } = {},
): Promise<Response> {
  const { token, ...rest } = options;
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'Content-Type': 'application/json',
    ...((rest.headers as Record<string, string>) ?? {}),
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return fetch(`${GITHUB_API}${path}`, {
    ...rest,
    headers,
  });
}
