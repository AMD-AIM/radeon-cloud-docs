---
title: RCC CLI 概览
description: 安装 Radeon Cloud CLI，完成登录，并从终端管理 Radeon Cloud GPU 实例。
sidebar:
  label: 概览
---

Radeon Cloud CLI（`rcc`）用于从本地终端管理 Radeon Cloud 资源。你可以通过现有的 Radeon Cloud 网站登录，查看 Credits 和已获准使用的资源，创建 GPU 实例，打开 JupyterLab，通过 SSH 连接，查看日志，并在使用完毕后释放实例。

RCC 使用作用域受限的 `rcc_...` 凭证执行账户和实例操作。它与调用 Radeon Cloud 模型 API 时使用的 `rc-...` API key 不同。

:::note[开始之前]
你需要一个现有的 Radeon Cloud 账户、Python 3.9 或更高版本，以及能够访问 Radeon Cloud 登录页面的浏览器。使用托管 SSH 还需要安装 `ssh` 和 `ssh-keygen`。
:::

## 快速开始

安装 RCC，授权当前工作站，并检查它能否正常连接 Radeon Cloud：

```bash
python3 -m pip install amd-oneclick-sdk

rcc auth login --account work
rcc doctor
rcc credits status
rcc catalog list
```

然后添加 SSH 公钥并创建实例。在交互式终端中，RCC 会引导你选择管理员批准的 Catalog 资源：

```bash
rcc instance add-key
rcc instance create
rcc instance open
```

使用完毕后，释放实例及其占用的 GPU：

```bash
rcc instance delete --yes
rcc instance status
```

:::caution[实例运行期间会消耗 Credits]
退出登录或删除本地账户不会停止实例。不再使用实例时，请务必将其删除，并持续检查状态，直到 RCC 报告当前没有活动实例。
:::

## 安装 RCC

RCC 在 PyPI 上的软件包名称是 `amd-oneclick-sdk`，主要命令是 `rcc`。

### Linux 和 macOS

```bash
python3 -m pip install amd-oneclick-sdk
rcc --version
```

### Windows

在 PowerShell 或命令提示符中运行：

```powershell
python -m pip install amd-oneclick-sdk
rcc --version
```

如果安装了可选的 Windows Python Launcher，也可以在这些命令中使用
`py` 代替 `python`。

### 使用 pipx 安装

如果希望把 RCC 安装在独立环境中：

```bash
pipx install amd-oneclick-sdk
rcc --version
```

### 使用 Python 虚拟环境

部分操作系统不允许向系统管理的 Python 环境中直接安装软件包。遇到这种情况时，可以先创建虚拟环境。

Linux 和 macOS：

```bash
python3 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install amd-oneclick-sdk
```

Windows PowerShell：

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
python -m pip install amd-oneclick-sdk
```

验证安装：

```bash
rcc --version
rcc --help
```

`rcc` 和用于兼容旧版本的 `amd-oneclick` 会启动同一个 CLI。新脚本和文档应使用 `rcc`。

## 登录

通过正常的 Radeon Cloud 浏览器登录流程授权当前工作站：

```bash
rcc auth login --account work
```

RCC 会打开一个一次性验证页面。登录后，确认设备名称并批准请求。RCC 不会读取浏览器 Cookie，也不会要求你把网页会话复制到终端中。

在远程或无图形界面的机器上，可以只打印验证链接：

```bash
rcc auth login --account work --no-browser
```

请在链接过期前，使用可信设备上的浏览器打开它。批准后，检查保存的账户和连接状态：

```bash
rcc auth status
rcc doctor
```

`rcc doctor` 会检查本地配置、服务连接、Token 有效性，以及当前部署公开的 RCC 功能。

## 使用多个账户

RCC 可以保存多个本地账户配置：

```bash
rcc account register personal
rcc account list
rcc account current
rcc account use work
```

使用 `-A` 或 `--account` 可以只为当前命令选择账户，而不修改默认账户：

```bash
rcc -A personal status
rcc -A work instance status
```

账户选择也是身份边界。保存了多个账户时，执行删除等破坏性操作应明确指定账户：

```bash
rcc -A work instance delete --yes
```

## 查看 Credits 和可用资源

查看当前登录账户及其 GPU 小时余额：

```bash
rcc status
rcc credits status
```

列出管理员为当前账户批准的环境和资源：

```bash
rcc catalog list
rcc catalog list --kind environment
rcc catalog list --kind resource_pool
rcc catalog list --kind resource_template
```

也可以查看或搜索具体的 Catalog 条目：

```bash
rcc catalog show ITEM
rcc catalog search QUERY
```

Catalog 显示资源可用，表示当前账户有资格申请该资源，但这不会预留 GPU，也不保证当时一定有可调度容量。

## 添加 SSH 密钥

第一次创建支持 SSH 的实例前，需要为所选 RCC 账户关联一个本地 SSH 身份：

```bash
rcc instance add-key
```

RCC 可以验证已有身份，也可以帮助生成 Ed25519 密钥。只有公钥会被上传，私钥始终保留在本地工作站。

要明确选择已有密钥，可以运行：

```bash
rcc instance add-key --identity-file ~/.ssh/id_ed25519
```

创建实例时默认启用 SSH。如果不需要 SSH，请在创建时使用 `--no-ssh`。

## 创建 GPU 实例

在交互式终端中运行：

```bash
rcc instance create
```

RCC 会提示你选择经过批准的 Catalog 资源。在自动化或非交互式终端中，需要明确提供选择器：

```bash
rcc instance create \
  --env REVIEWED_ENVIRONMENT \
  --pod-type RESOURCE_POOL \
  --resource-template RESOURCE_TEMPLATE
