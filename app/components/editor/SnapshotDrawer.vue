<script setup lang="ts">
import type { CvSnapshot } from '~/types/cv'

defineProps<{ open: boolean, snapshots: CvSnapshot[], busy: boolean }>()
const emit = defineEmits<{ close: [], restore: [snapshot: CvSnapshot], snapshotNow: [] }>()

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="open" class="fixed inset-0 z-40 bg-black/20 print:hidden" @click="emit('close')" />
    </Transition>
    <Transition name="slide">
      <aside
        v-if="open"
        class="fixed inset-y-0 right-0 z-50 flex w-80 max-w-[90vw] flex-col border-l border-slate-200 bg-white shadow-xl print:hidden"
      >
        <div class="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <h2 class="text-sm font-semibold text-slate-700">Historique</h2>
          <button type="button" class="text-slate-400 hover:text-slate-700" @click="emit('close')">
            ✕
          </button>
        </div>

        <div class="border-b border-slate-200 px-4 py-3">
          <button
            type="button"
            class="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-50 disabled:opacity-50"
            :disabled="busy"
            @click="emit('snapshotNow')"
          >
            Prendre un instantané maintenant
          </button>
        </div>

        <div class="flex-1 overflow-y-auto px-4 py-3">
          <p v-if="!snapshots.length" class="text-sm text-slate-400">
            Aucune version enregistrée pour l'instant.
          </p>
          <ul v-else class="divide-y divide-slate-100">
            <li
              v-for="snapshot in snapshots"
              :key="snapshot.id"
              class="flex items-center justify-between gap-3 py-2 text-sm"
            >
              <span class="text-slate-600">{{ formatDateTime(snapshot.created_at) }}</span>
              <button
                type="button"
                class="rounded-lg border border-slate-300 px-2.5 py-1 text-xs hover:bg-slate-50 disabled:opacity-50"
                :disabled="busy"
                @click="emit('restore', snapshot)"
              >
                Restaurer
              </button>
            </li>
          </ul>
        </div>
      </aside>
    </Transition>
  </Teleport>
</template>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.2s ease;
}
.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
