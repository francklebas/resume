/** Message lisible pour Error comme pour les objets d'erreur Supabase (PostgrestError, AuthError…). */
export function errorMessage(e: unknown): string {
  if (e && typeof e === 'object' && 'message' in e && typeof e.message === 'string')
    return e.message
  return String(e)
}
