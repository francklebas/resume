<script setup lang="ts">
import type { CvContent } from '~/types/cv'

const route = useRoute()
const slug = route.params.slug as string
const { getBySlug, updateContent } = useCvs()

const { data: cv } = await useAsyncData(`cv-${slug}`, () => getBySlug(slug))

if (!cv.value) {
  throw createError({ statusCode: 404, statusMessage: 'CV introuvable' })
}

// Copie locale éditable ; la préview et l'autosave observent la même structure.
const draft = reactive({
  name: cv.value.name,
  content: structuredClone(toRaw(cv.value.content)) as CvContent,
})

type SaveState = 'saved' | 'dirty' | 'saving' | 'error'
const saveState = ref<SaveState>('saved')
const saveError = ref<string | null>(null)
let saveTimer: ReturnType<typeof setTimeout> | null = null

async function save() {
  if (saveTimer) {
    clearTimeout(saveTimer)
    saveTimer = null
  }
  saveState.value = 'saving'
  try {
    const updated = await updateContent(cv.value!.id, {
      name: draft.name,
      content: structuredClone(toRaw(draft.content)),
    })
    cv.value = updated
    saveState.value = 'saved'
    saveError.value = null
  }
  catch (e: unknown) {
    saveState.value = 'error'
    saveError.value = errorMessage(e)
  }
}

watch(draft, () => {
  saveState.value = 'dirty'
  if (saveTimer) clearTimeout(saveTimer)
  saveTimer = setTimeout(save, 1500)
}, { deep: true })

// Mise à l'échelle de la préview A4 (210 mm ≈ 794 px) selon la largeur disponible
const previewWrap = ref<HTMLElement | null>(null)
const scale = ref(1)

onMounted(() => {
  const observer = new ResizeObserver(([entry]) => {
    if (entry) scale.value = Math.min(1, entry.contentRect.width / 794)
  })
  if (previewWrap.value) observer.observe(previewWrap.value)
  onUnmounted(() => observer.disconnect())
})

const saveLabel = computed(() => ({
  saved: 'Enregistré',
  dirty: 'Modifications en attente…',
  saving: 'Enregistrement…',
  error: 'Erreur d\'enregistrement',
}[saveState.value]))
</script>

<template>
  <div>
    <div class="mb-6 flex flex-wrap items-center justify-between gap-3">
      <div class="flex items-center gap-3">
        <NuxtLink to="/" class="text-sm text-slate-500 hover:text-slate-900">← Mes CV</NuxtLink>
        <input
          v-model="draft.name"
          type="text"
          class="rounded-lg border border-transparent px-2 py-1 text-xl font-semibold tracking-tight hover:border-slate-300 focus:border-blue-500 focus:outline-none"
        >
        <span
          class="text-xs"
          :class="saveState === 'error' ? 'text-red-600' : 'text-slate-400'"
        >{{ saveLabel }}</span>
      </div>
      <div class="flex items-center gap-2">
        <button
          class="rounded-lg border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-50"
          @click="save"
        >
          Enregistrer
        </button>
      </div>
    </div>

    <p v-if="saveError" class="mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">
      {{ saveError }}
    </p>

    <div class="grid grid-cols-1 gap-6 xl:grid-cols-2">
      <!-- Formulaire -->
      <div class="space-y-4">
        <EditorSection title="En-tête">
          <EditorHeaderForm :header="draft.content.header" />
        </EditorSection>
        <EditorSection title="Profil">
          <textarea
            v-model="draft.content.profile"
            rows="6"
            class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
        </EditorSection>
        <EditorSection title="Compétences">
          <EditorSkillsForm :skills="draft.content.skills" />
        </EditorSection>
        <EditorSection title="Expériences">
          <EditorExperiencesForm :experiences="draft.content.experiences" />
        </EditorSection>
        <EditorSection title="Métriques clés">
          <EditorMetricsForm :metrics="draft.content.metrics" />
        </EditorSection>
        <EditorSection title="Formation & langues">
          <EditorEducationForm :education="draft.content.education" :languages="draft.content.languages" />
        </EditorSection>
      </div>

      <!-- Préview -->
      <div ref="previewWrap" class="min-w-0">
        <div class="sticky top-6">
          <div
            class="origin-top-left shadow-lg"
            :style="{ transform: `scale(${scale})`, width: '210mm' }"
          >
            <CvDocument :content="draft.content" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
