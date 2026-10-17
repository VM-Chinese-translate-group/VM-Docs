import { createGlobalState, useStorage } from '@vueuse/core'

export const useDemoCodeWrap = createGlobalState(() =>
  useStorage('vm-docs-demo-code-wrap', false, undefined, { initOnMounted: true }),
)
