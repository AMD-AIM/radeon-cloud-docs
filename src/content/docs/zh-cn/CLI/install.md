---
title: 安装和维护 RCC
description: 安装、升级或卸载 Radeon Cloud CLI。
sidebar:
  label: 安装 RCC
---

如需最短使用流程，请先阅读 [RCC](/radeon-cloud-docs/zh-cn/cli/overview/)。

RCC 在 PyPI 上的软件包名称是 `amd-oneclick-sdk`，主要命令是 `rcc`，需要
Python 3.9 或更高版本。

## Linux 和 macOS

```bash
python3 -m pip install amd-oneclick-sdk
rcc --version
```

## Windows

在 PowerShell 或命令提示符中运行：

```powershell
python -m pip install amd-oneclick-sdk
rcc --version
```

如果安装了可选的 Windows Python Launcher，也可以使用 `py` 代替 `python`。

## 使用 pipx 安装

使用 `pipx` 可以把 RCC 安装在独立环境中：

```bash
pipx install amd-oneclick-sdk
rcc --version
```

## 使用虚拟环境

部分操作系统不允许向系统管理的 Python 环境直接安装软件包。遇到这种情况时，可以创建
虚拟环境。

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

用于兼容旧版本的 `amd-oneclick` 会启动同一个 CLI。新脚本和文档应使用 `rcc`。

## 升级

使用 pip 安装时：

```bash
python3 -m pip install --upgrade amd-oneclick-sdk
```

使用 pipx 安装时：

```bash
pipx upgrade amd-oneclick-sdk
```

## 卸载

```bash
python3 -m pip uninstall amd-oneclick-sdk
```

卸载软件包不会删除 RCC 本地状态目录中保存的账户配置和 SSH 密钥。默认状态目录是
`~/.radeon-cloud`。
