---
outline: deep
---

# 文档特有组件示例 <Badge type="danger" text="Alpha" />

> [!WARNING] 🚧警告🚧
> 本页面所有控件均处于WIP状态，随时可能进行破坏性更改

## `LinkCard` 示例
### `LargeLinkCard` 示例
#### EmojiIcon
<LargeLinkCard title="查看文档规范" desc="统一命名、结构和维护方式。" href="/guide/conventions" icon="📘"/>
<LargeLinkCard title="Vue 官方网站" desc="外部链接示例，会在新窗口打开。" href="https://vuejs.org/" icon="🟢" :external="true"/>
#### ImageIcon
<LargeLinkCard title="VMTU" desc="图片图标示例" href="/vmtu/index" iconSrc="/img/example/icon.png" />
#### IconifyIcon
<LargeLinkCard title="Modrinth" desc="Iconify图标示例" href="https://modrinth.com/mod/vmupdate" iconify="simple-icons:modrinth" iconifyColor="#60e499" :external="true" />
#### WithoutDesc
<LargeLinkCard title="Github (VMTUCore)" href="https://github.com/VM-Chinese-translate-group/VMTUCore" iconify="simple-icons:github" :external="true"/>

### `MediumLinkCard` 示例
#### EmojiIcon
<MediumLinkCard title="FAQ" href="/guide/faq" icon="❓" />
<MediumLinkCard title="VMTU" href="/vmtu/index" icon="🧭" />
<MediumLinkCard title="Vue 官网" href="https://vuejs.org/" icon="🟢" :external="true" />
#### ImageIcon
<MediumLinkCard title="VMTU" href="/vmtu/index" iconSrc="/img/example/icon.png" />
#### IconifyIcon
<MediumLinkCard title="Modrinth" href="https://modrinth.com/mod/vmupdate" iconify="simple-icons:modrinth" iconifyColor="#60e499" :external="true" />
#### WithDesc
<MediumLinkCard title="Github" desc="(VMTUCore)" href="https://github.com/VM-Chinese-translate-group/VMTUCore" iconify="simple-icons:github" :external="true"/>

### `MiniLinkCard` 示例
#### EmojiIcon
<MiniLinkCard title="FAQ" href="/guide/faq" icon="❓" />
<MiniLinkCard title="VMTU" href="/vmtu/index" icon="🧭" />
<MiniLinkCard title="Vue 官网" href="https://vuejs.org/" icon="🟢" :external="true" />
#### ImageIcon
<MiniLinkCard title="VMTU" href="/vmtu/index" iconSrc="/img/example/icon.png" />
#### IconifyIcon
<MiniLinkCard title="Modrinth" href="https://modrinth.com/mod/vmupdate" iconify="simple-icons:modrinth" iconifyColor="#60e499" :external="true"/>

## `FileTree` 示例

<FileTree
  title="项目结构"
  :items="[
    {
      name: 'docs',
      children: [
        { name: 'index.md', type: 'file' },
        {
          name: 'guide',
          children: [
            { name: 'getting-started.md', type: 'file' },
            { name: 'conventions.md', type: 'file' },
            { name: 'faq.md', type: 'file' }
          ]
        },
        {
          name: '.vitepress',
          children: [
            { name: 'config.mts', type: 'file' },
            { name: 'theme', type: 'folder' },
            {
              name: 'components',
              children: [
                { name: 'LinkCard.vue', type: 'file' },
                { name: 'MiniLinkCard.vue', type: 'file' },
                { name: 'FileTree.vue', type: 'file' }
              ]
            }
          ]
        }
      ]
    }
  ]"
/>