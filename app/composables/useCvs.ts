import type { CvContent, CvRow } from '~/types/cv'

/** Accès typé à la table cvs (RLS : chaque utilisateur ne voit que ses CV). */
export function useCvs() {
  const supabase = useSupabaseClient()

  async function list(): Promise<CvRow[]> {
    const { data, error } = await supabase
      .from('cvs')
      .select('*')
      .order('is_base', { ascending: false })
      .order('created_at', { ascending: true })
    if (error) throw error
    return data as unknown as CvRow[]
  }

  async function getBySlug(slug: string): Promise<CvRow | null> {
    const { data, error } = await supabase
      .from('cvs')
      .select('*')
      .eq('slug', slug)
      .maybeSingle()
    if (error) throw error
    return data as unknown as CvRow | null
  }

  async function create(cv: { slug: string, name: string, is_base?: boolean, content: CvContent }): Promise<CvRow> {
    const { data, error } = await supabase
      .from('cvs')
      // user_id est rempli par le default auth.uid() côté Postgres
      .insert(cv as never)
      .select()
      .single()
    if (error) throw error
    return data as unknown as CvRow
  }

  async function updateContent(id: string, patch: { name?: string, content?: CvContent }): Promise<CvRow> {
    const { data, error } = await supabase
      .from('cvs')
      .update(patch as never)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data as unknown as CvRow
  }

  async function remove(id: string): Promise<void> {
    const { error } = await supabase.from('cvs').delete().eq('id', id)
    if (error) throw error
  }

  return { list, getBySlug, create, updateContent, remove }
}
