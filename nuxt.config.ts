import tailwindcss from '@tailwindcss/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxtjs/supabase'],
  css: ['~/assets/css/main.css'],
  vite: {
    plugins: [tailwindcss()],
  },
  supabase: {
    redirectOptions: {
      login: '/login',
      callback: '/confirm',
      exclude: ['/print/**', '/cgu', '/confidentialite'],
    },
    cookieOptions: {
      // Défaut du module = true, refusé par les navigateurs en HTTP (dev local, tests E2E).
      secure: process.env.NODE_ENV === 'production',
    },
  },
  runtimeConfig: {
    // NUXT_MISTRAL_API_KEY
    mistralApiKey: '',
    // NUXT_PRINT_TOKEN_SECRET
    printTokenSecret: '',
  },
})
