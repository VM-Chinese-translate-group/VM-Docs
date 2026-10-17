<script setup lang="ts">
import { useDemoCodeWrap } from '../../composables/useDemoCodeWrap'

const wrapped = useDemoCodeWrap()
</script>

<template>
  <button
    type="button"
    class="demo-container-wrap"
    title="全局自动换行"
    aria-label="全局自动换行"
    :aria-pressed="wrapped"
    @click="wrapped = !wrapped"
  >
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <path
        fill="none"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linecap="round"
        stroke-linejoin="round"
        d="M4 6h16M4 12h13a3 3 0 0 1 0 6h-4m3-3-3 3 3 3M4 18h4"
      />
    </svg>
  </button>
</template>
