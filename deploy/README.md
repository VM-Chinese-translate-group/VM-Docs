# ECS 文档部署

生产地址为 https://docs.vmct.top，国际站默认配置不变。

`master` 更新后，Actions 使用 Node 24 和项目声明的 pnpm 构建文档，启用本地搜索并生成 docs.vmct.top 的 sitemap。PR 仅做构建检查。生产构建产物保存到 `ecs-artifacts` 分支，服务器不构建 docs。

Actions 在产物发布后调用 `POST /internal/deploy`，携带仓库 Secret `DOCS_DEPLOY_TOKEN`。服务器把任务写入磁盘队列后返回任务 ID。Actions 查询 `/internal/deploy/jobs/<id>`，等待服务器校验来源、拉取指定产物、原子切换版本、检查源站 TLS、版本标记和首页。服务器返回 `succeeded` 才结束成功；部署失败、凭据缺失或等待超过 20 分钟，Actions 使用 `::error::` 输出原因并退出失败。

API 每个请求只接受固定站点配置和 40 位提交 SHA，不接受命令、仓库 URL 或文件路径。队列单线程执行，重复请求复用任务 ID，服务重启会恢复尚未完成的任务。失败发布恢复之前的版本。主站不在 API 的站点配置中，仍在服务器从本地数据库构建。dict 前端以后可以在固定配置中添加，须先确认其源码和产物分支；词典数据库更新不通过本服务处理。

## 服务布局

- `/opt/vmct-static-deploy/`：从 `deploy/server/` 安装的代码，root 所有，运行账号 vmct，拉取产物使用其现有 GitHub SSH 配置。
- `/etc/vmct-static-deploy/api.env`：部署 token，root 0600，systemd 注入。
- `/etc/vmct-static-deploy/sites.json`：固定仓库、分支、域名和目录。
- `/var/lib/vmct-static-deploy/jobs/`：持久化任务状态。
- `/home/vmct/vmpm/dist/docs.vmct.top`：指向宿主机发布版本的相对符号链接。
- `/home/vmct/vmpm/dist/.docs.vmct.top-releases/`：静态发布版本。

现有 Nginx 容器已经只读挂载 `/home/vmct/vmpm/dist`，不需要复制文件进容器或改变 Compose。

安装后，在 VM-Docs 仓库 Settings → Secrets and variables → Actions 添加 `DOCS_DEPLOY_TOKEN`。值与服务器的 `DEPLOY_TOKEN` 相同，在服务器真实终端读取即可，勿提交到 Git 或发送到聊天。只有本仓库可信生产 workflow 使用此凭据。

站点白名单的完整示例见 `server/sites.example.json`，安装到 `/etc/vmct-static-deploy/sites.json`。服务器 GitHub SSH 凭据只用于拉取固定产物仓库，不传给 Actions。

部署脚本使用 Linux 的 git、tar、Node 标准库和 Python 标准库。生产构建工具链只在 Actions 上使用。查看任务与错误：`journalctl -u vmct-static-deploy.service`；手动重部署通过 Actions 的 workflow_dispatch。任务结果接口需要相同 Bearer token，公开站点不会暴露部署日志。

## 维护

更新服务代码时先运行 `node --test deploy/server/service.test.mjs`，再安装 server 目录文件并重启 systemd 服务。处理尚未完成的任务会在重启后恢复。站点发布失败会保留旧版本，日志包含具体原因。存储清理保留最近五个发布版本和上一次版本；任务状态另行按保留周期归档。
