import { defineConfig } from 'vitepress'
import { BiDirectionalLinks } from '@nolebase/markdown-it-bi-directional-links'
import { InlineLinkPreviewElementTransform } from '@nolebase/vitepress-plugin-inline-link-preview/markdown-it'
import mdAbbr from 'markdown-it-abbr'
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
    logo: { src: '/img/logo.png' },
    nav: [
      { text: 'VMTU', link: '/vmtu/' },
      { text: '示例', link: '/example/' },
    ],
    socialLinks: [
      { icon: 'github', link: 'https://github.com/VM-Chinese-translate-group' },
      { icon: 'bilibili', link: 'https://space.bilibili.com/2085089798' },
    ],
    sidebar: [
      {
        text: 'VMTU文档',
        collapsed: true,
        link: '/vmtu/',
        items: [
          {
            text: '配置文件',
            link: '/vmtu/configs/',
            collapsed: true,
            items: [
              { text: 'VM Metadata', link: '/vmtu/configs/metadata' },
              { text: 'ModpackInfo', link: '/vmtu/configs/modpackinfo' },
            ],
          },
          { text: '语言', link: '/vmtu/language' },
          { text: '模组检测', link: '/vmtu/mod-check' },
          { text: '资源包', link: '/vmtu/resourcepack' },
          { text: '汉化更新检测', link: '/vmtu/translation-update' },
        ],
      },
      {
        text: '文档示例',
        collapsed: true,
        link: '/example/',
        items: [
          { text: '运行时 API 示例', link: '/example/api' },
          { text: '特有组件示例', link: '/example/component' },
          { text: 'Markdown 示例', link: '/example/markdown' },
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
