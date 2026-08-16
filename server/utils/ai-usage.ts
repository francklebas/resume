import { serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server'
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

  const ip = getHeader(event, 'cf-connecting-ip') ?? null
  const isPdf = endpoint === 'pdf'
  const kinds: UsageEndpoint[] = isPdf ? ['pdf'] : ['tailor', 'import', 'update']
  const perUserLimit = isPdf ? PER_USER_PDF_LIMIT : PER_USER_AI_LIMIT
  const perIpLimit = isPdf ? PER_IP_PDF_LIMIT : PER_IP_AI_LIMIT

  // Check des 3 niveaux (global, IP, utilisateur) + insertion dans une seule transaction Postgres
  // sous verrou (public.consume_ai_usage, migration ai_usage_atomic) : un SELECT count() suivi d'un
  // INSERT séparé côté client laisse une fenêtre où des requêtes concurrentes lisent le même
  // compteur avant qu'aucune n'ait inséré, et dépassent la limite (confirmé en le reproduisant).
  const { data: verdict, error } = await admin.rpc('consume_ai_usage', {
    p_user_id: user!.sub,
    p_ip: ip,
    p_endpoint: endpoint,
    p_kinds: kinds,
    p_user_limit: perUserLimit,
    p_ip_limit: perIpLimit,
    p_global_limit: GLOBAL_DAILY_LIMIT,
  })
  if (error) throw createError({ statusCode: 500, message: error.message })

  if (verdict === 'global') {
    throw createError({
      statusCode: 429,
      message: `Limite quotidienne globale de la démo atteinte (${GLOBAL_DAILY_LIMIT} actions/24h). Réessaie demain.`,
    })
  }
  if (verdict === 'ip') {
    throw createError({
      statusCode: 429,
      message: 'Limite atteinte pour ce réseau (démo publique). Réessaie plus tard.',
    })
  }
  if (verdict === 'user') {
    const what = isPdf ? `${PER_USER_PDF_LIMIT} exports PDF` : `${PER_USER_AI_LIMIT} générations IA`
    throw createError({
      statusCode: 429,
      message: `Limite de ${what} par 24h atteinte. Réessaie plus tard.`,
    })
  }
}
