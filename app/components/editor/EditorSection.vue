<script setup lang="ts">
defineProps<{ title: string }>()
const open = ref(true)
</script>

<template>
  <section class="rounded-xl border border-slate-200 bg-white">
    <button
      type="button"
      class="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold text-slate-700"
      @click="open = !open"
    >
      {{ title }}
      <span class="text-slate-400">{{ open ? '−' : '+' }}</span>
    </button>
    <div v-show="open" class="border-t border-slate-100 px-4 py-4">
      <slot />
    </div>
  </section>
</template>
