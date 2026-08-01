import { defineConfig } from 'vitepress'
import { BiDirectionalLinks } from '@nolebase/markdown-it-bi-directional-links'
import { InlineLinkPreviewElementTransform } from '@nolebase/vitepress-plugin-inline-link-preview/markdown-it'
// @ts-ignore
import mdAbbr from 'markdown-it-abbr'
// @ts-ignore
import mdFootnote from 'markdown-it-footnote'
import { demo } from './theme/plugins/DemoContainer'
import { stepper } from './theme/plugins/StepperContainer'

export default defineConfig({
  head: [['link', { rel: 'icon', href: '/img/logo.png' }]],
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
    nav: [
      { text: 'VMTU文档', link: '/vmtu/' },
      { text: '汉化准则', link: '/rule/' },
      {
        text: '教程',
        items: [
          {
            text: '整合包相关',
            items: [
              { text: '汉化补丁安装', link: 'translation' },
              { text: '服务端下载', link: 'serverpack' },
            ]
          },
        ],
      },
      { text: 'VM官网', link: 'https://vmct-cn.top/' },
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
    search: {
      provider: 'algolia',
      options: {
        appId: 'TTUZ1AK1BJ',
        apiKey: '079af68ecd924c327b5ee9591e0dd829',
        indexName: 'VM-Docs',
        translations: {
          button: {
            buttonText: '搜索',
            buttonAriaLabel: '搜索',
          },
          modal: {
            searchBox: {
              clearButtonTitle: '清除',
              clearButtonAriaLabel: '清除查询',
              closeButtonText: '关闭',
              closeButtonAriaLabel: '关闭',
              placeholderText: '搜索文档',
              placeholderTextAskAi: '再问一个问题...',
              placeholderTextAskAiStreaming: '正在回答...',
              searchInputLabel: '搜索',
              backToKeywordSearchButtonText: '返回关键词搜索',
              backToKeywordSearchButtonAriaLabel: '返回关键词搜索',
              newConversationPlaceholder: '提问',
              conversationHistoryTitle: '我的对话历史',
              startNewConversationText: '开始新的对话',
              viewConversationHistoryText: '对话历史',
              threadDepthErrorPlaceholder: '对话已达上限',
            },
            footer: {
              selectText: '选择',
              submitQuestionText: '提交问题',
              selectKeyAriaLabel: '回车键',
              navigateText: '导航',
              navigateUpKeyAriaLabel: '向上箭头',
              navigateDownKeyAriaLabel: '向下箭头',
              closeText: '关闭',
              backToSearchText: '返回搜索',
              closeKeyAriaLabel: 'Esc 键',
              poweredByText: '由Algolia DocSearch提供支持',
            },
            errorScreen: {
              titleText: '无法获取结果',
              helpText: '你可能需要检查网络连接。',
            },
            startScreen: {
              recentSearchesTitle: '最近',
              noRecentSearchesText: '暂无最近搜索',
              saveRecentSearchButtonTitle: '保存此搜索',
              removeRecentSearchButtonTitle: '从历史记录中移除此搜索',
              favoriteSearchesTitle: '收藏',
              removeFavoriteSearchButtonTitle: '从收藏中移除此搜索',
              recentConversationsTitle: '最近对话',
              removeRecentConversationButtonTitle: '从历史记录中移除此对话',
            },
            noResultsScreen: {
              noResultsText: '未找到相关结果',
              suggestedQueryText: '尝试搜索',
              reportMissingResultsText: '认为此查询应该有结果？',
              reportMissingResultsLinkText: '告诉我们。',
            },
          },
        },
        locales: {
          zh: {
            translations: {
              button: {
                buttonText: '搜索',
                buttonAriaLabel: '搜索',
              },
              modal: {
                searchBox: {
                  clearButtonTitle: '清除',
                  clearButtonAriaLabel: '清除查询',
                  closeButtonText: '关闭',
                  closeButtonAriaLabel: '关闭',
                  placeholderText: '搜索文档',
                  placeholderTextAskAi: '再问一个问题...',
                  placeholderTextAskAiStreaming: '正在回答...',
                  searchInputLabel: '搜索',
                  backToKeywordSearchButtonText: '返回关键词搜索',
                  backToKeywordSearchButtonAriaLabel: '返回关键词搜索',
                  newConversationPlaceholder: '提问',
                  conversationHistoryTitle: '我的对话历史',
                  startNewConversationText: '开始新的对话',
                  viewConversationHistoryText: '对话历史',
                  threadDepthErrorPlaceholder: '对话已达上限',
                },
                footer: {
                  selectText: '选择',
                  submitQuestionText: '提交问题',
                  selectKeyAriaLabel: '回车键',
                  navigateText: '导航',
                  navigateUpKeyAriaLabel: '向上箭头',
                  navigateDownKeyAriaLabel: '向下箭头',
                  closeText: '关闭',
                  backToSearchText: '返回搜索',
                  closeKeyAriaLabel: 'Esc 键',
                  poweredByText: '由Algolia DocSearch提供支持',
                },
                errorScreen: {
                  titleText: '无法获取结果',
                  helpText: '你可能需要检查网络连接。',
                },
                startScreen: {
                  recentSearchesTitle: '最近',
                  noRecentSearchesText: '暂无最近搜索',
                  saveRecentSearchButtonTitle: '保存此搜索',
                  removeRecentSearchButtonTitle: '从历史记录中移除此搜索',
                  favoriteSearchesTitle: '收藏',
                  removeFavoriteSearchButtonTitle: '从收藏中移除此搜索',
                  recentConversationsTitle: '最近对话',
                  removeRecentConversationButtonTitle: '从历史记录中移除此对话',
                },
                noResultsScreen: {
                  noResultsText: '未找到相关结果',
                  suggestedQueryText: '尝试搜索',
                  reportMissingResultsText: '认为此查询应该有结果？',
                  reportMissingResultsLinkText: '告诉我们。',
                },
              },
            },
          },
        },
      },
    },
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
