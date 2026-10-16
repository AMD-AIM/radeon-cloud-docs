---
title: RCC CLI overview
description: Install Radeon Cloud CLI, sign in, and manage a Radeon Cloud GPU instance from your terminal.
sidebar:
  label: Overview
---

Radeon Cloud CLI (`rcc`) lets you manage Radeon Cloud resources from a local terminal. You can sign in through the existing Radeon Cloud website, check your Credits and approved resources, create a GPU instance, open JupyterLab, connect over SSH, inspect logs, and release the instance when you are finished.

RCC uses a scoped `rcc_...` credential for account and instance operations. This is separate from the `rc-...` API key used to call Radeon Cloud model APIs.

:::note[Before you begin]
You need an existing Radeon Cloud account, Python 3.9 or newer, and a browser that can reach the Radeon Cloud sign-in page. Managed SSH also requires `ssh` and `ssh-keygen`.
:::

## Quick start

Install RCC, authorize your workstation, and check that it can reach Radeon Cloud:

```bash
python3 -m pip install amd-oneclick-sdk

rcc auth login --account work
rcc doctor
rcc credits status
rcc catalog list
```

Then add your SSH public key and create an instance. In an interactive terminal, RCC guides you through the approved Catalog choices:

```bash
rcc instance add-key
rcc instance create
rcc instance open
```

When you are finished, release the instance and its GPU:

```bash
rcc instance delete --yes
rcc instance status
```

:::caution[Instances consume Credits while they run]
Logging out or removing a local account does not stop an instance. Always delete an instance when you no longer need it, then check its status until no active instance is reported.
:::

## Install RCC

The package is published to PyPI as `amd-oneclick-sdk`, while the primary command is `rcc`.

### Linux and macOS

```bash
python3 -m pip install amd-oneclick-sdk
rcc --version
```

### Windows

Run the following in PowerShell or Command Prompt:

```powershell
python -m pip install amd-oneclick-sdk
rcc --version
```

If you installed the optional Python Launcher for Windows, you can use `py`
instead of `python` in these commands.

### Install with pipx

For an isolated command-line installation:

```bash
pipx install amd-oneclick-sdk
rcc --version
```

### Use a virtual environment

Some operating systems prevent packages from being installed into the system-managed Python environment. In that case, create a virtual environment first.

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

Both `rcc` and the legacy-compatible `amd-oneclick` command start the same CLI. New scripts and documentation should use `rcc`.

## Sign in

Authorize the current workstation through the normal Radeon Cloud browser sign-in flow:

```bash
rcc auth login --account work
```

RCC opens a one-time verification page. Sign in, review the device name, and approve the request. RCC never reads your browser cookies or asks you to copy a web session into the terminal.

On a remote or headless machine, print the verification link instead:

```bash
rcc auth login --account work --no-browser
```

Open the link in a trusted browser before it expires. After approval, verify the saved account and connection:

```bash
rcc auth status
rcc doctor
```

`rcc doctor` checks the local configuration, service connection, token validity, and RCC features published by the deployment.

## Work with multiple accounts

RCC can store more than one local account profile:

```bash
rcc account register personal
rcc account list
rcc account current
rcc account use work
```

Use `-A` or `--account` to select an account for one command without changing the default:

```bash
rcc -A personal status
rcc -A work instance status
```

Account selection is an identity boundary. When several profiles exist, explicitly select an account for destructive commands:

```bash
rcc -A work instance delete --yes
```

## Check Credits and approved resources

Check the signed-in account and its GPU-hour balance:

```bash
rcc status
rcc credits status
```

List the environments and resources that administrators have approved for your account:

```bash
rcc catalog list
rcc catalog list --kind environment
rcc catalog list --kind resource_pool
rcc catalog list --kind resource_template
```

You can also inspect or search Catalog entries:

```bash
rcc catalog show ITEM
rcc catalog search QUERY
```

Catalog availability means that your account is eligible to request the resource. It does not reserve a GPU or guarantee that capacity is available at that moment.

## Add an SSH key

Before the first SSH-enabled launch, associate a local SSH identity with the selected RCC account:

```bash
rcc instance add-key
```

RCC can validate an existing identity or offer to generate an Ed25519 key. Only the public key is uploaded; the private key remains on your workstation.

To select an existing key explicitly:

```bash
rcc instance add-key --identity-file ~/.ssh/id_ed25519
```

SSH is enabled by default when creating an instance. Use `--no-ssh` during creation if you do not want SSH access.

## Create a GPU instance

In an interactive terminal, run:

```bash
rcc instance create
```

RCC prompts you to select approved Catalog values. For automation or non-interactive terminals, provide the selectors explicitly:

```bash
rcc instance create \
  --env REVIEWED_ENVIRONMENT \
  --pod-type RESOURCE_POOL \
  --resource-template RESOURCE_TEMPLATE
```

