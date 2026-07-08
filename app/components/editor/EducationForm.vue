<script setup lang="ts">
import type { CvEducation, CvLanguage } from '~/types/cv'

const props = defineProps<{ education: CvEducation[], languages: CvLanguage[] }>()

const inputClass = 'min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none'
</script>

<template>
  <div class="space-y-4">
    <div>
      <p class="mb-2 text-xs font-semibold text-slate-400">Formations</p>
      <div class="space-y-2">
        <div v-for="(edu, i) in props.education" :key="i" class="flex items-center gap-2">
          <input v-model="edu.degree" type="text" placeholder="Diplôme" :class="inputClass">
          <input v-model="edu.school" type="text" placeholder="École" :class="inputClass">
          <button
            type="button"
            class="rounded px-1.5 py-0.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
            @click="props.education.splice(i, 1)"
          >✕</button>
        </div>
        <button
          type="button"
          class="text-sm text-blue-600 hover:underline"
          @click="props.education.push({ degree: '', school: '' })"
        >
          + Ajouter une formation
        </button>
      </div>
    </div>
    <div>
      <p class="mb-2 text-xs font-semibold text-slate-400">Langues</p>
      <div class="space-y-2">
        <div v-for="(lang, i) in props.languages" :key="i" class="flex items-center gap-2">
          <input v-model="lang.language" type="text" placeholder="Langue" :class="inputClass">
          <input v-model="lang.level" type="text" placeholder="Niveau" :class="inputClass">
          <button
            type="button"
            class="rounded px-1.5 py-0.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
            @click="props.languages.splice(i, 1)"
          >✕</button>
        </div>
        <button
          type="button"
          class="text-sm text-blue-600 hover:underline"
          @click="props.languages.push({ language: '', level: '' })"
        >
          + Ajouter une langue
        </button>
      </div>
    </div>
  </div>
</template>
