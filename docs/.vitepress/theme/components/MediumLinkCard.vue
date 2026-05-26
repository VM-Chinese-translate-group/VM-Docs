<script setup lang="ts">
import { Icon } from "@iconify/vue";

const props = withDefaults(
  defineProps<{
    title: string;
    desc?: string;
    href: string;
    icon?: string;
    iconSrc?: string;
    iconify?: string;
    iconifyColor?: string;
    iconAlt?: string;
    external?: boolean;
  }>(),
  {
    desc: "",
    icon: "馃敆",
    iconSrc: "",
    iconify: "",
    iconifyColor: "",
    iconAlt: "",
    external: false
  }
);
</script>

<template>
  <a
    class="medium-link-card"
    :href="props.href"
    :target="props.external ? '_blank' : undefined"
    :rel="props.external ? 'noreferrer noopener' : undefined"
  >
    <Icon
      v-if="props.external"
      class="medium-link-card-external"
      icon="fluent:arrow-up-right-12-filled"
      aria-hidden="true"
    />
    <div class="medium-link-card-icon-wrap">
      <img
        v-if="props.iconSrc"
        class="medium-link-card-icon-image"
        :src="props.iconSrc"
        :alt="props.iconAlt || props.title"
      />
      <Icon
        v-else-if="props.iconify"
        class="medium-link-card-iconify"
        :icon="props.iconify"
        :style="props.iconifyColor ? { color: props.iconifyColor } : undefined"
        aria-hidden="true"
      />
      <span v-else class="medium-link-card-icon" aria-hidden="true">{{ props.icon }}</span>
    </div>
    <span class="medium-link-card-title">{{ props.title }}</span>
    <span v-if="props.desc" class="medium-link-card-desc">{{ props.desc }}</span>
  </a>
</template>

<style scoped>
.medium-link-card {
  width: 132px;
  height: 132px;
  display: inline-flex;
  vertical-align: top;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 18px 12px 14px;
  margin: 14px 14px 14px 0;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg-soft);
  position: relative;
  text-decoration: none !important;
  box-sizing: border-box;
  transition: border-color 0.2s ease, background-color 0.2s ease;
}

.medium-link-card:hover,
.medium-link-card:visited,
.medium-link-card:active {
  text-decoration: none !important;
}

.medium-link-card:hover {
  border-color: var(--vp-c-brand-2);
  background: var(--vp-c-brand-soft);
}

.medium-link-card-icon-wrap {
  width: 46px;
  height: 46px;
  flex: 0 0 46px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.medium-link-card-icon {
  width: 46px;
  text-align: center;
  line-height: 1;
  font-size: 34px;
}

.medium-link-card-icon-image {
  width: 46px;
  height: 46px;
  object-fit: contain;
  border-radius: 8px;
}

.medium-link-card-iconify {
  width: 44px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 0;
  flex: 0 0 42px;
  color: var(--vp-c-text-2);
}

.medium-link-card-iconify :deep(svg) {
  width: 44px;
  height: 44px;
  display: block;
  vertical-align: top;
}

.medium-link-card-title {
  margin-top: 14px;
  font-size: 16px;
  line-height: 1.35;
  color: var(--vp-c-text-1);
  text-align: center;
  letter-spacing: 0;
  font-weight: 600;
  height: 34px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  word-break: break-word;
}

.medium-link-card-desc {
  margin-top: 1px;
  width: 100%;
  font-size: 13px;
  line-height: 1.25;
  color: var(--vp-c-text-2);
  text-align: center;
  white-space: nowrap;
  overflow: visible;
  text-overflow: ellipsis;
}

.medium-link-card:hover .medium-link-card-title {
  color: var(--vp-c-brand-1);
}

.medium-link-card-external {
  position: absolute;
  top: 14px;
  right: 10px;
  color: var(--vp-c-text-3);
  font-size: 12px;
}
</style>
