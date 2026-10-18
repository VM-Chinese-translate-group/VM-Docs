# VM汉化组文档站

立即访问：https://docs.vmct.top/

## 📖 使用与部署

在开发前，请先安装 [NodeJS](https://nodejs.org/zh-cn/download/prebuilt-installer)，推荐安装 Node24。

安装依赖：

```sh
pnpm i
```

开发预览：

```sh
pnpm run docs:dev
```

构建：

```sh
pnpm run docs:build
```

构建结束时会自动生成 Pagefind 中文搜索索引，索引位于 `docs/.vitepress/dist/pagefind/`，需随站点产物一起部署。
搜索功能在构建后生效，可运行 `pnpm run docs:preview` 验证；开发服务器不生成搜索索引。