By default, RCC waits for the instance to become ready. To return after the create request is accepted:

```bash
rcc instance create \
  --env REVIEWED_ENVIRONMENT \
  --pod-type RESOURCE_POOL \
  --resource-template RESOURCE_TEMPLATE \
  --no-wait

rcc instance status --watch
rcc instance logs
```

Use `--idempotency-key KEY` when retrying the same logical create request after a lost response. Do not reuse the same key for a different launch.

:::note[Local waits do not control server-side work]
A local timeout or <kbd>Ctrl</kbd>+<kbd>C</kbd> stops RCC from waiting, but it does not cancel instance creation. Run `rcc instance status --watch` and `rcc instance logs` to continue monitoring it.
:::

## Open JupyterLab or connect with SSH

Open a ready instance in your browser:

```bash
rcc instance open
```

On a headless machine, print the short-lived URL and open it on another trusted device:

```bash
rcc instance open --print
```

The URL is single-use and sensitive. Do not place it in logs, tickets, or chat messages.

To enter the instance with OpenSSH:

```bash
rcc instance ssh
```

To inspect the SSH command without running it:

```bash
rcc instance ssh --print
```

## Inspect status and logs

Use these commands while an instance is starting or running:

```bash
rcc instance list
rcc instance status
rcc instance status --watch
rcc instance logs
```

Status and logs always belong to the authenticated Radeon Cloud account. RCC does not accept an arbitrary server-side user name or internal launch identifier.

## Delete an instance

Release the current instance explicitly:

```bash
rcc instance delete --yes
rcc instance status
```

A response saying that the instance is shutting down means deletion has started, not necessarily that cleanup is complete. Continue checking until RCC reports no active instance.

Logging out does not delete the instance:

```bash
rcc auth logout
```

Logout revokes the selected device credential only. It does not release a GPU, end browser sessions, or revoke credentials on other devices.

## Command groups

| Command | Description |
| --- | --- |
| `rcc status` | Show account, Credits, and current instance state. |
| `rcc auth` | Sign in, check authentication, and sign out. |
| `rcc account` | Manage named local account profiles. |
| `rcc credits` | Read the account's GPU-hour balance. |
| `rcc catalog` | Browse administrator-approved resources. |
| `rcc instance` | Create, inspect, open, connect to, and delete an instance. |
| `rcc doctor` | Check installation, authentication, and service health. |
| `rcc capabilities` | Show the RCC features published by the server. |
| `rcc completion` | Generate shell completion. |

Browse the built-in help for the complete options of any command:

```bash
rcc --help
rcc instance --help
rcc instance create --help
```

## Shell completion

Generate completion for your shell:

```bash
rcc completion bash
rcc completion zsh
rcc completion fish
rcc completion powershell
```

The command writes a completion script to standard output. Follow your shell's normal process to source it for the current session or install it in your shell configuration.

## Use RCC in automation

Global output options go before the command:

```bash
rcc --output json catalog list
rcc --output ndjson instance status --watch
rcc --quiet --output json instance status
```

- `json` writes one final result document to standard output.
- `ndjson` writes events and results one JSON object per line.
- Progress and diagnostics are written to standard error.
- Sensitive fields are redacted, except for explicitly secret-bearing operations.

Common exit codes:

| Code | Meaning |
| --- | --- |
| `0` | The local command completed successfully. |
| `1` | Service, network, TLS, protocol, or unexpected local failure. |
| `2` | Usage, local configuration, or authentication failure. |
| `5` | Local wait timeout; server-side work may still continue. |
| `130` | Interrupted by the user; remote work is left unchanged. |

Automation should inspect both the exit code and the lifecycle fields in the structured result. A status command can complete successfully while reporting that the remote instance is `failed` or absent.

## Upgrade or uninstall

Upgrade a pip installation:

```bash
python3 -m pip install --upgrade amd-oneclick-sdk
```

For pipx:

```bash
pipx upgrade amd-oneclick-sdk
```

Uninstall the package:

```bash
python3 -m pip uninstall amd-oneclick-sdk
```

Uninstalling RCC does not remove saved account profiles or SSH keys from the local RCC state directory, which is `~/.radeon-cloud` by default.

## Security basics

- Treat RCC tokens and one-time browser URLs as secrets.
- Do not pass tokens on the command line unless necessary; shell history and process inspection may expose them.
- RCC never uploads an SSH private key.
- TLS verification cannot be disabled from the CLI.
- Use `rcc auth logout` to revoke the selected workstation credential.
- Delete active instances separately before logging out when you want GPU usage to stop.

If a command fails, start with:

```bash
rcc doctor
rcc auth status
rcc instance status
rcc instance logs
```
