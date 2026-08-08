import { serverSupabaseUser } from '#supabase/server'

// Extrait le contenu structuré d'un ancien CV (PDF, Word ou OpenDocument) via Mistral, pour pré-remplir l'éditeur.
export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user) throw createError({ statusCode: 401, message: 'Non authentifié' })

  const body = await readBody<{ file?: string, filename?: string }>(event)
  if (!body.file) throw createError({ statusCode: 400, message: 'Aucun fichier reçu' })

  const upload = parseCvUpload(body.file, body.filename)

  await enforceAiUsageLimit(event, 'import')

  const content = await extractCvFromUpload(upload)
  return { content }
})
