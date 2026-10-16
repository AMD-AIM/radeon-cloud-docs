---
title: 管理 GPU 实例
description: 使用 RCC 浏览已批准资源，以及创建、访问、监控和删除 GPU 实例。
sidebar:
  label: GPU 实例
---

如需最短使用流程，请先阅读 [RCC](/radeon-cloud-docs/zh-cn/cli/overview/)。

## 查看 Credits 和已批准资源

```bash
rcc status
rcc credits status
rcc catalog list
```

需要明确指定资源时，可以筛选或查看 Catalog 条目：

```bash
rcc catalog list --kind environment
rcc catalog list --kind resource_pool
rcc catalog list --kind resource_template
rcc catalog show ITEM
rcc catalog search QUERY
```

Catalog 显示资源可用，表示当前账户有资格申请该资源，但不会预留 GPU，也不保证当时一定有
可调度容量。

## 添加 SSH 密钥

第一次创建支持 SSH 的实例前，需要为所选 RCC 账户关联本地 SSH 身份：

```bash
rcc instance add-key
```

RCC 可以验证已有身份，也可以帮助生成 Ed25519 密钥。只有公钥会被上传。

要明确选择已有密钥，可以运行：

```bash
rcc instance add-key --identity-file ~/.ssh/id_ed25519
```

创建实例时默认启用 SSH。如果不需要 SSH，请使用 `--no-ssh`。

## 创建实例

在交互式终端中，让 RCC 引导你选择已批准的 Catalog 资源：

```bash
rcc instance create
```

在自动化或非交互式终端中，需要明确提供选择器：

```bash
rcc instance create \
  --env REVIEWED_ENVIRONMENT \
  --pod-type RESOURCE_POOL \
  --resource-template RESOURCE_TEMPLATE
```

默认情况下 RCC 会等待实例就绪。如果希望创建请求被接受后立即返回：

```bash
rcc instance create \
  --env REVIEWED_ENVIRONMENT \
  --pod-type RESOURCE_POOL \
  --resource-template RESOURCE_TEMPLATE \
  --no-wait

rcc instance status --watch
rcc instance logs
```

请求已发送但响应丢失，需要重试同一次创建操作时，可以使用
`--idempotency-key KEY`。不要把同一个 key 用于不同的实例创建请求。

:::note[本地等待不会控制服务端任务]
本地超时或按下 <kbd>Ctrl</kbd>+<kbd>C</kbd> 只会让 RCC 停止等待，不会取消服务端的
实例创建。可以继续使用 `rcc instance status --watch` 和 `rcc instance logs`。
:::

## 打开 JupyterLab 或通过 SSH 连接

```bash
rcc instance open
rcc instance ssh
```

在无图形界面的机器上，可以打印短期有效的 JupyterLab URL 或 SSH 命令：

```bash
rcc instance open --print
rcc instance ssh --print
```

JupyterLab URL 只能使用一次，并且属于敏感信息。不要把它放进日志、工单或聊天消息中。

## 查看状态和日志

```bash
rcc instance list
rcc instance status
rcc instance status --watch
rcc instance logs
```

状态和日志始终属于当前认证的 Radeon Cloud 账户。RCC 不接受任意服务端用户名或内部启动
任务 ID。

## 删除实例

```bash
rcc instance delete --yes
rcc instance status
```

如果响应表示实例正在关闭，说明删除已经开始，并不一定代表清理已经完成。请持续检查，直到
RCC 报告当前没有活动实例。退出登录不会删除实例。
