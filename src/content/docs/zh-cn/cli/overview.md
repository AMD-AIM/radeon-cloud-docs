---
title: Radeon Cloud CLI
description: 在终端里登录 Radeon Cloud，创建、连接和删除 GPU 实例。
sidebar:
  label: 概览
---

Radeon Cloud CLI 是 Radeon Cloud 的命令行工具，命令名是 `rcc`。用它可以在终端里查看积分和可用资源、
创建 GPU 实例、打开 JupyterLab、SSH 登录、查看状态和日志，并在用完后删除实例。命令结果可以输出为
JSON，方便写进脚本。

:::note[准备工作]
- 一个 Radeon Cloud 账号
- Python 3.9 或更高版本
- 一个能打开 Radeon Cloud 登录页的浏览器，不必在同一台机器上
- 要用 SSH 的话，还需要 `ssh` 和 `ssh-keygen`
:::

## 快速上手

### 1. 安装

```bash
python3 -m pip install amd-oneclick-sdk
rcc --version
```

软件包名是 `amd-oneclick-sdk`，装好后就有 `rcc` 命令。pipx、虚拟环境和 Windows 的装法见
[安装与升级](/radeon-cloud-docs/zh-cn/cli/install/)。

### 2. 登录

```bash
rcc auth login
rcc doctor
```

`rcc auth login` 会打开浏览器，你在网页上批准这台设备即可。内置地址是
[全球站](https://radeon-global.anruicloud.com/)。要登录中国站，把地址传进去：

```bash
rcc auth login -u https://developer.amd.com.cn/radeon
```

服务器这类没有浏览器的机器，用 `rcc auth login --no-browser`，再把打印出的链接拿到别的设备上打开。
`rcc doctor` 检查安装、登录状态和服务连通性。见[登录与账号](/radeon-cloud-docs/zh-cn/cli/authentication/)。

### 3. 查看积分和可用资源

```bash
rcc credits status
rcc catalog list
```

`rcc catalog list` 列出你的账号可以使用的环境、资源池和资源模板。列在这里只表示你有权申请，
不代表此刻一定有空闲的 GPU。

### 4. 创建实例并连接

```bash
rcc instance add-key   # 第一次使用时上传 SSH 公钥
rcc instance create    # 按提示选择环境和资源
rcc instance open      # 在浏览器里打开 JupyterLab
rcc instance ssh       # 或者 SSH 登录
```

启动慢或失败时，用 `rcc instance status --watch` 看进度，用 `rcc instance logs` 看日志。

### 5. 用完删除

```bash
rcc instance delete --yes
rcc instance status
```

实例只要在运行就会持续消耗[积分](/radeon-cloud-docs/zh-cn/guides/credits/)。用完请删除，并用
`rcc instance status` 确认已经没有运行中的实例。

:::caution[退出登录不会停止实例]
`rcc auth logout` 只是让这台设备上的登录失效。实例会继续运行，也会继续消耗积分。
:::

## CLI 令牌和 API Key 是两回事

CLI 登录后保存的是以 `rcc_` 开头的令牌，只用来管理账号和实例。调用
[Token Factory](/radeon-cloud-docs/zh-cn/guides/token-factory/) 用的是以 `rc-` 开头的 API Key。

## 下一步

- [安装与升级](/radeon-cloud-docs/zh-cn/cli/install/)：pipx、虚拟环境、Windows，以及升级和卸载
- [登录与账号](/radeon-cloud-docs/zh-cn/cli/authentication/)：无浏览器登录、多个账号、退出登录
- [管理 GPU 实例](/radeon-cloud-docs/zh-cn/cli/instances/)：在脚本里指定资源、不等待直接返回、SSH 密钥
- [脚本与自动化](/radeon-cloud-docs/zh-cn/cli/automation/)：JSON 输出、退出码、Shell 补全

全部命令和参数见 `rcc --help` 和 `rcc <命令> --help`。