```

默认情况下，RCC 会等待实例就绪。如果希望创建请求被接受后立即返回：

```bash
rcc instance create \
  --env REVIEWED_ENVIRONMENT \
  --pod-type RESOURCE_POOL \
  --resource-template RESOURCE_TEMPLATE \
  --no-wait

rcc instance status --watch
rcc instance logs
```

请求已发送但响应丢失，需要重试同一次创建操作时，可以使用 `--idempotency-key KEY`。不要把同一个 key 用于不同的实例创建请求。

:::note[本地等待不会控制服务端任务]
本地超时或按下 <kbd>Ctrl</kbd>+<kbd>C</kbd> 只会让 RCC 停止等待，不会取消服务端的实例创建。可以通过 `rcc instance status --watch` 和 `rcc instance logs` 继续查看进度。
:::

## 打开 JupyterLab 或通过 SSH 连接

在浏览器中打开已经就绪的实例：

```bash
rcc instance open
```

在无图形界面的机器上，可以打印短期有效的 URL，然后在另一台可信设备上打开：

```bash
rcc instance open --print
```

这个 URL 只能使用一次，并且属于敏感信息。不要把它放进日志、工单或聊天消息中。

使用 OpenSSH 进入实例：

```bash
rcc instance ssh
```

如果只想查看 SSH 命令而不执行：

```bash
rcc instance ssh --print
```

## 查看状态和日志

实例启动或运行期间，可以使用：

```bash
rcc instance list
rcc instance status
rcc instance status --watch
rcc instance logs
```

状态和日志始终属于当前认证的 Radeon Cloud 账户。RCC 不接受任意服务端用户名或内部启动任务 ID。

## 删除实例

需要明确执行删除操作才能释放当前实例：

```bash
rcc instance delete --yes
rcc instance status
```

如果响应表示实例正在关闭，说明删除已经开始，并不一定代表清理已经完成。请持续检查，直到 RCC 报告当前没有活动实例。

退出登录不会删除实例：

```bash
rcc auth logout
```

退出登录只会撤销当前选择的设备凭证，不会释放 GPU、结束浏览器会话，也不会撤销其他设备上的凭证。

## 命令组

| 命令 | 用途 |
| --- | --- |
| `rcc status` | 显示账户、Credits 和当前实例状态。 |
| `rcc auth` | 登录、检查认证状态和退出登录。 |
| `rcc account` | 管理命名的本地账户配置。 |
| `rcc credits` | 查看账户的 GPU 小时余额。 |
| `rcc catalog` | 浏览管理员批准的资源。 |
| `rcc instance` | 创建、查看、打开、连接和删除实例。 |
| `rcc doctor` | 检查安装、认证和服务健康状态。 |
| `rcc capabilities` | 查看服务器公开的 RCC 功能。 |
| `rcc completion` | 生成 Shell 自动补全脚本。 |

通过内置帮助查看任意命令的完整选项：

```bash
rcc --help
rcc instance --help
rcc instance create --help
```

## Shell 自动补全

为当前 Shell 生成自动补全脚本：

```bash
rcc completion bash
rcc completion zsh
rcc completion fish
rcc completion powershell
```

命令会把补全脚本写入标准输出。请按照对应 Shell 的常规方式，在当前会话中加载脚本，或将其安装到 Shell 配置中。

## 在自动化中使用 RCC

全局输出选项需要放在子命令之前：

```bash
rcc --output json catalog list
rcc --output ndjson instance status --watch
rcc --quiet --output json instance status
```

- `json` 向标准输出写入一个最终结果文档。
- `ndjson` 每行写入一个事件或结果 JSON 对象。
- 进度和诊断信息写入标准错误。
- 敏感字段默认会被隐藏，明确用于返回敏感信息的操作除外。

常见退出码：

| 退出码 | 含义 |
| --- | --- |
| `0` | 本地命令执行成功。 |
| `1` | 服务、网络、TLS、协议或意外的本地错误。 |
| `2` | 命令用法、本地配置或认证错误。 |
| `5` | 本地等待超时；服务端任务可能仍在继续。 |
| `130` | 用户中断；远程任务保持不变。 |

自动化程序应同时检查退出码和结构化结果中的生命周期字段。状态命令可以正常执行并返回 `0`，但远程实例的状态仍可能是 `failed` 或不存在。

## 升级或卸载

升级 pip 安装：

```bash
python3 -m pip install --upgrade amd-oneclick-sdk
```

如果使用 pipx：

```bash
pipx upgrade amd-oneclick-sdk
```

卸载软件包：

```bash
python3 -m pip uninstall amd-oneclick-sdk
```

卸载 RCC 不会删除本地 RCC 状态目录中保存的账户配置和 SSH 密钥。默认状态目录是 `~/.radeon-cloud`。

## 基本安全原则

- 把 RCC Token 和一次性浏览器 URL 当作敏感信息处理。
- 除非确有必要，不要通过命令行参数传递 Token；Shell 历史和进程信息可能会暴露它。
- RCC 不会上传 SSH 私钥。
- CLI 不允许关闭 TLS 验证。
- 使用 `rcc auth logout` 撤销当前工作站凭证。
- 如果希望停止 GPU 使用，应先单独删除活动实例，再退出登录。

命令执行失败时，可以先运行：

```bash
rcc doctor
rcc auth status
rcc instance status
rcc instance logs
```
