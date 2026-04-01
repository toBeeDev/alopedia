/** Generate a URL-safe slug from Korean/English title + short unique suffix */
export function slugify(title: string, shortId: string): string {
  const base = title
    .trim()
    .toLowerCase()
    // Replace whitespace with hyphens
    .replace(/\s+/g, "-")
    // Remove characters that aren't Korean, alphanumeric, or hyphens
    .replace(/[^\uAC00-\uD7A3\u3131-\u3163a-z0-9-]/g, "")
    // Collapse multiple hyphens
    .replace(/-+/g, "-")
    // Trim hyphens from edges
    .replace(/^-+|-+$/g, "");

  // Append short ID suffix for uniqueness (first 6 chars of UUID)
  const suffix = shortId.replace(/-/g, "").slice(0, 6);
  return base ? `${base}-${suffix}` : suffix;
}
