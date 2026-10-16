---
title: Scripting and automation
description: Use Radeon Cloud CLI in scripts with JSON output, exit codes, safe retries and shell completion.
sidebar:
  label: Scripting and automation
---

## Output formats

Choose the format with `--output`: `human` (the default, for people), `json` or `ndjson`.

```bash
rcc --output json catalog list
rcc --output ndjson instance status --watch
rcc --quiet --output json instance status
```

- `json` writes one JSON document to standard output when the command finishes. `--json` is short
  for it.
- `ndjson` writes one JSON object per line, one for each event and each result, which suits
  commands that keep producing output, such as `--watch`.
- Progress and diagnostics always go to standard error, so they never mix with the result on
  standard output. `--quiet` turns progress off.
- Tokens, passwords, private keys and similar fields are hidden in the output. The one-time
  JupyterLab link printed by `rcc instance open --print` isn't, so keep it out of your logs.

When troubleshooting, add `-v` (repeatable: `-vv` says more), or `--debug` for a full traceback of
an unexpected local error.

## Exit codes

| Code | Meaning |
| --- | --- |
| `0` | The command completed locally. |
| `1` | A service, network, TLS or protocol error, or an unexpected local error. |
| `2` | Wrong usage, bad local configuration, or failed authentication. |
| `5` | The local wait timed out; the operation may still be running on the service. |
| `130` | Interrupted by the user; the operation on the service is unaffected. |

Exit code `0` only says the command itself worked, not that the instance is healthy:
`rcc instance status` can exit `0` while reporting an instance that is `failed`, or no instance at
all. Check both the exit code and the state in the JSON result.

## Retrying after a timeout or interruption

When `rcc instance create` times out (exit code `5`) or is interrupted (`130`), the instance may
still be on its way. Find out what the service has before deciding to retry:

```bash
rcc --output json instance status
rcc instance logs
```

If you do retry the same creation, pass the same `--idempotency-key` as the first attempt so a
second instance is not created.

## Shell completion

`rcc completion <shell>` prints a completion script to standard output for `bash`, `zsh`, `fish` or
`powershell`.

| Shell | This session only | Every new terminal |
|---|---|---|
| bash | `source <(rcc completion bash)` | add `eval "$(rcc completion bash)"` to `~/.bashrc` |
| zsh | `source <(rcc completion zsh)` | add `eval "$(rcc completion zsh)"` to `~/.zshrc`, after `compinit` |
| fish | `rcc completion fish \| source` | `rcc completion fish > ~/.config/fish/completions/rcc.fish` |
| PowerShell | `rcc completion powershell \| Out-String \| Invoke-Expression` | add the same line to `$PROFILE` |

## Finding commands and troubleshooting

```bash
rcc --help
rcc instance --help
rcc instance create --help
rcc capabilities   # which CLI features the service currently offers
```

When a command fails, check in this order:

```bash
rcc doctor            # installation, sign-in and service health
rcc auth status       # is the token valid
rcc instance status   # the instance's current state
rcc instance logs     # startup events and container logs
```
