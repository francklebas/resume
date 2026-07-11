import { serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server'

// Supprime définitivement le compte ; la suppression cascade en DB (cvs, cv_snapshots, ai_usage).
export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Non authentifié' })

  const client = serverSupabaseServiceRole(event)
  const { error } = await client.auth.admin.deleteUser(user.id)
  if (error) throw createError({ statusCode: 500, statusMessage: error.message })

  return { deleted: true }
})
