import { serverSupabaseUser } from '#supabase/server'

const MAX_SIZE_BYTES = 15 * 1024 * 1024 // 15 Mo

const WORD_MIME = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
const ODT_MIME = 'application/vnd.oasis.opendocument.text'

// Extrait le contenu structuré d'un ancien CV (PDF, Word ou OpenDocument) via Mistral, pour pré-remplir l'éditeur.
export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Non authentifié' })

  const body = await readBody<{ file?: string, filename?: string }>(event)
  const dataUri = body.file
  if (!dataUri) throw createError({ statusCode: 400, statusMessage: 'Aucun fichier reçu' })

  const match = dataUri.match(/^data:([^;]+);base64,(.+)$/)
  if (!match) throw createError({ statusCode: 400, statusMessage: 'Fichier invalide' })
  const [, mime, base64] = match as unknown as [string, string, string]

  if (base64.length * 0.75 > MAX_SIZE_BYTES) {
    throw createError({ statusCode: 413, statusMessage: 'Fichier trop volumineux (15 Mo max)' })
  }

  if (mime === 'application/pdf') {
    const content = await extractCvFromDocument({ pdfDataUri: dataUri, filename: body.filename })
    return { content }
  }

  if (mime === WORD_MIME || mime === ODT_MIME) {
    const binary = Uint8Array.from(atob(base64), c => c.charCodeAt(0))
    const text = mime === WORD_MIME
      ? await extractDocxText(binary.buffer)
      : await extractOdtText(binary.buffer)
    if (!text.trim()) {
      throw createError({ statusCode: 422, statusMessage: 'Impossible de lire le contenu de ce document' })
    }
    const content = await extractCvFromDocument({ text })
    return { content }
  }

  throw createError({ statusCode: 415, statusMessage: 'Format non supporté — utilise un PDF, un fichier Word (.docx) ou OpenDocument (.odt)' })
})
