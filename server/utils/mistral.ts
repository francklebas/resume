import { Mistral } from '@mistralai/mistralai'
import type { CvContent } from '~/types/cv'

const MODEL = 'mistral-medium-latest'

const CV_CONTENT_SCHEMA = `interface CvContent {
  header: { name: string, title: string, tagline: string, location: string, availableImmediately: boolean, phone: string, email: string, linkedin: string }
  profile: string
  skills: { category: string, items: string[] }[]
  experiences: { title: string, company: string, location: string, period: string, context?: string, bullets: string[], stack?: string }[]
  metrics: { value: string, label: string }[]
  education: { degree: string, school: string }[]
  languages: { language: string, level: string }[]
}`

const SYSTEM_PROMPT = `Tu adaptes un CV existant à une offre d'emploi, sans jamais inventer d'expérience, de poste, d'entreprise ou de date qui ne figure pas déjà dans le CV de base fourni.

Tu reçois :
1. Le CV de base, au format JSON (schéma CvContent ci-dessous)
2. Une offre d'emploi (texte ou capture d'écran)

Tu dois produire un JSON avec exactement quatre clés :
- "variantName": un nom court et lisible pour cette variante (ex. "Klarna — Vue.js Engineer"), basé sur l'entreprise et/ou le poste de l'offre
- "matchScore": un entier de 0 à 100 estimant à quel point le profil (une fois adapté) correspond à l'offre — sois honnête et différencié, pas systématiquement au-dessus de 80
- "matchSummary": une phrase courte (1 ligne) qui justifie ce score, en français, en pointant les points forts et/ou les écarts principaux
- "content": un objet respectant strictement ce schéma TypeScript (mêmes clés, mêmes types) :

${CV_CONTENT_SCHEMA}

Règles :
- Ne change ni les noms d'entreprises, ni les dates, ni les intitulés de poste (title/company/period restent identiques à l'original)
- Tu peux reformuler le profil et les bullets pour mettre en avant ce qui correspond à l'offre, réordonner les compétences et les expériences par pertinence, ajuster la tagline
- Les segments **gras** sont supportés dans les bullets (même syntaxe que le CV de base)
- N'invente aucun chiffre, aucune techno, aucun fait absent du CV de base
- Réponds uniquement avec le JSON, sans texte autour, sans balise markdown`

interface TailorResult {
  variantName: string
  matchScore: number
  matchSummary: string
  content: CvContent
}

export async function tailorCv(baseContent: CvContent, input: { text?: string, image?: string }): Promise<TailorResult> {
  const { mistralApiKey } = useRuntimeConfig()
  if (!mistralApiKey) {
    throw createError({ statusCode: 500, statusMessage: 'NUXT_MISTRAL_API_KEY manquant' })
  }

  const content: ({ type: 'text', text: string } | { type: 'image_url', imageUrl: string })[] = [
    { type: 'text', text: `CV de base :\n${JSON.stringify(baseContent)}` },
  ]
  if (input.text) content.push({ type: 'text', text: `Offre d'emploi :\n${input.text}` })
  if (input.image) content.push({ type: 'image_url', imageUrl: input.image })

  const mistral = new Mistral({ apiKey: mistralApiKey })
  const response = await mistral.chat.complete({
    model: MODEL,
    responseFormat: { type: 'json_object' },
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content },
    ],
  })

  const raw = response.choices?.[0]?.message?.content
  if (typeof raw !== 'string') {
    throw createError({ statusCode: 502, statusMessage: 'Réponse Mistral vide ou invalide' })
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  }
  catch {
    throw createError({ statusCode: 502, statusMessage: 'Réponse Mistral : JSON invalide' })
  }

  if (
    !parsed || typeof parsed !== 'object'
    || !('variantName' in parsed) || !('content' in parsed) || !('matchScore' in parsed)
    || typeof (parsed as Record<string, unknown>).variantName !== 'string'
    || typeof (parsed as Record<string, unknown>).matchScore !== 'number'
  ) {
    throw createError({ statusCode: 502, statusMessage: 'Réponse Mistral : schéma inattendu' })
  }

  const result = parsed as TailorResult
  return { ...result, matchScore: Math.max(0, Math.min(100, Math.round(result.matchScore))) }
}

const EXTRACT_SYSTEM_PROMPT = `Tu extrais le contenu structuré d'un CV à partir d'un document fourni (PDF, ou texte brut issu d'un fichier Word).

Réponds uniquement avec un JSON respectant strictement ce schéma TypeScript :

${CV_CONTENT_SCHEMA}

Règles :
- N'invente rien qui n'est pas dans le document. Si une information est absente, mets une valeur vide ("" ou []) plutôt que d'inventer.
- "availableImmediately" doit être exactement le booléen true ou false (jamais null) : true seulement si le document l'indique explicitement, false sinon.
- Regroupe les compétences par catégorie cohérente si le document ne le fait pas déjà.
- Si le document mentionne des réalisations chiffrées (%, nombre d'utilisateurs, durée, etc.), reprends-les dans "metrics" en plus des bullets d'expérience concernés.
- Les segments à mettre en avant dans les bullets peuvent être marqués **gras**.
- Réponds uniquement avec le JSON, sans texte autour, sans balise markdown.`

export async function extractCvFromDocument(doc: { pdfDataUri: string, filename?: string } | { text: string }): Promise<CvContent> {
  const { mistralApiKey } = useRuntimeConfig()
  if (!mistralApiKey) {
    throw createError({ statusCode: 500, statusMessage: 'NUXT_MISTRAL_API_KEY manquant' })
  }

  const content: ({ type: 'text', text: string } | { type: 'document_url', documentUrl: string, documentName?: string })[] = 'pdfDataUri' in doc
    ? [{ type: 'document_url', documentUrl: doc.pdfDataUri, documentName: doc.filename }]
    : [{ type: 'text', text: doc.text }]

  const mistral = new Mistral({ apiKey: mistralApiKey })
  const response = await mistral.chat.complete({
    model: MODEL,
    responseFormat: { type: 'json_object' },
    messages: [
      { role: 'system', content: EXTRACT_SYSTEM_PROMPT },
      { role: 'user', content },
    ],
  })

  const raw = response.choices?.[0]?.message?.content
  if (typeof raw !== 'string') {
    throw createError({ statusCode: 502, statusMessage: 'Réponse Mistral vide ou invalide' })
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  }
  catch {
    throw createError({ statusCode: 502, statusMessage: 'Réponse Mistral : JSON invalide' })
  }

  if (!parsed || typeof parsed !== 'object' || !('header' in parsed) || !('experiences' in parsed)) {
    throw createError({ statusCode: 502, statusMessage: 'Réponse Mistral : schéma inattendu' })
  }

  const result = parsed as CvContent
  result.header.availableImmediately = result.header.availableImmediately === true
  return result
}
