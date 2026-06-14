# VMTU文档

VMTU是一个为 Minecraft 整合包汉化补丁设计的自动化汉化管理工具，涵盖了绝大部分汉化相关的使用场景。

普通玩家可以通过它获得额外的模组资源包汉化，VM汉化组内部也可以通过它为玩家提供更好的汉化体验。

> [!IMPORTANT] 重要提示
> 本文档所有内容基于 VMTU 最新版 5.2.0 编写。
> MC 1.12.2版本的 VMTU 配置文件为 cfg 格式，与文档演示的toml格式存在较大差异，请以游戏内实际为准

<MediumLinkCard title="Github" desc="Mod主仓库" href="https://github.com/VM-Chinese-translate-group/VMTranslationUpdateMod" iconify="simple-icons:github" :external="true"/>
<MediumLinkCard title="Github" desc="VMTULibraries" href="https://github.com/VM-Chinese-translate-group/VMTULibraries" iconify="simple-icons:github" :external="true"/>
<MediumLinkCard title="Github" desc="VM-Resources" href="https://github.com/VM-Chinese-translate-group/VM-Resources" iconify="simple-icons:github" :external="true"/>
<MediumLinkCard title="CurseForge" href="https://www.curseforge.com/minecraft/mc-mods/vmtu" iconify="simple-icons:curseforge" iconifyColor="#f1693c" :external="true"/>
<MediumLinkCard title="Modrinth" href="https://modrinth.com/mod/vmtu" iconSrc="/img/modrinth.svg" />

## 模组功能

模组的所有功能都是可配置的，关于配置文件及更详细的功能介绍请看后文。

- ✅ 自动检测汉化版本更新，并在游戏里通知玩家更新。
- 📥 自动下载并激活汉化资源包
- 🌐 自动切换游戏语言
- 📦 指定整合包配置文件，支持为每个包指定自身汉化策略
- 🚦 指定资源包加载顺序
- 🔍 支持检测 I18nUpdateMod、Vault Patcher、Texture Locale Redirector 模组是否缺失。如未安装将弹出提示页面引导下载

其中，自动下载并激活资源包功能（VMTULibraries-ResourcePack）的代码源于 i18nUpdateMod3[^1] 模组代码修改，按照上游协议规定使用 AGPL v3 协议。

## 版本支持情况

本模组需要 Cloth Config API 作为前置（1.12.2版本除外），支持 Forge、NeoForge 和 Fabric 三大主流模组加载器。

VMTU 目前同时支持和维护以下的全版本，以下是支持版本列表：

| 模组加载器 | 支持的 Minecraft 版本             |
| ---------- | --------------------------------- |
| Forge      | 1.12.2[^2]/1.16.5/1.18~1.20.4[^3] |
| NeoForge   | 1.20~26.1.2                       |
| Fabric     | 1.16.5~26.1.2                     |

[^1]: i18nUpdateMod3是由CFPA制作的模组，提供了自动下载更新资源包的功能，VMTU的相关功能基于其代码修改而来。

[^2]: 注：1.12.2 版本以后将不再更新主要版本（VMTU 6.0.0），将停留在 5.x 版本系列。

[^3]: 注：对于 Forge 端 1.20.5 及以上版本，由于模组的前置依赖 Cloth Config API 已不再支持，故本模组也不支持。

## 开源协议

作者：捂脸、TexTrue

开源协议：MIT（VMTUMod）、AGPL v3（VMTULibraries-ResourcePack）、LGPL v3（VMTULibraries-Common、VMTULibraries-Modpack）

其中，VMTULibraries仓库包含3个子库：

- VMTULibraries-Common: VMTU通用代码库
- VMTULibraries-ResourcePack: VMTU资源包库，用于管理汉化资源包的下载和激活。
- VMTULibraries-Modpack: VMTU整合包库，用于管理整合包版本及其汉化补丁版本。
