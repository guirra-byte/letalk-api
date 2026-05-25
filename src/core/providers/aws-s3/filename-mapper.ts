export function normalizeFilename(filename: string): string {
  const basename = filename.trim().replace(/^.*[/\\]/, "");
  const sanitized = basename
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9._-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");

  if (!sanitized) {
    throw new Error("filename is required");
  }

  return sanitized;
}
