---
title: Sign-in and accounts
description: Sign in with Radeon Cloud CLI, switch between several accounts, and keep credentials safe.
sidebar:
  label: Sign-in and accounts
---

## Sign in

```bash
rcc auth login
```

The CLI opens a one-time authorization page in your browser. Sign in to Radeon Cloud, check the
device name shown on the page, and approve. The device name defaults to your host name followed by
`RCC CLI`; set your own with `--device-name`. The CLI does not read browser cookies and never asks
you to copy anything from the website into the terminal.

### Signing in on a machine without a browser

```bash
rcc auth login --no-browser
```

The CLI prints the authorization link. Open it in a browser on a device you trust and approve. The
CLI waits 5 minutes by default; change that with `--timeout` (in seconds).

### Check your sign-in

```bash
rcc auth status
rcc doctor
```

`rcc auth status` shows the token status of the current account; add `--all` to check every saved
account. `rcc doctor` checks the local configuration, the connection to the service, whether the
token is valid, and which CLI features the service currently offers.

## Several accounts

The CLI can keep several accounts, each under a local name you choose:

```bash
rcc account register personal   # sign in and save as "personal"
rcc account list                # saved accounts
rcc account current             # the default account
rcc account use work            # make "work" the default
```

To use another account for a single command without changing the default, put `-A`
(`--account`) before the command:

```bash
rcc -A personal status
rcc -A work instance status
```

With several accounts saved, always pass `-A` to destructive commands such as deleting an
instance, so you cannot delete the wrong account's instance:

```bash
rcc -A work instance delete --yes
```

To drop an account you no longer need:

```bash
rcc account remove personal --revoke --yes
```

`--revoke` invalidates its token before removing the local record. Removing the record does not
touch instances in the cloud.

## Sign out

```bash
rcc auth logout         # the current account
rcc auth logout --all   # every saved account
```

Signing out invalidates the token on this device and removes the local record. It does **not**:

- stop or delete an instance (it keeps consuming credits, so delete it separately)
- sign you out of Radeon Cloud in your browser
- affect sign-ins on other devices

## Credentials and safety

The CLI stores a token that starts with `rcc_`. It can only manage your account and instances.
Token Factory uses a different credential, an API key that starts with `rc-`.

- Treat tokens and one-time authorization links as secrets. Keep them out of logs, tickets and chat.
- Don't pass a token with `--token`: shell history and process listings expose it. If you must supply
  one from outside, use the `RCC_TOKEN` environment variable. A command with an explicit `-A` ignores
  `RCC_TOKEN`.
- The CLI uploads only your SSH public key, never the private key.
- The CLI has no option to turn off TLS certificate verification.
