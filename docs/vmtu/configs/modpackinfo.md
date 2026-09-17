# ModpackInfo

ModpackInfo（汉化支持信息文件）是用于标记整合包信息以及汉化包配置的文件。其位于游戏的根目录下，即与`config`、`mods`等文件夹同级。

这个文件类似于原版的 `pack.mcmeta` 文件，都是用于描述包的版本、名称和支持范围。

下方为一个配置文件模板（可在模组配置中开启生成示例整合包信息文件 `generateExampleModpackInfo` 功能来自动生成）：

```json5
{
  modpack: {
    name: 'ExampleModpack', // 整合包名称（暂无用途）
    version: '0.1.0', // 汉化适配的整合包版本，用于提示玩家是否需要升级整合包再安装新版汉化
    translation: {
      id: 'example', // 向云端查询汉化补丁是否为最新版的id（每个整合包id需唯一）
      url: 'https://vmct-cn.top/modpacks/example/', // 汉化对应的发布页面
      updateCheckUrl: 'https://github.com/VM-Chinese-translate-group/VM-Resources/blob/main/update/example.txt', // vm-meta v1链接，用于检查汉化更新（已从4.0.0起弃用）
      language: 'zh_cn', // 支持的语言，用于自动切换语言和汉化更新检测
      version: '1.0.0'  // 汉化补丁的版本号
    },
  },
}
```

## 整合包版本（`modpack.version`）

`modpack.version`用于检测整合包版本，可以从整合包自带的元数据/整合包安装的更新检测模组的配置文件获取整合包本地版本，支持的元数据/整合包更新检测模组如下：

| 名称                           | 文件所在位置                                |
| ------------------------------ | ------------------------------------------- |
| FTB Modpack Metadata           | `config/metadata.json`                      |
| ModpackUpdateChecker Mod       | `config/modpack-update-checker/config.json` |
| SimpleModpackUpdateChecker Mod | `config/simple-modpack-update-checker.json` |
| SimpleUpdateChecker Mod        | `config/simpleupdatechecker_modpack.json`   |
