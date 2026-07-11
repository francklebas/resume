<script setup lang="ts">
import type { CvRow } from '~/types/cv'

const emit = defineEmits<{ created: [cv: CvRow] }>()

const { consented, grant } = useAiConsent()

const text = ref('')
const image = ref<string | null>(null)
const generating = ref(false)
const errorMsg = ref<string | null>(null)

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

const canSubmit = computed(() => consented.value && !generating.value && (text.value.trim().length > 0 || !!image.value))

async function submit() {
  if (!canSubmit.value) return
  generating.value = true
  errorMsg.value = null
  try {
    const cv = await $fetch<CvRow>('/api/cvs/tailor', {
      method: 'POST',
      body: { text: text.value.trim() || undefined, image: image.value ?? undefined },
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
  <div class="intake" :class="{ 'is-generating': generating }">
    <div class="intake-scan" aria-hidden="true" />

    <p class="intake-eyebrow">
      SCAN://ANNONCE
    </p>

    <textarea
      v-model="text"
      rows="5"
      placeholder="Colle le texte de l'offre, ou une capture d'écran (⌘V) — le CV de base sera adapté automatiquement."
      class="intake-textarea"
      :disabled="generating"
      @paste="onPaste"
    />

    <p v-if="errorMsg" class="intake-error">
      {{ errorMsg }}
    </p>

    <label v-if="!consented" class="intake-consent">
      <input type="checkbox" @change="grant">
      <span>
        J'accepte que ce contenu soit transmis à Mistral AI pour analyse
        (<NuxtLink to="/confidentialite" target="_blank">politique de confidentialité</NuxtLink>)
      </span>
    </label>

    <div class="intake-actions">
      <div v-if="image" class="intake-chip">
        <img :src="image" alt="" class="intake-chip-thumb">
        <span>Capture collée</span>
        <button type="button" class="intake-chip-remove" :disabled="generating" @click="clearImage">
          ✕
        </button>
      </div>
      <span v-else />

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
