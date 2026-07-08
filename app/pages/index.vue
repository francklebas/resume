<script setup lang="ts">
import type { CvRow } from '~/types/cv'

const { list, create, remove } = useCvs()

const { data: cvs, refresh } = await useAsyncData('cvs', () => list(), { default: () => [] as CvRow[] })

const busy = ref<string | null>(null)
const errorMsg = ref<string | null>(null)

async function withBusy(id: string, fn: () => Promise<void>) {
  busy.value = id
  errorMsg.value = null
  try {
    await fn()
    await refresh()
  }
  catch (e: unknown) {
    errorMsg.value = errorMessage(e)
  }
  finally {
    busy.value = null
  }
}

function createBase() {
  return withBusy('create-base', async () => {
    await create({ slug: 'base', name: 'CV de base', is_base: true, content: baseCvContent })
  })
}

function duplicate(cv: CvRow) {
  const name = window.prompt(`Nom de la variante (copie de « ${cv.name} ») :`, '')
  if (!name) return
  const slug = slugify(name)
  if (!slug) return
  if (cvs.value.some(c => c.slug === slug)) {
    errorMsg.value = `Le slug « ${slug} » existe déjà.`
    return
  }
  return withBusy(cv.id, async () => {
    await create({ slug, name, content: structuredClone(toRaw(cv.content)) })
  })
}

function removeCv(cv: CvRow) {
  if (!window.confirm(`Supprimer « ${cv.name} » ?`)) return
  return withBusy(cv.id, () => remove(cv.id))
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
}

function matchBadgeClass(score: number): string {
  if (score >= 80) return 'bg-emerald-50 text-emerald-700'
  if (score >= 50) return 'bg-amber-50 text-amber-700'
  return 'bg-red-50 text-red-700'
}
</script>

<template>
  <div>
    <div class="mb-6 flex items-center justify-between">
      <h1 class="text-2xl font-semibold tracking-tight">Mes CV</h1>
    </div>

    <JobAdIntake v-if="cvs.some(c => c.is_base)" @created="() => refresh()" />

    <p v-if="errorMsg" class="mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">
      {{ errorMsg }}
    </p>

    <div v-if="!cvs.length" class="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
      <p class="mb-4 text-slate-500">Aucun CV pour l'instant.</p>
      <button
        class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        :disabled="busy === 'create-base'"
        @click="createBase"
      >
        Créer le CV de base
      </button>
    </div>

    <ul v-else class="space-y-3">
      <li
        v-for="cv in cvs"
        :key="cv.id"
        class="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-5 py-4"
      >
        <div>
          <div class="flex items-center gap-2">
            <NuxtLink :to="`/editor/${cv.slug}`" class="font-semibold hover:text-blue-600">
              {{ cv.name }}
            </NuxtLink>
            <span
              v-if="cv.is_base"
              class="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700"
            >Base</span>
            <span
              v-if="cv.match_score !== null"
              class="rounded-full px-2 py-0.5 text-xs font-medium"
              :class="matchBadgeClass(cv.match_score)"
              :title="cv.match_summary ?? undefined"
            >{{ cv.match_score }}% match</span>
          </div>
          <p class="mt-0.5 text-xs text-slate-500">
            <code class="rounded bg-slate-100 px-1">{{ cv.slug }}</code>
            · modifié le {{ formatDate(cv.updated_at) }}
          </p>
        </div>
        <div class="flex items-center gap-2 text-sm">
          <NuxtLink
            :to="`/editor/${cv.slug}`"
            class="rounded-lg border border-slate-300 px-3 py-1.5 hover:bg-slate-50"
          >
            Éditer
          </NuxtLink>
          <button
            class="rounded-lg border border-slate-300 px-3 py-1.5 hover:bg-slate-50 disabled:opacity-50"
            :disabled="busy === cv.id"
            @click="duplicate(cv)"
          >
            Dupliquer
          </button>
          <button
            class="rounded-lg px-2 py-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
            :disabled="busy === cv.id"
            title="Supprimer"
            @click="removeCv(cv)"
          >
            ✕
          </button>
        </div>
      </li>
    </ul>
  </div>
</template>
