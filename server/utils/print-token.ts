// Tokens HMAC courts autorisant Puppeteer (ou un lien direct) à accéder à /print/[slug]
// sans session Supabase. Web Crypto : fonctionne en Node comme sur Cloudflare Workers.

const encoder = new TextEncoder()

async function hmacKey(): Promise<CryptoKey> {
  const secret = useRuntimeConfig().printTokenSecret
  if (!secret) throw new Error('NUXT_PRINT_TOKEN_SECRET manquant')
  return crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  )
}

export async function signPrintToken(slug: string, ttlSeconds = 120): Promise<string> {
  const exp = Math.floor(Date.now() / 1000) + ttlSeconds
  const key = await hmacKey()
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(`${slug}.${exp}`))
  const sigHex = [...new Uint8Array(sig)].map(b => b.toString(16).padStart(2, '0')).join('')
  return `${exp}.${sigHex}`
}

export async function verifyPrintToken(slug: string, token: string): Promise<boolean> {
  const [expStr, sigHex] = token.split('.')
  if (!expStr || !sigHex) return false
  const exp = Number(expStr)
  if (!Number.isFinite(exp) || exp < Math.floor(Date.now() / 1000)) return false
  const sig = Uint8Array.from(sigHex.match(/.{2}/g)?.map(h => Number.parseInt(h, 16)) ?? [])
  const key = await hmacKey()
  return crypto.subtle.verify('HMAC', key, sig, encoder.encode(`${slug}.${exp}`))
}
