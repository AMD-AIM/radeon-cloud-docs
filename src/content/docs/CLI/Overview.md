---
title: RCC
description: Use Radeon Cloud CLI to sign in and manage a GPU instance from your terminal.
sidebar:
  label: RCC
---

Radeon Cloud CLI (`rcc`) manages Radeon Cloud accounts, Credits, approved
resources, and GPU instances from a terminal. Use it to create an instance,
open JupyterLab, connect over SSH, inspect status and logs, and release the GPU
when you are finished.

:::note[Before you begin]
You need a Radeon Cloud account, Python 3.9 or newer, and a browser that can
reach the Radeon Cloud sign-in page. SSH access also requires `ssh` and
`ssh-keygen`.
:::

## Install and sign in

Install the `amd-oneclick-sdk` package, which provides the `rcc` command:

```bash
python3 -m pip install amd-oneclick-sdk
rcc --version
```

Authorize this workstation and verify the connection:

```bash
rcc auth login
rcc doctor
```

On a remote or headless machine, use
`rcc auth login --no-browser` and open the printed verification
link on a trusted device.

RCC uses a scoped `rcc_...` credential. It is separate from the `rc-...` API
key used to call Radeon Cloud model APIs.

## Check Credits and available resources

```bash
rcc credits status
rcc catalog list
```

The Catalog lists environments, resource pools, and templates approved for
your account. It does not reserve capacity.

## Create and use a GPU instance

Add your SSH public key once, then start an interactive instance:

```bash
rcc instance add-key
rcc instance create
```

Open JupyterLab or connect over SSH:

```bash
rcc instance open
rcc instance ssh
```

Check progress or troubleshoot a launch:

```bash
rcc instance status --watch
rcc instance logs
```

## Release the instance

Delete the instance when you have finished so it stops consuming Credits:

```bash
rcc instance delete --yes
rcc instance status
```

:::caution[Logging out does not release a GPU]
`rcc auth logout` only revokes the selected workstation credential. It does
not stop or delete an instance. Delete the instance separately and check its
status until RCC reports that no active instance remains.
:::

## Learn more

- [Install and maintain RCC](/radeon-cloud-docs/cli/install/)
- [Authentication and accounts](/radeon-cloud-docs/cli/authentication/)
- [Manage GPU instances](/radeon-cloud-docs/cli/instances/)
- [Automation and structured output](/radeon-cloud-docs/cli/automation/)

Run `rcc --help` or `rcc COMMAND --help` for the complete command reference.
