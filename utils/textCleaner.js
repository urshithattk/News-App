export function cleanText(t = '') {
  return t
    .replace(/\s+/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .trim()
    .slice(0, 1000); // keep it short-ish
}
