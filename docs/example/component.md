---
outline: deep
---

# 文档特有组件示例 <Badge type="danger" text="Alpha" />

> [!WARNING] 🚧警告🚧
> 本页面所有控件均处于WIP状态，随时可能进行破坏性更改

## `LinkCard` 示例
### `LargeLinkCard` 示例
#### EmojiTextIcon
<LargeLinkCard title="查看文档规范" desc="统一命名、结构和维护方式。" href="/guide/conventions" icon="📘"/>
<LargeLinkCard title="Vue 官方网站" desc="外部链接示例，会在新窗口打开。" href="https://vuejs.org/" icon="🟢" :external="true"/>

<DemoContainer summary="EmojiTextIcon示例">
<LargeLinkCard title="查看文档规范" desc="统一命名、结构和维护方式。" href="/guide/conventions" icon="📘"/>
<LargeLinkCard title="Vue 官方网站" desc="外部链接示例，会在新窗口打开。" href="https://vuejs.org/" icon="🟢" :external="true"/>
</DemoContainer>

#### ImageIcon
<LargeLinkCard title="VMTU" desc="图片图标示例" href="/vmtu/index" iconSrc="/img/example/icon.png" />

<DemoContainer summary="ImageIcon示例">
<LargeLinkCard title="VMTU" desc="图片图标示例" href="/vmtu/index" iconSrc="/img/example/icon.png" />
</DemoContainer>

#### IconifyIcon
<DemoContainer summary="IconifyIcon示例">
<LargeLinkCard title="Modrinth" desc="Iconify图标示例" href="https://modrinth.com/mod/vmupdate" iconify="simple-icons:modrinth" iconifyColor="#60e499" :external="true" />
</DemoContainer>

#### WithoutDesc
<DemoContainer summary="WithoutDesc示例">
<LargeLinkCard title="Github (VMTUCore)" href="https://github.com/VM-Chinese-translate-group/VMTUCore" iconify="simple-icons:github" :external="true"/>
</DemoContainer>


### `MediumLinkCard` 示例
#### EmojiTextIcon
<DemoContainer summary="EmojiTextIcon示例">
<MediumLinkCard title="FAQ" href="/guide/faq" icon="❓" />
<MediumLinkCard title="VMTU" href="/vmtu/index" icon="🧭" />
<MediumLinkCard title="Vue 官网" href="https://vuejs.org/" icon="🟢" :external="true" />
</DemoContainer>

#### ImageIcon
<DemoContainer summary="ImageIcon示例">
<MediumLinkCard title="VMTU" href="/vmtu/index" iconSrc="/img/example/icon.png" />
</DemoContainer>

#### IconifyIcon
<DemoContainer summary="IconifyIcon示例">
<MediumLinkCard title="Modrinth" href="https://modrinth.com/mod/vmupdate" iconify="simple-icons:modrinth" iconifyColor="#60e499" :external="true" />
</DemoContainer>

#### WithDesc
<DemoContainer summary="WithDesc示例">
<MediumLinkCard title="Github" desc="VMTUCore" href="https://github.com/VM-Chinese-translate-group/VMTUCore" iconify="simple-icons:github" :external="true"/>
</DemoContainer>

### `MiniLinkCard` 示例
#### EmojiTextIcon
<DemoContainer summary="EmojiTextIcon示例">
<MiniLinkCard title="FAQ" href="/guide/faq" icon="❓" />
<MiniLinkCard title="VMTU" href="/vmtu/index" icon="🧭" />
<MiniLinkCard title="Vue 官网" href="https://vuejs.org/" icon="🟢" :external="true" />
</DemoContainer>

#### ImageIcon
<DemoContainer summary="ImageIcon示例">
<MiniLinkCard title="VMTU" href="/vmtu/index" iconSrc="/img/example/icon.png" />
</DemoContainer>

#### IconifyIcon

<DemoContainer summary="IconifyIcon示例">
<MiniLinkCard title="Modrinth" href="https://modrinth.com/mod/vmupdate" iconify="simple-icons:modrinth" iconifyColor="#60e499" :external="true"/>
</DemoContainer>

## `FileTree` 示例

<DemoContainer summary="目录示例">
<FileTree title="带标识的目录" :items="[
    {
      name: 'docs',
      type: 'folder',
      children: [
        { name: 'index.md', type: 'file', flag: 'i' },
        {
          name: 'guide',
          type: 'folder',
          children: [
            { name: 'getting-started.md', type: 'file', flag: '-' },
            { name: 'conventions.md', type: 'file', flag: '+' }
          ]
        }
      ]
    }
  ]"
/>
</DemoContainer>

## `DemoContainer` 示例 <Badge type="warning" text="WIP" />

<DemoContainer summary="示例">
对的，他还可以嵌套
<DemoContainer summary="这是一个示例">
加粗、斜体和 `行内代码` 都可以正常使用。
</DemoContainer>
</DemoContainer>
