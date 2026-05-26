<script setup lang="ts">
import { Icon } from "@iconify/vue";

const props = withDefaults(
  defineProps<{
    title: string;
    href: string;
    desc?: string;
    external?: boolean;
    icon?: string;
    iconify?: string;
    iconifyColor?: string;
    iconSrc?: string;
    iconAlt?: string;
  }>(),
  {
    desc: "",
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
    class="large-link-card"
    :href="props.href"
    :target="props.external ? '_blank' : undefined"
    :rel="props.external ? 'noreferrer noopener' : undefined"
  >
    <span class="large-link-card-title-wrap">
      <span class="large-link-card-icon-slot" aria-hidden="true">
        <img
          v-if="props.iconSrc"
          class="large-link-card-icon-image"
          :src="props.iconSrc"
          :alt="props.iconAlt || props.title"
        />
        <Icon
          v-else-if="props.iconify"
          class="large-link-card-iconify"
          :icon="props.iconify"
          :style="props.iconifyColor ? { color: props.iconifyColor } : undefined"
          aria-hidden="true"
        />
        <span v-else class="large-link-card-icon" aria-hidden="true">{{ props.icon }}</span>
      </span>
      <span class="large-link-card-title">{{ props.title }}</span>
      <Icon
        v-if="props.external"
        class="large-link-card-external"
        icon="fluent:arrow-up-right-12-filled"
        aria-hidden="true"
      />
    </span>
    <span v-if="props.desc" class="large-link-card-desc">{{ props.desc }}</span>
  </a>
</template>

<style scoped>
.large-link-card {
  display: block;
  margin: 12px 0;
  padding: 14px 16px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
  text-decoration: none !important;
  background-color: var(--vp-c-bg-soft);
  transition: border-color 0.2s ease, transform 0.2s ease;
}

.large-link-card:hover,
.large-link-card:visited,
.large-link-card:active {
  text-decoration: none !important;
}

.large-link-card:hover {
  border-color: var(--vp-c-brand-2);
  background: var(--vp-c-brand-soft);
}

.large-link-card-title {
  font-weight: 600;
  color: var(--vp-c-text-1);
}

.large-link-card:hover .large-link-card-title {
  color: var(--vp-c-brand-1);
}

.large-link-card-title-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 20px;
  line-height: 1;
}

.large-link-card-icon-slot {
  width: 24px;
  height: 24px;
  flex: 0 0 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 0;
}

.large-link-card-icon {
  width: 20px;
  height: 20px;
  text-align: center;
  line-height: 1;
  font-size: 20px;
  flex: 2 0 18px;
}

.large-link-card-iconify {
  width: 24px;
  height: 24px;
  display: block;
  color: var(--vp-c-text-2);
  flex: 0 0 24px;
}

.large-link-card-icon-image {
  width: 24px;
  height: 24px;
  display: block;
  vertical-align: top;
  object-fit: contain;
  flex: 0 0 24px;
  border-radius: 4px;
}

.large-link-card-external {
  margin-left: auto;
  color: var(--vp-c-text-3);
  font-size: 12px;
}

.large-link-card-desc {
  display: block;
  margin-top: 10px;
  font-size: 14px;
  color: var(--vp-c-text-2);
}
</style>
