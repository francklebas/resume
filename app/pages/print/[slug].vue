<script setup lang="ts">
import type { CvContent } from '~/types/cv'

definePageMeta({ layout: 'print' })

const route = useRoute()
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
  <CvDocument v-if="data" :content="data.content" />
</template>
