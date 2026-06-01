<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";

const container = ref<HTMLElement | null>(null);
const current = ref(0);
const total = ref(1);

const isFirst = computed(() => current.value === 0);
const isLast = computed(() => current.value === total.value - 1);

const tabs = ref<HTMLElement[]>([]);
const items = ref<HTMLElement[]>([]);

function goTo(step: number) {
  if (step < 0 || step >= total.value) return;
  current.value = step;
  updateDOM();
}

function prev() { goTo(current.value - 1); }
function next() { goTo(current.value + 1); }

function updateDOM() {
  tabs.value.forEach((tab, i) => {
    tab.classList.toggle("active", i === current.value);
    tab.classList.toggle("completed", i < current.value);
  });
  items.value.forEach((item, i) => {
    item.classList.toggle("active", i === current.value);
  });

  // Update button states
  const prevBtn = container.value?.querySelector("[data-prev]") as HTMLButtonElement | null;
  const nextBtn = container.value?.querySelector("[data-next]") as HTMLButtonElement | null;
  if (prevBtn) prevBtn.disabled = isFirst.value;
  if (nextBtn) nextBtn.disabled = isLast.value;

  // Scroll to content top when switching steps
  const activeItem = items.value[current.value];
  if (activeItem) {
    activeItem.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }
}

onMounted(() => {
  if (!container.value) return;
  const el = container.value;
  total.value = parseInt(el.getAttribute("data-total") || "1", 10);
  tabs.value = Array.from(el.querySelectorAll("[data-step]"));
  items.value = Array.from(el.querySelectorAll("[data-step-content]"));

  tabs.value.forEach((tab, i) => {
    tab.addEventListener("click", () => goTo(i));
  });

  const prevBtn = el.querySelector("[data-prev]") as HTMLButtonElement | null;
  const nextBtn = el.querySelector("[data-next]") as HTMLButtonElement | null;
  prevBtn?.addEventListener("click", prev);
  nextBtn?.addEventListener("click", () => {
    if (!isLast.value) next();
  });
});
</script>

<template>
  <div ref="container">
    <slot />
  </div>
</template>
