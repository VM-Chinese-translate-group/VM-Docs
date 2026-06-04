import type MarkdownIt from 'markdown-it'

export function copyDownloadButtonsPlugin(md: MarkdownIt, componentName = 'CopyDownloadButtons') {
  let depth = 0

  const originalRender = md.render.bind(md)
  md.render = (src: string, env?: any) => {
    depth++
    try {
      const html = originalRender(src, env)
      if (depth > 1) return html
      const h1Start = html.indexOf('<h1')
      const h1End = html.indexOf('</h1>', h1Start)
      if (h1Start === -1 || h1End === -1) {
        return `<${componentName} />` + html
      }
      const h1CloseEnd = h1End + 5
      const before = html.slice(0, h1Start)
      const h1Content = html.slice(h1Start, h1CloseEnd)
      const after = html.slice(h1CloseEnd)
      return `${before}<div class="page-header">${h1Content}<${componentName} /></div>${after}`
    } finally {
      depth--
    }
  }

  md.renderer.rules.html_block = md.renderer.rules.html_block || ((tokens, idx) => tokens[idx].content)
  md.renderer.rules.html_inline = md.renderer.rules.html_inline || ((tokens, idx) => tokens[idx].content)
}

import { readFileSync, writeFileSync, readdirSync, statSync, mkdirSync } from 'node:fs'
import { resolve, relative, join, dirname } from 'node:path'

interface SidebarItem {
  text?: string
  link?: string
  items?: SidebarItem[]
  collapsed?: boolean
}

function stripHtml(md: string): string {
  return md
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
}

function collectMdFiles(dir: string, base: string, files: string[] = []): string[] {
  const entries = readdirSync(dir)
  for (const entry of entries) {
    if (entry.startsWith('.') || entry === 'node_modules') continue
    const fullPath = join(dir, entry)
    const stat = statSync(fullPath)
    if (stat.isDirectory()) {
      collectMdFiles(fullPath, base, files)
    } else if (entry.endsWith('.md')) {
      const rel = relative(base, fullPath).replace(/\\/g, '/')
      files.push(rel)
    }
  }
  return files
}

function ensureDir(dir: string) {
  mkdirSync(dir, { recursive: true })
}

function sidebarToToc(items: SidebarItem[], indent = ''): string {
  let toc = ''
  for (const item of items) {
    if (item.items) {
      toc += `${indent}- ${item.text || ''}\n`
      toc += sidebarToToc(item.items, indent + '  ')
    } else if (item.link) {
      const mdLink = item.link.replace(/\/$/, '') + '.md'
      toc += `${indent}- [${item.text || item.link}](${mdLink})\n`
    }
  }
  return toc
}

export function llmsVitePlugin() {
  let outDir = ''
  let srcDir = ''
  let sidebar: SidebarItem[] = []
  let siteTitle = ''
  let siteDescription = ''

  return {
    name: 'llms-custom',

    configResolved(config: any) {
      const vp = config.vitepress
      outDir = vp?.outDir || resolve(config.root || process.cwd(), '.vitepress/dist')
      srcDir = vp?.srcDir || config.root || process.cwd()
      sidebar = vp?.site?.themeConfig?.sidebar || []
      siteTitle = vp?.site?.title || ''
      siteDescription = vp?.site?.description || ''
    },

    configureServer(server: any) {
      server.middlewares.use((req: any, res: any, next: any) => {
        if (!req.url?.endsWith('.md')) return next()

        const urlPath = req.url.replace(/\.md$/, '').replace(/\\/g, '/')
        const filePath = resolve(srcDir, `.${urlPath}.md`)

        try {
          const content = readFileSync(filePath, 'utf-8')
          res.setHeader('Content-Type', 'text/markdown; charset=utf-8')
          res.end(content)
        } catch {
          try {
            const indexPath = resolve(srcDir, `.${urlPath}/index.md`)
            const content = readFileSync(indexPath, 'utf-8')
            res.setHeader('Content-Type', 'text/markdown; charset=utf-8')
            res.end(content)
          } catch {
            next()
          }
        }
      })
    },

    configurePreviewServer(server: any) {
      server.middlewares.use((_req: any, res: any, next: any) => {
        const originalSetHeader = res.setHeader.bind(res)
        res.setHeader = function (name: string, value: string) {
          if (name.toLowerCase() === 'content-type' && value.startsWith('text/') && !value.includes('charset')) {
            value = `${value}; charset=utf-8`
          }
          return originalSetHeader(name, value)
        }
        next()
      })
    },

    async writeBundle() {
      const mdFiles = collectMdFiles(srcDir, srcDir)
      const pages: { path: string; raw: string; processed: string }[] = []

      for (const file of mdFiles) {
        if (file === 'index.md') continue
        const raw = readFileSync(resolve(srcDir, file), 'utf-8')
        const processed = stripHtml(raw)
        const urlPath = '/' + file.replace(/\.md$/, '.md')

        const destPath = resolve(outDir, file)
        ensureDir(dirname(destPath))
        writeFileSync(destPath, raw, 'utf-8')

        pages.push({ path: urlPath, raw, processed })
      }

      const toc = sidebarToToc(sidebar)
      const llmsTxt = `# ${siteTitle}\n\n> ${siteDescription}\n\n${toc}`
      writeFileSync(resolve(outDir, 'llms.txt'), llmsTxt, 'utf-8')

      const fullContent = pages
        .map(p => `---\nurl: ${p.path}\n---\n\n${p.processed}`)
        .join('\n\n---\n\n')
      writeFileSync(resolve(outDir, 'llms-full.txt'), fullContent, 'utf-8')

      console.log(`  [llms] Generated llms.txt, llms-full.txt, and ${pages.length} per-page .md files`)
    },
  }
}
