<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue'
import { useData } from 'vitepress'
import { MdEditor, config, type ExposeParam, type InnerError } from 'md-editor-v3'
import SiteMarkdownPreview from './SiteMarkdownPreview.vue'
import Cropper from 'cropperjs'
import screenfull from 'screenfull'
import * as prettier from 'prettier/standalone'
import * as parserMarkdown from 'prettier/plugins/markdown'
import 'cropperjs/dist/cropper.css'

// 编辑器只负责源码输入；格式化和图片裁剪均使用本地依赖。
config({
  editorExtensions: {
    prettier: { prettierInstance: prettier, parserMarkdownInstance: parserMarkdown },
    cropper: { instance: Cropper },
  },
})

const sample =
  String.raw`---
title: Markdown 创作空间
cardTitle: VM Docs
---

# Markdown 创作空间

在左侧编辑，右侧实时预览。支持 **粗体**、*斜体*、~~删除线~~、==高亮==、H~2~O、x^2^ 和 :smile:。

:::tip 站点原生预览
预览使用本站正文样式、代码高亮和已注册的 Vue 组件。
:::

## 组件与步骤

:::demo 原生链接卡片
<MiniLinkCard :title="frontmatter.cardTitle" href="https://docs.vmct.top/" icon="📘" :external="true" />
:::

:::stepper
@tab 编写
在左侧编辑 Markdown，或导入已有文档。

@tab 预览
在右侧检查本站组件、公式与图表，再导出文件。
:::

## 列表与引用

- 无序列表
  - 嵌套条目

1. 有序列表
2. 第二个条目

- [x] 完成基础语法
- [ ] 开始写作

> 引用可以包含 **格式**，也可以嵌套：
>
> > 第二层引用

---

## 链接与图片

[VM Docs](https://docs.vmct.top/) · [引用式链接][vm]

![VM 标志](/img/logo.png "图片标题")

[vm]: https://www.vmct.top/

## 表格

| 特性 | 语法 | 状态 |
| :--- | :---: | ---: |
| 行内代码 | ` +
  '`const answer = 42`' +
  String.raw` | 支持 |
| 表格对齐 | 左 / 中 / 右 | 支持 |

## 代码高亮

` +
  '```typescript' +
  String.raw`
interface Greeting {
  message: string
}
const greeting: Greeting = { message: '你好，Markdown！' }
console.log(greeting.message)
` +
  '```' +
  String.raw`

## 数学公式

行内公式：$E = mc^2$。

$$
\int_0^1 x^2\,dx = \frac{1}{3}
$$

## Mermaid 图表

` +
  '```mermaid' +
  String.raw`
flowchart LR
  A[编写 Markdown] --> B[实时预览]
  B --> C[导出文件]
` +
  '```' +
  String.raw`

## 脚注、缩写与定义列表

这是一条带有脚注的说明[^note]。HTML 是常用的标记语言。

[^note]: 支持多段脚注及返回正文链接。

*[HTML]: 超文本标记语言

Markdown
: 轻量级标记语言。

## 安全 HTML

<details>
<summary>点击展开</summary>

支持 HTML 的折叠内容，危险脚本和事件属性会被过滤。

</details>
`

const { isDark } = useData()
const storageKey = 'vm-docs:markdown-draft:v1'
const editor = ref<ExposeParam>()
const fileInput = ref<HTMLInputElement>()
const text = ref(sample)
const documentPath = ref('')
const workspace = ref<HTMLElement>()
const previewPane = ref<HTMLElement>()
const showOutline = ref(false)
const syncScroll = ref(true)
const fullscreen = ref(false)
const headings = shallowRef<{ element: HTMLElement; text: string; level: number }[]>([])
const ready = ref(false)
const draftStatus = ref('正在读取本地草稿')
const message = ref('')
const mode = ref<'edit' | 'split' | 'preview'>('split')
const characters = computed(() => Array.from(text.value).length)
const lines = computed(() => text.value.split('\n').length)
let saveTimer: ReturnType<typeof setTimeout> | undefined

let headingObserver: MutationObserver | undefined
let scrollFrame = 0
let scrollTarget: HTMLElement | undefined

