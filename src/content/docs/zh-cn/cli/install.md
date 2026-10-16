---
title: 安装与升级
description: 安装、升级和卸载 Radeon Cloud CLI。
sidebar:
  label: 安装与升级
---

Radeon Cloud CLI 以 `amd-oneclick-sdk` 的名字发布在 PyPI 上，装好后提供 `rcc` 命令。需要
Python 3.9 或更高版本。

## 用 pip 安装

Linux 和 macOS：

```bash
python3 -m pip install amd-oneclick-sdk
rcc --version
```

Windows（PowerShell 或命令提示符）：

```powershell
python -m pip install amd-oneclick-sdk
rcc --version
```

装了 Python Launcher 的话，也可以把 `python` 换成 `py`。

## 用 pipx 安装

`pipx` 会把 CLI 装进单独的环境，不影响系统里的其他 Python 包：

```bash
pipx install amd-oneclick-sdk
rcc --version
```

## 系统不让 pip 安装时：用虚拟环境

有些系统禁止往系统自带的 Python 里装包，pip 会报 `externally-managed-environment`。这时用
pipx，或者建一个虚拟环境。

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

装好后确认一下：

```bash
rcc --version
rcc --help
```

:::note[旧命令名 `amd-oneclick`]
`amd-oneclick` 是旧的命令名，和 `rcc` 是同一个程序。新写的脚本请用 `rcc`。
:::

## 升级

```bash
python3 -m pip install --upgrade amd-oneclick-sdk   # pip 安装的
pipx upgrade amd-oneclick-sdk                       # pipx 安装的
```

## 卸载

```bash
python3 -m pip uninstall amd-oneclick-sdk
```

卸载不会删除 `~/.radeon-cloud` 目录。里面保存着你的账号、登录令牌，以及 CLI 生成的 SSH 密钥。
要彻底清理，先运行 `rcc auth logout --all` 让所有已保存的令牌失效，再删除这个目录。删除之前，
确认里面没有你还要用的 SSH 私钥。
