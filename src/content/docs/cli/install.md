---
title: Install and upgrade
description: Install, upgrade and uninstall Radeon Cloud CLI.
sidebar:
  label: Install and upgrade
---

Radeon Cloud CLI is published on PyPI as `amd-oneclick-sdk` and provides the `rcc` command. It
needs Python 3.9 or newer.

## Install with pip

Linux and macOS:

```bash
python3 -m pip install amd-oneclick-sdk
rcc --version
```

Windows (PowerShell or Command Prompt):

```powershell
python -m pip install amd-oneclick-sdk
rcc --version
```

If you have the Python Launcher, `py` works in place of `python`.

## Install with pipx

`pipx` installs the CLI in its own environment, away from your other Python packages:

```bash
pipx install amd-oneclick-sdk
rcc --version
```

## When pip refuses: use a virtual environment

Some systems do not allow installing into the system Python, and pip stops with
`externally-managed-environment`. Use pipx, or create a virtual environment.

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

Then check the installation:

```bash
rcc --version
rcc --help
```

:::note[The old command name, `amd-oneclick`]
`amd-oneclick` is the former name of the command and runs the same program as `rcc`. Use `rcc` in
new scripts.
:::

## Upgrade

```bash
python3 -m pip install --upgrade amd-oneclick-sdk   # installed with pip
pipx upgrade amd-oneclick-sdk                       # installed with pipx
```

### 1.1.0

The current PyPI release is `amd-oneclick-sdk` 1.1.0 (published 2026-11-26). Upgrade with the
`--upgrade` or `pipx upgrade` commands above, then run `rcc --version`.

1.1.0 adds `--site global|china`, separate profiles for the same email, a China default API mode
of `auto`, and bilingual 404 and 401 hints. v1 commands and the Global default are unchanged.
Python 3.9 or newer is still required.

### 1.1.1

1.1.1 changes the unnamed default site to China (`https://developer.amd.com.cn/radeon`).
`rcc auth login` with no `--site` uses China; Global is `rcc auth login --site global`
(`https://radeon-global.anruicloud.com`). `rcc doctor` with no saved account shows `site: china`.
Saved accounts keep their site; an upgrade does not move an existing Global profile to China.
`RCC_DEFAULT_URL` still overrides the unnamed default. China API mode remains `auto`; Global
remains `v1`.

## Uninstall

```bash
python3 -m pip uninstall amd-oneclick-sdk
```

Uninstalling leaves `~/.radeon-cloud` in place. It holds your saved accounts, their sign-in tokens
and any SSH keys the CLI generated. To remove everything, first run `rcc auth logout --all` so the
saved tokens stop working. Then make sure the directory holds no SSH private key you still need,
and delete it.
