<script setup lang="ts">
import { computed, ref } from "vue";
import { Icon } from "@iconify/vue";

type FileTreeItem = {
  name: string;
  type?: "file" | "folder";
  children?: FileTreeItem[];
};

const props = defineProps<{
  item: FileTreeItem;
  depth?: number;
}>();

const depth = computed(() => props.depth ?? 0);
const isFolder = computed(() => {
  if (props.item.type) return props.item.type === "folder";
  return Array.isArray(props.item.children) && props.item.children.length > 0;
});
const expanded = ref(true);

const fileIcon = computed(() => {
  if (isFolder.value) return "fluent:folder-16-regular";

  const name = props.item.name.toLowerCase();
  const dotIndex = name.lastIndexOf(".");
  const ext = dotIndex >= 0 ? name.slice(dotIndex + 1) : "";

  const iconMap: Record<string, string> = {
    md: "material-icon-theme:markdown",
    mdx: "material-icon-theme:mdx",
    txt: "fluent:document-text-16-regular",
    json: "material-icon-theme:json",
    yml: "fluent:document-code-16-regular",
    yaml: "material-icon-theme:yaml",
    toml: "material-icon-theme:toml-light",
    ts: "material-icon-theme:typescript",
    mts: "material-icon-theme:typescript",
    cts: "material-icon-theme:typescript",
    js: "material-icon-theme:javascript",
    mjs: "material-icon-theme:javascript",
    cjs: "material-icon-theme:javascript",
    jsx: "material-icon-theme:javascript",
    tsx: "material-icon-theme:typescript",
    vue: "material-icon-theme:vue",
    html: "material-icon-theme:html",
    css: "material-icon-theme:css",
    scss: "fluent:paint-brush-16-regular",
    less: "fluent:paint-brush-16-regular",
    png: "fluent:image-16-regular",
    jpg: "fluent:image-16-regular",
    jpeg: "fluent:image-16-regular",
    gif: "fluent:image-16-regular",
    webp: "fluent:image-16-regular",
    svg: "material-icon-theme:svg",
    pdf: "material-icon-theme:pdf",
    zip: "material-icon-theme:zip"
  };

  return iconMap[ext] ?? "fluent:document-16-regular";
});
</script>

<template>
  <li class="file-tree-node">
    <button
      v-if="isFolder"
      class="file-tree-row file-tree-row-button"
      type="button"
      :style="{ paddingLeft: `${depth * 14}px` }"
      @click="expanded = !expanded"
    >
      <Icon
        class="file-tree-toggle"
        :icon="expanded ? 'fluent:chevron-down-12-filled' : 'fluent:chevron-right-12-filled'"
        aria-hidden="true"
      />
      <Icon class="file-tree-icon" :icon="fileIcon" aria-hidden="true" />
      <span class="file-tree-name">{{ item.name }}</span>
    </button>

    <div v-else class="file-tree-row" :style="{ paddingLeft: `${depth * 14}px` }">
      <Icon
        class="file-tree-icon"
        :icon="fileIcon"
        aria-hidden="true"
      />
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

.file-tree-name {
  font-size: 13px;
  color: var(--vp-c-text-1);
  line-height: 1.3;
}
</style>
