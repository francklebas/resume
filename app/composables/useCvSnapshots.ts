import type { CvContent, CvSnapshot } from '~/types/cv'

/**
 * Un snapshot est créé automatiquement par un trigger DB à chaque sauvegarde qui change le contenu.
 * `create` permet en plus un snapshot manuel explicite, à la demande.
 */
export function useCvSnapshots() {
  const supabase = useSupabaseClient()

  async function list(cvId: string): Promise<CvSnapshot[]> {
    const { data, error } = await supabase
      .from('cv_snapshots')
      .select('*')
      .eq('cv_id', cvId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return data as unknown as CvSnapshot[]
  }

  async function create(cvId: string, name: string, content: CvContent): Promise<CvSnapshot> {
    const { data, error } = await supabase
      .from('cv_snapshots')
      .insert({ cv_id: cvId, name, content } as never)
      .select()
      .single()
    if (error) throw error
    return data as unknown as CvSnapshot
  }

  return { list, create }
}
