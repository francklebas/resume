<script setup lang="ts">
const supabase = useSupabaseClient()
const user = useSupabaseUser()
const busy = ref(false)
const errorMsg = ref<string | null>(null)

async function exportData() {
  busy.value = true
  errorMsg.value = null
  try {
    const blob = await $fetch<Blob>('/api/account/export', { responseType: 'blob' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'mes-donnees.json'
    a.click()
    URL.revokeObjectURL(url)
  }
  catch (e: unknown) {
    errorMsg.value = errorMessage(e)
  }
  finally {
    busy.value = false
  }
}

async function deleteAccount() {
  if (!window.confirm('Supprimer définitivement ton compte et toutes tes données ? Cette action est irréversible.')) return
  if (!window.confirm('Vraiment sûr ? Il n\'y aura pas de retour en arrière possible.')) return

  busy.value = true
  errorMsg.value = null
  try {
    await $fetch('/api/account/delete', { method: 'POST' })
    await supabase.auth.signOut()
    await navigateTo('/login')
  }
  catch (e: unknown) {
    errorMsg.value = errorMessage(e)
    busy.value = false
  }
}
</script>

<template>
  <div class="mx-auto max-w-xl space-y-6">
    <h1 class="text-2xl font-semibold tracking-tight">Mon compte</h1>

    <p v-if="errorMsg" class="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">
      {{ errorMsg }}
    </p>

    <section class="rounded-xl border border-slate-200 bg-white p-4">
      <h2 class="mb-1 text-sm font-semibold text-slate-700">Compte</h2>
      <p class="text-sm text-slate-500">{{ user?.email }}</p>
    </section>

    <section class="rounded-xl border border-slate-200 bg-white p-4">
      <h2 class="mb-1 text-sm font-semibold text-slate-700">Exporter mes données</h2>
      <p class="mb-3 text-sm text-slate-500">
        Télécharge une copie de tous tes CV et de leur historique de versions, au format JSON.
      </p>
      <button
        class="rounded-lg border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-50 disabled:opacity-50"
        :disabled="busy"
        @click="exportData"
      >
        Télécharger mes données
      </button>
    </section>

    <section class="rounded-xl border border-red-200 bg-red-50 p-4">
      <h2 class="mb-1 text-sm font-semibold text-red-700">Supprimer mon compte</h2>
      <p class="mb-3 text-sm text-red-600">
        Supprime définitivement ton compte et l'ensemble de tes CV. Cette action est irréversible.
      </p>
      <button
        class="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
        :disabled="busy"
        @click="deleteAccount"
      >
        Supprimer mon compte
      </button>
    </section>
  </div>
</template>
