<script setup lang="ts">
import FileTreeNode from "./FileTreeNode.vue";

type FileTreeItem = {
  name: string;
  type?: "file" | "folder";
  flag?: string;
  children?: FileTreeItem[];
};

defineProps<{
  items: FileTreeItem[];
  title?: string;
}>();
</script>

<template>
  <section class="file-tree">
    <header v-if="title" class="file-tree-header">{{ title }}</header>
    <ul class="file-tree-list">
      <FileTreeNode v-for="item in items" :key="item.name" :item="item" :depth="0" />
    </ul>
  </section>
</template>

<style scoped>
.file-tree {
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg-soft);
  padding: 10px 12px;
  margin: 14px 0;
}

.file-tree-header {
  font-size: 13px;
  font-weight: 600;
  color: var(--vp-c-text-2);
  margin-bottom: 8px;
}

.file-tree-list {
  margin: 0;
  padding: 0;
  list-style: none;
}
</style>
