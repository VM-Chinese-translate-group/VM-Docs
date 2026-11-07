# VM汉化组文档站

立即访问：https://docs.vmct.top/

## 📖 使用与部署

在开发前，请先安装 [NodeJS](https://nodejs.org/zh-cn/download/prebuilt-installer)，推荐安装 Node24。

安装依赖：

```sh
pnpm i
```

请使用 `package.json` 中 `packageManager` 指定的 pnpm 版本。`pnpm-workspace.yaml` 的 `allowBuilds` 已允许 `esbuild` 和 `pnpm` 运行安装脚本；升级依赖时若出现 `ERR_PNPM_IGNORED_BUILDS`，请先检查被拦截的脚本，再通过 `pnpm approve-builds` 按需授权。

开发预览：

```sh
pnpm run docs:dev
```

构建：

```sh
pnpm run docs:build
```

主题中的文件树插件通过 `enhanceAppWithFileTree({ app })` 注册。供 VitePress 配置加载的自定义 Markdown 插件使用 `.mts` 文件及带扩展名的导入，以兼容 Vite 的原生 ESM 配置加载。

自定义 Markdown 插件通过开发依赖 `@types/markdown-it` 获取类型，仍使用 `import type ... from 'markdown-it'` 导入。`markdown-it` 作为直接依赖供浏览器预览使用；构建和预览共用 `docs/.vitepress/theme/plugins/SiteMarkdown.mts` 中的本站语法插件。

导航栏兼容样式位于 `docs/.vitepress/theme/styles/patches.css`：阅读增强模式下由 VitePress 的 flex 布局预留侧栏宽度，不再重复添加左边距。`acrylic-navbar.css` 通过 VitePress 原生背景变量设置毛玻璃效果，平板宽度下主导航与次级导航共用一层模糊背景，避免不透明背景遮挡或滤镜叠加；首页顶部保持透明，移动端展开菜单时恢复背景。

## Markdown 编辑器

导航栏的「Markdown 编辑器」打开 `/tools/markdown`。页面在 `docs/tools/markdown.md`，源码编辑器在 `docs/.vitepress/theme/components/MarkdownEditor.vue`，独立预览在 `SiteMarkdownPreview.vue`，仅在打开该页面时加载。

参考 [datapack-index 的 MarkdownPreviewer](https://github.com/CR-019/datapack-index/blob/master/.vitepress/vue/MarkdownPreviewer.vue)，`md-editor-v3` 只负责源码编辑，不再承担预览。预览使用 Markdown-it 和 Shiki 生成站点原生的文档、代码块及容器结构，并渲染本站注册的 Vue 组件，而不是给编辑器生成的 HTML 套主题。本站的缩写、脚注、demo 和 stepper 插件通过 `SiteMarkdown.mts` 共用；标题锚点规则、代码主题及无障碍配色也由该模块统一提供给 VitePress 构建和实时预览。

支持 Markdown 基础语法、表格、任务列表、删除线、脚注、缩写、定义列表、Emoji、高亮、上下标、KaTeX 公式、Mermaid 与 ECharts 图表，以及编辑 / 分屏 / 预览、标题目录、比例同步滚动、格式化和全屏。依赖随本站打包，不使用编辑器默认 CDN。预览正文独立使用 `.vp-doc`，源码编辑器样式不会覆盖预览组件。

frontmatter 使用 YAML 解析，并作为预览中 Vue 组件的 `useData()` 上下文。组件参数支持 JSON5 字面量与 `frontmatter` / `page` / `site` / `theme` 属性引用；不执行脚本、事件指令或任意 JavaScript 表达式。不支持的绑定会显示诊断，而不是执行或悄悄忽略。Mermaid 使用严格安全模式，KaTeX 不启用信任模式。

Mermaid 以隔离的 SVG 图片展示，图表样式不会污染编辑器页面。清理时仅对 Mermaid 生成的 SVG 允许 `foreignObject` 中的 XHTML 标签，再通过 XML 序列化保留命名空间和换行；图片按 `viewBox` 固有比例显示，小图不放大，窄屏自动缩小，并在解码成功后显示。长图表在固定高度的预览区内滚动，不会挤出工具栏和页脚。ECharts 配置使用 JSON5，不执行函数；提示框固定使用 `richText`，不启用 HTML dataView。安全预览不执行 Markdown 内的 `<script>`、全局 `<style>` 或任意 Vue 模板代码。

文档及可选的文档 / 资源路径自动保存在浏览器的 `vm-docs:markdown-draft:v1`，兼容旧草稿，刷新后恢复（包含空文档）。资源路径决定相对图片和链接的解析位置，不会上传本地目录；wiki 链接依据启动或构建时收集的真实站点文件列表解析。草稿只保留当前一份，清除网站数据会删除草稿。

新建、载入示例和导入文件会提示确认替换；可导入 UTF-8 `.md`、`.markdown`、`.txt` 文件，统一导出为 `文档.md`，页面不再提供文件名输入栏。保存按钮及 `Ctrl / ⌘ + S` 均导出文件。图片上传、粘贴或拖入后以 data URL 嵌入文档，不需要服务器；大图片可能超出本地存储容量，页面会提示导出备份。
