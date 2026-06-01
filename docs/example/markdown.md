---
outline: deep
next: false
---

# Markdown 扩展示例 <Badge type="danger" text="Alpha" />

> [!WARNING] 🚧警告🚧
> 本页面所有控件均处于WIP状态，随时可能进行破坏性更改

本页展示了本文档提供的 Markdown 扩展功能。 VitePress所支持的 Markdown 扩展功能请查看[VitePress官方文档](https://vitepress.dev/guide/markdown)。

## 词语释义 (Abbr)
此功能由`markdown-it-abbr`提供支持，此功能用于定义词语释义。

:::demo
*[HTML]: 超文本标记语言（Hyper Text Markup Language）
*[W3C]: 万维网联盟（World Wide Web Consortium）

HTML 规范由 W3C 负责维护。
:::

## 示例容器 （Demo）
通过本文档自行基于`markdown-it`接口实现的`demo`插件，我们提供了一个名为`demo`的示例容器。

:::demo
这是外层容器的内容。

:::demo 套娃容器
这是内层容器的内容，支持**粗体**、*斜体* 和`代码`。
<MiniLinkCard title="同样支持Vue组件" href="api" icon="❓" />
:::

外层容器的其他内容。
:::

## 步骤组 （Stepper）
通过本文档自行基于`markdown-it`接口实现的`stepper`插件，我们提供了一个名为`stepper`的步骤组容器。

:::demo
:::stepper
@tab 第一步
安装项目依赖：

```bash
npm install
```

@tab 第二步
启动开发服务器：

```bash
npm run dev
```

@tab 第三步
打开浏览器访问 `http://localhost:5173` 查看效果。

@tab 第四步
出bug了，D老师快救救我
:::
:::
