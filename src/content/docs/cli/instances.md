---
title: Manage GPU instances
description: Find available resources, then create, connect to, monitor and delete GPU instances with Radeon Cloud CLI.
sidebar:
  label: Manage GPU instances
---

Each account has one current instance, and every `rcc instance` command acts on it. There's no
instance ID to pass. To work with another account's instance, switch accounts with `-A` (see
[Sign-in and accounts](/radeon-cloud-docs/cli/authentication/)).

## Check credits and available resources

```bash
rcc status           # account, credits and instance at a glance
rcc credits status   # credit balance
rcc catalog list     # environments, resource pools and templates you may use
```

Filter by kind, or look up and search for an entry:

```bash
rcc catalog list --kind environment
rcc catalog list --kind resource_pool
rcc catalog list --kind resource_template
rcc catalog show ID
rcc catalog search TEXT
```

Being listed means your account may request the resource. It does not reserve a GPU or promise
free capacity right now.

## Add an SSH key

Before your first instance with SSH, register an SSH key for the current account:

```bash
rcc instance add-key
```

The CLI checks the key you already have and, if there is none, offers to generate an Ed25519 key.
Only the public key is uploaded.

To pick a specific existing key:

```bash
rcc instance add-key --identity-file ~/.ssh/id_ed25519
```

SSH is on by default when you create an instance; add `--no-ssh` if you don't need it.

## Create an instance

Run it in a terminal and the CLI walks you through choosing an environment and resources:

```bash
rcc instance create
```

In a script, or anywhere without an interactive terminal, spell the choices out. The values come
from `rcc catalog list`:

```bash
rcc instance create \
  --env ENVIRONMENT \
  --pod-type RESOURCE_POOL \
  --resource-template RESOURCE_TEMPLATE
```

| Option | Value |
|---|---|
| `--env` | the ID, name or image of an `environment` entry |
| `--pod-type` | a `resource_pool` entry |
| `--resource-template` | a `resource_template` entry |

By default the instance gets a temporary workspace that is deleted with it. To keep `/workspace` after
the instance is deleted, add `--use-pvc`. See [Keep your data](/radeon-cloud-docs/guides/storage/).

The console **Auto-delete** picker is not in the CLI. A CLI launch uses the pool maximum, which is 7 days on one-click.

The CLI creates notebook instances. To serve a model, use the console. See
[Serve a model](/radeon-cloud-docs/guides/serve-model/).

By default the CLI waits until the instance is ready. Add `--no-wait` to return as soon as the
request is accepted, then follow the progress:

```bash
rcc instance create \
  --env ENVIRONMENT \
  --pod-type RESOURCE_POOL \
  --resource-template RESOURCE_TEMPLATE \
  --no-wait

rcc instance status --watch
rcc instance logs
```

If a request went out but no response came back, retry with the same `--idempotency-key KEY` so it
is not created twice. Never reuse a key for a different create request.

:::note[A timeout or Ctrl+C does not cancel the creation]
When the local wait times out or you press <kbd>Ctrl</kbd>+<kbd>C</kbd>, the CLI only stops waiting;
the service keeps creating the instance. Carry on with `rcc instance status --watch` and
`rcc instance logs`.
:::

## Open JupyterLab or connect over SSH

```bash
rcc instance open   # open JupyterLab in your browser
rcc instance ssh    # connect over SSH
```

On a machine without a browser, print the link or the SSH command instead:

```bash
rcc instance open --print
rcc instance ssh --print
```

The JupyterLab link works once and expires quickly. Keep it out of logs, tickets
and chat.

## Status and logs

```bash
rcc instance list             # the current instance (--all: one per saved account)
rcc instance status           # its current state
rcc instance status --watch   # keep refreshing, every 3 seconds by default
rcc instance logs             # startup events and container logs
```

You can only see the instances of the account you are signed in as.

## Delete an instance

```bash
rcc instance delete --yes
rcc instance status
```

Right after deletion the status may say the instance is shutting down. That means deletion has
started, not that cleanup is finished. Keep checking until no running instance is left. Signing out
does not delete an instance.
