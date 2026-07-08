import { serverSupabaseServiceRole } from '#supabase/server'
import type { CvContent } from '~/types/cv'

// Données du CV pour la page /print, authentifiées par token HMAC (pas de session
// Supabase dans Puppeteer) — d'où le client service-role qui contourne la RLS.
export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')!
  const { token } = getQuery(event)

  if (typeof token !== 'string' || !(await verifyPrintToken(slug, token)))
    throw createError({ statusCode: 401, statusMessage: 'Invalid or expired print token' })

  const client = serverSupabaseServiceRole(event)
  const { data, error } = await client.from('cvs').select('content').eq('slug', slug).single()
  if (error || !data)
    throw createError({ statusCode: 404, statusMessage: 'CV not found' })

  return { content: data.content as unknown as CvContent }
})