function refreshHeadings() {
  headings.value = Array.from(
    previewPane.value?.querySelectorAll<HTMLElement>(
      '#markdown-site-preview h1, #markdown-site-preview h2, #markdown-site-preview h3, #markdown-site-preview h4, #markdown-site-preview h5, #markdown-site-preview h6',
    ) ?? [],
  ).map((element) => ({
    element,
    text: element.textContent?.replace(/^\s*#\s*/, '').trim() || '未命名标题',
    level: Number(element.tagName.slice(1)),
  }))
}

watch(previewPane, (pane) => {
  headingObserver?.disconnect()
  if (!pane) return
  headingObserver = new MutationObserver(refreshHeadings)
  headingObserver.observe(pane, { childList: true, subtree: true, characterData: true })
  refreshHeadings()
})

function synchronizeScroll(event: Event) {
  if (!syncScroll.value || mode.value !== 'split') return
  const source = editor.value?.getEditorView()?.scrollDOM
  const preview = previewPane.value
  const current = event.target as HTMLElement | null
  if (
    !source ||
    !preview ||
    !current ||
    (current !== source && current !== preview) ||
    current === scrollTarget
  ) {
    return
  }
  const target = current === source ? preview : source
  const range = current.scrollHeight - current.clientHeight
  scrollTarget = target
  target.scrollTop =
    range > 0
      ? (current.scrollTop / range) * Math.max(0, target.scrollHeight - target.clientHeight)
      : 0
  cancelAnimationFrame(scrollFrame)
  scrollFrame = requestAnimationFrame(() => {
    scrollTarget = undefined
  })
}

async function goToHeading(element: HTMLElement) {
  if (mode.value === 'edit') {
    mode.value = window.matchMedia('(max-width: 767px)').matches ? 'preview' : 'split'
    await nextTick()
  }
  const pane = previewPane.value
  if (!pane || !element.isConnected) return
  pane.scrollTop += element.getBoundingClientRect().top - pane.getBoundingClientRect().top - 20
}

function escapeFullscreen(event: KeyboardEvent) {
  if (event.key === 'Escape' && (!screenfull.isEnabled || !screenfull.isFullscreen)) {
    fullscreen.value = false
  }
}

function nativeFullscreenChanged() {
  if (screenfull.isEnabled) fullscreen.value = screenfull.element === workspace.value
}

async function toggleFullscreen() {
  if (!screenfull.isEnabled || !workspace.value) {
    fullscreen.value = !fullscreen.value
    return
  }
  try {
    await screenfull.toggle(workspace.value)
  } catch {
    message.value = '无法进入或退出浏览器全屏，请检查浏览器权限。'
  }
}

function workspaceShortcut(event: KeyboardEvent) {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
    event.preventDefault()
    event.stopPropagation()
    exportMarkdown()
  }
}

function saveDraft() {
  clearTimeout(saveTimer)
  try {
    localStorage.setItem(
      storageKey,
      JSON.stringify({
        text: text.value,
        documentPath: documentPath.value,
      }),
    )
    draftStatus.value = '草稿已保存到此浏览器'
    return true
  } catch {
    draftStatus.value = '本地保存失败，请导出文件以免丢失内容'
    return false
  }
}

watch([text, documentPath], () => {
  if (!ready.value) return
  draftStatus.value = '正在保存…'
  clearTimeout(saveTimer)
  saveTimer = setTimeout(saveDraft, 400)
})

function beforeUnload(event: BeforeUnloadEvent) {
  if (!saveDraft()) {
    event.preventDefault()
    event.returnValue = ''
  }
}

onMounted(() => {
  try {
    const stored = localStorage.getItem(storageKey)
    if (stored !== null) {
      const draft = JSON.parse(stored)
      if (typeof draft.text !== 'string') {
        throw new Error('Invalid draft')
      }
      text.value = draft.text
      documentPath.value = typeof draft.documentPath === 'string' ? draft.documentPath : ''
      draftStatus.value = '已恢复本地草稿'
    } else {
      draftStatus.value = '修改后自动保存到此浏览器'
    }
  } catch {
    draftStatus.value = '无法读取本地草稿，请使用文件导入 / 导出'
  }
  if (window.matchMedia('(max-width: 767px)').matches) mode.value = 'edit'
  ready.value = true
  window.addEventListener('beforeunload', beforeUnload)
  window.addEventListener('keydown', escapeFullscreen)
  if (screenfull.isEnabled) screenfull.on('change', nativeFullscreenChanged)
})

onBeforeUnmount(() => {
  if (ready.value) saveDraft()
  window.removeEventListener('beforeunload', beforeUnload)
  window.removeEventListener('keydown', escapeFullscreen)
  headingObserver?.disconnect()
  cancelAnimationFrame(scrollFrame)
  if (screenfull.isEnabled) {
    screenfull.off('change', nativeFullscreenChanged)
  }
})

function replaceDocument(content: string) {
  if (text.value && !window.confirm('替换当前文档？请先导出需要保留的内容。')) return
  text.value = content
  editor.value?.resetHistory()
  message.value = ''
  saveDraft()
}

