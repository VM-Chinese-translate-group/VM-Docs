import type MarkdownIt from 'markdown-it'
// @ts-ignore
import { findContainerClose } from './containerBoundary.mts'

export function demo(md: MarkdownIt) {
  md.block.ruler.before('fence', 'demo_container', (state: { bMarks: { [x: string]: any }; tShift: { [x: string]: any }; eMarks: { [x: string]: any }; src: string; push: (arg0: string, arg1: string, arg2: number) => any; parentType: string; lineMax: number; md: { block: { tokenize: (arg0: any, arg1: any, arg2: number) => void } }; line: number }, startLine: number, endLine: number, silent: any) => {
    const startPos = state.bMarks[startLine] + state.tShift[startLine]
    const maxPos = state.eMarks[startLine]
    const lineContent = state.src.slice(startPos, maxPos).trim()

    if (!lineContent.match(/^:::demo(\s|$)/)) return false

    const nextLine = findContainerClose(state, startLine, endLine)
    if (nextLine < 0) return false
    if (silent) return true

    // Extract title
    const title = lineContent.replace(/^:::demo\s*/, '') || '查看代码'

    // Extract raw source
    const rawLines: string[] = []
    for (let i = startLine + 1; i < nextLine; i++) {
      rawLines.push(state.src.slice(state.bMarks[i], state.eMarks[i]))
    }
    const rawCode = rawLines.join('\n').trim()

    // Open token
    const open = state.push('demo_container_open', 'section', 1)
    open.markup = ':::demo'
    open.block = true
    open.meta = { rawCode, title }
    open.map = [startLine, nextLine]

    // Parse content
    const oldParent = state.parentType
    const oldLineMax = state.lineMax
    state.parentType = 'demo'
    state.lineMax = nextLine
    state.md.block.tokenize(state, startLine + 1, nextLine)
    state.parentType = oldParent
    state.lineMax = oldLineMax

    // Close token
    const close = state.push('demo_container_close', 'section', -1)
    close.markup = ':::'
    close.block = true
    close.meta = { rawCode, title }

    state.line = nextLine + 1
    return true
  })

  md.renderer.rules.demo_container_open = () =>
    `<section class="demo-container">
  <div class="demo-container-preview vp-doc">\n`

  md.renderer.rules.demo_container_close = (tokens, idx) => {
    const t = tokens[idx]
    const rawCode = t.meta.rawCode as string
    const title = (t.meta.title as string) || '查看代码'

    let high: string
    const h = md.options.highlight
    if (h && rawCode) high = h(rawCode, 'md', '')
    else high = `<pre class="shiki"><code>${md.utils.escapeHtml(rawCode)}</code></pre>`

    return `  </div>
  <button type="button" class="demo-container-summary" onclick="this.parentElement.classList.toggle('demo-container--open')">
    <svg class="demo-container-indicator" viewBox="0 0 24 24" width="16" height="16">
      <path fill="currentColor" d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
    </svg>
    <span class="demo-container-title">${md.utils.escapeHtml(title)}</span>
  </button>
  <div class="demo-container-code-wrap language-md">
    <button type="button" class="copy" title="复制代码" aria-label="复制代码"></button>
    <div class="demo-container-code-header">
      <span class="demo-container-lang">md</span>
      <DemoWrapButton />
    </div>
    <div class="demo-container-code">${high}</div>
  </div>
</section>\n`
  }
}
