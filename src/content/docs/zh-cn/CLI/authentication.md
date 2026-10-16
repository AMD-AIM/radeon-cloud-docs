---
title: 认证与账户
description: 登录 RCC、使用多个账户配置，并安全管理本地凭证。
sidebar:
  label: 认证与账户
---

如需最短使用流程，请先阅读 [RCC](/radeon-cloud-docs/zh-cn/cli/overview/)。

## 登录

通过 Radeon Cloud 浏览器登录流程授权当前工作站：

```bash
rcc auth login
```

RCC 会打开一次性验证页面。登录后，确认设备名称并批准请求。RCC 不会读取浏览器 Cookie，
也不会要求你把网页会话复制到终端中。

在远程或无图形界面的机器上，可以打印验证链接：

```bash
rcc auth login --no-browser
```

请在链接过期前使用可信设备上的浏览器打开它，然后检查账户和连接：

```bash
rcc auth status
rcc doctor
```

`rcc doctor` 会检查本地配置、服务连接、Token 有效性，以及当前部署公开的 RCC 功能。

## 使用多个账户

RCC 可以保存多个命名账户配置：

```bash
rcc account register personal
rcc account list
rcc account current
rcc account use work
```

使用 `-A` 或 `--account` 可以只为当前命令选择账户，而不修改默认账户：

```bash
rcc -A personal status
rcc -A work instance status
```

账户选择也是身份边界。保存了多个账户时，执行删除等破坏性操作应明确指定账户：

```bash
rcc -A work instance delete --yes
```

## 凭证与退出登录

RCC 使用作用域受限的 `rcc_...` 凭证执行账户和实例操作。它与 Radeon Cloud 模型 API
使用的 `rc-...` API key 不同。

```bash
rcc auth logout
```

退出登录只会撤销所选设备凭证，不会释放 GPU、删除实例、结束浏览器会话，也不会撤销其他
设备上的凭证。

## 基本安全原则

- 把 RCC Token 和一次性浏览器 URL 当作敏感信息处理。
- 避免通过命令行参数传递 Token；Shell 历史和进程列表可能会暴露它。
- RCC 只上传 SSH 公钥，绝不会上传私钥。
- CLI 不允许关闭 TLS 验证。
- 如果希望停止 GPU 使用，请先单独删除活动实例，再退出登录。
