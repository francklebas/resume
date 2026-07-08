<script setup lang="ts">
import type { CvExperience } from '~/types/cv'

const props = defineProps<{ experiences: CvExperience[] }>()

function move(from: number, to: number) {
  const [item] = props.experiences.splice(from, 1)
  props.experiences.splice(to, 0, item!)
}

function remove(index: number) {
  props.experiences.splice(index, 1)
}

function add() {
  props.experiences.push({
    title: '',
    company: '',
    location: '',
    period: '',
    bullets: [],
  })
}

// Une bullet par ligne dans le textarea ; **gras** supporté.
function bulletsText(exp: CvExperience): string {
  return exp.bullets.join('\n')
}

function setBullets(exp: CvExperience, value: string) {
  exp.bullets = value.split('\n').map(s => s.trim()).filter(Boolean)
}

const inputClass = 'w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none'
</script>

<template>
  <div class="space-y-4">
    <div
      v-for="(exp, i) in props.experiences"
      :key="i"
      class="rounded-lg border border-slate-200 bg-slate-50 p-3"
    >
      <div class="mb-2 flex items-center justify-between">
        <span class="text-xs font-semibold text-slate-400">Expérience {{ i + 1 }}</span>
        <EditorListControls :index="i" :length="props.experiences.length" @move="move" @remove="remove" />
      </div>
      <div class="space-y-2">
        <input v-model="exp.title" type="text" placeholder="Intitulé du poste" :class="inputClass">
        <div class="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <input v-model="exp.company" type="text" placeholder="Entreprise" :class="inputClass">
          <input v-model="exp.location" type="text" placeholder="Lieu" :class="inputClass">
          <input v-model="exp.period" type="text" placeholder="Jan 2020 – Present" :class="inputClass">
        </div>
        <input v-model="exp.context" type="text" placeholder="Ligne de contexte (optionnelle)" :class="inputClass">
        <textarea
          :value="bulletsText(exp)"
          rows="4"
          placeholder="Une réalisation par ligne — **gras** supporté"
          :class="inputClass"
          @change="setBullets(exp, ($event.target as HTMLTextAreaElement).value)"
        />
        <input v-model="exp.stack" type="text" placeholder="Stack (optionnelle) : Vue 3 · TypeScript · …" :class="inputClass">
      </div>
    </div>
    <button type="button" class="text-sm text-blue-600 hover:underline" @click="add">
      + Ajouter une expérience
    </button>
  </div>
</template>
