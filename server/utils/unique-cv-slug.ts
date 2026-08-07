import type { serverSupabaseClient } from '#supabase/server'
import { slugify } from '~/utils/slugify'
import type { Database } from '~/types/database.types'

type SupabaseClientLike = Awaited<ReturnType<typeof serverSupabaseClient<Database>>>

/** Dérive un slug depuis `name`, en le désambiguïsant (-2, -3...) contre les slugs déjà pris. */
export async function uniqueCvSlug(client: SupabaseClientLike, name: string): Promise<string> {
  const { data: existing } = await client.from('cvs').select('slug')
  const taken = new Set((existing ?? []).map(c => c.slug))
  const baseSlug = slugify(name) || 'variante'
  let slug = baseSlug
  let i = 2
  while (taken.has(slug)) {
    slug = `${baseSlug}-${i}`
    i += 1
  }
  return slug
}
