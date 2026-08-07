import type { CvContent } from '~/types/cv'

const MAX_SIZE_BYTES = 15 * 1024 * 1024 // 15 Mo

const PDF_MIME = 'application/pdf'
const WORD_MIME = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
const ODT_MIME = 'application/vnd.oasis.opendocument.text'

export interface CvUpload {
  mime: string
  base64: string
  dataUri: string
  filename?: string
}

// Valide le data URI (format, type, taille) — à appeler AVANT enforceAiUsageLimit, pour ne pas
// consommer un crédit sur un fichier qu'on refusera de toute façon.
export function parseCvUpload(dataUri: string, filename?: string): CvUpload {
  const match = dataUri.match(/^data:([^;]+);base64,(.+)$/)
  if (!match) throw createError({ statusCode: 400, statusMessage: 'Fichier invalide' })
  const [, mime, base64] = match as unknown as [string, string, string]

  if (mime !== PDF_MIME && mime !== WORD_MIME && mime !== ODT_MIME) {
    throw createError({
      statusCode: 415,
      statusMessage: 'Format non supporté — utilise un PDF, un fichier Word (.docx) ou OpenDocument (.odt)',
    })
  }

  if (base64.length * 0.75 > MAX_SIZE_BYTES) {
    throw createError({ statusCode: 413, statusMessage: 'Fichier trop volumineux (15 Mo max)' })
  }

  return { mime, base64, dataUri, filename }
}

// Extrait le contenu structuré du CV via Mistral (opération payante).
export async function extractCvFromUpload(upload: CvUpload): Promise<CvContent> {
  if (upload.mime === PDF_MIME) {
    return extractCvFromDocument({ pdfDataUri: upload.dataUri, filename: upload.filename })
  }

  const binary = Uint8Array.from(atob(upload.base64), c => c.charCodeAt(0))
  const text = upload.mime === WORD_MIME
    ? await extractDocxText(binary.buffer)
    : await extractOdtText(binary.buffer)
  if (!text.trim()) {
    throw createError({ statusCode: 422, statusMessage: 'Impossible de lire le contenu de ce document' })
  }
  return extractCvFromDocument({ text })
}
