<script setup lang="ts">
import type { CvHeader } from '~/types/cv'

const props = defineProps<{ header: CvHeader }>()

const fields = [
  { key: 'name', label: 'Nom' },
  { key: 'title', label: 'Titre (ligne bleue)' },
  { key: 'tagline', label: 'Sous-titre' },
  { key: 'location', label: 'Localisation' },
  { key: 'phone', label: 'Téléphone' },
  { key: 'email', label: 'Email' },
  { key: 'linkedin', label: 'LinkedIn' },
] as const satisfies readonly { key: keyof Omit<CvHeader, 'availableImmediately'>, label: string }[]
</script>

<template>
  <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
    <label v-for="field in fields" :key="field.key" class="block">
      <span class="mb-1 block text-xs font-medium text-slate-500">{{ field.label }}</span>
      <input
        v-model="props.header[field.key]"
        type="text"
        class="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
      >
    </label>
    <label class="flex items-center gap-2 sm:col-span-2">
      <input
        v-model="props.header.availableImmediately"
        type="checkbox"
        class="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
      >
      <span class="text-sm text-slate-700">Disponible immédiatement</span>
    </label>
  </div>
</template>
