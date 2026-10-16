---
title: Authentication and accounts
description: Sign in to RCC, use multiple account profiles, and manage local credentials safely.
sidebar:
  label: Authentication and accounts
---

For the shortest workflow, start with [RCC](/radeon-cloud-docs/cli/overview/).

## Sign in

Authorize the current workstation through the Radeon Cloud browser sign-in
flow:

```bash
rcc auth login
```

RCC opens a one-time verification page. Sign in, review the device name, and
approve the request. RCC does not read browser cookies or ask you to copy a web
session into the terminal.

On a remote or headless machine, print the verification link:

```bash
rcc auth login --no-browser
```

Open the link in a trusted browser before it expires. Then verify the account
and connection:

```bash
rcc auth status
rcc doctor
```

`rcc doctor` checks local configuration, service connectivity, token validity,
and the RCC features published by the deployment.

## Work with multiple accounts

RCC can store more than one named account profile:

```bash
rcc account register personal
rcc account list
rcc account current
rcc account use work
```

Use `-A` or `--account` to select an account for one command without changing
the default:

```bash
rcc -A personal status
rcc -A work instance status
```

Account selection is an identity boundary. When several profiles exist,
explicitly select an account for destructive operations:

```bash
rcc -A work instance delete --yes
```

## Credentials and logout

RCC uses a scoped `rcc_...` credential for account and instance operations.
This is separate from the `rc-...` API key used by Radeon Cloud model APIs.

```bash
rcc auth logout
```

Logout revokes only the selected device credential. It does not release a GPU,
delete an instance, end browser sessions, or revoke credentials on other
devices.

## Security basics

- Treat RCC tokens and one-time browser URLs as secrets.
- Avoid passing tokens on the command line; shell history and process listings
  may expose them.
- RCC uploads only an SSH public key, never the private key.
- TLS verification cannot be disabled from the CLI.
- Delete active instances separately before logging out when you want GPU
  usage to stop.
