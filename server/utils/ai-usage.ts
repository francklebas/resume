import { serverSupabaseClient, serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server'
import type { H3Event } from 'h3'

// Quotas de la démo publique — protègent les ressources payantes (Mistral + Cloudflare Browser Rendering).
// Fenêtre glissante de 24h, sur deux niveaux : par utilisateur ET garde-fou global par app.
const PER_USER_AI_LIMIT = 5 // générations IA (tailor + import + update) / 24h / utilisateur
const PER_USER_PDF_LIMIT = 5 // exports PDF / 24h / utilisateur
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
    if (profileError) throw createError({ statusCode: 500, statusMessage: profileError.message })
    if (profile?.is_admin) return
  }

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

  // 1. Garde-fou global — client service-role (contourne la RLS, voit toutes les lignes de tous les users).
  const { count: globalCount, error: globalError } = await admin
    .from('ai_usage')
    .select('id', { count: 'exact', head: true })
    .gte('created_at', since)
  if (globalError) throw createError({ statusCode: 500, statusMessage: globalError.message })
  if ((globalCount ?? 0) >= GLOBAL_DAILY_LIMIT) {
    throw createError({
      statusCode: 429,
      statusMessage: `Limite quotidienne globale de la démo atteinte (${GLOBAL_DAILY_LIMIT} actions/24h). Réessaie demain.`,
    })
  }

  // 2. Quota par utilisateur — client RLS (ne compte que les lignes du user courant).
  const client = await serverSupabaseClient(event)
  const isPdf = endpoint === 'pdf'
  const perUserLimit = isPdf ? PER_USER_PDF_LIMIT : PER_USER_AI_LIMIT
  const kinds: UsageEndpoint[] = isPdf ? ['pdf'] : ['tailor', 'import', 'update']

  const { count: userCount, error: userError } = await client
    .from('ai_usage')
    .select('id', { count: 'exact', head: true })
    .in('endpoint', kinds)
    .gte('created_at', since)
  if (userError) throw createError({ statusCode: 500, statusMessage: userError.message })
  if ((userCount ?? 0) >= perUserLimit) {
    const what = isPdf ? `${PER_USER_PDF_LIMIT} exports PDF` : `${PER_USER_AI_LIMIT} générations IA`
    throw createError({
      statusCode: 429,
      statusMessage: `Limite de ${what} par 24h atteinte. Réessaie plus tard.`,
    })
  }

  // 3. Enregistre la consommation (RLS : insère pour le user courant, user_id = auth.uid() par défaut).
  const { error: insertError } = await client.from('ai_usage').insert({ endpoint } as never)
  if (insertError) throw createError({ statusCode: 500, statusMessage: insertError.message })
}
