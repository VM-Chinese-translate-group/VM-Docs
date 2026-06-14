# 配置文件

## 配置文件说明

VMTU 共有 3 个配置文件，要使模组正常运行三者缺一不可。

本模组会在首次启动且未找到相关配置文件时在以下目录自动生成 VMTU模组配置文件 和 modpackinfo.json 。

_[VMTU模组配置文件]: 用于控制具体模组功能的启用与否，在1.16.5及以上版本中位于 `config/vmtranslationupdate.toml`，在1.12.2版本中位于 `config/vmtranslationupdate.cfg`，本文档仅介绍1.16.5及以上版本的配置文件内容
_[modpackinfo.json]: 用于定义汉化补丁的版本信息和更新检测配置，位于游戏根目录下

对于 VMTU 模组的开发者和汉化补丁维护者，还需了解云端 vm-meta 的配置文件。此文件用户不可见。

\*[vm-meta]: 用于定义汉化补丁的版本信息和更新检测配置，位于游戏根目录下

## 模组功能开关配置

我们首先来介绍 VMTU模组配置文件 。

它是 VMTU 模组的主要配置文件，位于游戏的 `config` 目录下。此文件用于控制具体模组功能的启用与否。

下方为默认生成的配置文件内容：

```toml
[misc]                                  # 其他配置
devMode = false                         # 供开发者使用的测试模式，会输出更多日志，并在聊天栏输出整合包配置信息（默认禁用）
autoSwitchLanguage = false              # 是否自动切换语言（默认禁用）
checkModPackTranslationUpdate = false   # 是否检查整合包汉化更新（默认禁用）
generateExampleModpackInfo = false      # 是否生成示例整合包信息文件（默认禁用）
[resourcePack]                          # 资源包相关配置
autoDownloadVMTranslationPack = true    # 是否自动下载VM汉化资源包（默认启用）
autoLoadExtraTranslationPack = false    # 是否自动加载扩展汉化资源包（默认禁用）
resourcePackIndex = "DEFAULT"           # 资源包在资源包列表中的位置
extraPackName = ""                      # 扩展汉化资源包名称（包括扩展名）
extraPackCustomIndex = 0                # 自定义扩展翻译资源包在资源包列表中的位置
[modInstallCheck]                       # 模组安装检查配置
i18nUpdateMod = true                    # 是否检查安装 i18nUpdateMod 模组（默认启用）
vaultPatcher = false                    # 是否检查安装 Vault Patch 模组（默认禁用）
textureLocaleRedirector = false         # 是否检查安装 Texture Locale Redirector 模组（默认禁用）
```

为了方便使用，本配置文件的所有内容均可在游戏内的模组配置界面进行修改。[^1]

## 汉化信息配置 （modpackinfo.json）

modpackinfo.json 是用于标记整合包信息以及汉化包配置的文件，位于游戏的根目录下。
此文件用于让 VMTU 基于此文件内的信息向云端查询游戏安装的汉化补丁是否需要更新。

有关 modpackinfo.json 文件的更多信息，请参见 [[modpackinfo|ModpackInfo 文档]] 。

## 云端汉化信息配置 （vm-meta）

vm-meta 是存储在云端的汉化补丁信息文件。VMTU 会联网基于此文件内的信息与本地 modpackinfo.json 中的汉化信息对比，
来检测汉化补丁是否需要更新。

有关云端 vm-meta 文件的更多信息，请参见 [[metadata|VM Metadata 文档]] 。

[^1]: 对于 Fabric 版本，需安装可选的 Modmenu 模组后才能看到模组页面。
