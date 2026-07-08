import type { CvContent } from '~/types/cv'

/**
 * Contenu du CV de base, extrait de franck-lebas-vuejs-2026.pdf.
 * Sert de point de départ à la création du premier CV.
 */
export const baseCvContent: CvContent = {
  header: {
    name: 'Franck LEBAS',
    title: 'Senior Vue.js Engineer · Vue 3 · Nuxt · TypeScript',
    tagline: 'Senior Vue.js Engineer',
    location: 'Stockholm, Sweden',
    availableImmediately: true,
    phone: '+46 (0)735 103 291',
    email: 'francklebas@ik.me',
    linkedin: 'linkedin.com/in/francklebas',
  },
  profile:
    'Senior Vue.js Engineer with 17 years of experience, specialised in Vue 3, Nuxt, and TypeScript. '
    + 'Deep expertise in Composition API, Pinia, and SSR/SSG architectures — built and led a SaaS platform '
    + 'serving 500,000+ users at Betao AB. Strong background in component system design, SCSS/BEM conventions, '
    + 'and headless CMS integrations. Design-trained (BTS Visual Communication), which directly shapes how I '
    + 'approach component APIs, design systems, and user experience. I write clean, reusable, and scalable '
    + 'frontend code with a genuine interest in web standards and performance. React and Angular experience '
    + 'available as secondary strengths.',
  skills: [
    { category: 'Vue Ecosystem', items: ['Vue 3', 'Nuxt 3/4', 'Composition API', 'TypeScript', 'Pinia', 'Vuex', 'Vuetify', 'Tailwind'] },
    { category: 'Styling', items: ['SCSS', 'BEM', 'CSS3', 'Responsive Design'] },
    { category: 'Build & Quality', items: ['Vite', 'Vitest', 'Jest', 'Playwright', 'Cypress', 'GitHub Actions', 'Docker'] },
    { category: 'Rendering', items: ['SSR', 'SSG', 'ISR', 'Web Performance', 'WCAG Accessibility'] },
    { category: 'APIs & CMS', items: ['REST APIs', 'GraphQL', 'Contentful', 'Strapi', 'Storyblok'] },
    { category: 'Secondary', items: ['React', 'Next.js', 'Angular', 'NestJS', 'Node.js', 'PostgreSQL', 'Stripe'] },
  ],
  experiences: [
    {
      title: 'Independent Projects & Job Search',
      company: 'Freelance',
      location: 'Stockholm',
      period: 'Jan 2026 – Present',
      bullets: [
        'Built a **full-stack job board** (FastAPI · Nuxt 4 · PostgreSQL · Docker · Caddy · Terraform/AWS) — deployed on AWS infrastructure with IaC',
        'Built a **Nuxt 4 e-commerce platform** with Stripe Checkout and Nuxt Content v3 as YAML product catalog',
        'Published a **SaaS starter boilerplate** (Next.js · TypeScript · Clerk · Supabase · Stripe) — sold commercially on Gumroad',
      ],
    },
    {
      title: 'Lead Frontend Architect — Vue 3',
      company: 'Betao AB',
      location: 'Stockholm',
      period: 'Feb 2022 – Jan 2026',
      context: 'SaaS platform serving 500,000+ users — portail-autoentrepreneur.fr',
      bullets: [
        'Architected and led the full frontend of a multi-product SaaS platform in Vue 3, TypeScript, and Pinia — **full ownership from design to deployment**',
        'Migrated core systems to TypeScript/Vite infrastructure: **70% CI/CD build time reduction**',
        'Built a scalable **Design System (40+ components)** with SCSS/BEM conventions, decoupled via headless CMS (Contentful, Strapi)',
        'Implemented SSR patterns and structured data strategies: **35% organic traffic growth**, LCP < 1.2s on data-heavy pages',
        'Built and maintained Node.js/Express API endpoints supporting the platform',
        'Mentored **6 developers** on Vue 3 best practices, Composition API patterns, and performance-first architecture',
      ],
      stack: 'Vue 3 · TypeScript · Pinia · Vite · SCSS · Nuxt · Contentful · Strapi · Docker · Node.js',
    },
    {
      title: 'Senior React Developer',
      company: 'FDJ — Française des Jeux',
      location: 'Vitrolles, France',
      period: 'Jun 2019 – Feb 2020',
      context: 'National lottery e-commerce platform — millions of daily active users',
      bullets: [
        'Led frontend architecture for a **high-traffic national platform** with extreme performance constraints',
        'Built a reusable React component library shared across multiple high-traffic products',
        '**50% FCP/LCP improvement** through code-splitting and advanced caching strategies',
      ],
    },
    {
      title: 'Lead Frontend Developer & Fullstack Engineer',
      company: 'Inovalia',
      location: 'France',
      period: 'Jul 2017 – Feb 2019',
      bullets: [
        'Early Next.js adoption for a complex B2B SaaS platform — SSR, real-time data, collaborative editing interfaces',
        'Built Symfony REST APIs with Doctrine ORM and API Platform — full-stack delivery from architecture to deployment',
        'Introduced component-driven frontend practices in a predominantly backend team',
      ],
    },
    {
      title: 'Founder & Full Stack Developer',
      company: 'Desire Labs',
      location: 'Marseille, France',
      period: 'Jan 2009 – Feb 2020',
      context: 'Independent web agency — 50+ projects for SMBs across France',
      bullets: [
        'Ran an independent web agency for 11 years, with full ownership from client brief to production deployment',
        'Early adopter of Vue.js and React — built SPAs and component-driven UIs before they became industry standard',
        'Full-stack delivery across Vue.js, React, Angular, Node.js, Symfony, and WordPress',
        'Developed strong product instincts and client-facing communication across diverse industries',
      ],
    },
  ],
  metrics: [
    { value: '70%', label: 'CI/CD build time reduction (Betao)' },
    { value: '500k+', label: 'Users served on Vue 3 SaaS platform' },
    { value: '35%', label: 'Organic traffic growth via SSR/SEO' },
    { value: '50%', label: 'FCP/LCP improvement (FDJ)' },
    { value: '17 yrs', label: 'Professional web development experience' },
  ],
  education: [
    { degree: 'BTS Visual Communication', school: 'Atlas School, France' },
    { degree: 'Web Application Development', school: 'ACOPAD, France' },
  ],
  languages: [
    { language: 'French', level: 'Native' },
    { language: 'English', level: 'Professional' },
    { language: 'Swedish', level: 'Conversational' },
  ],
}
