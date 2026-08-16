<script setup lang="ts">
import type { CvRow } from '~/types/cv'

// Sans CV de base en BDD, l'adaptation n'est possible qu'à partir d'un CV joint.
const props = defineProps<{ hasBase?: boolean }>()
const emit = defineEmits<{ created: [cv: CvRow] }>()

const { consented, grant } = useAiConsent()

const EXTENSION_MIME: Record<string, string> = {
  pdf: 'application/pdf',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  odt: 'application/vnd.oasis.opendocument.text',
}
const ACCEPTED_TYPES = Object.values(EXTENSION_MIME)

// Au glisser-déposer, file.type est souvent vide ou générique (application/octet-stream)
// selon le gestionnaire de fichiers : on retombe alors sur l'extension.
function resolveDocMime(file: File): string | null {
  if (ACCEPTED_TYPES.includes(file.type)) return file.type
  const ext = file.name.split('.').pop()?.toLowerCase() ?? ''
  return EXTENSION_MIME[ext] ?? null
}

const text = ref('')
const image = ref<string | null>(null)
const sourceFile = ref<{ name: string, dataUri: string } | null>(null)
const generating = ref(false)
const errorMsg = ref<string | null>(null)

// dragenter/dragleave se déclenchent aussi sur les enfants : on compte les entrées/sorties.
const dragDepth = ref(0)
const dragOver = computed(() => dragDepth.value > 0)

// Firefox refuse le drop (l'event 'drop' ne se déclenche même pas) si dropEffect n'est pas
// explicitement positionné pendant dragover — preventDefault() seul suffit sous Chrome mais pas ici.
function onDragEnter(event: DragEvent) {
  dragDepth.value += 1
  if (event.dataTransfer) event.dataTransfer.dropEffect = 'copy'
}

function onDragOver(event: DragEvent) {
  if (event.dataTransfer) event.dataTransfer.dropEffect = 'copy'
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

async function attachFile(file: File) {
  // Une image déposée = capture de l'annonce, comme au collage.
  if (file.type.startsWith('image/')) {
    errorMsg.value = null
    image.value = await readAsDataUrl(file)
    return
  }

  const mime = resolveDocMime(file)
  if (!mime) {
    errorMsg.value = 'Formats supportés : PDF, Word (.docx), OpenDocument (.odt), ou une capture de l\'annonce'
    return
  }
  errorMsg.value = null
  const dataUri = await readAsDataUrl(file)
  // Le serveur se fie au type déclaré dans le data URI : on le réaligne sur le type résolu.
  sourceFile.value = {
    name: file.name,
    dataUri: dataUri.replace(/^data:[^;,]*;base64,/, `data:${mime};base64,`),
  }
}

function onDrop(event: DragEvent) {
  dragDepth.value = 0
  if (generating.value) return
  const file = event.dataTransfer?.files?.[0]
  if (file) attachFile(file)
}

function onFileInput(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (file) attachFile(file)
  input.value = '' // permet de re-sélectionner le même fichier après suppression
}

function clearSourceFile() {
  sourceFile.value = null
}

function onPaste(event: ClipboardEvent) {
  const items = event.clipboardData?.items
  if (!items) return
  for (const item of items) {
    if (item.type.startsWith('image/')) {
      event.preventDefault()
      const file = item.getAsFile()
      if (!file) continue
      const reader = new FileReader()
      reader.onload = () => { image.value = reader.result as string }
      reader.readAsDataURL(file)
      break
    }
  }
}

function clearImage() {
  image.value = null
}

const needsSourceFile = computed(() => !props.hasBase && !sourceFile.value)

const canSubmit = computed(() =>
  consented.value
  && !generating.value
  && !needsSourceFile.value
  && (text.value.trim().length > 0 || !!image.value))

async function submit() {
  if (!canSubmit.value) return
  generating.value = true
  errorMsg.value = null
  try {
    const cv = await $fetch<CvRow>('/api/cvs/tailor', {
      method: 'POST',
      body: {
        text: text.value.trim() || undefined,
        image: image.value ?? undefined,
        sourceFile: sourceFile.value?.dataUri,
        sourceFilename: sourceFile.value?.name,
      },
    })
    emit('created', cv)
    await navigateTo(`/editor/${cv.slug}`)
  }
  catch (e: unknown) {
    errorMsg.value = errorMessage(e)
  }
  finally {
    generating.value = false
  }
}
</script>

<template>
  <div
    class="intake"
    :class="{ 'is-generating': generating, 'is-dragover': dragOver }"
    @dragenter.prevent="onDragEnter"
    @dragleave.prevent="dragDepth -= 1"
    @dragover.prevent="onDragOver"
    @drop.prevent="onDrop"
  >
    <div class="intake-scan" aria-hidden="true" />

    <p class="intake-eyebrow">
      SCAN://ANNONCE
    </p>

    <textarea
      v-model="text"
      rows="5"
      :placeholder="sourceFile
        ? 'Colle le texte de l\'offre, ou une capture d\'écran (⌘V) — le CV joint sera adapté.'
        : 'Colle le texte de l\'offre, ou une capture d\'écran (⌘V) — le CV de base sera adapté automatiquement. Tu peux aussi déposer un CV (PDF, Word) pour l\'adapter à la place.'"
      class="intake-textarea"
      autocorrect="off"
      :disabled="generating"
      @paste="onPaste"
    />

    <div v-if="dragOver" class="intake-dropzone">
      Dépose ton CV (PDF, Word ou OpenDocument)
    </div>

    <p v-if="errorMsg" class="intake-error">
      {{ errorMsg }}
    </p>

    <p v-else-if="needsSourceFile" class="intake-hint">
      Pas encore de CV de base : dépose ton CV (PDF, Word) ici pour l'adapter à l'annonce.
    </p>

    <label v-if="!consented" class="intake-consent">
      <input type="checkbox" @change="grant">
      <span>
        J'accepte que ce contenu soit transmis à Mistral AI pour analyse
        (<NuxtLink to="/confidentialite" target="_blank">politique de confidentialité</NuxtLink>)
      </span>
    </label>

    <div class="intake-actions">
      <div class="intake-chips">
        <div v-if="image" class="intake-chip">
          <img :src="image" alt="" class="intake-chip-thumb">
          <span>Capture collée</span>
          <button type="button" class="intake-chip-remove" :disabled="generating" @click="clearImage">
            ✕
          </button>
        </div>

        <div v-if="sourceFile" class="intake-chip">
          <span aria-hidden="true">📄</span>
          <span class="intake-chip-name">{{ sourceFile.name }}</span>
          <button type="button" class="intake-chip-remove" :disabled="generating" @click="clearSourceFile">
            ✕
          </button>
        </div>
        <label v-else class="intake-attach">
          <input
            type="file"
            accept=".pdf,.docx,.odt"
            class="sr-only"
            :disabled="generating"
            @change="onFileInput"
          >
          <span>📎 Joindre un CV</span>
        </label>
      </div>

      <button
        type="button"
        class="intake-submit"
        :disabled="!canSubmit"
        @click="submit"
      >
        {{ generating ? 'Analyse en cours…' : 'Générer le CV adapté →' }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.intake {
  --paper: #f7f8fa;
  --glass: #ffffff;
  --accent: #2f5fc4;
  --scan: #8ec9ff;

  position: relative;
  overflow: hidden;
  border-radius: 1rem;
  border: 1px solid #dbe4f7;
  background: var(--paper);
  box-shadow: 0 8px 24px -12px rgba(47, 95, 196, 0.25);
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.intake-scan {
  position: absolute;
  left: 0;
  right: 0;
  top: -10%;
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--scan), transparent);
  box-shadow: 0 0 12px 2px var(--scan);
  opacity: 0;
  pointer-events: none;
}

.is-generating .intake-scan {
  opacity: 1;
  animation: scan-sweep 1.4s ease-in-out infinite;
}

@keyframes scan-sweep {
  0% { top: -2%; }
  100% { top: 102%; }
}

@media (prefers-reduced-motion: reduce) {
  .is-generating .intake-scan {
    animation: none;
    top: 50%;
    opacity: 0.6;
  }
}

.intake-eyebrow {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 0.65rem;
  letter-spacing: 0.12em;
  color: var(--accent);
  margin: 0 0 0.75rem;
}

.intake-textarea {
  width: 100%;
  resize: vertical;
  background: var(--glass);
  border: 1px solid #e6ebf5;
  border-radius: 0.75rem;
  padding: 0.9rem 1rem;
  font-size: 0.9rem;
  color: #1e2433;
  line-height: 1.5;
}

.intake-textarea:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(47, 95, 196, 0.12);
}

