<script setup lang="ts">
import type { CvRow } from '~/types/cv'

const props = defineProps<{ cvs: CvRow[] }>()
const emit = defineEmits<{ created: [cv: CvRow] }>()

const { consented, grant } = useAiConsent()

const defaultSourceId = computed(() => props.cvs.find(c => c.is_base)?.id ?? props.cvs[0]?.id ?? '')
const sourceCvId = ref(defaultSourceId.value)
watch(defaultSourceId, (id) => { if (!sourceCvId.value) sourceCvId.value = id })

const instructions = ref('')
const generating = ref(false)
const errorMsg = ref<string | null>(null)

const canSubmit = computed(() =>
  consented.value
  && !generating.value
  && !!sourceCvId.value
  && instructions.value.trim().length > 0)

async function submit() {
  if (!canSubmit.value) return
  generating.value = true
  errorMsg.value = null
  try {
    const cv = await $fetch<CvRow>('/api/cvs/update', {
      method: 'POST',
      body: {
        sourceCvId: sourceCvId.value,
        instructions: instructions.value.trim(),
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
  <div class="update-intake" :class="{ 'is-generating': generating }">
    <p class="update-eyebrow">
      MAJ://INFOS
    </p>

    <p v-if="!cvs.length" class="update-hint">
      Crée d'abord un CV pour pouvoir le mettre à jour.
    </p>

    <template v-else>
      <select v-model="sourceCvId" class="update-select" :disabled="generating">
        <option v-for="cv in cvs" :key="cv.id" :value="cv.id">
          {{ cv.name }}{{ cv.is_base ? ' (base)' : '' }}
        </option>
      </select>

      <textarea
        v-model="instructions"
        rows="4"
        placeholder="Décris ce qu'il faut ajouter ou changer (ex. « J'ai obtenu la certification AWS Solutions Architect en juillet 2026 »)"
        class="update-textarea"
        autocorrect="off"
        :disabled="generating"
      />

      <p v-if="errorMsg" class="update-error">
        {{ errorMsg }}
      </p>

      <label v-if="!consented" class="update-consent">
        <input type="checkbox" @change="grant">
        <span>
          J'accepte que ce contenu soit transmis à Mistral AI pour analyse
          (<NuxtLink to="/confidentialite" target="_blank">politique de confidentialité</NuxtLink>)
        </span>
      </label>

      <div class="update-actions">
        <button
          type="button"
          class="update-submit"
          :disabled="!canSubmit"
          @click="submit"
        >
          {{ generating ? 'Mise à jour en cours…' : 'Générer le CV mis à jour →' }}
        </button>
      </div>
    </template>
  </div>
</template>

<style scoped>
.update-intake {
  border-radius: 1rem;
  border: 1px solid #dbe4f7;
  background: #f7f8fa;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.update-eyebrow {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 0.65rem;
  letter-spacing: 0.12em;
  color: #2f5fc4;
  margin: 0 0 0.75rem;
}

.update-hint {
  margin: 0;
  font-size: 0.85rem;
  color: #475569;
}

.update-select {
  width: 100%;
  background: #ffffff;
  border: 1px solid #e6ebf5;
  border-radius: 0.75rem;
  padding: 0.6rem 0.75rem;
  font-size: 0.9rem;
  color: #1e2433;
  margin-bottom: 0.75rem;
}

.update-textarea {
  width: 100%;
  resize: vertical;
  background: #ffffff;
  border: 1px solid #e6ebf5;
  border-radius: 0.75rem;
  padding: 0.9rem 1rem;
  font-size: 0.9rem;
  color: #1e2433;
  line-height: 1.5;
}

.update-textarea:focus,
.update-select:focus {
  outline: none;
  border-color: #2f5fc4;
  box-shadow: 0 0 0 3px rgba(47, 95, 196, 0.12);
}

.update-textarea:disabled,
.update-select:disabled {
  opacity: 0.6;
}

.update-error {
  margin: 0.6rem 0 0;
  font-size: 0.8rem;
  color: #b91c1c;
}

.update-consent {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  margin-top: 0.75rem;
  font-size: 0.8rem;
  color: #475569;
  cursor: pointer;
}

.update-consent input {
  margin-top: 0.15rem;
}

.update-consent :deep(a) {
  color: #2f5fc4;
  text-decoration: underline;
}

.update-actions {
  margin-top: 0.9rem;
  display: flex;
  justify-content: flex-end;
}

.update-submit {
  border-radius: 0.5rem;
  background: #2f5fc4;
  color: white;
  font-size: 0.875rem;
  font-weight: 500;
  padding: 0.5rem 1rem;
  white-space: nowrap;
}

.update-submit:hover:not(:disabled) {
  background: #2951a8;
}

.update-submit:disabled {
  opacity: 0.5;
}
</style>
