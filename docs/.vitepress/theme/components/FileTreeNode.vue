<script setup lang="ts">
// @ts-ignore
import { computed, ref } from 'vue'
import { Icon } from '@iconify/vue'

type FileTreeItem = {
  name: string
  type?: 'file' | 'folder'
  flag?: string
  children?: FileTreeItem[]
}

const props = defineProps<{
  item: FileTreeItem
  depth?: number
}>()

const depth = computed(() => props.depth ?? 0)
const hasFlag = computed(() => !!props.item.flag)
const rowPaddingLeft = computed(() => `${depth.value * 14 + 18}px`)
const isFolder = computed(() => {
  if (props.item.type) return props.item.type === 'folder'
  return Array.isArray(props.item.children) && props.item.children.length > 0
})
const expanded = ref(true)
const rowToneClass = computed(() => {
  switch (props.item.flag) {
    case '+':
    case 'v':
      return 'file-tree-row-tone-success'
    case '-':
    case '!':
    case 'x':
      return 'file-tree-row-tone-danger'
    case 'i':
      return 'file-tree-row-tone-info'
    default:
      return 'file-tree-row-tone-brand'
  }
})

const fileIcon = computed(() => {
  if (isFolder.value) return 'fluent:folder-16-regular'

  const name = props.item.name.toLowerCase()
  const dotIndex = name.lastIndexOf('.')
  const ext = dotIndex >= 0 ? name.slice(dotIndex + 1) : ''

  const iconMap: Record<string, string> = {
    md: 'material-icon-theme:markdown',
    mdx: 'material-icon-theme:mdx',
    txt: 'fluent:document-text-16-regular',
    json: 'material-icon-theme:json',
    yml: 'fluent:document-code-16-regular',
    yaml: 'material-icon-theme:yaml',
    toml: 'material-icon-theme:toml-light',
    ts: 'material-icon-theme:typescript',
    mts: 'material-icon-theme:typescript',
    cts: 'material-icon-theme:typescript',
    js: 'material-icon-theme:javascript',
    mjs: 'material-icon-theme:javascript',
    cjs: 'material-icon-theme:javascript',
    jsx: 'material-icon-theme:javascript',
    tsx: 'material-icon-theme:typescript',
    vue: 'material-icon-theme:vue',
    html: 'material-icon-theme:html',
    css: 'material-icon-theme:css',
    scss: 'fluent:paint-brush-16-regular',
    less: 'fluent:paint-brush-16-regular',
    png: 'fluent:image-16-regular',
    jpg: 'fluent:image-16-regular',
    jpeg: 'fluent:image-16-regular',
    gif: 'fluent:image-16-regular',
    webp: 'fluent:image-16-regular',
    svg: 'material-icon-theme:svg',
    pdf: 'material-icon-theme:pdf',
    zip: 'material-icon-theme:zip',
  }

  return iconMap[ext] ?? 'fluent:document-16-regular'
})
</script>

<template>
  <li class="file-tree-node">
    <button
      v-if="isFolder"
      class="file-tree-row file-tree-row-button"
      :class="[hasFlag ? 'file-tree-row-flagged' : '', rowToneClass]"
      type="button"
      :style="{ paddingLeft: rowPaddingLeft }"
      @click="expanded = !expanded"
    >
      <span v-if="item.flag" class="file-tree-flag file-tree-flag-left">
        {{ item.flag }}
      </span>
      <Icon
        class="file-tree-toggle"
        :icon="expanded ? 'fluent:chevron-down-12-filled' : 'fluent:chevron-right-12-filled'"
        aria-hidden="true"
      />
      <Icon class="file-tree-icon" :icon="fileIcon" aria-hidden="true" />
      <span class="file-tree-name">{{ item.name }}</span>
    </button>

    <div
      v-else
      class="file-tree-row"
      :class="[hasFlag ? 'file-tree-row-flagged' : '', rowToneClass]"
      :style="{ paddingLeft: rowPaddingLeft }"
    >
      <span v-if="item.flag" class="file-tree-flag file-tree-flag-left">
        {{ item.flag }}
      </span>
      <Icon class="file-tree-icon" :icon="fileIcon" aria-hidden="true" />
      <span class="file-tree-name">{{ item.name }}</span>
    </div>

    <ul v-if="item.children?.length && (!isFolder || expanded)" class="file-tree-list">
      <FileTreeNode
        v-for="child in item.children"
        :key="`${child.name}-${depth}`"
        :item="child"
        :depth="depth + 2"
      />
    </ul>
  </li>
</template>

<style scoped>
.file-tree-list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.file-tree-node {
  margin: 4px 0;
  padding: 0;
  list-style: none;
}

.file-tree-row {
  display: flex;
  align-items: center;
  gap: 6px;
  min-height: 30px;
  position: relative;
  width: 100%;
  box-sizing: border-box;
  border-radius: 8px;
  overflow: hidden;
}

.file-tree-row-button {
  width: 100%;
  border: none;
  background: transparent;
  text-align: left;
  cursor: pointer;
  padding-top: 0;
  padding-bottom: 0;
  color: inherit;
}

.file-tree-row-button:hover .file-tree-name {
  color: var(--vp-c-brand-1);
}

.file-tree-row-flagged::before {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.file-tree-row-tone-brand::before {
  background: color-mix(in srgb, var(--vp-c-brand-soft) 28%, transparent);
}

.file-tree-row-tone-success::before {
  background: color-mix(in srgb, var(--vp-c-green-soft) 28%, transparent);
}

.file-tree-row-tone-danger::before {
  background: color-mix(in srgb, var(--vp-c-red-soft) 28%, transparent);
}

.file-tree-row-tone-info::before {
  background: color-mix(in srgb, var(--vp-c-indigo-soft) 28%, transparent);
}

.file-tree-row-tone-muted::before {
  background: color-mix(in srgb, var(--vp-c-default-soft) 28%, transparent);
}

.file-tree-row > * {
  position: relative;
  z-index: 1;
}

.file-tree-toggle {
  color: var(--vp-c-text-3);
  font-size: 12px;
  flex: 0 0 auto;
}

.file-tree-icon {
  color: var(--vp-c-text-2);
  font-size: 15px;
  flex: 0 0 auto;
}

.file-tree-flag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  padding: 0 2px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 600;
  line-height: 1;
}

.file-tree-flag-left {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  flex: 0 0 16px;
  margin-right: 2px;
}

.file-tree-row-tone-brand .file-tree-flag {
  color: var(--vp-c-brand-1);
  background: color-mix(in srgb, var(--vp-c-brand-soft) 72%, transparent);
}

.file-tree-row-tone-success .file-tree-flag {
  color: var(--vp-c-green-1);
  background: color-mix(in srgb, var(--vp-c-green-soft) 72%, transparent);
}

.file-tree-row-tone-danger .file-tree-flag {
  color: var(--vp-c-red-1);
  background: color-mix(in srgb, var(--vp-c-red-soft) 72%, transparent);
}

.file-tree-row-tone-info .file-tree-flag {
  color: var(--vp-c-indigo-1);
  background: color-mix(in srgb, var(--vp-c-indigo-soft) 72%, transparent);
}

.file-tree-row-tone-muted .file-tree-flag {
  color: var(--vp-c-text-2);
  background: color-mix(in srgb, var(--vp-c-default-soft) 72%, transparent);
}

.file-tree-name {
  font-size: 13px;
  color: var(--vp-c-text-1);
  line-height: 1.3;
}
</style>
