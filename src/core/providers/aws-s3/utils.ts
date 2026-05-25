export function isHttpEndpoint(endpoint: string | undefined): boolean {
  if (!endpoint?.trim()) return false;
  return /^https?:\/\//i.test(endpoint.trim());
}

export function joinPathSegments(...segments: Array<string | number>): string {
  return segments
    .map((segment) => String(segment).trim().replace(/^\/+|\/+$/g, ""))
    .filter(Boolean)
    .join("/");
}

export function normalizeS3Key(key: string): string {
  return key.replace(/^\/+/, "").replace(/\/+/g, "/");
}
