import { defineConfig } from "vitepress";
import { BiDirectionalLinks } from '@nolebase/markdown-it-bi-directional-links'
import { InlineLinkPreviewElementTransform } from '@nolebase/vitepress-plugin-inline-link-preview/markdown-it'
import mdAbbr from "markdown-it-abbr";
import { demo } from "./theme/plugins/DemoContainer";
import { stepper } from "./theme/plugins/StepperContainer";

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
      { icon: 'github', link: 'https://github.com/VM-Chinese-translate-group' },
      { icon: 'bilibili', link: 'https://space.bilibili.com/2085089798' }
    ],
    sidebar: [
      {
        text: "VMTU",
        collapsed: true,
        items: [
          { text: "模组简介", link: "/vmtu/" },
          { text: "配置文件", link: "/vmtu/config" },
          { text: "语言", link: "/vmtu/language" },
          { text: "模组检测", link: "/vmtu/mod-check" },
          { text: "资源包", link: "/vmtu/resourcepack" },
          { text: "汉化更新检测", link: "/vmtu/translation-update" },
          { text: "版本支持情况", link: "/vmtu/supported-version" },
          { text: "VM Metadata", link: "/vmtu/metadata" }
        ]
      },
      {
        text: "文档示例",
        collapsed: true,
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
      md.use(mdAbbr)
      md.use(demo)
      md.use(stepper)
    },
  }
});
