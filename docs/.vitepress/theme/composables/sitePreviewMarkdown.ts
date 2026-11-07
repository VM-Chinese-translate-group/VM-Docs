import MarkdownIt from 'markdown-it'
import type Token from 'markdown-it/lib/token.mjs'
import anchor from 'markdown-it-anchor'
// @ts-ignore
import container from 'markdown-it-container'
// @ts-ignore
import taskLists from 'markdown-it-task-lists'
// @ts-ignore
import sub from 'markdown-it-sub'
// @ts-ignore
import sup from 'markdown-it-sup'
// @ts-ignore
import { full as emoji } from 'markdown-it-emoji'
// @ts-ignore
import mark from 'markdown-it-mark'
// @ts-ignore
import deflist from 'markdown-it-deflist'
import { componentPlugin } from '@mdit-vue/plugin-component'
import { katex } from '@mdit/plugin-katex'
import { createHighlighter, bundledLanguages, type BundledLanguage, type Highlighter } from 'shiki'
import {
  transformerMetaHighlight,
  transformerNotationDiff,
  transformerNotationFocus,
  transformerNotationHighlight,
  transformerNotationErrorLevel,
} from '@shikijs/transformers'
import { parseDocument } from 'yaml'
import {
  configureSiteMarkdown,
  siteCodeThemes,
  siteCodeColorReplacements,
  siteHeadingSlug,
} from '../plugins/SiteMarkdown.mts'
import { findContainerClose } from '../plugins/containerBoundary.mts'
import { resolvePreviewExpression, resolvePreviewResource } from './sitePreviewVNodes'

declare const __VM_DOC_FILES__: string[]

export interface PreviewDiagram {
  id: string
  type: 'mermaid' | 'echarts'
  source: string
}
export interface PreviewMarkdown {
  html: string
  frontmatter: Record<string, unknown>
  fragments: Map<string, string>
  fragmentTag: string
  diagrams: PreviewDiagram[]
  diagnostics: string[]
}

let highlighterPromise: Promise<Highlighter> | undefined
const escape = new MarkdownIt().utils.escapeHtml

interface TreeNode {
  filename: string
  comment: string
  children: TreeNode[]
  level: number
  expanded: boolean
  focus: boolean
  type: string
  diff?: string
}

function parseTree(content: string, fence: boolean): TreeNode[] {
  const root = { level: -1, children: [] as TreeNode[] }
  const stack: Array<{ level: number; children: TreeNode[] }> = [root]
  const lines = content.trimEnd().split('\n')
  const initialIndent = lines[0]?.match(/^\s*/)?.[0].length || 0
  for (const line of lines) {
    const match = fence
      ? line.match(/^((?:│ {3}| {4})*)(?:├|└)── (.+)$/u)
      : line.match(/^(\s*)-(.*)$/)
    if (!match) continue
    const level = fence
      ? match[1].length / 4
      : Math.max(0, Math.floor((match[1].length - initialIndent) / 2))
    let info = match[2].trim()
    let diff: string | undefined
    if (/^(?:\+\+|--)/.test(info)) {
      diff = info.startsWith('++') ? 'add' : 'remove'
      info = info.slice(2).trim()
    }
    const focused = info.match(/^\*\*(.*?)\*\*(?:$|\s+)/)
    const sharp = info.indexOf('#')
    let filename = focused ? focused[1] : info.slice(0, sharp < 0 ? info.length : sharp).trim()
    const comment = focused
      ? info.slice(focused[0].length).trim()
      : sharp < 0
        ? ''
        : info.slice(sharp).trim()
    const folder = filename.endsWith('/')
    filename = filename.replace(/\/$/, '')
    while (stack.length > 1 && stack[stack.length - 1].level >= level) stack.pop()
    const node: TreeNode = {
      filename,
      comment,
      children: [],
      level,
      expanded: !folder,
      focus: !!focused,
      type: folder ? 'folder' : 'file',
      diff,
    }
    stack[stack.length - 1].children.push(node)
    stack.push(node)
  }
  return root.children
}

