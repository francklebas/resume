export interface CvTheme {
  id: string
  label: string
  description: string
  vars: {
    accent: string
    ink: string
    muted: string
    rule: string
    fontBody: string
    fontHeading: string
  }
}

export const cvThemes: CvTheme[] = [
  {
    id: 'classic',
    label: 'Classique',
    description: 'Sobre, bleu discret, repères horizontaux — le plus proche du CV traditionnel.',
    vars: {
      accent: '#2f5fc4',
      ink: '#222222',
      muted: '#6b6b6b',
      rule: '#d8d8d8',
      fontBody: 'Arial, Helvetica, sans-serif',
      fontHeading: 'Arial, Helvetica, sans-serif',
    },
  },
  {
    id: 'graphite',
    label: 'Graphite',
    description: 'Monochrome, titres en serif — registre senior / conseil.',
    vars: {
      accent: '#1a1a1a',
      ink: '#1a1a1a',
      muted: '#767066',
      rule: '#cfc9bd',
      fontBody: 'Georgia, "Times New Roman", serif',
      fontHeading: 'Georgia, "Times New Roman", serif',
    },
  },
  {
    id: 'signal',
    label: 'Signal',
    description: 'Accent vif, titres non capitalisés — registre produit / startup.',
    vars: {
      accent: '#0f8a6c',
      ink: '#16211d',
      muted: '#5c6b65',
      rule: '#d3e4dd',
      fontBody: '"Helvetica Neue", Arial, sans-serif',
      fontHeading: '"Helvetica Neue", Arial, sans-serif',
    },
  },
]

export const defaultCvThemeId = 'classic'

export function getCvTheme(id: string | undefined): CvTheme {
  return cvThemes.find(t => t.id === id) ?? cvThemes.find(t => t.id === defaultCvThemeId)!
}
