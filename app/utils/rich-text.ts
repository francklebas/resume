/** Échappe le HTML puis convertit les segments **gras** en <strong> (seul balisage supporté dans les bullets). */
export function richText(text: string): string {
  const escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
  return escaped.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
}
