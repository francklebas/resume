import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import type { CvContent, CvRow } from '~/types/cv'

// Met à jour un CV existant de l'utilisateur avec des informations supplémentaires fournies en
// texte libre (ex. nouvelle certification), via Mistral. Crée toujours une nouvelle variante,
// le CV source n'est jamais modifié en place.
export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Non authentifié' })

  const body = await readBody<{ sourceCvId?: string, instructions?: string }>(event)
  const sourceCvId = body.sourceCvId
  const instructions = body.instructions?.trim()
  if (!sourceCvId) throw createError({ statusCode: 400, statusMessage: 'CV source manquant' })
  if (!instructions) throw createError({ statusCode: 400, statusMessage: 'Décris ce qu\'il faut ajouter ou changer' })

  await enforceAiUsageLimit(event, 'update')

  const client = await serverSupabaseClient(event)

  const { data: source, error: sourceError } = await client
    .from('cvs')
    .select('content')
    .eq('id', sourceCvId)
    .single()
  if (sourceError || !source) throw createError({ statusCode: 404, statusMessage: 'CV source introuvable' })

  const { variantName, content } = await updateCv(source.content as unknown as CvContent, instructions)

  const slug = await uniqueCvSlug(client, variantName)

  const { data: created, error: insertError } = await client
    .from('cvs')
    .insert({ slug, name: variantName, content } as never)
    .select()
    .single()
  if (insertError || !created) {
    throw createError({ statusCode: 500, statusMessage: insertError?.message ?? 'Création impossible' })
  }

  return created as unknown as CvRow
})
