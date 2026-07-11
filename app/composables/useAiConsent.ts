const STORAGE_KEY = 'ai-consent'

/** Consentement (une fois, mémorisé) avant tout envoi de contenu à Mistral AI. */
export function useAiConsent() {
  const consented = useState<boolean>('ai-consent-state', () => {
    if (import.meta.client) return localStorage.getItem(STORAGE_KEY) === '1'
    return false
  })

  function grant() {
    consented.value = true
    if (import.meta.client) localStorage.setItem(STORAGE_KEY, '1')
  }

  return { consented, grant }
}
