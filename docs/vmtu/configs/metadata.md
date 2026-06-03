---
layout: doc
title: VM Metadata
next: false
---

# VM Metadata

VM Metadata 是用于实时更新整合包版本和资源包版本数据的文件，这些文件不保存在本地，
它们被存放在 [GitHub仓库 VM-Chinese-translate-group/VM-Resources](https://github.com/VM-Chinese-translate-group/VM-Resources)。

你可以把它理解为一种“云控”，但是我们只用来提醒更新汉化补丁。

## VM Metadata v1

> [!IMPORTANT] 重要提示
> VM Metadata v1 已经弃用，VMTU 后续可能会删除此兼容。强烈建议使用 VM Metadata v2！

VM Metadata v1 使用 txt 为存储版本的文件，文件结构如下所示：

```txt
1.0.0
1.2.0
```

VM Metadata v1 会根据 txt 的行数判断汉化补丁版本的功能。
第一行必填，为汉化补丁版本号，第二行选填，为支持的整合包版本号。

要启用 VM Metadata v1，请在 `modpackinfo.json` 中的 `translation` 节点添加 `updateCheckUrl` 字段，
并填写可访问的 txt 直链。

```json5
{
  "modpack": {
    "name": "ExampleModpack",
    "version": "0.1.0",
    "translation": {
      "id": "example",
      "updateCheckUrl": "https://github.com/VM-Chinese-translate-group/VM-Resources/blob/main/update/example.txt", // [!code highlight]
      "language": "zh_cn",
      "version": "1.0.0"
    }
  }
}
```

## VM Metadata v2

VM Metadata v2 重写了版本检测逻辑，使用 json 作为存储版本的文件。
v2 版本将所有整合包的版本信息写在同一个文件中，并将链接写死在模组代码中，不可由外部修改。

v2 版本的文件地址为：https://github.com/VM-Chinese-translate-group/VM-Resources/blob/main/update/v2/vm-meta.json

文件格式如下：

```json5
{
  "metaVersion": "v2", // 数据格式版本
  "modpacks": {
    "example": {
      // 汉化补丁id，对应本地 modpackinfo.json 中的 translation.id
      "translationVersion": "1.1.0", // 最新汉化补丁版本号
      "modpackVersion": "1.0.2" // 该汉化补丁支持的最新整合包版本号
    },
    "example2": {
      // 汉化补丁id，对应本地 modpackinfo.json 中的 translation.id
      "translationVersion": "1.4.0", // 最新汉化补丁版本号
      "modpackVersion": "1.2.1" // 该汉化补丁支持的最新整合包版本号
    }
  }
}
```

其中的 `example` 和 `example2` 是汉化补丁的 id，对应本地 `modpackinfo.json` 中的 `translation.id` 字段。

而id下面的两个项分别是，`translationVersion` 是最新的汉化补丁版本号，`modpackVersion` 是该汉化补丁支持的最新整合包版本号。