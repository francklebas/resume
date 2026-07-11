<script setup lang="ts">
import type { CvContent, CvTemplate } from '~/types/cv'

definePageMeta({ layout: 'print' })

const route = useRoute()
const template: CvTemplate = route.query.template === 'ats' ? 'ats' : 'design'
const { data, error } = await useFetch<{ content: CvContent }>(
  `/api/print/${route.params.slug}`,
  { query: { token: route.query.token } },
)

if (error.value) {
  throw createError({
    statusCode: error.value.statusCode ?? 401,
    statusMessage: 'Accès refusé',
  })
}
</script>

<template>
  <CvDocumentAts v-if="data && template === 'ats'" :content="data.content" />
  <CvDocument v-else-if="data" :content="data.content" />
</template>
