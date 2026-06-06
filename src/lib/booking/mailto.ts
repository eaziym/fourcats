/** Build a mailto URL that opens the user's email client with a pre-filled draft. */
export function buildMailtoUrl(
  to: string,
  subject: string,
  body: string,
): string {
  const params = new URLSearchParams();
  params.set("subject", subject);
  params.set("body", body);
  return `mailto:${encodeURIComponent(to.trim())}?${params.toString()}`;
}
