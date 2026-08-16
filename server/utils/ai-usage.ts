import { serverSupabaseClient, serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server'
import type { H3Event } from 'h3'

// Quotas de la démo publique — protègent les ressources payantes (Mistral + Cloudflare Browser Rendering).
// Fenêtre glissante de 24h, sur trois niveaux : par utilisateur, par IP, ET garde-fou global par app.
const PER_USER_AI_LIMIT = 5 // générations IA (tailor + import + update) / 24h / utilisateur
const PER_USER_PDF_LIMIT = 5 // exports PDF / 24h / utilisateur
// Une session anonyme (signInAnonymously) est gratuite à recréer (fenêtre privée, storage vidé) :
// le quota par utilisateur seul ne protège rien contre un visiteur qui en abuse. Le quota par IP
// est plus large (usages légitimes derrière une même IP partagée : bureau, 4G, CGNAT) mais ferme
// la boucle « nouvelle identité anonyme = nouveau budget ».
const PER_IP_AI_LIMIT = 15
const PER_IP_PDF_LIMIT = 15
const GLOBAL_DAILY_LIMIT = 50 // toutes actions confondues / 24h / app

type UsageEndpoint = 'tailor' | 'import' | 'update' | 'pdf'

// À appeler AVANT l'opération coûteuse. Chaque tentative acceptée consomme un crédit.
export async function enforceAiUsageLimit(event: H3Event, endpoint: UsageEndpoint): Promise<void> {
  const admin = serverSupabaseServiceRole(event)

  // 0. Compte admin (créateur du SaaS, positionné manuellement en base) : aucune restriction, et on
  // ne consomme pas non plus le quota global partagé par les comptes de démo.
  const user = await serverSupabaseUser(event)
  if (user) {
    const { data: profile, error: profileError } = await admin.from('profiles').select('is_admin').eq('user_id', user.sub).maybeSingle()
    if (profileError) throw createError({ statusCode: 500, message: profileError.message })
    if (profile?.is_admin) return
  }

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  const ip = getHeader(event, 'cf-connecting-ip') ?? null

  // 1. Garde-fou global — client service-role (contourne la RLS, voit toutes les lignes de tous les users).
  const { count: globalCount, error: globalError } = await admin
    .from('ai_usage')
    .select('id', { count: 'exact', head: true })
    .gte('created_at', since)
  if (globalError) throw createError({ statusCode: 500, message: globalError.message })
  if ((globalCount ?? 0) >= GLOBAL_DAILY_LIMIT) {
    throw createError({
      statusCode: 429,
      message: `Limite quotidienne globale de la démo atteinte (${GLOBAL_DAILY_LIMIT} actions/24h). Réessaie demain.`,
    })
  }

  const isPdf = endpoint === 'pdf'
  const kinds: UsageEndpoint[] = isPdf ? ['pdf'] : ['tailor', 'import', 'update']

  // 2. Quota par IP — client service-role (une identité anonyme est gratuite à recréer, l'IP moins).
  if (ip) {
    const perIpLimit = isPdf ? PER_IP_PDF_LIMIT : PER_IP_AI_LIMIT
    const { count: ipCount, error: ipError } = await admin
      .from('ai_usage')
      .select('id', { count: 'exact', head: true })
      .eq('ip', ip)
      .in('endpoint', kinds)
      .gte('created_at', since)
    if (ipError) throw createError({ statusCode: 500, message: ipError.message })
    if ((ipCount ?? 0) >= perIpLimit) {
      throw createError({
        statusCode: 429,
        message: 'Limite atteinte pour ce réseau (démo publique). Réessaie plus tard.',
      })
    }
  }

  // 3. Quota par utilisateur — client RLS (ne compte que les lignes du user courant).
  const client = await serverSupabaseClient(event)
  const perUserLimit = isPdf ? PER_USER_PDF_LIMIT : PER_USER_AI_LIMIT

  const { count: userCount, error: userError } = await client
    .from('ai_usage')
    .select('id', { count: 'exact', head: true })
    .in('endpoint', kinds)
    .gte('created_at', since)
  if (userError) throw createError({ statusCode: 500, message: userError.message })
  if ((userCount ?? 0) >= perUserLimit) {
    const what = isPdf ? `${PER_USER_PDF_LIMIT} exports PDF` : `${PER_USER_AI_LIMIT} générations IA`
    throw createError({
      statusCode: 429,
      message: `Limite de ${what} par 24h atteinte. Réessaie plus tard.`,
    })
  }

  // 4. Enregistre la consommation (RLS : insère pour le user courant, user_id = auth.uid() par défaut).
  const { error: insertError } = await client.from('ai_usage').insert({ endpoint, ip } as never)
  if (insertError) throw createError({ statusCode: 500, message: insertError.message })
}
