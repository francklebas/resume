<script setup lang="ts">
import type { CvSkillGroup } from '~/types/cv'

const props = defineProps<{ skills: CvSkillGroup[] }>()

function move(from: number, to: number) {
  const [item] = props.skills.splice(from, 1)
  props.skills.splice(to, 0, item!)
}

function remove(index: number) {
  props.skills.splice(index, 1)
}

function add() {
  props.skills.push({ category: '', items: [] })
}

// Les items sont édités comme une seule ligne séparée par « · »
function itemsText(group: CvSkillGroup): string {
  return group.items.join(' · ')
}

function setItems(group: CvSkillGroup, value: string) {
  group.items = value.split('·').map(s => s.trim()).filter(Boolean)
}
</script>

<template>
  <div class="space-y-2">
    <div
      v-for="(group, i) in props.skills"
      :key="i"
      class="flex items-start gap-2"
    >
      <input
        v-model="group.category"
        type="text"
        placeholder="Catégorie"
        class="w-36 shrink-0 rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
      >
      <input
        :value="itemsText(group)"
        type="text"
        placeholder="Vue 3 · Nuxt · TypeScript…"
        class="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
        @change="setItems(group, ($event.target as HTMLInputElement).value)"
      >
      <EditorListControls :index="i" :length="props.skills.length" @move="move" @remove="remove" />
    </div>
    <button type="button" class="text-sm text-blue-600 hover:underline" @click="add">
      + Ajouter une catégorie
    </button>
  </div>
</template>
