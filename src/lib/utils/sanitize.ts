/**
 * Strip all HTML tags from user-supplied text.
 * Prevents XSS when storing plain-text fields.
 */
export function stripHtml(text: string): string {
  return text.replace(/<[^>]*>/g, "");
}
