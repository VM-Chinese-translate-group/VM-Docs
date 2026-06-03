---
layout: doc
title: ModpackInfo
---

# ModpackInfo

ModpackInfo 是用于标记整合包信息以及汉化包配置的文件，位于游戏的根目录下。

这个文件类似于 `pack.mcmeta`，但它包含了更多的字段来描述整合包的信息。

下方为默认生成的配置文件内容（需在模组配置中开启生成示例整合包信息文件 `generateExampleModpackInfo` 功能）：

```json5
{
  "modpack": {
    "name": "ExampleModpack", // 整合包名称（暂无用途）
    "version": "0.1.0", // 汉化适配的整合包版本，用于提示玩家是否需要升级整合包再安装新版汉化
    "translation": {
      "id": "example", // 向云端查询汉化补丁的id（每个整合包id需唯一）
      "url": "https://vmct-cn.top/modpacks/example/", // 当前汉化对应的官网的页面
      "updateCheckUrl": "https://github.com/VM-Chinese-translate-group/VM-Resources/blob/main/update/example.txt", // vm-meta v1链接，用于检查汉化更新（已从4.0.0起弃用）
      "language": "zh_cn", // 支持的语言，用于自动切换语言和汉化更新检测
      "version": "1.0.0", // 汉化补丁包版本号，用于设定当前汉化补丁版本
      "resourcePackName": "VM汉化组模组汉化包1.19及以上" // VM汉化资源包名称，用于下载汉化资源包（已从5.0.2起弃用）
    }
  }
}
```

## 整合包版本（`modpack.version`）

`modpack.version`用于检测整合包版本，可以从整合包自带的metadata/整合包更新检测mod的配置文件获取整合包本地版本，支持的metadata/整合包更新检测mod如下：

| 名称                             | 文件所在位置                                      |
|--------------------------------|---------------------------------------------|
| FTB Modpack Metadata           | `config/metadata.json`                      |
| ModpackUpdateChecker Mod       | `config/modpack-update-checker/config.json` |
| SimpleModpackUpdateChecker Mod | `config/simple-modpack-update-checker.json` |
| SimpleUpdateChecker Mod        | `config/simpleupdatechecker_modpack.json`   |