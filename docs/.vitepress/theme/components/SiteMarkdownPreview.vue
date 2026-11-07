<script setup lang="ts">
import {
  computed,
  defineComponent,
  Fragment,
  getCurrentInstance,
  h,
  nextTick,
  onBeforeUnmount,
  onErrorCaptured,
  onMounted,
  provide,
  ref,
  shallowRef,
  watch,
  type VNodeChild,
} from 'vue'
import { dataSymbol, useData } from 'vitepress'
import { VPBadge } from 'vitepress/theme'
import DOMPurify from 'dompurify'
import JSON5 from 'json5'
import type { ECharts, EChartsOption } from 'echarts'
import { createPreviewNodes, resolvePreviewResource } from '../composables/sitePreviewVNodes'
import { renderSiteMarkdown, type PreviewDiagram } from '../composables/sitePreviewMarkdown'
import 'katex/dist/katex.min.css'

const props = withDefaults(defineProps<{ source: string; documentPath?: string }>(), {
  documentPath: '',
})
const emit = defineEmits<{ error: [message: string] }>()
const parentData = useData()
const instance = getCurrentInstance()!
const root = ref<HTMLElement>()
const nodes = shallowRef<VNodeChild[]>([])
const diagnostics = ref<string[]>([])
const frontmatter = ref<Record<string, unknown>>({})
const rendering = ref(false)
const mounted = ref(false)
const revision = ref(0)
const page = computed(() => ({
  ...parentData.page.value,
  relativePath: props.documentPath || parentData.page.value.relativePath,
  title: String(frontmatter.value.title || 'Markdown 预览'),
  frontmatter: frontmatter.value,
}))
provide(dataSymbol, { ...parentData, page, frontmatter: computed(() => frontmatter.value) })

const RenderedContent = defineComponent({
  setup: () => () => h(Fragment, { key: revision.value }, nodes.value),
})
const charts = new Set<ECharts>()
const diagramUrls = new Set<string>()
const timers = new Set<number>()
let observer: ResizeObserver | undefined
let active = false
let queued = false
let version = 0

function report(message: string) {
  diagnostics.value = [...new Set([...diagnostics.value, message])]
  emit('error', diagnostics.value.join('\n'))
}

onErrorCaptured((error) => {
  report(`组件渲染失败：${error.message}`)
  return false
})

function disposeCharts() {
  observer?.disconnect()
  observer = undefined
  for (const chart of charts) chart.dispose()
  charts.clear()
  for (const url of diagramUrls) URL.revokeObjectURL(url)
  diagramUrls.clear()
}

function chartValue(value: unknown, key = ''): unknown {
  if (typeof value === 'string') {
    if (
      /^(?:image|symbol|link|sublink|href|url|src)$/.test(key) &&
      /^(?:javascript|vbscript|data|file|blob):/i.test(
        value.replace(/[\u0000-\u0020\u007f-\u009f]/g, ''),
      )
    )
      throw new Error(`ECharts 包含不安全的地址：${key}`)
    if (/^(?:image|symbol)$/.test(key)) {
      const prefix = value.startsWith('image://') ? 'image://' : ''
      if (prefix || key === 'image')
        return (
          prefix +
          resolvePreviewResource(
            value.slice(prefix.length),
            props.documentPath || parentData.page.value.relativePath,
            parentData.site.value.base,
          )
        )
    }
    if (/^(?:link|sublink|href|url|src)$/.test(key))
      return resolvePreviewResource(
        value,
        props.documentPath || parentData.page.value.relativePath,
        parentData.site.value.base,
      )
    return value
  }
  if (Array.isArray(value)) return value.map((item) => chartValue(item, key))
  if (value && typeof value === 'object') {
    const output: Record<string, unknown> = {}
    for (const [name, item] of Object.entries(value)) {
      if (['__proto__', 'prototype', 'constructor'].includes(name))
        throw new Error(`ECharts 不允许字段 ${name}`)
      if (key === 'feature' && name === 'dataView') {
        report('ECharts 安全预览已禁用 toolbox.feature.dataView 的 HTML 界面。')
        continue
      }
      output[name] = chartValue(item, name)
    }
    // Never permit ECharts' HTML tooltip renderer to interpret user strings as markup.
    if (key === 'tooltip') output.renderMode = 'richText'
    return output
  }
  return value
}

