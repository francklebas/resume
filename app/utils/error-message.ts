/** Message lisible pour Error comme pour les objets d'erreur Supabase (PostgrestError, AuthError…). */
export function errorMessage(e: unknown): string {
  // Erreur $fetch/ofetch sur une réponse d'API : le message utile est dans le corps JSON
  // (`data.message`), pas dans `.message` — qui ne fait que recomposer le statusText HTTP
  // ("[POST] url: 502 <statusText>"), potentiellement tronqué de ses accents par h3.
  if (e && typeof e === 'object' && 'data' in e && e.data && typeof e.data === 'object' && 'message' in e.data && typeof e.data.message === 'string')
    return e.data.message
  if (e && typeof e === 'object' && 'message' in e && typeof e.message === 'string')
    return e.message
  return String(e)
}
