const GITHUB_API = 'https://api.github.com';

/**
 * GitHub REST API fetch wrapper — server-side only.
 * Injects auth headers and the required GitHub API version header.
 *
 * NEVER call this from client components — GITHUB_TOKEN must stay server-side.
 *
 * @param path - API path (e.g. "/repos/owner/repo/contents/file.json")
 * @param options - Standard fetch options plus required `token` field
 */
export function githubFetch(
  path: string,
  options: RequestInit & { token: string },
): Promise<Response> {
  const { token, ...rest } = options;
  return fetch(`${GITHUB_API}${path}`, {
    ...rest,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'Content-Type': 'application/json',
      ...((rest.headers as Record<string, string>) ?? {}),
    },
  });
}