async function renderDiagrams(diagrams: PreviewDiagram[], current: number) {
  for (const diagram of diagrams) {
    if (current !== version || !mounted.value) return
    const element = root.value?.querySelector<HTMLElement>(`[data-preview-diagram="${diagram.id}"]`)
    if (!element) continue
    try {
      if (diagram.type === 'mermaid') {
        const { default: mermaid } = await import('mermaid')
        if (current !== version || !mounted.value) return
        // Keep Mermaid styling inside an SVG image, never in the editor document's CSS scope.
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: 'strict',
          secure: [
            'secure',
            'securityLevel',
            'startOnLoad',
            'maxTextSize',
            'maxEdges',
            'suppressErrorRendering',
            'dompurifyConfig',
          ],
          theme: parentData.isDark.value ? 'dark' : 'default',
          suppressErrorRendering: true,
          flowchart: { htmlLabels: false },
        })
        const result = await mermaid.render(diagram.id, diagram.source)
        if (current !== version || !mounted.value) return
        const fragment = DOMPurify.sanitize(result.svg, {
          USE_PROFILES: { html: true, svg: true, svgFilters: true },
          ADD_TAGS: ['foreignObject'],
          // Mermaid uses XHTML labels inside SVG, including class and state diagrams.
          HTML_INTEGRATION_POINTS: { foreignobject: true },
          FORBID_TAGS: ['script', 'iframe', 'object'],
          RETURN_DOM_FRAGMENT: true,
        })
        const svg = fragment.querySelector('svg')
        if (!svg) throw new Error('Mermaid 未生成有效的 SVG。')
        const { width, height } = svg.viewBox.baseVal
        const hasDimensions =
          Number.isFinite(width) && Number.isFinite(height) && width > 0 && height > 0
        if (hasDimensions) {
          svg.setAttribute('width', String(width))
          svg.setAttribute('height', String(height))
        }
        // XML serialization preserves XHTML namespaces and closes tags such as <br />.
        const serialized = new XMLSerializer().serializeToString(svg)
        const url = URL.createObjectURL(new Blob([serialized], { type: 'image/svg+xml' }))
        diagramUrls.add(url)
        const image = document.createElement('img')
        image.alt = 'Mermaid 图表'
        image.style.width = hasDimensions ? `${width}px` : 'auto'
        image.style.maxWidth = '100%'
        image.style.height = 'auto'
        image.src = url
        await image.decode()
        if (current !== version || !mounted.value) {
          URL.revokeObjectURL(url)
          diagramUrls.delete(url)
          return
        }
        element.replaceChildren(image)
      } else {
        const parsed: unknown = JSON5.parse(diagram.source)
        if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed))
          throw new Error('ECharts 代码块必须为 JSON5 配置对象；不支持执行 JavaScript。')
        const option = chartValue(parsed) as EChartsOption
        const echarts = await import('echarts')
        if (current !== version || !mounted.value) return
        const chart = echarts.init(element, parentData.isDark.value ? 'dark' : undefined, {
          renderer: 'svg',
        })
        charts.add(chart)
        chart.setOption({
          ...option,
          tooltip: Array.isArray(option.tooltip)
            ? option.tooltip.map((item) => ({ ...item, renderMode: 'richText' }))
            : { ...(option.tooltip || {}), renderMode: 'richText' },
        })
      }
    } catch (error) {
      if (current !== version || !mounted.value) return
      const message = `${diagram.type}：${error instanceof Error ? error.message : String(error)}`
      element.textContent = message
      element.setAttribute('role', 'alert')
      report(message)
    }
  }
  if (current === version && charts.size && root.value) {
    observer = new ResizeObserver(() => {
      for (const chart of charts) chart.resize()
    })
    observer.observe(root.value)
  }
}

async function drain() {
  if (active || !mounted.value) return
  active = true
  rendering.value = true
  try {
    while (queued && mounted.value) {
      queued = false
      const current = version
      const source = props.source
      const path = props.documentPath || parentData.page.value.relativePath
      try {
        const rendered = await renderSiteMarkdown(source, path, parentData.site.value.base)
        if (current !== version || !mounted.value) continue
        const issues = [...rendered.diagnostics]
        const nextNodes = createPreviewNodes(rendered.html, {
          components: { Badge: VPBadge, ...instance.appContext.components },
          scope: {
            frontmatter: rendered.frontmatter,
            page: {
              ...page.value,
              title: String(rendered.frontmatter.title || 'Markdown 预览'),
              relativePath: path || page.value.relativePath,
              frontmatter: rendered.frontmatter,
            },
            site: parentData.site.value,
            theme: parentData.theme.value,
            params: parentData.params.value,
          },
          documentPath: path,
          base: parentData.site.value.base,
          fragments: rendered.fragments,
          fragmentTag: rendered.fragmentTag,
          diagnostics: issues,
        })
        if (current !== version || !mounted.value) continue
        disposeCharts()
        diagnostics.value = [...new Set(issues)]
        frontmatter.value = rendered.frontmatter
        nodes.value = nextNodes
        revision.value++
        emit('error', diagnostics.value.join('\n'))
        await nextTick()
        if (current === version && mounted.value) await renderDiagrams(rendered.diagrams, current)
      } catch (error) {
        if (current !== version || !mounted.value) continue
        disposeCharts()
        nodes.value = []
        frontmatter.value = {}
        diagnostics.value = []
        report(error instanceof Error ? error.message : String(error))
      }
    }
  } finally {
    active = false
    rendering.value = false
  }
}

