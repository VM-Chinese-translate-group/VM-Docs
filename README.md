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

自定义 Markdown 插件通过开发依赖 `@types/markdown-it` 获取类型，仍使用 `import type ... from 'markdown-it'` 导入；运行时的 `markdown-it` 由 VitePress 及插件依赖提供，不再作为项目的直接依赖。

导航栏兼容样式位于 `docs/.vitepress/theme/styles/patches.css`：阅读增强模式下由 VitePress 的 flex 布局预留侧栏宽度，不再重复添加左边距。`acrylic-navbar.css` 通过 VitePress 原生背景变量设置毛玻璃效果，平板宽度下主导航与次级导航共用一层模糊背景，避免不透明背景遮挡或滤镜叠加；首页顶部保持透明，移动端展开菜单时恢复背景。