async function importFile(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  try {
    const content = (await file.text()).replace(/^\uFEFF/, '')
    replaceDocument(content)
  } catch {
    message.value = '文件读取失败，请重新选择 UTF-8 编码的 Markdown 文件。'
  } finally {
    input.value = ''
  }
}

function download(content: string, extension: string, mime: string) {
  const url = URL.createObjectURL(new Blob([content], { type: mime }))
  const link = document.createElement('a')
  link.href = url
  link.download = `文档.${extension}`
  link.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

function exportMarkdown() {
  download(text.value, 'md', 'text/markdown;charset=utf-8')
  saveDraft()
  message.value = '已导出 Markdown 文件。'
}

async function uploadImages(files: File[], callback: (urls: string[]) => void) {
  try {
    const urls = await Promise.all(
      files.map(
        (file) =>
          new Promise<string>((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = () => resolve(reader.result as string)
            reader.onerror = () => reject(reader.error)
            reader.readAsDataURL(file)
          }),
      ),
    )
    callback(urls)
    message.value = '图片已嵌入文档，不会上传到服务器；大图片可能超出浏览器草稿容量，请及时导出。'
  } catch {
    message.value = '图片读取失败，请重试或使用图片链接。'
  }
}

function reportError(error: InnerError) {
  message.value = `编辑器错误（${error.name}）：${error.message}`
}
</script>

<template>
  <section
    ref="workspace"
    class="markdown-tool"
    :class="{ 'workspace-fullscreen': fullscreen }"
    aria-labelledby="markdown-title"
    @keydown.capture="workspaceShortcut"
  >
    <header class="editor-heading">
      <div>
        <h1 id="markdown-title">VMDocs Editor</h1>
        <p>VMDocs编辑器，用于预览编辑的页面内容</p>
      </div>
      <a href="#markdown-help">语法与使用说明</a>
    </header>

    <div class="document-actions" aria-label="文档操作">
      <div class="file-buttons">
        <button type="button" class="workspace-button" @click="replaceDocument('')">新建</button>
        <button type="button" class="workspace-button" @click="fileInput?.click()">
          导入 Markdown
        </button>
        <button type="button" class="workspace-button" @click="replaceDocument(sample)">
          载入示例
        </button>
        <button type="button" class="workspace-button primary" @click="exportMarkdown">
          导出 Markdown
        </button>
      </div>
      <input
        ref="fileInput"
        type="file"
        accept=".md,.markdown,.txt,text/markdown,text/plain"
        aria-label="选择 Markdown 文件"
        hidden
        @change="importFile"
      />
    </div>

    <div class="document-path">
      <label for="markdown-document-path">文档 / 资源路径（可选）</label>
      <input
        id="markdown-document-path"
        v-model="documentPath"
        placeholder="/guide/example.md"
        aria-describedby="markdown-path-help"
        spellcheck="false"
      />
      <p id="markdown-path-help">
        相对图片和链接按此文档所在目录解析；留空时使用当前页面地址。以 /
        开头的路径从站点根目录解析，本地文件夹不会自动上传。
      </p>
    </div>

    <div class="view-actions">
      <div class="view-buttons" role="group" aria-label="编辑器视图">
        <button
          type="button"
          class="workspace-button"
          :aria-pressed="mode === 'edit'"
          @click="mode = 'edit'"
        >
          编辑
        </button>
        <button
          type="button"
          class="workspace-button"
          :aria-pressed="mode === 'split'"
          @click="mode = 'split'"
        >
          分屏
        </button>
        <button
          type="button"
          class="workspace-button"
          :aria-pressed="mode === 'preview'"
          @click="mode = 'preview'"
        >
          预览
        </button>
      </div>
      <div class="view-buttons" role="group" aria-label="预览工具">
        <button
          type="button"
          class="workspace-button"
          :aria-pressed="syncScroll"
          @click="syncScroll = !syncScroll"
        >
          同步滚动
        </button>
        <button
          type="button"
          class="workspace-button"
          :aria-expanded="showOutline"
          aria-controls="markdown-outline"
          @click="showOutline = !showOutline"
        >
          目录
        </button>
        <button
          type="button"
          class="workspace-button"
          :aria-pressed="fullscreen"
          @click="toggleFullscreen"
        >
          {{ fullscreen ? '退出全屏' : '全屏' }}
        </button>
      </div>
      <span class="draft-status" role="status">{{ draftStatus }}</span>
    </div>

    <div
      class="editor-workspace"
      :class="[`mode-${mode}`, { 'has-outline': showOutline }]"
      @scroll.capture="synchronizeScroll"
    >
      <div v-show="mode !== 'preview'" class="source-pane" aria-label="Markdown 源码">
        <MdEditor
          v-if="ready"
          id="markdown-workspace"
          ref="editor"
          v-model="text"
          language="zh-CN"
          :theme="isDark ? 'dark' : 'light'"
          :preview="false"
          :no-katex="true"
          :no-mermaid="true"
          :no-echarts="true"
          :no-highlight="true"
          :scroll-auto="false"
          :footers="[]"
          :toolbars-exclude="[
            'github',
            'preview',
            'previewOnly',
            'htmlPreview',
            'catalog',
            'fullscreen',
            'pageFullscreen',
          ]"
          placeholder="开始编写 Markdown…"
          @on-save="exportMarkdown"
          @on-upload-img="uploadImages"
          @on-error="reportError"
        />
      </div>
      <div
        ref="previewPane"
        v-show="mode !== 'edit'"
        class="preview-pane"
        role="region"
        aria-label="站点原生预览"
        tabindex="0"
      >
        <SiteMarkdownPreview v-if="ready" :source="text" :document-path="documentPath" />
      </div>
      <nav v-show="showOutline" id="markdown-outline" class="heading-catalog" aria-label="预览目录">
        <h2>文档目录</h2>
        <p v-if="!headings.length">文档中暂无标题。</p>
        <ol v-else>
          <li v-for="(heading, index) in headings" :key="index">
            <button
              type="button"
              class="catalog-button"
              :style="{ paddingInlineStart: `${(heading.level - 1) * 12 + 8}px` }"
              @click="goToHeading(heading.element)"
            >
              {{ heading.text }}
            </button>
          </li>
        </ol>
      </nav>
    </div>
    <div class="editor-summary">
      <span>{{ characters }} 字符 · {{ lines }} 行</span>
      <span>Ctrl / ⌘ + S 导出 · Ctrl / ⌘ + B 加粗 · Ctrl / ⌘ + F 查找</span>
    </div>
    <p v-if="message" class="editor-message" role="status">{{ message }}</p>

    <details id="markdown-help" class="editor-help">
      <summary>语法与使用说明</summary>
      <ul>
        <li>
          基础语法：六级标题、段落、换行、粗体、斜体、嵌套列表、引用、分隔线、转义、链接、图片、引用式链接、行内代码与围栏代码块。
        </li>
        <li>
          扩展语法：表格与对齐、删除线、任务列表、自动链接、脚注、缩写、定义列表、Emoji、
          <code>==高亮==</code>
          、
          <code>H~2~O</code>
          、
          <code>x^2^</code>
          。
        </li>
        <li>
          公式使用
          <code>$…$</code>
          或
          <code>$$…$$</code>
          ；图表使用
          <code>mermaid</code>
          代码块，数据图表使用
          <code>echarts</code>
          代码块（JSON / JSON5 配置）。工具栏可以直接插入公式、图表、链接、图片和表格。
        </li>
        <li>
          支持代码高亮、实际预览标题目录、按两侧滚动比例同步、格式化、查找替换、撤销重做和全屏。窄屏默认只显示编辑区，可通过视图按钮切换预览。
        </li>
        <li>
          支持安全 HTML、VitePress 提示 / demo / stepper 容器、本站已注册 Vue 组件与 Badge。
          组件绑定支持 JSON5 字面量及 frontmatter / site / theme / page 的属性引用；
          脚本、事件指令和任意 JavaScript 表达式不会执行，不支持的绑定会在预览中说明。
        </li>
        <li>
          草稿只保留当前一份，存放在当前浏览器；清除网站数据会删除草稿。导入 / 导出使用
          UTF-8，空文档也会保存。工具栏保存按钮与保存快捷键均导出 Markdown。
        </li>
        <li>
          粘贴、拖入或上传图片会将其嵌入
          Markdown，不会上传图片。图片链接仍会向对应地址发起请求；大文件请导出备份。
        </li>
      </ul>
    </details>
  </section>
