# 创建新项目
> [!WARNING]
> 🚧本文档目仍处于 WIP 状态，随时可能进行更改。🚧

本文档主要介绍了如何在 `Paratranz` 和 `Github` 上创建新的汉化项目并进行项目配置。

## 准备工作

* 拥有 Github 中 *VM Chinese Translation Group* 组织的 *Owner* 权限
* 一个 ParaTranz 账号

## 创建项目

* 在 ParaTranz 中创建项目
  * 项目名称：**{整合包原名} 汉化**
  * 项目介绍：表明该项目属于VM汉化组即可，通常使用**VM汉化组自用**
  * 除`校对等级`可以根据情况进行修改外，其余项不需要进行额外更改
  * 接下来你需要用到`项目 ID`（项目页面网址上的数字）和你的`个人 API`
    * `项目 ID` 查询操作：`进入项目 -> 项目网页链接 -> 查看 .../projects/ 后的数字`
    * `个人 API` 查询操作：`进入个人主页 -> 设置 -> 生成 API Token（若已有 API Token 则直接使用即可）`
* 在 Github 上创建项目仓库
   1. 进入 *VM Chinese Translation Group* 组织的仓库（Repositories）页面，点击右上角的 `New repository` 按钮。
   2. General 部分
      - `Owner` 更改为 `VM-Chinese-translate-group`
      - `Repository Name` 填写 **整合包原名-Chinese**
      - `Description` 无特殊情况填写为 **{整合包原名} 简体中文本地化**
   3. Configuration 部分
      - `Choose visibility` 更改为 `Public`
      - `Start with a template` 更改为 `VM-Chinese-translate-group/Templete-Repo`
      - `Include all branches` 保持为 `OFF`
   4. 上述步骤完成后，点击下方绿色的 `Create repository` 按钮，即创建成功。

## 配置项目

### 自动化 Paratranz 同步

注：主分支必须叫 `main`！

#### 1. 设置环境变量

1. 在仓库顶部导航栏依次进入：
   `Settings -> Environments -> New environment`，新建环境 `PARATRANZ_ENV`。

