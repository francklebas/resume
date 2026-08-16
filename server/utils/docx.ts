// L'entrée par défaut de mammoth ("mammoth") résout vers lib/index.js, qui dépend de fs +
// bluebird (require("./unzip")) — inutilisable sur Cloudflare Workers ("promisify is not a
// function" en prod). On importe directement le bundle mammoth.browser.js, autonome (pas de
// dépendance à fs), pour que ça marche pareil en dev et en build Cloudflare.
import mammoth from 'mammoth/mammoth.browser.js'

export async function extractDocxText(arrayBuffer: ArrayBuffer): Promise<string> {
  const result = await mammoth.extractRawText({ arrayBuffer })
  return result.value
}