function configureBrowserSyntax(
  md: MarkdownIt,
  documentPath: string,
  base: string,
  diagnostics: string[],
) {
  function treeMarkup(content: string, fence: boolean, title = '') {
    const nodes = parseTree(content, fence)
    function plain(items: TreeNode[], prefix = ''): string {
      return items
        .map(
          (node, index) =>
            `${prefix}${index === items.length - 1 ? '└── ' : '├── '}${node.filename}\n${plain(node.children, `${prefix}${index === items.length - 1 ? '    ' : '│   '}`)}`,
        )
        .join('')
    }
    function render(items: TreeNode[]): string {
      return items
        .map((node) => {
          const folder = node.type === 'folder' || node.children.length > 0
          const nested =
            render(node.children) ||
            (folder ? `<VPFileTreeNode filename="…" type="file" :level="${node.level + 1}" />` : '')
          return `<VPFileTreeNode filename="${escape(node.filename)}" type="${folder ? 'folder' : 'file'}" :level="${node.level}" :expanded="${folder && node.expanded}" :focus="${node.focus}"${node.diff ? ` diff="${node.diff}"` : ''}>${node.comment ? `<template #comment>${md.renderInline(node.comment)}</template>` : ''}${nested}</VPFileTreeNode>`
        })
        .join('\n')
    }
    return `<VPFileTree title="${escape(title)}" text="${encodeURIComponent(fence ? content.trim() : `.\n${plain(nodes)}`.trim())}">${render(nodes)}</VPFileTree>`
  }
  md.block.ruler.before('fence', 'preview_file_tree', (state, startLine, endLine, silent) => {
    const line = state.src
      .slice(state.bMarks[startLine] + state.tShift[startLine], state.eMarks[startLine])
      .trim()
    const match = line.match(/^:::\s*file-tree(?:\s+(.*))?$/)
    if (!match) return false
    const close = findContainerClose(state, startLine, endLine)
    if (close < 0) return false
    if (silent) return true
    const token = state.push('preview_file_tree', '', 0)
    token.content = Array.from({ length: close - startLine - 1 }, (_, index) =>
      state.src.slice(state.bMarks[startLine + index + 1], state.eMarks[startLine + index + 1]),
    ).join('\n')
    token.meta = { title: match[1] || '' }
    state.line = close + 1
    return true
  })
  md.renderer.rules.preview_file_tree = (tokens, index) =>
    treeMarkup(tokens[index].content, false, tokens[index].meta.title)
  md.inline.ruler.before('link', 'preview_wiki_link', (state, silent) => {
    const opener = state.src.startsWith('![[', state.pos)
      ? 3
      : state.src.startsWith('[[', state.pos)
        ? 2
        : 0
    if (!opener) return false
    const end = state.src.indexOf(']]', state.pos + opener)
    if (end < 0 || state.src[end + 2] === '(') return false
    const raw = state.src.slice(state.pos + opener, end)
    const pipe = raw.indexOf('|')
    const target = (pipe < 0 ? raw : raw.slice(0, pipe)).trim()
    let label = pipe < 0 ? target : raw.slice(pipe + 1)
    let url: string
    let file = ''
    if (/^[#^]/.test(target)) {
      url = `#${target.slice(1)}`
      if (pipe < 0) label = target.slice(1)
    } else {
      const parsed = new URL(target, 'https://preview.invalid/')
      const requested = decodeURIComponent(parsed.pathname)
        .replace(/^\/?docs\//, '')
        .replace(/^\//, '')
        .replace(/\.md$/i, '')
        .toLowerCase()
      const candidates = __VM_DOC_FILES__.filter((candidate) => {
        const normalized = candidate
          .replace(/^public\//, '')
          .replace(/\.md$/i, '')
          .toLowerCase()
        return normalized === requested || normalized.split('/').pop() === requested
      })
      const exact = candidates.find(
        (candidate) =>
          candidate
            .replace(/^public\//, '')
            .replace(/\.md$/i, '')
            .toLowerCase() === requested,
      )
      const localDir = documentPath
        .replace(/^\/?docs\//, '')
        .replace(/[^/]*$/, '')
        .toLowerCase()
      file =
        exact ||
        candidates.find((candidate) => candidate.toLowerCase() === `${localDir}${requested}.md`) ||
        (candidates.length === 1 ? candidates[0] : '')
      if (!file) {
        if (!silent)
          diagnostics.push(
            candidates.length
              ? `Wiki 链接 [[${target}]] 匹配多个文件；请使用完整文档路径。`
              : `Wiki 链接 [[${target}]] 未找到站点文件。`,
          )
        return false
      }
      url = resolvePreviewResource(
        `/${file.replace(/^public\//, '').replace(/\.md$/i, '')}${parsed.search}${parsed.hash}`,
        '',
        base,
      )
    }
    if (!silent) {
      const token = state.push('html_inline', '', 0)
      const dimensions = label.match(/(?:^|\|)(\d+)(?:x(\d+))?$/)
      const size = dimensions
        ? ` width="${dimensions[1]}"${dimensions[2] ? ` height="${dimensions[2]}"` : ''}`
        : ''
      const mediaLabel = dimensions ? label.slice(0, dimensions.index) : label
      if (/\.(?:png|jpe?g|gif|svg|webp|ico|bmp|tiff|apng|avif|jfif|pjpeg|pjp|xbm)$/i.test(file))
        token.content = `<img src="${escape(url)}" alt="${escape(mediaLabel)}"${size}>`
      else if (/\.(?:mp3|flac|wav|ogg|opus|webm|acc)$/i.test(file))
        token.content = `<audio controls preload="metadata" title="${escape(mediaLabel)}"${size}><source src="${escape(url)}"></audio>`
      else if (/\.(?:mp4|mov|mkv|3gp|flv)$/i.test(file))
        token.content = `<video controls preload="metadata" title="${escape(mediaLabel)}"${size}><source src="${escape(url)}"></video>`
      else token.content = `<a href="${escape(url)}">${md.renderInline(label)}</a>`
    }
    state.pos = end + 2
    return true
  })
  return treeMarkup
}

export async function renderSiteMarkdown(
  source: string,
  documentPath: string,
  base: string,
): Promise<PreviewMarkdown> {
  const diagnostics: string[] = []
  let body = source.replace(/^\uFEFF/, '')
  let frontmatter: Record<string, unknown> = {}
  if (/^---(?:\r?\n|$)/.test(body)) {
    const match = body.match(/^---\r?\n([\s\S]*?)\r?\n(?:---|\.\.\.)(?:\r?\n|$)/)
    if (!match) throw new Error('Frontmatter 缺少结束的 --- 或 ...。')
    const yaml = parseDocument(match[1], { uniqueKeys: true })
    if (yaml.errors.length)
      throw new Error(`Frontmatter：${yaml.errors.map((error) => error.message).join('\n')}`)
    diagnostics.push(...yaml.warnings.map((warning) => `Frontmatter：${warning.message}`))
    const parsed = yaml.toJS({ maxAliasCount: 100 })
    if (parsed !== null && (typeof parsed !== 'object' || Array.isArray(parsed)))
      throw new Error('Frontmatter 必须是 YAML 映射。')
    frontmatter = parsed || {}
    body = body.slice(match[0].length)
  }
  const fragments = new Map<string, string>()
  const fragmentTag = `site-generated-${crypto.randomUUID()}`
  let sequence = 0
  const fragment = (html: string) => {
    const id = String(++sequence)
    fragments.set(id, html)
    return `<${fragmentTag} data-id="${id}"></${fragmentTag}>`
  }
  const requested = new Map<string, { code: string; lang: string; meta: string }>()
  const highlighted = new Map<string, string>()
  const diagrams: PreviewDiagram[] = []
  let collecting = true
  const md = new MarkdownIt({
    html: true,
    linkify: true,
    highlight(code, lang, meta) {
      const key = JSON.stringify([code, lang, meta])
      requested.set(key, { code, lang, meta })
      return collecting ? '' : fragment(highlighted.get(key) || '')
    },
  })
  md.use(componentPlugin)
    .use(taskLists, { enabled: false, label: true })
    .use(sub)
    .use(sup)
    .use(emoji)
    .use(mark)
    .use(deflist)
  configureSiteMarkdown(md)
  md.core.ruler.after('inline', 'preview_heading_frontmatter', (state) => {
    for (let index = 0; index < state.tokens.length; index++) {
      if (state.tokens[index].type !== 'heading_open') continue
      for (const token of state.tokens[index + 1]?.children || []) {
        if (token.type !== 'text') continue
        token.content = token.content.replace(
          /\{\{\s*((?:\$?frontmatter)(?:\.[\w$]+|\[(?:\d+|'[^']*'|"[^"]*")\])*)\s*\}\}/g,
          (original, expression) => {
            try {
              const value = resolvePreviewExpression(expression, { frontmatter })
              return value !== null && typeof value === 'object'
                ? JSON.stringify(value, null, 2)
                : String(value ?? '')
            } catch {
              return original
            }
          },
        )
      }
    }
  })
  md.use(anchor, {
    slugify: siteHeadingSlug,
    getTokensText: (tokens) =>
      tokens
        .filter((token) => !['html_inline', 'emoji'].includes(token.type))
        .map((token) => token.content)
        .join(''),
    permalink(slug, _options, state, index) {
      const inline = state.tokens[index + 1]
      const title =
        inline.children
          ?.filter((token) => ['text', 'code_inline'].includes(token.type))
          .map((token) => token.content)
          .join('')
          .trim() || ''
      const space = new state.Token('text', '', 0)
      space.content = ' '
      const open = new state.Token('link_open', 'a', 1)
      open.attrs = [
        ['class', 'header-anchor'],
        ['href', `#${slug}`],
        ['aria-label', `Permalink to “${title}”`],
      ]
      const symbol = new state.Token('html_inline', '', 0)
      symbol.content = '&#8203;'
      inline.children?.push(space, open, symbol, new state.Token('link_close', 'a', -1))
    },
  })
  md.use(katex, {
    trust: false,
    throwOnError: true,
    strict: 'warn',
    transformer(html: string) {
      if (html.includes('katex-error')) diagnostics.push('KaTeX 公式无效；请查看公式旁的错误提示。')
      return fragment(html)
    },
  })
  for (const kind of ['tip', 'info', 'warning', 'danger', 'details']) {
    md.use(container, kind, {
      render(tokens: Token[], index: number) {
        if (tokens[index].nesting < 0) return kind === 'details' ? '</details>\n' : '</div>\n'
        const title =
          tokens[index].info.trim().slice(kind.length).trim() ||
          (kind === 'details' ? 'Details' : kind.toUpperCase())
        return kind === 'details'
          ? `<details class="details custom-block"><summary>${md.renderInline(title)}</summary>\n`
          : `<div class="${kind} custom-block"><p class="custom-block-title">${md.renderInline(title)}</p>\n`
      },
    })
  }
  md.use(container, 'code-group', {
    render(tokens: Token[], index: number) {
      if (tokens[index].nesting < 0) return '</div></div>\n'
      const group = `${fragmentTag}-${index}-${sequence++}`
      const fences: Token[] = []
      let nesting = 1
      for (let cursor = index + 1; cursor < tokens.length && nesting; cursor++) {
        const token = tokens[cursor]
        if (token.type === 'container_code-group_open') nesting++
        if (token.type === 'container_code-group_close') nesting--
        if (nesting === 1 && token.type === 'fence') fences.push(token)
      }
      if (!fences.length && !collecting) diagnostics.push(':::code-group 需要至少一个围栏代码块。')
      const tabs = fences
        .map((token, tab) => {
          token.meta = { ...token.meta, previewGroup: group, previewTab: tab }
          const label =
            token.info.match(/\[([^\]]+)\]/)?.[1] || token.info.split(/[\s{]/)[0] || 'text'
          return `<input type="radio" name="${group}" id="${group}-${tab}" data-preview-code-tab="${tab}" ${tab === 0 ? 'checked' : ''}><label for="${group}-${tab}">${escape(label)}</label>`
        })
        .join('')
      return `<div class="vp-code-group">${fragment(`<div class="tabs">${tabs}</div>`)}<div class="blocks">`
    },
  })
  const treeMarkup = configureBrowserSyntax(md, documentPath, base, diagnostics)
  md.renderer.rules.fence = (tokens, index) => {
    const token = tokens[index]
    const info = token.info.trim()
    const lang = info.match(/^[\w+-]+/)?.[0] || 'text'
    if (lang === 'file-tree' || lang === 'tree') {
      const tree = treeMarkup(token.content, true)
      return token.meta?.previewGroup
        ? `<div class="vp-block${token.meta.previewTab === 0 ? ' active' : ''}" data-preview-code-panel="${token.meta.previewTab}">${tree}</div>`
        : tree
    }
    if (lang === 'mermaid' || lang === 'echarts') {
      const id = `diagram-${fragmentTag}-${diagrams.length}`
      if (!collecting) diagrams.push({ id, type: lang, source: token.content })
      const group = token.meta?.previewGroup
      return `<div class="site-preview-diagram${group ? ` vp-block${token.meta.previewTab === 0 ? ' active' : ''}` : ''}"${group ? ` data-preview-code-panel="${token.meta.previewTab}"` : ''} data-preview-diagram="${id}" role="img" aria-label="${lang}"></div>`
    }
    const meta = info.slice(lang.length)
    const code = md.options.highlight!(token.content, lang, meta)
    const numbered = /\bline-numbers\b/.test(meta) && !/\bno-line-numbers\b/.test(meta)
    const start = Number(meta.match(/line-numbers=(\d+)/)?.[1] || 1)
    const lines = numbered
      ? `<div class="line-numbers-wrapper" aria-hidden="true">${token.content
          .trimEnd()
          .split('\n')
          .map((_, line) => `<span class="line-number">${start + line}</span><br>`)
          .join('')}</div>`
      : ''
    const groupClass = token.meta?.previewGroup
      ? token.meta.previewTab === 0
        ? ' active'
        : ''
      : ''
    return `<div class="language-${escape(lang)} vp-adaptive-theme${numbered ? ' line-numbers-mode' : ''}${groupClass}"${token.meta?.previewGroup ? ` data-preview-code-panel="${token.meta.previewTab}"` : ''}><button type="button" class="copy" title="复制代码" aria-label="复制代码"></button><span class="lang">${escape(lang)}</span>${code}${lines}</div>`
  }
  md.renderer.rules.code_block = md.renderer.rules.fence
  for (const type of ['th_open', 'td_open'])
    md.renderer.rules[type] = (tokens, index, options, _env, renderer) => {
      const token = tokens[index]
      const alignment = token.attrGet('style')?.match(/^text-align:(left|center|right)$/)?.[1]
      if (alignment) {
        token.attrs = token.attrs?.filter(([name]) => name !== 'style') || []
        token.attrSet('align', alignment)
      }
      return renderer.renderToken(tokens, index, options)
    }
  md.renderer.rules.code_inline = (tokens, index) =>
    `<code>${md.utils.escapeHtml(tokens[index].content).replace(/\{/g, '&#123;').replace(/\}/g, '&#125;')}</code>`
  md.render(body)
  highlighterPromise ||= createHighlighter({
    themes: [siteCodeThemes.light, siteCodeThemes.dark],
    langs: [],
  })
  const highlighter = await highlighterPromise
  const aliases: Record<string, string> = {
    sh: 'bash',
    shell: 'bash',
    zsh: 'bash',
    md: 'markdown',
    yml: 'yaml',
    txt: 'text',
    plaintext: 'text',
    'vue-html': 'vue',
  }
  for (const [key, request] of requested) {
    let lang = Object.hasOwn(aliases, request.lang) ? aliases[request.lang] : request.lang || 'text'
    if (lang !== 'text' && lang !== 'ansi') {
      if (!Object.hasOwn(bundledLanguages, lang)) {
        diagnostics.push(`未知代码语言「${request.lang}」；已保留为纯文本。`)
        lang = 'text'
      } else if (!highlighter.getLoadedLanguages().includes(lang as BundledLanguage))
        await highlighter.loadLanguage(lang as BundledLanguage)
    }
    highlighted.set(
      key,
      highlighter.codeToHtml(request.code.trimEnd(), {
        lang,
        themes: siteCodeThemes,
        colorReplacements: siteCodeColorReplacements,
        defaultColor: false,
        meta: { __raw: request.meta },
        transformers: [
          transformerMetaHighlight(),
          transformerNotationDiff(),
          transformerNotationFocus({
            classActiveLine: 'has-focus',
            classActivePre: 'has-focused-lines',
          }),
          transformerNotationHighlight(),
          transformerNotationErrorLevel(),
          {
            name: 'site-vitepress-classes',
            pre(node) {
              this.addClassToHast(node, 'vp-code')
              node.properties.dir = 'ltr'
            },
            code(node) {
              for (const line of node.children) {
                if (line.type === 'element' && line.tagName === 'span' && !line.children.length)
                  line.children.push({
                    type: 'element',
                    tagName: 'wbr',
                    properties: {},
                    children: [],
                  })
              }
            },
          },
        ],
      }),
    )
  }
  collecting = false
  fragments.clear()
  sequence = 0
  const html = md.render(body)
  return {
    html,
    frontmatter,
    fragments,
    fragmentTag,
    diagrams,
    diagnostics: [...new Set(diagnostics)],
  }
}