2. 在该环境中添加 **加密变量（Environment secrets）**：

   | 名称    | 值                                       |
   | ------- | ---------------------------------------- |
   | API_KEY | 你的 Paratranz token，需具备上传文件权限（直接填写原始 token 即可） |
   | CF_API_KEY | 使用 CurseForge API 检查更新时必填；只填写原始 key，不要添加引号 |

   🔑 Token 可在 [Paratranz 用户设置页](https://paratranz.cn/users/my) 获取。
   CurseForge API Key 在这里[获取](https://console.curseforge.com/?#/api-keys)；文档要求第三方模组服务先申请 API 访问权限。如果工作流返回 HTTP 401/403，说明 CurseForge 未接受该 key；请确认授权或重新生成后，覆盖 `PARATRANZ_ENV` 环境中的 `CF_API_KEY` secret。

3. 在该环境中添加 **环境变量（Environment variables）**：

   | 名称 | 值                              |
      | ---- | ------------------------------- |
   | ID   | Paratranz 项目 ID，例如 `10719` |

#### 2. 使用说明

我们目前有两个 GitHub Actions 工作流：

- **Paratranz → GitHub**：从 Paratranz 拉取译文至 GitHub 仓库。
- **GitHub → Paratranz**：将原文内容推送到 Paratranz。

> ✅ 两者均支持手动运行，操作如下图所示：

![[public/img/internal/action.png]]

##### 自动运行规则

- **Paratranz → GitHub** 会在北京时间 **每天早上与晚上 10 点左右** 自动执行。
- 下载译文至 GitHub 的功能可通过修改 `.github/workflows/download_release.yml` 内的 `cron 表达式` 自行设定执行时间。

📎 参考：[Cron 表达式教程](https://blog.csdn.net/Stromboli/article/details/141962560)

##### 发布与检查机制

- 当有译文更改时，工作流会自动发布一个 **预发布 Release** 供测试。

>⚠️ 注意：
> - **GitHub → Paratranz** 的同步任务使用频率较低，仅支持手动触发。
> - 若项目已完成，请至仓库 **Settings** 中禁用工作流运行。

##### 任务 JSON 仅在 Paratranz 分片

对于 Minecraft 1.20 及以下常见的 JSON 任务语言文件，可以在 `.github/configs/modpack.json` 中配置虚拟分片。GitHub 的 `Source` 和 `CNPack` 仍各自只保留一个完整语言文件；上传时才按规则生成临时 JSON，下载时再按源文件的键顺序合并。

该功能只处理 `jsonSplits` 中明确配置的 `.json` 文件，不会改变现有的 FTB Quests SNBT 拆分、上传、下载或合并逻辑。未配置时，Paratranz 同步行为保持不变。

```jsonc
{
  "paratranz": {
    "jsonSplits": [
      {
        // 相对于仓库 Source 目录的完整源文件路径。
        "path": "resourcepacks/vm_translations/assets/quests/lang/en_us.json",

        // 按顺序匹配；第一个捕获组将成为 Paratranz 上的文件名。
        "groupPatterns": [
          "^ftbquests\\.chapter\\.([^.]+)\\.",
          "^ftbquests\\.([^.]+)\\."
        ],

        // 所有规则都未匹配时使用 general.json。
        "fallbackGroup": "general"
      }
    ],

    // 下载到 CNPack 时进行路径前缀重定向；未匹配的路径保持不变。
    "pathRedirects": [
      {
        "from": "resourcepacks",
        "to": "config/paxi/resourcepacks"
      }
    ]
  }
}
```

以上示例会在 Paratranz 中生成：

```text
resourcepacks/vm_translations/assets/quests/lang/en_us/
├── applied_energistics_2.json
├── chapter_group.json
├── general.json
├── main_story.json
├── reward_table.json
└── ...
```

规则采用 Python 正则表达式，必须至少包含一个捕获组。常用写法如下；写入 JSON 时，表中的每个反斜杠都要写成两个反斜杠，例如 `\.` 写成 `\\.`。

| 语言键示例 | 正则表达式 | 生成的文件 |
| ---------- | ---------- | ---------- |
| `ftbquests.chapter.main_story.quest...` | `^ftbquests\.chapter\.([^.]+)\.` | `main_story.json` |
| `ftbquests.reward_table.loot.title` | `^ftbquests\.([^.]+)\.` | `reward_table.json` |
| `ftbquests.chapter_group.ABCD.title` | `^ftbquests\.([^.]+)\.` | `chapter_group.json` |
| `quest.chapter_01.entry...` | `^quest\.([^.]+)\.` | `chapter_01.json` |
| `mypack.quests.magic.entry...` | `^mypack\.quests\.([^.]+)\.` | `magic.json` |

配置与同步规则：

- `groupPatterns` 按配置顺序匹配，因此应把具体规则放在通用规则前面。上例先提取具体章节，再把 `reward_table`、`chapter_group` 等其他作用域分别归档。
- 未匹配任何规则的键进入 `fallbackGroup`。例如根级键 `ftbquests.title` 会进入 `general.json`。
- 远端目录由源文件名自动派生：`en_us.json` 对应 `en_us/`，无需再配置输出路径。
- 该远端目录由工作流专用。所有新分片上传成功后，工作流会删除其中不再生成的旧 `.json` 分片，并删除原来的远端长文件；不会删除目录外的文件。
- 下载时如果发现未知键、重复键或缺少源文件中的键，工作流会直接失败，不会生成残缺的 GitHub 语言文件。
- `pathRedirects` 只匹配完整路径前缀。例如 `resourcepacks` 不会误匹配 `some_resourcepacks`。多个规则同时可用时，以配置顺序中的第一项为准。
- 首次从远端长文件迁移到分片前，建议先运行一次 Paratranz → GitHub 并备份当前译文。键移动到新文件后，Paratranz 是否保留文件级历史或审核状态取决于平台本身。

### 自动化整合包更新

本教程介绍如何配置 Actions 以实现自动检测 CurseForge 上的整合包更新，并创建包含更新文件的PR。

#### 1. 首次配置

##### 配置 `modpack.json`

在仓库的 `.github/configs/modpack.json` 文件中进行详细配置。此文件是自动化更新脚本的核心。

该文件必须是严格的 JSON，不能保留注释。完成所有配置后，务必把 `configured` 改为 `true`；保留为 `false` 时，更新检查会明确终止，避免模板默认值误更新仓库。

```jsonc
// .github/configs/modpack.json
{
  // [必需] 确认已经完成配置；实际文件中不要保留本示例的注释。
  "configured": true,

  // [必需] 整合包在 CurseForge 上的数字 ID。
  "packId": 130,

  // [必需] 整合包的名称，用于生成 PR 标题等。
  "packName": "FTB StoneBlock 4",

  // [必需] 供选择合适的VMTU使用
  "mcVersion": "1.20.1",

  // [必需] 供选择合适的VMTU使用
  "loader": "forge",

  // [必需] 存储当前版本信息的文件路径。脚本会读写此文件。
  "infoFilePath": "CNPack/modpackinfo.json",

  // [必需] 存放整合包 `overrides` 目录内容的文件夹路径。
  "sourceDir": "Source",

  // [可选] Paratranz JSON 虚拟分片与下载路径重定向；详见上文。
  "paratranz": {
    "jsonSplits": [],
    "pathRedirects": []
  },

  // [必需] 指定检查更新和下载文件的方法。
  // 可选值: "api" (默认) 或 "cursethebeast"。
  // "api" 方法需要配置 CF_API_KEY。
  "updateMethod": "cursethebeast",

  // [可选, 仅用于 'api' 方法] 版本号解析模板。
  // 必须与 CurseForge 返回的实际文件名完全对应，并且只包含一个 {version}。
  // 例如文件名 Fractured-4.0.zip 应配置为 Fractured-{version}。
  // 模板不匹配时工作流会停止，避免把完整文件名误写成版本号。
  "versionPattern": "FTB StoneBlock 4 {version}",

  // [可选] "关注列表"，指定脚本只检查特定文件或文件夹的变更，可提高效率。
  // 如果此项为空，则默认对比整个 `sourceDir` 目录。
  "attentionList": {
    "folders": [
      {
        "path": "config/ftbquests/quests", // 检查此文件夹
        "ignoreDeletions": false // 不忽略删除操作
      }
    ],
    "filePatterns": [
      {
        "pattern": "kubejs/assets/*/lang/en_us.json", // 检查匹配此模式的文件
        "ignoreDeletions": true // 忽略删除操作（例如不删除我们自己创建的语言文件）
      }
    ]
  },

  // [可选] "排除模式列表"，用于从变更中排除特定文件。
  "exclusionPatterns": [
    "**/lang/*.*",       // 排除所有语言文件
    "!**/lang/en_us.*"   // 但保留 en_us 语言文件
  ]
}
```

#### 2. 工作流说明

- **工作流文件**：`.github/workflows/check_update.yml`
- **触发方式**：默认在北京时间（UTC+8） **每天早上 6 点左右** 自动运行，也支持在 Actions 页面手动触发。

### Paratranz 术语管理和标记规则

#### 1. 术语管理

  * Paratranz 自带术语添加、修改、删除功能。可以查看项目页面侧边栏的**术语**。
  * 项目默认无术语， CFPA组织下的 [Grossary](https://github.com/CFPAOrg/Glossary/) 仓库存放了一部分经过筛选的术语，可以下载后导入项目。
    * 导入术语操作：`进入项目 -> 设置与管理 -> 术语管理 -> 创建术语右侧的下拉按钮 -> 导入术语 -> 选择文件进行导入`
    * 推荐导入：[模组材料简体中文翻译指南](https://github.com/CFPAOrg/Glossary/blob/main/Mod/模组材料简体中文翻译指南.tsv)、[模组简体中文翻译指南](https://github.com/CFPAOrg/Glossary/blob/main/Mod/模组简体中文翻译指南.tsv)
  * 翻译过程中可通过右侧术语界面中的加号添加术语。
    * `词性`按照实际情况选择，大多数情况请选择`名词`。
    * `术语原文`请填写需要标记为术语的原文、单词、短语。
    * `术语译文`直接填写翻译，不要添加任何备注。
    * `术语变体`必要时填写缩写形式。
    * `额外的说明`无特殊情况请填写`{示例模组}术语`。
    * `大小写敏感`请默认取消勾选。

#### 2. 标记规则
  * Paratranz 自带特殊字符标记功能，所有经正则表达式过滤出的特殊符号将高亮显示。
  * 添加特殊字符标记操作：`进入项目 -> 设置与管理 -> 标记规则 -> 自定义规则 -> 输入正则表达式 -> 添加规则`
  * 这里提供了仙人掌编辑的正则：`&([^a-v0-9\s\\#])`，可以高亮出原版、FTBQ支持的大多数格式化字符，包括格式符号、颜色符号等。

## 致谢

* VM汉化组成员 七羽_Kiyo（SevenKiyo）撰写了本文初版。
* VM汉化组成员 TexTrue（TexBlock）负责相关内容的修订与审校。
* VM汉化组成员 仙人掌（Cactusstudent）补充了术语、标记相关内容，并审校了前文。
* VM汉化组成员 捂脸（Wulian233）进行了部分内容的审校
