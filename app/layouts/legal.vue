<template>
  <div class="min-h-screen bg-slate-100 text-slate-900">
    <header class="border-b border-slate-200 bg-white">
      <div class="mx-auto flex max-w-3xl items-center justify-between px-6 py-3">
        <NuxtLink to="/" class="text-lg font-semibold tracking-tight">
          CV<span class="text-blue-600">Builder</span>
        </NuxtLink>
        <NuxtLink to="/" class="text-sm text-slate-500 hover:text-slate-900">
          ← Retour à l'application
        </NuxtLink>
      </div>
    </header>
    <main class="mx-auto max-w-3xl px-6 py-10">
      <slot />
    </main>
  </div>
</template>
