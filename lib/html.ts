/**
 * Splits rendered story HTML after the Nth closing </p> so a mid-article ad
 * can sit between two prose blocks instead of being jammed in with a regex.
 * Returns the whole thing as `lead` (and an empty `rest`) when the story is
 * too short to interrupt.
 */
export function splitAfterParagraph(
  html: string,
  paragraphs: number,
): { lead: string; rest: string } {
  const CLOSE = "</p>";
  let index = -1;

  for (let i = 0; i < paragraphs; i++) {
    const next = html.indexOf(CLOSE, index + 1);
    if (next === -1) return { lead: html, rest: "" };
    index = next;
  }

  const cut = index + CLOSE.length;
  const rest = html.slice(cut).trim();

  // Don't strand a couple of sentences below the ad.
  if (rest.length < 600) return { lead: html, rest: "" };

  return { lead: html.slice(0, cut), rest };
}
