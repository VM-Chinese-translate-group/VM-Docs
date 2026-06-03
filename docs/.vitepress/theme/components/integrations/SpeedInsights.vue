<script setup lang="ts">
import { onMounted, ref } from 'vue'

const SpeedInsightsComponent = ref<any>(null)

onMounted(async () => {
  if (typeof window !== 'undefined') {
    const { SpeedInsights } = await import('@vercel/speed-insights/vue')
    SpeedInsightsComponent.value = SpeedInsights
  }
})
</script>

<template>
  <component :is="SpeedInsightsComponent" v-if="SpeedInsightsComponent" />
</template>
