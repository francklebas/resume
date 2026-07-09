import mammoth from 'mammoth'

// mammoth résout vers des implémentations d'unzip différentes selon le bundler :
// { buffer } en Node (lib/unzip.js), { arrayBuffer } dans le build navigateur/edge (browser/unzip.js).
// On fournit les deux pour que ça fonctionne aussi bien en dev qu'en build Cloudflare.
export async function extractDocxText(arrayBuffer: ArrayBuffer): Promise<string> {
  const result = await mammoth.extractRawText({ arrayBuffer, buffer: Buffer.from(arrayBuffer) } as never)
  return result.value
}
