<script setup lang="ts">
declare global {
  interface Window {
    turnstile?: {
      render: (container: string | HTMLElement, options: {
        sitekey: string
        action?: string
        callback: (token: string) => void
      }) => string
      reset: (widgetId: string) => void
    }
  }
}

const supabase = useSupabaseClient()
const user = useSupabaseUser()
const { public: publicConfig } = useRuntimeConfig()

const email = ref('')
const password = ref('')
const mode = ref<'login' | 'signup'>('login')
const pending = ref(false)
const demoPending = ref(false)
const showAccountForm = ref(false)
const error = ref<string | null>(null)
const info = ref<string | null>(null)

watchEffect(() => {
  if (user.value) navigateTo('/')
})

// Widget Turnstile invisible/managed pour protéger la démo anonyme (Supabase valide le token
// côté serveur via son propre siteverify, configuré dans le dashboard Auth).
const turnstileToken = ref('')
let turnstileWidgetId: string | null = null

function renderTurnstile() {
  if (!window.turnstile || !publicConfig.turnstileSitekey) return
  turnstileWidgetId = window.turnstile.render('#turnstile-widget', {
    sitekey: publicConfig.turnstileSitekey as string,
    action: 'anonymous_signin',
    callback: (token: string) => { turnstileToken.value = token },
  })
}

function waitForToken() {
  return new Promise<void>((resolve) => {
    if (turnstileToken.value) return resolve()
    const stop = watch(turnstileToken, (val) => {
      if (val) {
        stop()
        resolve()
      }
    })
  })
}

onMounted(() => {
  if (!publicConfig.turnstileSitekey) return
  const script = document.createElement('script')
  script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js'
  script.async = true
  script.defer = true
  script.onload = renderTurnstile
  document.head.appendChild(script)
})

// Accès démo sans friction : session anonyme (rôle `authenticated`, isolée par auth.uid()).
// Le quota par-user et la RLS s'appliquent tels quels.
async function startDemo() {
  demoPending.value = true
  error.value = null
  try {
    await waitForToken()
    const { error: err } = await supabase.auth.signInAnonymously({
      options: { captchaToken: turnstileToken.value },
    })
    if (err) throw err
  }
  catch (e: unknown) {
    error.value = errorMessage(e)
  }
  finally {
    demoPending.value = false
    turnstileToken.value = ''
    if (turnstileWidgetId) window.turnstile?.reset(turnstileWidgetId)
  }
}

async function submit() {
  pending.value = true
  error.value = null
  info.value = null
  try {
    await waitForToken()
    if (mode.value === 'login') {
      const { error: err } = await supabase.auth.signInWithPassword({
        email: email.value,
        password: password.value,
        options: { captchaToken: turnstileToken.value },
      })
      if (err) throw err
      await navigateTo('/')
    }
    else {
      const { data, error: err } = await supabase.auth.signUp({
        email: email.value,
        password: password.value,
        options: { captchaToken: turnstileToken.value },
      })
      if (err) throw err
      if (data.session) await navigateTo('/')
      else info.value = 'Compte créé — vérifie ta boîte mail pour confirmer ton adresse.'
    }
  }
  catch (e: unknown) {
    error.value = errorMessage(e)
  }
  finally {
    pending.value = false
    turnstileToken.value = ''
    if (turnstileWidgetId) window.turnstile?.reset(turnstileWidgetId)
  }
}
</script>

<template>
  <div class="mx-auto mt-16 max-w-sm rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
    <h1 class="mb-6 text-xl font-semibold">
      {{ mode === 'login' ? 'Connexion' : 'Créer un compte' }}
    </h1>

    <!-- Accès démo sans friction : un clic, ni e-mail ni mot de passe. -->
    <button
      type="button"
      :disabled="demoPending"
      class="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      @click="startDemo"
    >
      {{ demoPending ? 'Ouverture de la démo…' : 'Tester la démo sans compte' }}
    </button>
    <div id="turnstile-widget" class="mt-3 flex justify-center" />
    <button
      type="button"
      class="mt-3 block w-full text-center text-xs text-slate-500 hover:text-slate-900"
      @click="showAccountForm = !showAccountForm"
    >
      {{ showAccountForm ? 'Masquer' : 'Se connecter avec un compte' }}
    </button>

    <form v-if="showAccountForm" class="mt-4 space-y-4" @submit.prevent="submit">
      <input
        v-model="email"
        type="email"
        required
        placeholder="Email"
        class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
      >
      <input
        v-model="password"
        type="password"
        required
        minlength="8"
        placeholder="Mot de passe"
        class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
      >
      <button
        type="submit"
        :disabled="pending"
        class="w-full rounded-lg bg-blue-600 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {{ mode === 'login' ? 'Se connecter' : "S'inscrire" }}
      </button>
    </form>
    <p v-if="error" class="mt-4 text-sm text-red-600">{{ error }}</p>
    <p v-if="info" class="mt-4 text-sm text-emerald-600">{{ info }}</p>
    <button
      v-if="showAccountForm"
      class="mt-6 text-xs text-slate-500 hover:text-slate-900"
      @click="mode = mode === 'login' ? 'signup' : 'login'"
    >
      {{ mode === 'login' ? "Pas encore de compte ? S'inscrire" : 'Déjà un compte ? Se connecter' }}
    </button>
  </div>
</template>
