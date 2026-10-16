---
title: 登录与账号
description: 用 Radeon Cloud CLI 登录、在多个账号之间切换，以及安全地保管凭证。
sidebar:
  label: 登录与账号
---

## 登录

```bash
rcc auth login
```

CLI 会在浏览器里打开一个一次性的授权页面。登录 Radeon Cloud 后，核对页面上显示的设备名称，
然后批准。设备名称默认是“主机名 + RCC CLI”，可以用 `--device-name` 改。CLI 不会读取浏览器 Cookie，
也不需要你把网页上的任何东西复制到终端。

### 在没有浏览器的机器上登录

```bash
rcc auth login --no-browser
```

CLI 会打印授权链接。在你信任的设备上用浏览器打开并批准即可。CLI 默认等待 5 分钟，可以用
`--timeout` 调整（单位：秒）。

### 确认登录状态

```bash
rcc auth status
rcc doctor
```

`rcc auth status` 显示当前账号的令牌状态，加 `--all` 检查所有已保存的账号。`rcc doctor` 检查
本地配置、服务连通性、令牌是否有效，以及当前服务端开放了哪些 CLI 功能。

## 多个账号

CLI 可以保存多个账号，每个账号有一个你自己起的本地名称：

```bash
rcc account register personal   # 登录并保存为 personal
rcc account list                # 列出已保存的账号
rcc account current             # 当前默认账号
rcc account use work            # 把 work 设为默认账号
```

只想让某一条命令用别的账号，在命令前加 `-A`（`--account`），默认账号不变：

```bash
rcc -A personal status
rcc -A work instance status
```

保存了多个账号时，删除实例这类操作建议总是显式加 `-A`，免得删到另一个账号的实例：

```bash
rcc -A work instance delete --yes
```

不再需要某个账号时：

```bash
rcc account remove personal --revoke --yes
```

`--revoke` 会先让它的令牌失效，再删除本地记录。删除账号记录不会影响云端的实例。

## 退出登录

```bash
rcc auth logout         # 当前账号
rcc auth logout --all   # 所有已保存的账号
```

退出登录会让这台设备上的令牌失效，并删除对应的本地记录。它**不会**：

- 停止或删除实例（实例会继续消耗积分，请先单独删除）
- 退出浏览器里的 Radeon Cloud 登录
- 影响其他设备上的登录

## 凭证与安全

CLI 登录后保存的是以 `rcc_` 开头的令牌，只能用来管理账号和实例；调用模型 API 用的是以 `rc-`
开头的 API Key，两者不是同一种凭证。

- 令牌和一次性授权链接都属于敏感信息，不要贴到日志、工单或聊天里。
- 不要用 `--token` 在命令行上传令牌：Shell 历史和进程列表会暴露它。确实需要从外部提供时，用环境变量
  `RCC_TOKEN`。显式指定了 `-A` 的命令不会读取 `RCC_TOKEN`。
- CLI 只上传 SSH 公钥，从不上传私钥。
- CLI 不提供关闭 TLS 证书校验的选项。
