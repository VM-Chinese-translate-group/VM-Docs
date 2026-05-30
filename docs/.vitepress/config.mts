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
        text: "VMTU",
        items: [
          { text: "模组简介", link: "/vmtu/" },
          { text: "配置文件", link: "/vmtu/config" },
          { text: "自动切换语言", link: "/vmtu/language" },
          { text: "模组安装检测", link: "/vmtu/mod-check" },
          { text: "资源包相关", link: "/vmtu/resourcepack" },
          { text: "汉化更新检测", link: "/vmtu/translation-update" },
          { text: "支持的模组加载器及版本", link: "/vmtu/supported-version" },
          { text: "VM Metadata", link: "/vmtu/metadata" }
        ]
      },
      {
        text: "文档样式示例",
        items: [
          { text: "Markdown 示例", link: "example/markdown" },
          { text: "API 示例", link: "example/api" },
          { text: "组件示例", link: "example/component" }
        ]
      }
    ],
    search: {
      provider: 'algolia',
      options: {
        appId: 'TTUZ1AK1BJ',
        apiKey: '079af68ecd924c327b5ee9591e0dd829',
        indexName: 'VM-Docs'
      }
    }
  },
  markdown: {
    config: (md) => {
      md.use(BiDirectionalLinks())
      md.use(InlineLinkPreviewElementTransform)
    },
  }
});
