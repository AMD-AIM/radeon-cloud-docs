---
title: 自动化 RCC
description: 在 Radeon Cloud CLI 中使用结构化输出、退出码和 Shell 自动补全。
sidebar:
  label: 自动化
---

如需最短使用流程，请先阅读 [RCC](/radeon-cloud-docs/zh-cn/cli/overview/)。

## 结构化输出

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

自动化程序应同时检查进程退出码和结构化结果中的生命周期字段。状态命令可以正常返回，
但远程实例的状态仍可能是 `failed` 或不存在。

## 退出码

| 退出码 | 含义 |
| --- | --- |
| `0` | 本地命令执行成功。 |
| `1` | 服务、网络、TLS、协议或意外的本地错误。 |
| `2` | 命令用法、本地配置或认证错误。 |
| `5` | 本地等待超时；服务端任务可能仍在继续。 |
| `130` | 用户中断；远程任务保持不变。 |

创建命令超时或被中断后，应先检查远程状态，再决定是否重试：

```bash
rcc --output json instance status
rcc instance logs
```

重试同一次逻辑创建操作时应使用幂等 key。

## Shell 自动补全

为当前 Shell 生成自动补全脚本：

```bash
rcc completion bash
rcc completion zsh
rcc completion fish
rcc completion powershell
```

命令会把补全脚本写入标准输出。请按照对应 Shell 的常规方式，在当前会话中加载脚本，或
将其安装到 Shell 配置中。

## 查找命令

```bash
rcc --help
rcc instance --help
rcc instance create --help
rcc capabilities
```

`rcc capabilities` 会显示当前部署公开的 RCC 功能。

命令执行失败时，可以先运行：

```bash
rcc doctor
rcc auth status
rcc instance status
rcc instance logs
```
