---
title: 管理 GPU 实例
description: 用 Radeon Cloud CLI 查看可用资源，创建、连接、监控和删除 GPU 实例。
sidebar:
  label: 管理 GPU 实例
---

每个账户有一个“当前实例”，`rcc instance` 下的命令都作用于它，不需要填实例 ID。要同时操作别的账户，
用 `-A` 切换账户（见[登录与账户](/radeon-cloud-docs/zh-cn/cli/authentication/)）。

## 查看额度和可用资源

```bash
rcc status           # 账户、额度和实例状态一览
rcc credits status   # 额度余额
rcc catalog list     # 你可以使用的环境、资源池和资源模板
```

按类别筛选，或查看、搜索某一项：

```bash
rcc catalog list --kind environment
rcc catalog list --kind resource_pool
rcc catalog list --kind resource_template
rcc catalog show ID
rcc catalog search 关键词
```

出现在列表里只表示你的账户有权申请这项资源，不会预留 GPU，也不保证此刻有空闲容量。

## 添加 SSH 密钥

第一次创建带 SSH 的实例之前，先为当前账户登记一把 SSH 密钥：

```bash
rcc instance add-key
```

CLI 会检查你已有的密钥，没有的话可以帮你生成一把 Ed25519 密钥。只有公钥会上传。

想指定某把已有的密钥：

```bash
rcc instance add-key --identity-file ~/.ssh/id_ed25519
```

创建实例时默认开启 SSH，不需要的话加 `--no-ssh`。

## 创建实例

在终端里直接运行，CLI 会一步步让你选择环境和资源：

```bash
rcc instance create
```

在脚本里或没有交互终端时，需要把选择写全，取值来自 `rcc catalog list`：

```bash
rcc instance create \
  --env ENVIRONMENT \
  --pod-type RESOURCE_POOL \
  --resource-template RESOURCE_TEMPLATE
```

| 参数 | 取值 |
|---|---|
| `--env` | `environment` 类条目的 ID、名称或镜像 |
| `--pod-type` | `resource_pool` 类条目 |
| `--resource-template` | `resource_template` 类条目 |

CLI 默认会等到实例就绪才返回。只想提交请求、马上返回的话加 `--no-wait`，之后再查看进度：

```bash
rcc instance create \
  --env ENVIRONMENT \
  --pod-type RESOURCE_POOL \
  --resource-template RESOURCE_TEMPLATE \
  --no-wait

rcc instance status --watch
rcc instance logs
```

如果请求已经发出去但没收到响应，重试时带上同一个 `--idempotency-key KEY`，就不会重复创建。
不同的创建请求不要共用一个 key。

:::note[超时或按 Ctrl+C 不会取消创建]
本地等待超时或按下 <kbd>Ctrl</kbd>+<kbd>C</kbd>，只是 CLI 不再等待，服务端仍会继续创建实例。
用 `rcc instance status --watch` 和 `rcc instance logs` 接着看。
:::

## 打开 JupyterLab 或 SSH 登录

```bash
rcc instance open   # 在浏览器里打开 JupyterLab
rcc instance ssh    # 通过 SSH 登录
```

在没有浏览器的机器上，可以只打印链接或 SSH 命令：

```bash
rcc instance open --print
rcc instance ssh --print
```

JupyterLab 链接只能用一次，而且很快过期。它属于敏感信息，不要贴到日志、工单或聊天里。

## 查看状态和日志

```bash
rcc instance list             # 当前实例（加 --all 列出每个已保存账户的实例）
rcc instance status           # 当前状态
rcc instance status --watch   # 持续刷新，默认每 3 秒一次
rcc instance logs             # 启动事件和容器日志
```

只能查看当前登录账户自己的实例。

## 删除实例

```bash
rcc instance delete --yes
rcc instance status
```

删除后状态可能先显示为正在关闭，这表示删除已经开始，不代表清理已经完成。请继续查看，直到显示
已经没有运行中的实例。退出登录不会删除实例。
