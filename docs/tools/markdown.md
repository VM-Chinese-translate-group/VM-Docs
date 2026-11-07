---
layout: page
title: VMDocs Editor
description: 支持实时预览、代码高亮、表格、任务列表、数学公式和 Mermaid 图表的在线 Markdown 编辑器。
sidebar: false
outline: false
footer: false
---

<script setup>
import { defineAsyncComponent } from 'vue'

const MarkdownEditor = defineAsyncComponent(() =>
  import('../.vitepress/theme/components/MarkdownEditor.vue')
)
</script>

<ClientOnly>
  <MarkdownEditor />
  <template #fallback>
    <p style="padding: 32px; text-align: center">正在加载 Markdown 编辑器，需要启用 JavaScript。</p>
  </template>
</ClientOnly>
