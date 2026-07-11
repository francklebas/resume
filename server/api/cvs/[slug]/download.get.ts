import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import { slugify } from '~/utils/slugify'
import type { CvContent } from '~/types/cv'

// Génère le PDF à la volée (rendu Chromium de /print/[slug], identique à la preview)
// et le renvoie directement en téléchargement — pas de stockage, régénéré à chaque appel.
export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Non authentifié' })

  const slug = getRouterParam(event, 'slug')!
  const isAts = getQuery(event).template === 'ats'

  const client = await serverSupabaseClient(event)
  const { data: cv } = await client.from('cvs').select('content').eq('slug', slug).single()
  const ownerName = (cv?.content as unknown as CvContent | undefined)?.header?.name
  const filenamePrefix = (ownerName && slugify(ownerName)) || slug

  const origin = getRequestURL(event).origin
  const token = await signPrintToken(slug)
  const printUrl = `${origin}/print/${slug}?token=${token}${isAts ? '&template=ats' : ''}`
  const pdf = await renderUrlToPdf(event, printUrl)

  const suffix = isAts ? '-ats' : ''
  setHeaders(event, {
    'Content-Type': 'application/pdf',
    'Content-Disposition': `attachment; filename="${filenamePrefix}-${slug}${suffix}.pdf"`,
  })
  return pdf
})
