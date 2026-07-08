export interface CvHeader {
  name: string
  title: string
  tagline: string
  location: string
  availability: string
  phone: string
  email: string
  linkedin: string
}

export interface CvSkillGroup {
  category: string
  items: string[]
}

export interface CvExperience {
  title: string
  company: string
  location: string
  period: string
  /** Ligne de contexte en italique sous l'intitulé (ex : « SaaS platform serving 500,000+ users ») */
  context?: string
  /** Les segments **gras** sont supportés dans les bullets */
  bullets: string[]
  stack?: string
}

export interface CvMetric {
  value: string
  label: string
}

export interface CvEducation {
  degree: string
  school: string
}

export interface CvLanguage {
  language: string
  level: string
}

export interface CvContent {
  header: CvHeader
  profile: string
  skills: CvSkillGroup[]
  experiences: CvExperience[]
  metrics: CvMetric[]
  education: CvEducation[]
  languages: CvLanguage[]
}

export interface CvRow {
  id: string
  user_id: string
  slug: string
  name: string
  is_base: boolean
  content: CvContent
  pdf_key: string | null
  pdf_generated_at: string | null
  created_at: string
  updated_at: string
}
