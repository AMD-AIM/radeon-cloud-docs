---
title: Radeon Cloud CLI
description: Sign in to Radeon Cloud and create, connect to and delete GPU instances from your terminal.
sidebar:
  label: Overview
---

Radeon Cloud CLI is the command-line tool for Radeon Cloud; the command is `rcc`. From a terminal you
can check your credits and the resources available to you, create a GPU instance, open JupyterLab,
connect over SSH, follow its status and logs, and delete it when you are done. Results can be
printed as JSON for scripts.

:::note[Before you begin]
- A Radeon Cloud account
- Python 3.9 or newer
- A browser that can reach the Radeon Cloud sign-in page, on this machine or another one
- For SSH, `ssh` and `ssh-keygen`
:::

## Quickstart

### 1. Install

```bash
python3 -m pip install amd-oneclick-sdk
rcc --version
```

The package is called `amd-oneclick-sdk` and provides the `rcc` command. For pipx, virtual
environments and Windows, see [Install and upgrade](/radeon-cloud-docs/cli/install/).

### 2. Sign in

```bash
rcc auth login
rcc doctor
```

`rcc auth login` opens your browser, where you approve this device. On a server or any machine
without a browser, run `rcc auth login --no-browser` and open the printed link on another device.
`rcc doctor` checks the installation, your sign-in and the connection to the service.

### 3. Check credits and available resources

```bash
rcc credits status
rcc catalog list
```

`rcc catalog list` shows the environments, resource pools and resource templates your account may
use. Being listed means you are allowed to request it, not that a GPU is free right now.

### 4. Create an instance and connect

```bash
rcc instance add-key   # first time only: upload your SSH public key
rcc instance create    # pick an environment and resources when prompted
rcc instance open      # open JupyterLab in your browser
rcc instance ssh       # or connect over SSH
```

If startup is slow or fails, follow it with `rcc instance status --watch` and read
`rcc instance logs`.

### 5. Delete it when you are done

```bash
rcc instance delete --yes
rcc instance status
```

A running instance keeps consuming [credits](/radeon-cloud-docs/guides/credits/). Delete it when
you have finished, and check `rcc instance status` until no running instance is left.

:::caution[Signing out does not stop an instance]
`rcc auth logout` only signs this device out. The instance keeps running and keeps consuming credits.
:::

## The CLI token is not an API key

After sign-in the CLI stores a token that starts with `rcc_`. It manages your account and
instances only. [Token Factory](/radeon-cloud-docs/guides/token-factory/) uses an API key that starts
with `rc-`.

## Next steps

- [Install and upgrade](/radeon-cloud-docs/cli/install/): pipx, virtual environments, Windows, upgrading and uninstalling
- [Sign-in and accounts](/radeon-cloud-docs/cli/authentication/): signing in without a browser, several accounts, signing out
- [Manage GPU instances](/radeon-cloud-docs/cli/instances/): choosing resources in scripts, returning without waiting, SSH keys
- [Scripting and automation](/radeon-cloud-docs/cli/automation/): JSON output, exit codes, shell completion

For every command and option, run `rcc --help` or `rcc <command> --help`.
