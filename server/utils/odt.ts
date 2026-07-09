import JSZip from 'jszip'

function decodeXmlEntities(text: string): string {
  return text
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCodePoint(Number.parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(Number.parseInt(dec, 10)))
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, '\'')
    .replace(/&amp;/g, '&')
}

// ODT n'a pas d'outil d'extraction équivalent à mammoth : on déballe le zip et on lit
// les paragraphes/titres de content.xml directement (assez pour de l'extraction texte).
export async function extractOdtText(arrayBuffer: ArrayBuffer): Promise<string> {
  const zip = await JSZip.loadAsync(arrayBuffer)
  const contentFile = zip.file('content.xml')
  if (!contentFile) {
    throw createError({ statusCode: 422, statusMessage: 'Fichier .odt invalide (content.xml introuvable)' })
  }
  const xml = await contentFile.async('string')

  const paragraphs: string[] = []
  const blockRegex = /<text:(p|h)[^>]*>([\s\S]*?)<\/text:\1>/g
  let match: RegExpExecArray | null
  // eslint-disable-next-line no-cond-assign
  while ((match = blockRegex.exec(xml))) {
    const raw = (match[2] ?? '')
      .replace(/<text:tab\s*\/>/g, '\t')
      .replace(/<text:line-break\s*\/>/g, '\n')
      .replace(/<[^>]+>/g, '')
    const text = decodeXmlEntities(raw).trim()
    if (text) paragraphs.push(text)
  }
  return paragraphs.join('\n')
}
