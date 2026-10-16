---
title: Automate RCC
description: Use structured output, exit codes, and shell completion with Radeon Cloud CLI.
sidebar:
  label: Automation
---

For the shortest workflow, start with [RCC](/radeon-cloud-docs/cli/overview/).

## Structured output

Global output options go before the command:

```bash
rcc --output json catalog list
rcc --output ndjson instance status --watch
rcc --quiet --output json instance status
```

- `json` writes one final result document to standard output.
- `ndjson` writes events and results one JSON object per line.
- Progress and diagnostics are written to standard error.
- Sensitive fields are redacted except for operations that explicitly return a
  secret.

Automation should inspect both the process exit code and lifecycle fields in
the structured result. A status command can exit successfully while reporting
that a remote instance is `failed` or absent.

## Exit codes

| Code | Meaning |
| --- | --- |
| `0` | The local command completed successfully. |
| `1` | Service, network, TLS, protocol, or unexpected local failure. |
| `2` | Usage, local configuration, or authentication failure. |
| `5` | Local wait timeout; server-side work may still continue. |
| `130` | Interrupted by the user; remote work is left unchanged. |

If a create command times out or is interrupted, check the remote state before
retrying:

```bash
rcc --output json instance status
rcc instance logs
```

Use an idempotency key when retrying the same logical create operation.

## Shell completion

Generate completion for the current shell:

```bash
rcc completion bash
rcc completion zsh
rcc completion fish
rcc completion powershell
```

The command writes a completion script to standard output. Follow the shell's
normal process to source it for the current session or install it in the shell
configuration.

## Command discovery

```bash
rcc --help
rcc instance --help
rcc instance create --help
rcc capabilities
```

`rcc capabilities` shows the RCC features published by the current deployment.

If a command fails, start with:

```bash
rcc doctor
rcc auth status
rcc instance status
rcc instance logs
```
