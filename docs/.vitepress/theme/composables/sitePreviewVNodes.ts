import { parse, NodeTypes, type ElementNode, type TemplateChildNode } from '@vue/compiler-dom'
import { h, type Component, type VNodeChild } from 'vue'
import JSON5 from 'json5'
import DOMPurify from 'dompurify'

export interface PreviewContext {
  components: Record<string, Component>
  scope: Record<string, unknown>
  documentPath: string
  base: string
  fragments: Map<string, string>
  fragmentTag: string
  diagnostics: string[]
}

const htmlTags: Record<string, true> = Object.fromEntries(
  'a abbr address article aside audio b bdi bdo blockquote br button caption cite code col colgroup dd del details dfn div dl dt em figcaption figure footer h1 h2 h3 h4 h5 h6 header hr i img input kbd label li main mark nav ol p picture pre q rp rt ruby s samp section small source span strong sub summary sup table tbody td tfoot th thead time tr track u ul var video wbr svg path circle rect line polyline polygon g title'
    .split(' ')
    .map((tag) => [tag, true]),
)
const htmlAttrs =
  /^(?:id|class|style|title|alt|width|height|role|tabindex|open|disabled|checked|type|start|reversed|colspan|rowspan|scope|align|loading|decoding|dir|lang|target|rel|for|controls|muted|loop|preload|kind|label|srclang|datetime|download|viewBox|d|fill|stroke|stroke-width|cx|cy|r|x|y|x1|x2|y1|y2|points|xmlns|aria-[\w-]+|data-[\w-]+)$/
const blockedKeys: Record<string, true> = {
  ['__proto__']: true,
  prototype: true,
  constructor: true,
  innerHTML: true,
  outerHTML: true,
  srcdoc: true,
}
const resourceKeys =
  /^(?:href|src|srcset|poster|action|formaction|xlink:href|iconSrc|icon-src|cover|url|sources|filepath)$/i