</template>

<style src="md-editor-v3/lib/style.css"></style>

<style scoped>
.markdown-tool {
  max-width: 1600px;
  margin: 0 auto;
  padding: 32px;
}
.markdown-tool.workspace-fullscreen {
  position: fixed;
  inset: 0;
  z-index: 100;
  width: 100%;
  max-width: none;
  overflow: auto;
  overscroll-behavior: contain;
  background: var(--vp-c-bg);
}
.editor-heading,
.document-actions,
.file-buttons,
.view-actions,
.view-buttons,
.editor-summary {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}
.editor-heading,
.view-actions,
.editor-summary {
  justify-content: space-between;
}
.editor-heading h1 {
  font-size: 28px;
  font-weight: 700;
  line-height: 1.4;
}
.editor-heading p {
  margin-top: 8px;
  color: var(--vp-c-text-2);
}
.editor-heading a {
  color: var(--vp-c-brand-1);
}
.document-actions {
  justify-content: flex-end;
  margin: 24px 0 16px;
}
.document-path input {
  min-width: 0;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  padding: 6px 10px;
  background: var(--vp-c-bg);
}
.document-path {
  display: grid;
  grid-template-columns: auto minmax(180px, 420px);
  align-items: center;
  gap: 8px 12px;
  margin-bottom: 16px;
  font-size: 14px;
}
.document-path p {
  grid-column: 1 / -1;
  color: var(--vp-c-text-2);
  font-size: 13px;
}
.workspace-button {
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 14px;
  background: var(--vp-c-bg-soft);
  cursor: pointer;
}
.workspace-button:hover,
.workspace-button[aria-pressed='true'] {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}
.workspace-button.primary {
  background: var(--vp-c-brand-3);
  border-color: var(--vp-c-brand-3);
  color: var(--vp-c-white);
}
.workspace-button:focus-visible,
.catalog-button:focus-visible,
.editor-heading a:focus-visible,
.document-path input:focus-visible,
.editor-help summary:focus-visible,
.preview-pane:focus-visible {
  outline: 2px solid var(--vp-c-brand-1);
  outline-offset: 3px;
}
.view-actions {
  margin-bottom: 12px;
}
.draft-status,
.editor-summary {
  font-size: 13px;
  color: var(--vp-c-text-2);
}
.editor-workspace {
  display: flex;
  gap: 16px;
  height: min(72vh, 900px);
  min-height: 440px;
}
.source-pane,
.preview-pane {
  flex: 1 1 0;
  min-width: 0;
  min-height: 0;
  height: 100%;
}
.source-pane :deep(.md-editor) {
  width: 100%;
  height: 100%;
  border-radius: 8px;
  border-color: var(--vp-c-divider);
}
.preview-pane {
  overflow: auto;
  overscroll-behavior: contain;
  padding: 24px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg);
}
.heading-catalog {
  flex: 0 0 200px;
  min-width: 0;
  overflow: auto;
  padding: 12px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  font-size: 13px;
}
.heading-catalog h2 {
  margin-bottom: 10px;
  font-weight: 600;
}
.heading-catalog ol {
  list-style: none;
  margin: 0;
  padding: 0;
}
.catalog-button {
  display: block;
  width: 100%;
  padding: 6px 8px;
  text-align: start;
  overflow-wrap: anywhere;
  line-height: 1.5;
  color: var(--vp-c-text-2);
  cursor: pointer;
}
.catalog-button:hover {
  color: var(--vp-c-brand-1);
  background: var(--vp-c-bg-soft);
}
.editor-summary {
  margin-top: 10px;
}
.editor-message {
  padding: 10px 14px;
  margin-top: 12px;
  background: var(--vp-c-bg-soft);
  border-left: 3px solid var(--vp-c-brand-1);
}
.editor-help {
  margin-top: 24px;
  padding: 16px 20px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
}
.editor-help summary {
  cursor: pointer;
  font-weight: 600;
}
.editor-help ul {
  list-style: disc;
  padding-left: 20px;
  margin-top: 12px;
  line-height: 1.9;
}
.editor-help code {
  font-size: 0.9em;
  background: var(--vp-c-bg-soft);
  padding: 2px 4px;
  border-radius: 4px;
}
@media (max-width: 767px) {
  .markdown-tool {
    padding: 24px 16px;
  }
  .editor-heading h1 {
    font-size: 24px;
  }
  .file-buttons {
    gap: 8px;
  }
  .document-path {
    grid-template-columns: minmax(0, 1fr);
  }
  .editor-workspace {
    height: 68vh;
    min-height: 400px;
    gap: 8px;
    flex-wrap: wrap;
  }
  .editor-workspace.mode-split .source-pane,
  .editor-workspace.mode-split .preview-pane {
    flex-basis: calc(50% - 4px);
  }
  .preview-pane {
    padding: 16px;
  }
  .heading-catalog {
    flex-basis: 100%;
    max-height: 180px;
  }
  .editor-workspace.has-outline {
    height: auto;
  }
  .editor-workspace.has-outline .source-pane,
  .editor-workspace.has-outline .preview-pane {
    height: 68vh;
  }
}
</style>
