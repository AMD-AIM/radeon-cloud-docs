---
title: 认证
description: 各部分接口接受哪种凭证，以及怎么获取、发送和轮换 API Key。
sidebar:
  order: 2
---

AMD Radeon Cloud 有三种凭证，调用不同的接口要用不同的凭证。

| 凭证 | 格式 | 用途 |
|---|---|---|
| **API Key** | `rc-` 加 48 位十六进制字符 | 共享模型 API 和专属模型 API |
| **CLI 令牌** | `rcc_...` | [Radeon Cloud CLI](/radeon-cloud-docs/zh-cn/cli/overview/)：实例、积分、可用资源 |
| **会话 Cookie** | 登录控制台时设置 | 控制台和[平台接口](/radeon-cloud-docs/zh-cn/api/instances/) |

要在脚本里管理实例，请用 CLI。平台接口是给控制台用的，只接受浏览器会话。

## API Key

API Key 的格式如下：

```text
rc-4f8a19c7e02b6d3a5c81f70e9b2d4a6c38e5b1907f2c4d8a
```

以 Bearer 令牌的方式发送：

```bash
curl https://developer.amd.com.cn/radeon/api/v1/models \
  -H "Authorization: Bearer $RADEON_API_KEY"
```

共享模型 API 也接受放在 `x-api-key` 请求头里的 API Key，这是 Anthropic SDK 的认证方式。调用 [`/v1/messages`](/radeon-cloud-docs/zh-cn/api/messages/) 时，同时发送 `anthropic-version`：

```bash
curl https://developer.amd.com.cn/radeon/api/v1/messages \
  -H "x-api-key: $RADEON_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "Content-Type: application/json" \
  -d '{"model":"DeepSeek-V4-Flash","max_tokens":256,"messages":[{"role":"user","content":"Hello"}]}'
```

两个请求头同时存在时，以 `Authorization` 为准。只有共享模型 API 读取 `x-api-key`。

### 获取 API Key

打开 [Token Factory](https://developer.amd.com.cn/radeon/tokenfactory)，顶部的 **您的 API 密钥** 卡片上就是你的 API Key，点 **复制**。第一次打开 Token Factory 时会自动生成。

还在审核中的账号不会生成 API Key。如果看不到，请确认账号是否已通过审核。

专属模型 API 会在实例卡片上显示它自己的 API Key，可能和这里的不同，见[专属端点](/radeon-cloud-docs/zh-cn/api/dedicated-endpoints/)。

### 轮换 API Key

在 **您的 API 密钥** 卡片上点 **重新生成密钥**。旧的 API Key 立即失效，请同时更新所有用到它的客户端。

API Key 可能泄露时，请立即轮换。

:::danger[像保管密码一样保管 API Key]
它可以消耗你的模型额度。请放在环境变量或密钥管理服务里，不要提交到代码仓库，也不要写进浏览器能读到的前端代码。
:::

## CLI 令牌

`rcc auth login` 通过浏览器让 CLI 登录，并保存一个以 `rcc_` 开头的令牌。它用来管理账号和实例，不能调用模型 API。见[登录与账号](/radeon-cloud-docs/zh-cn/cli/authentication/)。

## 会话 Cookie

登录控制台后会设置会话 Cookie。没有用密码换取会话的接口，所以脚本无法获得会话。

退出登录、身份提供方的登录过期，或者管理员撤销时，会话失效。

## 各接口接受的凭证

| 接口 | API Key | CLI 令牌 | 会话 |
|---|---|---|---|
| 共享模型 API（`/api/v1/...`） | 是 | 否 | 是 |
| 专属模型 API（`/spaces/...`） | 是 | 否 | 是 |
| CLI 接口（`/api/cli/...`） | 否 | 是 | 否 |
| 平台接口：实例、模板、账号 | 否 | 否 | 是 |
| 浏览公开模板（`GET /api/templates`） | 可选 | 否 | 可选 |
| JupyterLab 等应用（`/instances/...`） | 否 | 否 | 是 |

专属模型 API 只接受该实例对应的 API Key，并且只能访问实例实际提供服务的端口。

## 认证错误

`401` 表示凭证缺失、格式错误或无法识别。把 API Key 发给平台接口也会返回 `401`，内容是 `Login required`。

`403` 且 `"code": "account_not_verified"`，表示已经登录，但账号还在审核中。响应里的 `redirect` 指向审核页面。

访问实例路径时返回 `403`，表示这个实例不属于你。

完整列表见[错误](/radeon-cloud-docs/zh-cn/api/errors/)。
