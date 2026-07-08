export interface EditorStep {
  key: 'header' | 'profile' | 'skills' | 'experiences' | 'metrics' | 'education'
  title: string
  tip: string
}

export const editorSteps: EditorStep[] = [
  {
    key: 'header',
    title: 'En-tête',
    tip: 'Reste factuel et lisible en 3 secondes : titre clair, localisation, disponibilité visible. Évite les formules vagues — un recruteur doit savoir immédiatement qui tu es.',
  },
  {
    key: 'profile',
    title: 'Profil',
    tip: '3 à 5 phrases maximum : une phrase de positionnement (séniorité + spécialité), une ou deux réalisations chiffrées. Bannis le générique (« passionné », « rigoureux ») qui ne dit rien de toi.',
  },
  {
    key: 'skills',
    title: 'Compétences',
    tip: 'Regroupe par catégorie plutôt qu\'en vrac, et mets en premier ce qui correspond le plus au poste visé — l\'ordre compte autant que le contenu.',
  },
  {
    key: 'experiences',
    title: 'Expériences',
    tip: 'Chaque bullet doit répondre à « et alors ? » : privilégie l\'impact chiffré (%, temps gagné, utilisateurs) plutôt qu\'un simple verbe d\'action. Le **gras** fait ressortir les résultats clés.',
  },
  {
    key: 'metrics',
    title: 'Métriques clés',
    tip: '3 à 5 chiffres qui résument ta valeur ajoutée. Un chiffre seul ne convainc pas — associe-le toujours à ce qu\'il a permis (ex. « 70% » + « réduction du temps de build »).',
  },
  {
    key: 'education',
    title: 'Formation & langues',
    tip: 'Section courte : diplôme + école suffisent. Les langues comptent surtout si le poste est international ou multiculturel — reste honnête sur le niveau.',
  },
]
