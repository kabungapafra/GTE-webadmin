/** Shared bearer-token check for every route under src/app/api/public/*. */
export function isAuthorizedPublicRequest(request: Request): boolean {
  const expected = process.env.PUBLIC_API_TOKEN;
  const auth = request.headers.get("authorization");
  return Boolean(expected) && auth === `Bearer ${expected}`;
}

/**
 * Uploaded images (src/app/api/uploads/route.ts) are only ever served from
 * this app's own /uploads/<file> route — never copied into the website repo.
 * Legacy asset paths like "/assets/foo.jpg" belong to the WEBSITE's own
 * public/ directory and must stay relative to *its* domain, so only
 * "/uploads/..." paths get rewritten to a fully-qualified admin URL here.
 */
export function absolutizeUploadUrl(path: string | null | undefined): string | undefined {
  if (!path) return undefined;
  if (!path.startsWith("/uploads/")) return path;
  const origin = process.env.ADMIN_ORIGIN ?? "http://localhost:3000";
  return `${origin}${path}`;
}
