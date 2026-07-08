<script setup lang="ts">
const supabase = useSupabaseClient()
const user = useSupabaseUser()

const email = ref('')
const password = ref('')
const mode = ref<'login' | 'signup'>('login')
const pending = ref(false)
const error = ref<string | null>(null)
const info = ref<string | null>(null)

watchEffect(() => {
  if (user.value) navigateTo('/')
})

async function submit() {
  pending.value = true
  error.value = null
  info.value = null
  try {
    if (mode.value === 'login') {
      const { error: err } = await supabase.auth.signInWithPassword({
        email: email.value,
        password: password.value,
      })
      if (err) throw err
      await navigateTo('/')
    }
    else {
      const { data, error: err } = await supabase.auth.signUp({
        email: email.value,
        password: password.value,
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
  }
}
</script>

<template>
  <div class="mx-auto mt-16 max-w-sm rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
    <h1 class="mb-6 text-xl font-semibold">
      {{ mode === 'login' ? 'Connexion' : 'Créer un compte' }}
    </h1>
    <form class="space-y-4" @submit.prevent="submit">
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
      class="mt-6 text-xs text-slate-500 hover:text-slate-900"
      @click="mode = mode === 'login' ? 'signup' : 'login'"
    >
      {{ mode === 'login' ? "Pas encore de compte ? S'inscrire" : 'Déjà un compte ? Se connecter' }}
    </button>
  </div>
</template>
