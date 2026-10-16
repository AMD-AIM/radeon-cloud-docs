---
title: RCC
description: 使用 Radeon Cloud CLI 从终端登录并管理 GPU 实例。
sidebar:
  label: RCC
---

Radeon Cloud CLI（`rcc`）用于从终端管理 Radeon Cloud 账户、Credits、已批准资源和
GPU 实例。你可以用它创建实例、打开 JupyterLab、通过 SSH 连接、查看状态和日志，并在
使用完毕后释放 GPU。

:::note[开始之前]
你需要一个 Radeon Cloud 账户、Python 3.9 或更高版本，以及能够访问 Radeon Cloud
登录页面的浏览器。使用 SSH 还需要安装 `ssh` 和 `ssh-keygen`。
:::

## 安装并登录

安装提供 `rcc` 命令的 `amd-oneclick-sdk` 软件包：

```bash
python3 -m pip install amd-oneclick-sdk
rcc --version
```

授权当前工作站并检查连接：

```bash
rcc auth login
rcc doctor
```

在远程或无图形界面的机器上，使用 `rcc auth login --no-browser`，
然后在可信设备上打开终端打印的验证链接。

RCC 使用作用域受限的 `rcc_...` 凭证。它与调用 Radeon Cloud 模型 API 时使用的
`rc-...` API key 不同。

## 查看 Credits 和可用资源

```bash
rcc credits status
rcc catalog list
```

Catalog 会列出当前账户获准使用的环境、资源池和模板，但不会预留容量。

## 创建和使用 GPU 实例

首次使用时添加 SSH 公钥，然后创建交互式实例：

```bash
rcc instance add-key
rcc instance create
```

打开 JupyterLab 或通过 SSH 连接：

```bash
rcc instance open
rcc instance ssh
```

查看启动进度或排查问题：

```bash
rcc instance status --watch
rcc instance logs
```

## 释放实例

使用完毕后删除实例，停止消耗 Credits：

```bash
rcc instance delete --yes
rcc instance status
```

:::caution[退出登录不会释放 GPU]
`rcc auth logout` 只会撤销当前工作站的凭证，不会停止或删除实例。请单独删除实例，
并持续检查状态，直到 RCC 报告当前没有活动实例。
:::

## 了解更多

- [安装和维护 RCC](/radeon-cloud-docs/zh-cn/cli/install/)
- [认证与账户](/radeon-cloud-docs/zh-cn/cli/authentication/)
- [管理 GPU 实例](/radeon-cloud-docs/zh-cn/cli/instances/)
- [自动化与结构化输出](/radeon-cloud-docs/zh-cn/cli/automation/)

使用 `rcc --help` 或 `rcc COMMAND --help` 查看完整命令帮助。
