<script setup lang="ts">
import type { CvMetric } from '~/types/cv'

const props = defineProps<{ metrics: CvMetric[] }>()

function move(from: number, to: number) {
  const [item] = props.metrics.splice(from, 1)
  props.metrics.splice(to, 0, item!)
}

function remove(index: number) {
  props.metrics.splice(index, 1)
}

function add() {
  props.metrics.push({ value: '', label: '' })
}
</script>

<template>
  <div class="space-y-2">
    <div v-for="(metric, i) in props.metrics" :key="i" class="flex items-center gap-2">
      <input
        v-model="metric.value"
        type="text"
        placeholder="70%"
        class="w-24 shrink-0 rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
      >
      <input
        v-model="metric.label"
        type="text"
        placeholder="CI/CD build time reduction"
        class="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
      >
      <EditorListControls :index="i" :length="props.metrics.length" @move="move" @remove="remove" />
    </div>
    <button type="button" class="text-sm text-blue-600 hover:underline" @click="add">
      + Ajouter une métrique
    </button>
  </div>
</template>
