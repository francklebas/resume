<script setup lang="ts">
import type { EditorStep } from '~/utils/editor-steps'

defineProps<{ steps: EditorStep[], current: number }>()
const emit = defineEmits<{ 'update:current': [index: number] }>()
</script>

<template>
  <ol class="flex flex-wrap items-center gap-2 print:hidden">
    <li v-for="(step, i) in steps" :key="step.key">
      <button
        type="button"
        class="flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors"
        :class="i === current
          ? 'border-blue-600 bg-blue-600 text-white'
          : 'border-slate-300 text-slate-500 hover:bg-slate-50'"
        @click="emit('update:current', i)"
      >
        <span
          class="flex h-4 w-4 items-center justify-center rounded-full text-[10px]"
          :class="i === current ? 'bg-white/20' : 'bg-slate-100'"
        >{{ i + 1 }}</span>
        {{ step.title }}
      </button>
    </li>
  </ol>
</template>
