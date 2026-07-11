import { serverSupabaseUser } from '#supabase/server'

// Génère le PDF à la volée (rendu Chromium de /print/[slug], identique à la preview)
// et le renvoie directement en téléchargement — pas de stockage, régénéré à chaque appel.
export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Non authentifié' })

  const slug = getRouterParam(event, 'slug')!
  const isAts = getQuery(event).template === 'ats'
  const origin = getRequestURL(event).origin
  const token = await signPrintToken(slug)
  const printUrl = `${origin}/print/${slug}?token=${token}${isAts ? '&template=ats' : ''}`
  const pdf = await renderUrlToPdf(event, printUrl)

  const suffix = isAts ? '-ats' : ''
  setHeaders(event, {
    'Content-Type': 'application/pdf',
    'Content-Disposition': `attachment; filename="franck-lebas-${slug}${suffix}.pdf"`,
  })
  return pdf
})
