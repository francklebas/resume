<script setup lang="ts">
import type { CvContent } from '~/types/cv'

const emit = defineEmits<{ imported: [content: CvContent] }>()

const ACCEPTED_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.oasis.opendocument.text',
]

const busy = ref(false)
const errorMsg = ref<string | null>(null)
const dragOver = ref(false)

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

async function handleFile(file: File) {
  if (!ACCEPTED_TYPES.includes(file.type)) {
    errorMsg.value = 'Formats supportés : PDF, Word (.docx) ou OpenDocument (.odt)'
    return
  }
  busy.value = true
  errorMsg.value = null
  try {
    const dataUri = await readAsDataUrl(file)
    const { content } = await $fetch<{ content: CvContent }>('/api/cvs/import', {
      method: 'POST',
      body: { file: dataUri, filename: file.name },
    })
    emit('imported', content)
  }
  catch (e: unknown) {
    errorMsg.value = errorMessage(e)
  }
  finally {
    busy.value = false
  }
}

function onDrop(event: DragEvent) {
  dragOver.value = false
  const file = event.dataTransfer?.files?.[0]
  if (file) handleFile(file)
}

function onFileInput(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file) handleFile(file)
}
</script>

<template>
  <div>
    <label
      class="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-8 text-center transition-colors"
      :class="dragOver ? 'border-blue-400 bg-blue-50' : 'border-slate-300 hover:bg-slate-50'"
      @dragover.prevent="dragOver = true"
      @dragleave.prevent="dragOver = false"
      @drop.prevent="onDrop"
    >
      <input type="file" accept=".pdf,.docx,.odt" class="hidden" :disabled="busy" @change="onFileInput">
      <span class="text-2xl" aria-hidden="true">📄</span>
      <p class="text-sm text-slate-600">
        <template v-if="busy">Analyse en cours…</template>
        <template v-else>Glisse ton ancien CV ici (PDF, Word ou OpenDocument), ou clique pour choisir un fichier</template>
      </p>
    </label>
    <p v-if="errorMsg" class="mt-2 text-sm text-red-600">
      {{ errorMsg }}
    </p>
  </div>
</template>
