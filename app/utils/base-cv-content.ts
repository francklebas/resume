import type { CvContent } from '~/types/cv'

/**
 * Contenu de départ générique pour un nouveau CV de base — à remplacer entièrement
 * par l'utilisateur via l'éditeur pas à pas (ou en important un CV existant).
 */
export const baseCvContent: CvContent = {
  header: {
    name: 'Prénom Nom',
    title: 'Intitulé de poste',
    tagline: 'Ta proposition de valeur en une ligne',
    location: 'Ville, Pays',
    availableImmediately: false,
    phone: '+33 6 00 00 00 00',
    email: 'prenom.nom@email.com',
    linkedin: 'linkedin.com/in/ton-profil',
  },
  profile:
    'Résume en 3 à 5 phrases ta séniorité, ta spécialité, et une ou deux réalisations chiffrées. '
    + 'Évite les généralités ("passionné", "rigoureux") — préfère des faits vérifiables.',
  skills: [
    { category: 'Catégorie', items: ['Compétence 1', 'Compétence 2', 'Compétence 3'] },
  ],
  experiences: [
    {
      title: 'Intitulé du poste',
      company: 'Entreprise',
      location: 'Ville',
      period: 'MMM AAAA – Présent',
      bullets: [
        'Décris une réalisation concrète avec un résultat mesurable',
      ],
    },
  ],
  metrics: [
    { value: 'X%', label: 'Un impact mesurable' },
  ],
  education: [
    { degree: 'Diplôme', school: 'École ou université' },
  ],
  languages: [
    { language: 'Français', level: 'Natif' },
  ],
}
