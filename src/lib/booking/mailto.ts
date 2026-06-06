/** Build a mailto URL that opens the user's email client with a pre-filled draft. */
export function buildMailtoUrl(
  to: string,
  subject: string,
  body: string,
): string {
  const encodedTo = encodeURIComponent(to.trim());
  const encodedSubject = encodeURIComponent(subject);
  const encodedBody = encodeURIComponent(body);
  return `mailto:${encodedTo}?subject=${encodedSubject}&body=${encodedBody}`;
}
