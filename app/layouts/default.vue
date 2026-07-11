<script setup lang="ts">
const user = useSupabaseUser()
const supabase = useSupabaseClient()

async function logout() {
  await supabase.auth.signOut()
  await navigateTo('/login')
}
</script>

<template>
  <div class="min-h-screen bg-slate-100 text-slate-900 print:bg-white">
    <header class="border-b border-slate-200 bg-white print:hidden">
      <div class="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        <NuxtLink to="/" class="text-lg font-semibold tracking-tight">
          CV<span class="text-blue-600">Builder</span>
        </NuxtLink>
        <div v-if="user" class="flex items-center gap-4">
          <NuxtLink to="/compte" class="text-sm text-slate-500 hover:text-slate-900">
            Mon compte
          </NuxtLink>
          <button
            class="text-sm text-slate-500 hover:text-slate-900"
            @click="logout"
          >
            Se déconnecter
          </button>
        </div>
      </div>
    </header>
    <main class="mx-auto max-w-6xl px-6 py-8 print:max-w-none print:p-0">
      <slot />
    </main>
    <footer class="border-t border-slate-200 px-6 py-4 text-center text-xs text-slate-400 print:hidden">
      <NuxtLink to="/cgu" class="hover:text-slate-600">CGU</NuxtLink>
      <span class="mx-2">·</span>
      <NuxtLink to="/confidentialite" class="hover:text-slate-600">Confidentialité</NuxtLink>
    </footer>
  </div>
</template>
