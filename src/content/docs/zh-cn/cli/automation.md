---
title: 脚本与自动化
description: 在脚本里使用 Radeon Cloud CLI：JSON 输出、退出码、超时重试和 Shell 补全。
sidebar:
  label: 脚本与自动化
---

## 输出格式

用 `--output` 选择输出格式：`human`（默认，给人看）、`json` 或 `ndjson`。

```bash
rcc --output json catalog list
rcc --output ndjson instance status --watch
rcc --quiet --output json instance status
```

- `json`：命令结束时向标准输出写一个 JSON 文档。`--json` 是它的简写。
- `ndjson`：每行一个 JSON 对象，每个事件、每个结果各一行，适合 `--watch` 这类持续输出的命令。
- 进度和诊断信息一律写到标准错误，不会混进标准输出里的结果。`--quiet` 可以关掉进度信息。
- 输出里的令牌、密码、私钥这类字段会被隐藏。但 `rcc instance open --print` 打印的一次性 JupyterLab
  链接不会被隐藏，脚本里请自行保管，不要写进日志。

排查问题时可以加 `-v`（可叠加，`-vv` 更详细），或用 `--debug` 显示本地异常的完整调用栈。

## 退出码

| 退出码 | 含义 |
| --- | --- |
| `0` | 命令在本地执行成功 |
| `1` | 服务端、网络、TLS、协议错误，或本地发生意外错误 |
| `2` | 命令用法错误、本地配置有误或认证失败 |
| `5` | 本地等待超时，服务端的操作可能还在进行 |
| `130` | 被用户中断，服务端的操作不受影响 |

退出码 `0` 只说明命令本身执行成功，不代表实例状态正常。例如 `rcc instance status` 可能正常退出，
但返回的实例状态是 `failed`，或者根本没有实例。脚本里请同时检查退出码和 JSON 结果里的状态字段。

## 超时和中断后怎么重试

`rcc instance create` 超时（退出码 `5`）或被中断（`130`）时，实例可能仍在创建。先查清楚服务端的状态，
再决定要不要重试：

```bash
rcc --output json instance status
rcc instance logs
```

确实要重试同一次创建时，带上和第一次相同的 `--idempotency-key`，避免重复创建实例。

## Shell 补全

`rcc completion <shell>` 把补全脚本打印到标准输出，支持 `bash`、`zsh`、`fish` 和 `powershell`。

| Shell | 只在当前会话生效 | 每次打开终端都生效 |
|---|---|---|
| bash | `source <(rcc completion bash)` | 把 `eval "$(rcc completion bash)"` 加到 `~/.bashrc` |
| zsh | `source <(rcc completion zsh)` | 把 `eval "$(rcc completion zsh)"` 加到 `~/.zshrc`，放在 `compinit` 之后 |
| fish | `rcc completion fish \| source` | `rcc completion fish > ~/.config/fish/completions/rcc.fish` |
| PowerShell | `rcc completion powershell \| Out-String \| Invoke-Expression` | 把同一行加到 `$PROFILE` |

## 查找命令和排错

```bash
rcc --help
rcc instance --help
rcc instance create --help
rcc capabilities   # 当前服务端开放了哪些 CLI 功能
```

命令失败时，按这个顺序检查：

```bash
rcc doctor            # 安装、登录和服务是否正常
rcc auth status       # 令牌是否有效
rcc instance status   # 实例当前状态
rcc instance logs     # 启动事件和容器日志
```
