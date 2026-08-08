import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import type { CvContent, CvRow } from '~/types/cv'

// Génère une variante de CV adaptée à une offre d'emploi (texte ou image), via Mistral.
// Source adaptée : le CV joint à la demande (PDF/Word/ODT) s'il y en a un, sinon le CV de base de l'utilisateur.
export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user) throw createError({ statusCode: 401, message: 'Non authentifié' })

  const body = await readBody<{ text?: string, image?: string, sourceFile?: string, sourceFilename?: string }>(event)
  const text = body.text?.trim() || undefined
  const image = body.image || undefined
  if (!text && !image) {
    throw createError({ statusCode: 400, message: 'Colle le texte ou une capture de l\'annonce' })
  }

  const upload = body.sourceFile ? parseCvUpload(body.sourceFile, body.sourceFilename) : null

  // Un CV joint = deux appels Mistral (extraction + adaptation), donc deux crédits.
  if (upload) await enforceAiUsageLimit(event, 'import')
  await enforceAiUsageLimit(event, 'tailor')

  const client = await serverSupabaseClient(event)

  let sourceContent: CvContent
  if (upload) {
    sourceContent = await extractCvFromUpload(upload)
  }
  else {
    const { data: base, error: baseError } = await client
      .from('cvs')
      .select('content')
      .eq('is_base', true)
      .single()
    if (baseError || !base) throw createError({ statusCode: 404, message: 'CV de base introuvable' })
    sourceContent = base.content as unknown as CvContent
  }

  const { variantName, matchScore, matchSummary, content } = await tailorCv(sourceContent, { text, image })

  const slug = await uniqueCvSlug(client, variantName)

  const { data: created, error: insertError } = await client
    .from('cvs')
    .insert({ slug, name: variantName, content, match_score: matchScore, match_summary: matchSummary } as never)
    .select()
    .single()
  if (insertError || !created) {
    throw createError({ statusCode: 500, message: insertError?.message ?? 'Création impossible' })
  }

  return created as unknown as CvRow
})
