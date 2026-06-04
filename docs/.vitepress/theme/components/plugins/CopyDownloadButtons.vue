<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useData } from 'vitepress'
import { Icon } from '@iconify/vue'

const { frontmatter } = useData()

const copied = ref(false)
const downloaded = ref(false)
const currentURL = ref('')
const isOpen = ref(false)
const isRendered = ref(false)

let dropdownContainer: HTMLElement | null = null
let dropdownMenu: HTMLElement | null = null

const aiProviders = [
  { name: 'ChatGPT', url: 'https://chatgpt.com/?hints=search&prompt=', icon: 'simple-icons:openai' },
  { name: 'Claude',  url: 'https://claude.ai/new?q=',               icon: 'simple-icons:claude' },
  { name: 'Copilot', url: 'https://copilot.microsoft.com/?q=',       icon: 'simple-icons:githubcopilot' },
]

onMounted(() => {
  currentURL.value = window.location.href
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

function cleanUrl(url: string): string {
  const { origin, pathname } = new URL(url)
  const cleaned = pathname.replace(/\/+$/u, '').replace(/\.html$/u, '')
  return origin + (cleaned || '/index')
}

const isHomePage = computed(() => {
  if (!currentURL.value) return true
  const pathname = new URL(currentURL.value).pathname
  return pathname === '/' || pathname === '/index' || pathname === '/index.html'
})

const markdownURL = computed(() => {
  if (!currentURL.value) return ''
  return cleanUrl(currentURL.value) + '.md'
})

async function fetchMarkdown(): Promise<string> {
  const resp = await fetch(markdownURL.value)
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`)
  return resp.text()
}

async function handleCopy() {
  try {
    const text = await fetchMarkdown()
    await navigator.clipboard.writeText(text)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  } catch {
    window.open(markdownURL.value, '_blank')
  }
  closeDropdown()
}

async function handleDownload() {
  try {
    const text = await fetchMarkdown()
    const filename = markdownURL.value.split('/').pop() || 'page.md'
    const blob = new Blob([text], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = filename; a.click()
    URL.revokeObjectURL(url)
    downloaded.value = true
    setTimeout(() => { downloaded.value = false }, 2000)
  } catch {
    window.open(markdownURL.value, '_blank')
  }
}

function handleViewAsMarkdown() {
  window.open(markdownURL.value, '_blank')
  closeDropdown()
}

async function handleCopyPrompt() {
  try {
    const prompt = `Read this markdown source: ${markdownURL.value}`
    await navigator.clipboard.writeText(prompt)
  } catch {
    // ignore
  }
  closeDropdown()
}

function handleOpenInAI(provider: { name: string; url: string }) {
  const prompt = `Read this markdown source: ${markdownURL.value}`
  window.open(`${provider.url}${encodeURIComponent(prompt)}`, '_blank')
  closeDropdown()
}

function closeDropdown() {
  if (!isOpen.value) { isRendered.value = false; return }
  isOpen.value = false
  const el = dropdownMenu
  if (!el) { isRendered.value = false; return }
  const onEnd = () => { isRendered.value = false; el.removeEventListener('transitionend', onEnd) }
  el.addEventListener('transitionend', onEnd)
}

function toggleDropdown() {
  if (isOpen.value) { closeDropdown() }
  else { isRendered.value = true; requestAnimationFrame(() => { isOpen.value = true }) }
}

function handleClickOutside(event: MouseEvent) {
  if (dropdownContainer && !dropdownContainer.contains(event.target as Node)) { closeDropdown() }
}
</script>

<template>
  <div v-if="!isHomePage && frontmatter.showCopyDownload !== false" class="action-bar">
    <div class="split-btn" ref="dropdownContainer">
      <button class="action-btn action-btn-main" @click="handleCopy">
        <Icon :icon="copied ? 'fluent:checkmark-32-regular' : 'fluent:clipboard-32-regular'" class="btn-icon" />
        <span>{{ copied ? '已复制' : '复制页面' }}</span>
      </button>
      <button class="action-btn action-btn-caret" @click.stop="toggleDropdown">
        <Icon icon="mdi:chevron-down" class="btn-icon btn-caret-icon" :class="{ rotated: isOpen }" />
      </button>
      <div v-if="isRendered" ref="dropdownMenu" class="dropdown-panel" :class="{ open: isOpen }">
        <button class="dropdown-item" @click="handleViewAsMarkdown">
          <Icon icon="fluent:markdown-28-filled" class="btn-icon" />
          查看 Markdown
        </button>
        <div class="dropdown-divider" />
        <button class="dropdown-item" @click="handleCopyPrompt">
          <Icon icon="fluent:clipboard-text-edit-24-regular" class="btn-icon" />
          复制 LLM Prompt
        </button>
        <div class="dropdown-divider" />
        <button v-for="ai in aiProviders" :key="ai.name" class="dropdown-item" @click="handleOpenInAI(ai)">
          <Icon :icon="ai.icon" class="btn-icon" />
          在 {{ ai.name }} 中打开
        </button>
      </div>
    </div>
    <button class="action-btn" @click="handleDownload" :title="downloaded ? '已下载' : '下载页面'">
      <Icon :icon="downloaded ? 'fluent:checkmark-32-regular' : 'fluent:arrow-download-32-regular'" class="btn-icon" />
    </button>
  </div>
</template>

<style scoped>
.action-bar {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.split-btn {
  position: relative;
  display: flex;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  transition: border-color 0.2s ease;
}

.split-btn:hover {
  border-color: var(--vp-c-brand-2);
}

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  font-size: 13px;
  font-weight: 500;
  color: var(--vp-c-text-1);
  background: var(--vp-c-bg-soft);
  border: none;
  cursor: pointer;
  transition: background-color 0.2s ease, color 0.2s ease;
  font-family: inherit;
}

.action-btn:hover {
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
}

.action-btn-main {
  border-right: 1px solid var(--vp-c-divider);
  border-radius: 8px 0 0 8px;
}

.action-btn-caret {
  padding: 0 8px;
  border-radius: 0 8px 8px 0;
}

.btn-icon {
  font-size: 16px;
  flex-shrink: 0;
}

.btn-caret-icon {
  font-size: 14px;
  transition: transform 0.2s ease;
}

.dropdown-item .btn-icon {
  font-size: 16px;
}

.btn-caret-icon.rotated {
  transform: rotate(180deg);
}

.action-btn:not(.action-btn-main):not(.action-btn-caret) {
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
}

.action-btn:not(.action-btn-main):not(.action-btn-caret):hover {
  border-color: var(--vp-c-brand-2);
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
}

.dropdown-panel {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  min-width: 200px;
  background: var(--vp-c-bg-elv);
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12);
  z-index: 100;
  overflow: hidden;
  padding: 4px;

  opacity: 0;
  transform: translateY(-4px);
  pointer-events: none;
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.dropdown-panel.open {
  opacity: 1;
  transform: translateY(0);
  pointer-events: auto;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 8px 12px;
  font-size: 13px;
  font-weight: 500;
  line-height: 1.5;
  color: var(--vp-c-text-1);
  background: transparent;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  text-align: left;
  transition: background-color 0.15s ease, color 0.15s ease;
}

.dropdown-item:hover {
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
}

.dropdown-divider {
  height: 1px;
  margin: 4px 8px;
  background: var(--vp-c-divider);
}
</style>

<style>
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
}

.page-header h1 {
  margin-bottom: 0;
}
</style>