.intake-textarea:disabled {
  opacity: 0.6;
}

.intake-error {
  margin: 0.6rem 0 0;
  font-size: 0.8rem;
  color: #b91c1c;
}

.intake-hint {
  margin: 0.6rem 0 0;
  font-size: 0.8rem;
  color: #475569;
}

.intake-consent {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  margin-top: 0.75rem;
  font-size: 0.8rem;
  color: #475569;
  cursor: pointer;
}

.intake-consent input {
  margin-top: 0.15rem;
}

.intake-consent :deep(a) {
  color: var(--accent);
  text-decoration: underline;
}

.intake-actions {
  margin-top: 0.9rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.is-dragover {
  border-color: var(--accent);
  background: #eef3fd;
}

.intake-dropzone {
  margin-top: 0.6rem;
  border: 2px dashed var(--accent);
  border-radius: 0.75rem;
  padding: 0.75rem;
  text-align: center;
  font-size: 0.8rem;
  color: var(--accent);
  pointer-events: none;
}

.intake-chips {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
  min-width: 0;
}

.intake-attach {
  cursor: pointer;
  border-radius: 999px;
  border: 1px dashed #c3d0e8;
  padding: 0.3rem 0.75rem;
  font-size: 0.8rem;
  color: #475569;
}

.intake-attach:hover {
  border-color: var(--accent);
  color: var(--accent);
}

.intake-chip-name {
  max-width: 12rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.intake-chip {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--glass);
  border: 1px solid #e6ebf5;
  border-radius: 999px;
  padding: 0.25rem 0.75rem 0.25rem 0.25rem;
  font-size: 0.8rem;
  color: #475569;
}

.intake-chip-thumb {
  width: 1.75rem;
  height: 1.75rem;
  object-fit: cover;
  border-radius: 999px;
}

.intake-chip-remove {
  color: #94a3b8;
  font-size: 0.75rem;
}

.intake-chip-remove:hover {
  color: #b91c1c;
}

.intake-submit {
  border-radius: 0.5rem;
  background: var(--accent);
  color: white;
  font-size: 0.875rem;
  font-weight: 500;
  padding: 0.5rem 1rem;
  white-space: nowrap;
}

.intake-submit:hover:not(:disabled) {
  background: #2951a8;
}

.intake-submit:disabled {
  opacity: 0.5;
}
</style>