export function resolvePreviewResource(value: string, documentPath: string, base: string): string {
  const clean = value.replace(/[\u0000-\u0020\u007f-\u009f]/g, '')
  if (/^(?:javascript|vbscript|data|file|blob):/i.test(clean) || clean.startsWith('\\'))
    throw new Error(`不安全的资源地址：${value}`)
  if (/^[a-z][a-z\d+.-]*:/i.test(clean) && !/^(?:https?|mailto|tel):/i.test(clean))
    throw new Error(`不支持的地址协议：${value}`)
  if (!value || /^(?:#|\?|\/\/|[a-z][a-z\d+.-]*:)/i.test(value)) return value
  const root = `https://preview.invalid${base.endsWith('/') ? base : `${base}/`}`
  if (value.startsWith('/')) {
    const prefixed =
      base !== '/' && value.startsWith(base) ? value : `${base.replace(/\/$/, '')}${value}`
    const resolved = new URL(prefixed, root)
    return resolved.pathname + resolved.search + resolved.hash
  }
  const path = documentPath
    .replace(/\\/g, '/')
    .replace(/^\/?docs\//, '')
    .replace(/^\//, '')
  const resolved = new URL(value, new URL(path || 'index.md', root))
  return resolved.pathname + resolved.search + resolved.hash
}

function reference(expression: string, scope: Record<string, unknown>): unknown {
  const match = expression
    .trim()
    .match(
      /^(\$?(?:frontmatter|site|theme|page|params))((?:\.[A-Za-z_$][\w$]*|\[(?:\d+|'[^'\\]*'|"[^"\\]*")\])*)$/,
    )
  if (!match)
    throw new Error(
      `不支持的表达式「${expression}」；请使用 JSON5 字面量或 $frontmatter、$site、$theme、$page 的属性路径。`,
    )
  let value = scope[match[1].replace(/^\$/, '')]
  const segments = match[2].matchAll(/\.([A-Za-z_$][\w$]*)|\[(\d+|'[^']*'|"[^"]*")\]/g)
  for (const segment of segments) {
    const key = segment[1] ?? String(JSON5.parse(segment[2]))
    if (
      Object.hasOwn(blockedKeys, key) ||
      value == null ||
      typeof value !== 'object' ||
      !Object.prototype.hasOwnProperty.call(value, key)
    )
      throw new Error(`属性路径「${expression}」不存在或不可访问。`)
    value = (value as Record<string, unknown>)[key]
  }
  return value
}

export function resolvePreviewExpression(
  expression: string,
  scope: Record<string, unknown>,
): unknown {
  try {
    return JSON5.parse(expression)
  } catch {
    return reference(expression, scope)
  }
}

function safeValue(
  value: unknown,
  key: string,
  context: PreviewContext,
  ancestors = new Set<object>(),
): unknown {
  if (typeof value === 'function' || typeof value === 'symbol' || typeof value === 'bigint')
    throw new Error(`属性 ${key} 必须是可序列化的值。`)
  if (
    typeof value === 'string' &&
    /^(?:src|iconSrc|icon-src|cover|sources)$/i.test(key) &&
    /^data:image\/(?:png|jpe?g|gif|webp|avif|bmp|svg\+xml);base64,[a-z\d+/=\s]+$/i.test(value)
  )
    return value
  if (
    key === 'style' &&
    typeof value === 'string' &&
    /expression\s*\(|@import|-moz-binding|url\s*\(\s*['"]?\s*(?:javascript|vbscript):/i.test(value)
  ) {
    throw new Error('style 包含不安全的 CSS。')
  }
  if (typeof value === 'string') {
    if (
      /^(?:javascript|vbscript|data|file|blob):/i.test(
        value.replace(/[\u0000-\u0020\u007f-\u009f]/g, ''),
      )
    )
      throw new Error(`属性 ${key} 包含不安全的地址。`)
    if (resourceKeys.test(key)) {
      if (/^srcset$/i.test(key)) {
        return value
          .split(',')
          .map((candidate) => {
            const match = candidate.trim().match(/^(\S+)(?:\s+(\d+w|(?:\d+(?:\.\d+)?|\.\d+)x))?$/)
            if (!match) throw new Error('srcset 格式无效；请使用「图片地址 1x, 图片地址 2x」。')
            return (
              resolvePreviewResource(match[1], context.documentPath, context.base) +
              (match[2] ? ` ${match[2]}` : '')
            )
          })
          .join(', ')
      }
      const resolved = resolvePreviewResource(value, context.documentPath, context.base)
      return /^href$/i.test(key) && resolved.startsWith('/')
        ? resolved.replace(/\.md(?=[?#]|$)/i, '')
        : resolved
    }
    return value
  }
  if (value && typeof value === 'object') {
    if (ancestors.has(value)) throw new Error(`属性 ${key} 含有循环引用。`)
    ancestors.add(value)
    try {
      if (Array.isArray(value)) return value.map((item) => safeValue(item, key, context, ancestors))
      const result: Record<string, unknown> = Object.create(null)
      for (const [name, item] of Object.entries(value)) {
        if (Object.hasOwn(blockedKeys, name) || /^on/i.test(name))
          throw new Error(`属性 ${key} 包含不允许的字段 ${name}。`)
        result[name] = safeValue(item, name, context, ancestors)
      }
      return result
    } finally {
      ancestors.delete(value)
    }
  }
  return value
}

function generatedNodes(html: string): VNodeChild[] {
  const template = document.createElement('template')
  template.innerHTML = DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true, svg: true, svgFilters: true, mathMl: true },
    ADD_TAGS: ['annotation'],
    FORBID_TAGS: ['script', 'iframe', 'object', 'foreignObject'],
    FORBID_ATTR: ['autofocus'],
  })
  function convert(node: Node): VNodeChild {
    if (node.nodeType === Node.TEXT_NODE) return node.textContent || ''
    if (!(node instanceof Element)) return null
    const props = Object.fromEntries(Array.from(node.attributes, (attr) => [attr.name, attr.value]))
    return h(node.tagName.toLowerCase(), props, Array.from(node.childNodes, convert))
  }
  return Array.from(template.content.childNodes, convert)
}

export function createPreviewNodes(html: string, context: PreviewContext): VNodeChild[] {
  const ast = parse(html.replace(/<(pre|code)(?=[\s>])(?![^>]*\bv-pre(?:\s|=|>))/g, '<$1 v-pre'), {
    comments: false,
    onError(error) {
      context.diagnostics.push(`模板：${error.message}`)
    },
  })
  const registry = new Map<string, Component>()
  for (const [name, component] of Object.entries(context.components)) {
    if (/^(?:Content|ClientOnly|component|SiteMarkdownPreview|MarkdownEditor)$/i.test(name))
      continue
    registry.set(name, component)
    registry.set(name.replace(/([a-z\d])([A-Z])/g, '$1-$2').toLowerCase(), component)
  }
  function children(nodes: TemplateChildNode[], literal = false): VNodeChild[] {
    return nodes.flatMap((node) => render(node, literal))
  }
  function render(node: TemplateChildNode, literal: boolean): VNodeChild[] {
    if (node.type === NodeTypes.TEXT) return [node.content]
    if (node.type === NodeTypes.COMMENT) return []
    if (node.type === NodeTypes.INTERPOLATION) {
      if (literal) return [node.loc.source]
      try {
        const value = resolvePreviewExpression(node.content.loc.source, context.scope)
        return [
          typeof value === 'object' && value !== null
            ? JSON.stringify(safeValue(value, 'interpolation', context), null, 2)
            : String(value ?? ''),
        ]
      } catch (error) {
        context.diagnostics.push(String((error as Error).message))
        return [node.loc.source]
      }
    }
    if (node.type !== NodeTypes.ELEMENT) return []
    const element = node as ElementNode
    if (element.tag === context.fragmentTag) {
      const id = element.props.find(
        (prop) => prop.type === NodeTypes.ATTRIBUTE && prop.name === 'data-id',
      )
      const fragment =
        id?.type === NodeTypes.ATTRIBUTE
          ? context.fragments.get(id.value?.content || '')
          : undefined
      return fragment === undefined ? [] : generatedNodes(fragment)
    }
    const component = registry.get(element.tag)
    if (!component && !Object.hasOwn(htmlTags, element.tag)) {
      context.diagnostics.push(`不支持的标签或未注册组件 <${element.tag}>。`)
      return []
    }
    const props: Record<string, unknown> = {}
    for (const prop of element.props) {
      try {
        let key: string
        let value: unknown
        if (prop.type === NodeTypes.ATTRIBUTE) {
          key = prop.name
          value = prop.value?.content ?? ''
          // Local demo's shared markup contains this handler; behavior is provided by delegated clicks instead.
          if (
            key === 'onclick' &&
            value === "this.parentElement.classList.toggle('demo-container--open')" &&
            element.tag === 'button'
          )
            continue
        } else {
          if (prop.name === 'slot' && element.tag === 'template') continue
          if (
            prop.name !== 'bind' ||
            !prop.arg ||
            prop.arg.type !== NodeTypes.SIMPLE_EXPRESSION ||
            !prop.arg.isStatic ||
            prop.modifiers.length ||
            !prop.exp
          )
            throw new Error(`不支持指令 ${prop.loc.source}；仅允许 :属性="JSON5 或数据属性路径"。`)
          key = prop.arg.content
          value = resolvePreviewExpression(prop.exp.loc.source, context.scope)
        }
        if (
          Object.hasOwn(blockedKeys, key) ||
          /^on/i.test(key) ||
          /^(?:is|ref|key)$|^v-/i.test(key)
        )
          throw new Error(`已阻止属性 ${key}。`)
        if (!component && !htmlAttrs.test(key) && !resourceKeys.test(key))
          throw new Error(`HTML 属性 ${key} 不在安全预览白名单中。`)
        props[key] = safeValue(value, key, context)
        if (
          !component &&
          ['disabled', 'checked', 'open', 'reversed', 'controls', 'muted', 'loop'].includes(key) &&
          value === ''
        )
          props[key] = true
      } catch (error) {
        context.diagnostics.push(`<${element.tag}>：${(error as Error).message}`)
      }
    }
    if (element.tag === 'a' && typeof props.href === 'string' && /^https?:\/\//.test(props.href)) {
      props.target = '_blank'
      props.rel = 'noopener noreferrer'
    }
    if (!component && element.tag === 'input') {
      props.disabled = true
      props.type = 'checkbox'
    }
    const isLiteral = literal || element.tag === 'pre' || element.tag === 'code'
    if (component) {
      const slots: Record<string, () => VNodeChild[]> = {}
      const normal: TemplateChildNode[] = []
      for (const child of element.children) {
        if (child.type === NodeTypes.ELEMENT && child.tag === 'template') {
          const slot = child.props.find(
            (prop) => prop.type === NodeTypes.DIRECTIVE && prop.name === 'slot',
          )
          if (
            slot?.type === NodeTypes.DIRECTIVE &&
            slot.arg?.type === NodeTypes.SIMPLE_EXPRESSION &&
            slot.arg.isStatic &&
            !slot.exp
          ) {
            const content = children(child.children, isLiteral)
            slots[slot.arg.content] = () => content
            continue
          }
          context.diagnostics.push('仅支持不带作用域参数的静态具名插槽。')
        } else normal.push(child)
      }
      if (
        !slots.default ||
        normal.some((child) => child.type !== NodeTypes.TEXT || child.content.trim())
      ) {
        const content = children(normal, isLiteral)
        slots.default = () => content
      }
      return [h(component, props, slots)]
    }
    return [h(element.tag, props, children(element.children, isLiteral))]
  }
  return children(ast.children)
}
