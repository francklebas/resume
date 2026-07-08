<script setup lang="ts">
// Page de callback du module Supabase : une fois la session établie, retour au dashboard.
const user = useSupabaseUser()

watchEffect(() => {
  if (user.value) navigateTo('/')
})
</script>

<template>
  <p class="mt-16 text-center text-sm text-slate-500">
    Connexion en cours…
  </p>
</template>
