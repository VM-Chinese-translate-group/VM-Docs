import { defineConfig } from "vitepress";
import { BiDirectionalLinks } from '@nolebase/markdown-it-bi-directional-links'

import {
  InlineLinkPreviewElementTransform
} from '@nolebase/vitepress-plugin-inline-link-preview/markdown-it'

export default defineConfig({
  vite: {
    optimizeDeps: {
      exclude: [
        '@nolebase/vitepress-plugin-inline-link-preview/client',
        '@nolebase/vitepress-plugin-enhanced-readabilities/client',
        'vitepress',
        '@nolebase/ui',
      ],
    },
    ssr: {
      noExternal: [
        '@nolebase/vitepress-plugin-inline-link-preview',
        '@nolebase/vitepress-plugin-enhanced-readabilities',
        '@nolebase/ui',
      ],
    },
  },
  lang: "zh-CN",
  title: "VM Docs",
  description: "VM 文档",
  themeConfig: {
    nav: [
      { text: "首页", link: "/" }
    ],
    socialLinks: [
      { icon: 'github', link: 'https://github.com/vuejs/vitepress' },
      { icon: 'bilibili', link: 'https://space.bilibili.com/2085089798' }
    ],
    sidebar: [
      {
        text: "指南",
        items: [
          { text: "快速开始", link: "/guide/getting-started" },
          { text: "文档规范", link: "/guide/conventions" },
          { text: "常见问题", link: "/guide/faq" }
        ]
      },
      {
        text: "示例",
        items: [
          { text: "Markdown 示例", link: "example/markdown" },
          { text: "API 示例", link: "example/api" },
          { text: "组件示例", link: "example/component" }
        ]
      },
      {
        text: "VMTU",
        items: [{ text: "Index", link: "/vmtu/index" }]
      }
    ]
  },
  markdown: {
    config: (md) => {
      md.use(BiDirectionalLinks())
      md.use(InlineLinkPreviewElementTransform)
    },
  }
});
