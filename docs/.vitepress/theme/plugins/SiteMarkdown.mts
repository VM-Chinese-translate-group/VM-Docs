import type MarkdownIt from 'markdown-it'
// @ts-ignore
import abbr from 'markdown-it-abbr'
// @ts-ignore
import footnote from 'markdown-it-footnote'
import { demo } from './DemoContainer.mts'
import { stepper } from './StepperContainer.mts'

export const siteCodeThemes = { light: 'github-light', dark: 'github-dark' } as const

// VitePress's accessible GitHub palette, shared with the live Shiki renderer.
export const siteCodeColorReplacements = {
  'github-light': {
    '#959da5': '#6c676f',
    '#28a745': '#0e790b',
    '#b08800': '#846312',
    '#e36209': '#c13617',
    '#3192aa': '#05728b',
    '#d73a49': '#c62739',
    '#22863a': '#11782a',
    '#6a737d': '#62687b',
    '#1b7c83': '#06747a',
    '#0366d6': '#0663d0',
    '#cb2431': '#c82430',
  },
  'github-dark': {
    '#586069': '#5b93a3',
    '#6a737d': '#818e99',
    '#ea4a5a': '#ef5564',
    '#2188ff': '#268bf9',
  },
}

export function siteHeadingSlug(title: string) {
  return title
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[\u0000-\u001f]/g, '')
    .replace(/[\s~`!@#$%^&*()\-_+=[\]{}|\\;:"'“”‘’<>,.?/]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/^(\d)/, '_$1')
    .toLowerCase()
}

/** Shared by VitePress builds and the browser preview. Keep site syntax in one place. */
export function configureSiteMarkdown(md: MarkdownIt) {
  md.use(abbr)
  md.use(footnote)
  md.use(demo)
  md.use(stepper)
}
