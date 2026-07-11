import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import { slugify } from '~/utils/slugify'
import type { CvContent, CvRow } from '~/types/cv'

// Génère une variante de CV adaptée à une offre d'emploi (texte ou image), via Mistral,
// à partir du CV de base de l'utilisateur.
export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Non authentifié' })

  const body = await readBody<{ text?: string, image?: string }>(event)
  const text = body.text?.trim() || undefined
  const image = body.image || undefined
  if (!text && !image) {
    throw createError({ statusCode: 400, statusMessage: 'Colle le texte ou une capture de l\'annonce' })
  }

  await enforceAiUsageLimit(event, 'tailor')

  const client = await serverSupabaseClient(event)
  const { data: base, error: baseError } = await client
    .from('cvs')
    .select('content')
    .eq('is_base', true)
    .single()
  if (baseError || !base) throw createError({ statusCode: 404, statusMessage: 'CV de base introuvable' })

  const { variantName, matchScore, matchSummary, content } = await tailorCv(base.content as unknown as CvContent, { text, image })

  const { data: existing } = await client.from('cvs').select('slug')
  const taken = new Set((existing ?? []).map(c => c.slug))
  const baseSlug = slugify(variantName) || 'variante'
  let slug = baseSlug
  let i = 2
  while (taken.has(slug)) {
    slug = `${baseSlug}-${i}`
    i += 1
  }

  const { data: created, error: insertError } = await client
    .from('cvs')
    .insert({ slug, name: variantName, content, match_score: matchScore, match_summary: matchSummary } as never)
    .select()
    .single()
  if (insertError || !created) {
    throw createError({ statusCode: 500, statusMessage: insertError?.message ?? 'Création impossible' })
  }

  return created as unknown as CvRow
})
