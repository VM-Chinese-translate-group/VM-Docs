<script lang="ts">
import {defineComponent} from 'vue'
import { SpeedInsights } from '@vercel/speed-insights/vue'

export default defineComponent({
  name: "SpeedInsights",
  components: {
    SpeedInsights
  }
})
</script>

<template>
  <SpeedInsights />
</template>