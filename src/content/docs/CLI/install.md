---
title: Install and maintain RCC
description: Install, upgrade, or remove Radeon Cloud CLI.
sidebar:
  label: Install RCC
---

For the shortest workflow, start with [RCC](/radeon-cloud-docs/cli/overview/).

The package is published to PyPI as `amd-oneclick-sdk`; the primary command is
`rcc`. Python 3.9 or newer is required.

## Linux and macOS

```bash
python3 -m pip install amd-oneclick-sdk
rcc --version
```

## Windows

Run the following in PowerShell or Command Prompt:

```powershell
python -m pip install amd-oneclick-sdk
rcc --version
```

If the optional Python Launcher is installed, you can use `py` instead of
`python`.

## Install with pipx

Use `pipx` to keep RCC in an isolated environment:

```bash
pipx install amd-oneclick-sdk
rcc --version
```

## Use a virtual environment

Some operating systems prevent installation into the system-managed Python
environment. Create a virtual environment instead.

Linux and macOS:

```bash
python3 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install amd-oneclick-sdk
```

Windows PowerShell:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
python -m pip install amd-oneclick-sdk
```

Verify the installation:

```bash
rcc --version
rcc --help
```

The legacy-compatible `amd-oneclick` command starts the same CLI. New scripts
and documentation should use `rcc`.

## Upgrade

For a pip installation:

```bash
python3 -m pip install --upgrade amd-oneclick-sdk
```

For pipx:

```bash
pipx upgrade amd-oneclick-sdk
```

## Uninstall

```bash
python3 -m pip uninstall amd-oneclick-sdk
```

Uninstalling the package does not remove account profiles or SSH keys from the
local RCC state directory, which is `~/.radeon-cloud` by default.
