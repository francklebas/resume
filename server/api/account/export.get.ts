import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

// Exporte toutes les données de l'utilisateur (CV + historique de versions) en JSON.
export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Non authentifié' })

  const client = await serverSupabaseClient(event)

  const { data: cvs, error: cvsError } = await client.from('cvs').select('*')
  if (cvsError) throw createError({ statusCode: 500, statusMessage: cvsError.message })

  const { data: snapshots, error: snapshotsError } = await client.from('cv_snapshots').select('*')
  if (snapshotsError) throw createError({ statusCode: 500, statusMessage: snapshotsError.message })

  setHeaders(event, {
    'Content-Type': 'application/json',
    'Content-Disposition': 'attachment; filename="mes-donnees.json"',
  })

  return {
    exported_at: new Date().toISOString(),
    account_email: user.email,
    cvs,
    cv_snapshots: snapshots,
  }
})
