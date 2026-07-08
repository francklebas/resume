<script setup lang="ts">
// Boutons monter/descendre/supprimer pour un élément de liste.
defineProps<{ index: number, length: number }>()
defineEmits<{ move: [from: number, to: number], remove: [index: number] }>()
</script>

<template>
  <div class="flex items-center gap-1 text-slate-400">
    <button
      type="button"
      :disabled="index === 0"
      class="rounded px-1.5 py-0.5 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-30"
      title="Monter"
      @click="$emit('move', index, index - 1)"
    >↑</button>
    <button
      type="button"
      :disabled="index === length - 1"
      class="rounded px-1.5 py-0.5 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-30"
      title="Descendre"
      @click="$emit('move', index, index + 1)"
    >↓</button>
    <button
      type="button"
      class="rounded px-1.5 py-0.5 hover:bg-red-50 hover:text-red-600"
      title="Supprimer"
      @click="$emit('remove', index)"
    >✕</button>
  </div>
</template>
