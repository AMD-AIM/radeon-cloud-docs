---
title: Manage GPU instances
description: Browse approved resources and create, access, monitor, and delete GPU instances with RCC.
sidebar:
  label: GPU instances
---

For the shortest workflow, start with [RCC](/radeon-cloud-docs/cli/overview/).

## Check Credits and approved resources

```bash
rcc status
rcc credits status
rcc catalog list
```

Filter or inspect Catalog entries when you need explicit selectors:

```bash
rcc catalog list --kind environment
rcc catalog list --kind resource_pool
rcc catalog list --kind resource_template
rcc catalog show ITEM
rcc catalog search QUERY
```

Catalog availability means that the account is eligible to request a resource.
It does not reserve a GPU or guarantee capacity.

## Add an SSH key

Before the first SSH-enabled launch, associate a local SSH identity with the
selected RCC account:

```bash
rcc instance add-key
```

RCC can validate an existing identity or offer to generate an Ed25519 key.
Only the public key is uploaded.

To select an existing key explicitly:

```bash
rcc instance add-key --identity-file ~/.ssh/id_ed25519
```

SSH is enabled by default. Use `--no-ssh` during creation if it is not needed.

## Create an instance

In an interactive terminal, let RCC guide you through approved Catalog values:

```bash
rcc instance create
```

For automation or a non-interactive terminal, provide the selectors:

```bash
rcc instance create \
  --env REVIEWED_ENVIRONMENT \
  --pod-type RESOURCE_POOL \
  --resource-template RESOURCE_TEMPLATE
```

RCC waits for readiness by default. To return after the request is accepted:

```bash
rcc instance create \
  --env REVIEWED_ENVIRONMENT \
  --pod-type RESOURCE_POOL \
  --resource-template RESOURCE_TEMPLATE \
  --no-wait

rcc instance status --watch
rcc instance logs
```

Use `--idempotency-key KEY` when retrying the same logical create operation
after a lost response. Do not reuse the key for a different launch.

:::note[Local waits do not control server-side work]
A timeout or <kbd>Ctrl</kbd>+<kbd>C</kbd> stops RCC from waiting, but does not
cancel instance creation. Continue with `rcc instance status --watch` and
`rcc instance logs`.
:::

## Open JupyterLab or connect over SSH

```bash
rcc instance open
rcc instance ssh
```

On a headless machine, print the short-lived JupyterLab URL or SSH command:

```bash
rcc instance open --print
rcc instance ssh --print
```

The JupyterLab URL is single-use and sensitive. Do not place it in logs,
tickets, or chat messages.

## Inspect status and logs

```bash
rcc instance list
rcc instance status
rcc instance status --watch
rcc instance logs
```

Status and logs belong to the authenticated Radeon Cloud account. RCC does not
accept an arbitrary server-side user name or internal launch identifier.

## Delete an instance

```bash
rcc instance delete --yes
rcc instance status
```

A shutting-down response means deletion has started, not necessarily that
cleanup has completed. Keep checking until RCC reports no active instance.
Logging out does not delete the instance.
