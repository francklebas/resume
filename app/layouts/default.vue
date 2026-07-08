<script setup lang="ts">
const user = useSupabaseUser()
const supabase = useSupabaseClient()

async function logout() {
  await supabase.auth.signOut()
  await navigateTo('/login')
}
</script>

<template>
  <div class="min-h-screen bg-slate-100 text-slate-900">
    <header class="border-b border-slate-200 bg-white">
      <div class="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        <NuxtLink to="/" class="text-lg font-semibold tracking-tight">
          CV<span class="text-blue-600">Builder</span>
        </NuxtLink>
        <button
          v-if="user"
          class="text-sm text-slate-500 hover:text-slate-900"
          @click="logout"
        >
          Se déconnecter
        </button>
      </div>
    </header>
    <main class="mx-auto max-w-6xl px-6 py-8">
      <slot />
    </main>
  </div>
</template>
