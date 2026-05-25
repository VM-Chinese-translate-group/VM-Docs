<script setup lang="ts">
import { Icon } from "@iconify/vue";

const props = withDefaults(
  defineProps<{
    title: string;
    href: string;
    external?: boolean;
    icon?: string;
    iconify?: string;
    iconifyColor?: string;
    iconSrc?: string;
    iconAlt?: string;
  }>(),
  {
    external: false,
    icon: "🔗",
    iconify: "",
    iconifyColor: "",
    iconSrc: "",
    iconAlt: ""
  }
);
</script>

<template>
  <a
    class="mini-link-card"
    :href="props.href"
    :target="props.external ? '_blank' : undefined"
    :rel="props.external ? 'noreferrer noopener' : undefined"
  >
    <span class="mini-link-card-icon-slot" aria-hidden="true">
      <img
          v-if="props.iconSrc"
          class="mini-link-card-icon-image"
          :src="props.iconSrc"
          :alt="props.iconAlt || props.title"
      />
    <Icon
        v-else-if="props.iconify"
        class="mini-link-card-iconify"
        :icon="props.iconify"
        :style="props.iconifyColor ? { color: props.iconifyColor } : undefined"
        aria-hidden="true"
    />
    <span v-else class="mini-link-card-icon" aria-hidden="true">{{ props.icon }}</span>
    </span>
    <span class="mini-link-card-title">{{ props.title }}</span>
    <Icon
      v-if="props.external"
      class="mini-link-card-external"
      icon="fluent:arrow-up-right-12-filled"
      aria-hidden="true"
    />
  </a>
</template>

<style scoped>
.mini-link-card {
  vertical-align: top;
  display: inline-flex;
  align-items: center;

  gap: 8px;
  padding: 9px 14px;
  margin: 10px 10px 10px 0;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
  text-decoration: none !important;
  line-height: 1.3;
  transition: border-color 0.2s ease, background-color 0.2s ease;
}

.mini-link-card:hover,
.mini-link-card:active,
.mini-link-card:visited {
  text-decoration: none !important;
}

.mini-link-card:hover {
  border-color: var(--vp-c-brand-2);
  background: var(--vp-c-brand-soft);
}

.mini-link-card-icon-slot {
  width: 18px;
  height: 18px;
  flex: 0 0 18px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 0;
}

.mini-link-card-icon {
  width: 18px;
  height: 18px;
  text-align: center;
  line-height: 1;
  font-size: 15px;
  flex: 0 0 18px;
}

.mini-link-card-iconify {
  width: 18px;
  height: 18px;
  color: var(--vp-c-text-2);
  flex: 0 0 18px;
}

.mini-link-card-icon-image {
  width: 18px;
  height: 18px;
  display: block;
  vertical-align: center;
  object-fit: contain;
  flex: 0 0 18px;
  border-radius: 4px;
}

.mini-link-card-title {
  font-size: 16px;
  font-weight: 600;
}

.mini-link-card-external {
  color: var(--vp-c-text-3);
  font-size: 14px;
}
</style>
