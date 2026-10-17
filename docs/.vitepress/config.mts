import { defineConfig } from 'vitepress'
import { chineseSearchOptimize, pagefindPlugin } from 'vitepress-plugin-pagefind'
import { BiDirectionalLinks } from '@nolebase/markdown-it-bi-directional-links'
import { InlineLinkPreviewElementTransform } from '@nolebase/vitepress-plugin-inline-link-preview/markdown-it'
// @ts-ignore
import mdAbbr from 'markdown-it-abbr'
// @ts-ignore
import mdFootnote from 'markdown-it-footnote'
import { demo } from './theme/plugins/DemoContainer'
import { stepper } from './theme/plugins/StepperContainer'

export default defineConfig({
  ...(process.env.DOCS_SITE_ORIGIN ? { sitemap: { hostname: process.env.DOCS_SITE_ORIGIN } } : {}),
  head: [['link', { rel: 'icon', href: '/img/logo.png' }]],
  vite: {
    plugins: [
      pagefindPlugin({
        excludeSelector: ['.VPDocFooter', '.footnote-backref'],
        btnPlaceholder: '搜索',
        placeholder: '搜索文档',
        emptyText: '未找到相关结果',
        loadingText: '搜索中…',
        heading: '共 {{searchResult}} 条结果',
        toSelect: '选择',
        toNavigate: '切换',
        toClose: '关闭',
        searchBy: '搜索提供者',
        displayDetailedList: '显示详细列表',
        resetSearch: '清空搜索',
        closeSearch: '关闭搜索',
        customSearchQuery: chineseSearchOptimize,
        forceLanguage: 'zh-cn'
      }),
    ],
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
  lang: 'zh-CN',
  title: 'VM Docs',
  description: 'VM 文档',
  themeConfig: {
    outlineTitle: '目录',
    sidebarMenuLabel: '菜单',
    returnToTopLabel: '返回顶部',
    lastUpdatedText: '最后更新',
    docFooter: {
      prev: '上一页',
      next: '下一页'
    },
    darkModeSwitchLabel: '主题',
    lightModeSwitchTitle: '切换到浅色模式',
    darkModeSwitchTitle: '切换到深色模式',
    langMenuLabel: '选择语言',

    logo: { src: '/img/logo.png' },
    outline: {
      level: 'deep'
    },
    nav: [
      { text: 'VMTU文档', link: '/vmtu/' },
      { text: '汉化准则', link: '/rule/' },
      {
        text: '教程',
        items: [
          {
            text: '整合包相关',
            items: [
              { text: '汉化补丁安装', link: '/tutorial/modpack/translation' },
              { text: '服务端下载', link: '/tutorial/modpack/serverpack' },
            ]
          },
        ],
      },
      { text: 'VM官网', link: process.env.DOCS_LOCAL_SEARCH === '1' ? 'https://www.vmct.top/' : 'https://vmct-cn.top/' },
    ],
    socialLinks: [
      { icon: 'github', link: 'https://github.com/VM-Chinese-translate-group' },
      { icon: 'bilibili', link: 'https://space.bilibili.com/2085089798' },
    ],
    sidebar: [
      {
        text: 'VMTU文档',
        collapsed: true,
        base: '/vmtu/',
        link: '/',
        items: [
          {
            text: '配置文件',
            base: '/vmtu/configs/',
            link: '/',
            items: [
              { text: 'VM Metadata', link: 'metadata' },
              { text: 'ModpackInfo', link: 'modpackinfo' },
            ],
          },
          { text: '语言', link: 'language' },
          { text: '模组检测', link: 'mod-check' },
          { text: '资源包', link: 'resourcepack' },
          { text: '汉化更新检测', link: 'translation-update' },
        ],
      },
      {
        text: '汉化准则',
        collapsed: true,
        base: '/rule/',
        link: '/',
        items: [
          { text: '普适汉化准则', link: 'common' },
          { text: '地图汉化准则', link: 'map' },
        ],
      },
      {
        text: '教程',
        collapsed: true,
        base: '/tutorial/',
        items: [
          {
            text: '整合包相关',
            base: '/tutorial/modpack/',
            link: '/',
            items: [
              { text: '汉化补丁安装', link: 'translation' },
              { text: '服务端下载', link: 'serverpack' },
            ]
          },
        ],
      },
      {
        text: '工具链文档',
        collapsed: true,
        base: '/internal/',
        items: [
          { text: '创建新项目', link: 'new-project' }
        ],
      },
      {
        text: '文档示例',
        collapsed: true,
        base: '/example/',
        link: '/',
        items: [
          { text: '运行时 API 示例', link: 'api' },
          { text: '特有组件示例', link: 'component' },
          { text: 'Markdown 示例', link: 'markdown' },
        ],
      },
    ],
  },
  markdown: {
    config: (md) => {
      md.use(
        BiDirectionalLinks({
          dir: 'docs/',
        }),
      )
      md.use(InlineLinkPreviewElementTransform)
      md.use(mdAbbr)
      md.use(mdFootnote)
      md.use(demo)
      md.use(stepper)
    },
  },
})