function schedule() {
  version++
  queued = true
  void drain()
}

watch(() => [props.source, props.documentPath, parentData.isDark.value], schedule, {
  flush: 'sync',
})
onMounted(() => {
  mounted.value = true
  schedule()
})
onBeforeUnmount(() => {
  mounted.value = false
  version++
  disposeCharts()
  for (const timer of timers) window.clearTimeout(timer)
  timers.clear()
})

async function handleClick(event: MouseEvent) {
  if (!(event.target instanceof Element)) return
  const target = event.target
  const summary = target.closest<HTMLButtonElement>('.demo-container-summary')
  if (summary && root.value?.contains(summary)) {
    const container = summary.closest('.demo-container')
    container?.classList.toggle('demo-container--open')
    summary.setAttribute(
      'aria-expanded',
      String(container?.classList.contains('demo-container--open')),
    )
    return
  }
  const tab = target.closest<HTMLInputElement>('input[data-preview-code-tab]')
  if (tab) {
    const group = tab.closest('.vp-code-group')
    group
      ?.querySelectorAll<HTMLElement>(':scope > .blocks > [data-preview-code-panel]')
      .forEach((panel) =>
        panel.classList.toggle(
          'active',
          panel.dataset.previewCodePanel === tab.dataset.previewCodeTab,
        ),
      )
    for (const chart of charts) chart.resize()
    return
  }
  const copy = target.closest<HTMLButtonElement>('button.copy')
  if (!copy || !root.value?.contains(copy)) return
  const code = copy.parentElement?.querySelector('pre code')
  if (!code) return
  event.preventDefault()
  event.stopPropagation()
  try {
    await navigator.clipboard.writeText(code.textContent || '')
    copy.classList.add('copied')
    copy.setAttribute('aria-label', '已复制')
    const timer = window.setTimeout(() => {
      copy.classList.remove('copied')
      copy.setAttribute('aria-label', '复制代码')
      timers.delete(timer)
    }, 1800)
    timers.add(timer)
  } catch (error) {
    report(`复制失败：${error instanceof Error ? error.message : String(error)}`)
  }
}
</script>

<template>
  <section class="site-markdown-preview" :aria-busy="rendering">
    <p class="site-preview-status" role="status" aria-live="polite">
      {{
        rendering
          ? '正在渲染站点预览…'
          : diagnostics.length
            ? `预览包含 ${diagnostics.length} 条诊断`
            : '站点预览'
      }}
    </p>
    <aside v-if="diagnostics.length" class="site-preview-diagnostics" role="alert">
      <strong>预览诊断</strong>
      <ul>
        <li v-for="message in diagnostics" :key="message">{{ message }}</li>
      </ul>
    </aside>
    <div id="markdown-site-preview" ref="root" class="vp-doc" @click="handleClick">
      <RenderedContent />
    </div>
  </section>
</template>

<style scoped>
.site-markdown-preview {
  min-width: 0;
  min-height: 0;
  width: 100%;
  overflow-wrap: anywhere;
}
.site-preview-status {
  margin: 0 0 12px;
  color: var(--vp-c-text-2);
  font-size: 12px;
}
.site-preview-diagnostics {
  margin-bottom: 16px;
  padding: 12px 16px;
  border: 1px solid var(--vp-c-warning-2);
  border-radius: 8px;
  background: var(--vp-c-warning-soft);
  color: var(--vp-c-text-1);
  font-size: 13px;
}
.site-preview-diagnostics ul {
  margin: 8px 0 0;
  padding-left: 20px;
  white-space: pre-wrap;
}
:deep(.site-preview-diagram) {
  min-height: 100px;
  margin: 16px 0;
  overflow: auto;
}
:deep(.site-preview-diagram[aria-label='echarts']) {
  height: 360px;
}
:deep(.site-preview-diagram svg) {
  max-width: 100%;
}
</style>
