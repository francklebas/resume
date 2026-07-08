<script setup lang="ts">
import type { CvContent, CvSnapshot } from '~/types/cv'

const route = useRoute()
const slug = route.params.slug as string
const { getBySlug, updateContent } = useCvs()
const { list: listSnapshots, create: createSnapshot } = useCvSnapshots()

const { data: cv } = await useAsyncData(`cv-${slug}`, () => getBySlug(slug))

if (!cv.value) {
  throw createError({ statusCode: 404, statusMessage: 'CV introuvable' })
}

const { data: snapshots, refresh: refreshSnapshots } = await useAsyncData(
  `cv-${slug}-snapshots`,
  () => listSnapshots(cv.value!.id),
  { default: () => [] as CvSnapshot[] },
)

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
    await refreshSnapshots()
  }
  catch (e: unknown) {
    saveState.value = 'error'
    saveError.value = errorMessage(e)
  }
}

async function restore(snapshot: CvSnapshot) {
  if (!window.confirm(`Restaurer la version du ${formatDateTime(snapshot.created_at)} ? La version actuelle sera aussi conservée dans l'historique.`)) return
  draft.name = snapshot.name
  draft.content = structuredClone(snapshot.content)
  await save()
  historyOpen.value = false
}

async function snapshotNow() {
  await createSnapshot(cv.value!.id, draft.name, structuredClone(toRaw(draft.content)))
  await refreshSnapshots()
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

const historyOpen = ref(false)

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

  // À l'impression, la préview doit s'afficher à taille réelle (pas la mise à l'échelle d'écran)
  let scaleBeforePrint = 1
  const onBeforePrint = () => { scaleBeforePrint = scale.value; scale.value = 1 }
  const onAfterPrint = () => { scale.value = scaleBeforePrint }
  window.addEventListener('beforeprint', onBeforePrint)
  window.addEventListener('afterprint', onAfterPrint)
  onUnmounted(() => {
    window.removeEventListener('beforeprint', onBeforePrint)
    window.removeEventListener('afterprint', onAfterPrint)
  })
})

function downloadPdf() {
  window.print()
}

function matchBadgeClass(score: number): string {
  if (score >= 80) return 'bg-emerald-50 text-emerald-700'
  if (score >= 50) return 'bg-amber-50 text-amber-700'
  return 'bg-red-50 text-red-700'
}

const currentStep = ref(0)
const activeStep = computed(() => editorSteps[currentStep.value]!)

const saveLabel = computed(() => ({
  saved: 'Enregistré',
  dirty: 'Modifications en attente…',
  saving: 'Enregistrement…',
  error: 'Erreur d\'enregistrement',
}[saveState.value]))
</script>

<template>
  <div>
    <div class="mb-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
      <div class="flex items-center gap-3">
        <NuxtLink to="/" class="text-sm text-slate-500 hover:text-slate-900">← Mes CV</NuxtLink>
        <input
          v-model="draft.name"
          type="text"
          class="rounded-lg border border-transparent px-2 py-1 text-xl font-semibold tracking-tight hover:border-slate-300 focus:border-blue-500 focus:outline-none"
        >
        <span
          v-if="cv?.match_score !== null && cv?.match_score !== undefined"
          class="rounded-full px-2 py-0.5 text-xs font-medium"
          :class="matchBadgeClass(cv.match_score)"
          :title="cv.match_summary ?? undefined"
        >{{ cv.match_score }}% match</span>
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
        <button
          class="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
          @click="downloadPdf"
        >
          Télécharger (PDF)
        </button>
        <button
          type="button"
          class="rounded-lg border border-slate-300 p-1.5 text-slate-500 hover:bg-slate-50 hover:text-slate-700"
          title="Historique des versions"
          @click="historyOpen = true"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-4 w-4">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z" />
          </svg>
        </button>
      </div>
    </div>

    <p v-if="saveError" class="mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700 print:hidden">
      {{ saveError }}
    </p>

    <div class="grid grid-cols-1 gap-6 xl:grid-cols-2 print:block">
      <!-- Formulaire, guidé pas à pas -->
      <div class="space-y-4 print:hidden">
        <EditorStepper :steps="editorSteps" :current="currentStep" @update:current="currentStep = $event" />

        <div class="rounded-xl border border-slate-200 bg-white p-4">
          <div class="mb-4 flex gap-2 rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-900">
            <span aria-hidden="true">💡</span>
            <p>{{ activeStep.tip }}</p>
          </div>

          <template v-if="activeStep.key === 'header'">
            <EditorHeaderForm :header="draft.content.header" />
          </template>
          <template v-else-if="activeStep.key === 'profile'">
            <textarea
              v-model="draft.content.profile"
              rows="8"
              class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </template>
          <template v-else-if="activeStep.key === 'skills'">
            <EditorSkillsForm :skills="draft.content.skills" />
          </template>
          <template v-else-if="activeStep.key === 'experiences'">
            <EditorExperiencesForm :experiences="draft.content.experiences" />
          </template>
          <template v-else-if="activeStep.key === 'metrics'">
            <EditorMetricsForm :metrics="draft.content.metrics" />
          </template>
          <template v-else-if="activeStep.key === 'education'">
            <EditorEducationForm :education="draft.content.education" :languages="draft.content.languages" />
          </template>

          <div class="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
            <button
              type="button"
              class="rounded-lg border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-50 disabled:opacity-40"
              :disabled="currentStep === 0"
              @click="currentStep--"
            >
              ← Précédent
            </button>
            <span class="text-xs text-slate-400">Étape {{ currentStep + 1 }} / {{ editorSteps.length }}</span>
            <button
              type="button"
              class="rounded-lg border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-50 disabled:opacity-40"
              :disabled="currentStep === editorSteps.length - 1"
              @click="currentStep++"
            >
              Suivant →
            </button>
          </div>
        </div>
      </div>

      <!-- Préview -->
      <div ref="previewWrap" class="min-w-0 print:w-full">
        <div class="sticky top-6 print:static">
          <div
            class="origin-top-left shadow-lg print:shadow-none"
            :style="{ transform: `scale(${scale})`, width: '210mm' }"
          >
            <CvDocument :content="draft.content" />
          </div>
        </div>
      </div>
    </div>

    <EditorSnapshotDrawer
      :open="historyOpen"
      :snapshots="snapshots"
      :busy="saveState === 'saving'"
      @close="historyOpen = false"
      @restore="restore"
      @snapshot-now="snapshotNow"
    />
  </div>
</template>
