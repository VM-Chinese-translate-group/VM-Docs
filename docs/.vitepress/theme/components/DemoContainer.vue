<script setup lang="ts">
import { computed, ref, useSlots, Comment, Fragment, Text, type VNode } from "vue";
import { Icon } from "@iconify/vue";

const props = withDefaults(
  defineProps<{
    summary: string;
    code?: string;
    lang?: string;
  }>(),
  {
    lang: "md"
  }
);

const codeOpen = ref(false);
const slots = useSlots();

function isVNode(value: unknown): value is VNode {
  return !!value && typeof value === "object" && "type" in (value as Record<string, unknown>);
}

function escapeMarkdown(value: string) {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/`/g, "\\`")
    .replace(/\*/g, "\\*")
    .replace(/_/g, "\\_")
    .replace(/\[/g, "\\[")
    .replace(/\]/g, "\\]")
    .replace(/\|/g, "\\|");
}

function escapeAttribute(value: string) {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r");
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function formatPropValue(value: unknown) {
  if (typeof value === "string") {
    return `"${escapeAttribute(value)}"`;
  }

  if (typeof value === "number" || typeof value === "bigint") {
    return `"${String(value)}"`;
  }

  if (typeof value === "boolean") {
    return value ? "" : '"false"';
  }

  if (value == null) {
    return '"null"';
  }

  if (Array.isArray(value) || isPlainObject(value)) {
    return `'${JSON.stringify(value, null, 2)}'`;
  }

  return `"${escapeAttribute(String(value))}"`;
}

function getComponentName(type: VNode["type"]) {
  if (typeof type === "function") {
    return type.name || "AnonymousComponent";
  }

  if (type && typeof type === "object") {
    const component = type as Record<string, unknown>;
    return (
      (typeof component.name === "string" && component.name) ||
      (typeof component.__name === "string" && component.__name) ||
      "AnonymousComponent"
    );
  }

  return "AnonymousComponent";
}

function serializeProps(props: Record<string, unknown> | undefined) {
  if (!props) return "";

  const entries = Object.entries(props).filter(([key, value]) => {
    if (key === "key" || key === "ref" || key === "onVnodeMounted" || key === "onVnodeUpdated") {
      return false;
    }

    return value !== undefined;
  });

  if (!entries.length) return "";

  return entries
    .map(([key, value]) => {
      if (typeof value === "boolean") {
        return value ? key : `:${key}="false"`;
      }

      if (typeof value === "string") {
        return `${key}=${formatPropValue(value)}`;
      }

      if (typeof value === "number" || typeof value === "bigint") {
        return `:${key}=${formatPropValue(value)}`;
      }

      if (Array.isArray(value) || isPlainObject(value)) {
        return `:${key}=${formatPropValue(value)}`;
      }

      return `:${key}=${formatPropValue(String(value))}`;
    })
    .join(" ");
}

function renderNodes(nodes: VNode[] | undefined, inInline = false): string {
  if (!nodes?.length) return "";

  const parts = nodes
    .map((node) => renderNode(node, inInline))
    .filter((part) => part !== "");

  return inInline ? parts.join("") : parts.join("\n\n");
}

function renderNode(node: VNode, inInline = false): string {
  if (node.type === Text) {
    return typeof node.children === "string" ? node.children : String(node.children ?? "");
  }

  if (node.type === Comment) return "";

  if (node.type === Fragment) {
    const children = Array.isArray(node.children)
      ? node.children.filter(isVNode)
      : [];
    return renderNodes(children, inInline);
  }

  if (typeof node.type === "string") {
    const children = Array.isArray(node.children)
      ? node.children.filter(isVNode)
      : [];
    const inner = renderNodes(children, true);

    switch (node.type) {
      case "strong":
      case "b":
        return `**${inner}**`;
      case "em":
      case "i":
        return `_${inner}_`;
      case "code":
        return `\`${escapeMarkdown(inner)}\``;
      case "a": {
        const href = typeof node.props?.href === "string" ? node.props.href : "";
        return href ? `[${inner}](${href})` : inner;
      }
      case "br":
        return "\n";
      case "p":
      case "div":
      case "section":
      case "article":
      case "li":
        return inner;
      default:
        return inner;
    }
  }

  if (node.type && typeof node.type === "object" || typeof node.type === "function") {
    const componentName = getComponentName(node.type);
    const props = serializeProps(node.props as Record<string, unknown> | undefined);
    const childSlots = isPlainObject(node.children) && typeof node.children.default === "function"
      ? node.children.default()
      : [];
    const renderedChildren = Array.isArray(childSlots)
      ? renderNodes(childSlots.filter(isVNode), false)
      : "";

    if (!renderedChildren) {
      return props ? `<${componentName} ${props} />` : `<${componentName} />`;
    }

    const openTag = props ? `<${componentName} ${props}>` : `<${componentName}>`;
    return `${openTag}\n${renderedChildren}\n</${componentName}>`;
  }

  if (Array.isArray(node.children)) {
    return renderNodes(node.children.filter(isVNode), inInline);
  }

  return "";
}

const renderedCode = computed(() => {
  if (props.code?.trim()) return props.code.trimEnd();
  return renderNodes(slots.default?.().filter(isVNode));
});

const codeFallback = "/* 当前内容无法自动提取源码。 */";
</script>

<template>
  <section class="demo-container">
    <button
      type="button"
      class="demo-container-summary"
      @click="codeOpen = !codeOpen"
    >
      <Icon
        class="demo-container-indicator"
        :icon="codeOpen ? 'fluent:chevron-down-12-filled' : 'fluent:chevron-right-12-filled'"
        aria-hidden="true"
      />
      <span class="demo-container-title">{{ summary }}</span>
    </button>

    <div class="demo-container-body">
      <div class="demo-container-preview vp-doc">
        <slot />
      </div>

      <div v-if="codeOpen" class="demo-container-code-wrap">
        <div class="demo-container-code-header">
          <span class="demo-container-lang">{{ props.lang }}</span>
        </div>
        <pre class="demo-container-code"><code>{{ renderedCode || codeFallback }}</code></pre>
      </div>
    </div>
  </section>
</template>

<style scoped>
.demo-container {
  margin: 14px 0;
  border: 1px solid var(--vp-c-divider);
  border-radius: 14px;
  background: var(--vp-c-bg-soft);
  overflow: hidden;
}

.demo-container-summary {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 4px;
  min-height: 52px;
  padding: 0 18px;
  color: var(--vp-c-text-2);
  background: var(--vp-c-bg-soft);
  border: none;
  text-align: left;
  cursor: pointer;
}

.demo-container-indicator {
  color: var(--vp-c-text-2);
  font-size: 16px;
  flex: 0 0 auto;
}

.demo-container-title {
  font-size: 16px;
  line-height: 1;
  font-weight: 700;
  color: inherit;
}

.demo-container-body {
  border-top: 1px solid var(--vp-c-divider);
}

.demo-container-preview {
  padding: 20px 22px 20px;
  border-bottom: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  font-size: 16px;
  line-height: 1;
  color: var(--vp-c-text-1);
}

.demo-container-preview :deep(p) {
  margin: 0;
}

.demo-container-code-wrap {
  position: relative;
  background: var(--vp-code-block-bg);
  color: var(--vp-code-block-color);
}

.demo-container-code-header {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 6px;
  padding: 8px 14px 0;
}

.demo-container-lang {
  color: var(--vp-c-text-3);
  font-size: 14px;
  line-height: 1;
}

.demo-container-code {
  margin: 0;
  padding: 12px 22px 22px;
  overflow-x: auto;
  font-size: 16px;
  line-height: 1.75;
  white-space: pre-wrap;
  word-break: break-word;
}

.demo-container-code code {
  font: inherit;
  color: inherit;
}
</style>
