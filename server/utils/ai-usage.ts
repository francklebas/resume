import { serverSupabaseClient } from '#supabase/server'
import type { H3Event } from 'h3'

const DAILY_LIMIT = 20

// Plafond glissant de 24h, partagé entre tous les appels Mistral (tailor + import), par utilisateur.
// Chaque tentative consomme un crédit, avant même l'appel Mistral (RLS scope déjà à l'utilisateur courant).
export async function enforceAiUsageLimit(event: H3Event, endpoint: 'tailor' | 'import'): Promise<void> {
  const client = await serverSupabaseClient(event)
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

  const { count, error } = await client
    .from('ai_usage')
    .select('id', { count: 'exact', head: true })
    .gte('created_at', since)
  if (error) throw createError({ statusCode: 500, statusMessage: error.message })

  if ((count ?? 0) >= DAILY_LIMIT) {
    throw createError({
      statusCode: 429,
      statusMessage: `Limite de ${DAILY_LIMIT} générations IA par 24h atteinte. Réessaie plus tard.`,
    })
  }

  const { error: insertError } = await client.from('ai_usage').insert({ endpoint } as never)
  if (insertError) throw createError({ statusCode: 500, statusMessage: insertError.message })
}
