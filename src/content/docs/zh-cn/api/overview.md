---
title: API 概览
description: 基础 URL、凭证，以及 AMD Radeon Cloud API 各部分的作用。
sidebar:
  order: 1
---

AMD Radeon Cloud API 分为四部分：

- **Token Factory API** 用来调用 [Token Factory](/radeon-cloud-docs/zh-cn/guides/token-factory/) 托管的模型，兼容 OpenAI，另有兼容 Anthropic 的 Messages 接口。
- **模型服务接口** 访问你用 **部署类型：模型 API** 在自己实例上运行的 vLLM。它也兼容 OpenAI，但运行在不同的主机上，限制和错误响应也不同。
- **CLI 接口** 是 [Radeon Cloud CLI](/radeon-cloud-docs/zh-cn/cli/overview/) 调用的接口。要在脚本里管理实例，请用 CLI。
- **平台接口** 服务于网页控制台，包括实例、模板和账号，只接受浏览器会话。

## 基础 URL

| API | 基础 URL |
|---|---|
| Token Factory API | `https://developer.amd.com.cn/radeon/api/v1`（仅中国站） |
| 模型服务接口 | 显示在实例卡片上，例如 `https://jupyter.anruicloud.com/inference/<instance-id>/v1` |
| 平台接口 | `https://developer.amd.com.cn/radeon` 或 `https://radeon-global.anruicloud.com` |

Token Factory 只在中国站提供。

模型服务就绪后，实例卡片上会显示它的 base URL 和 API Key。请直接从卡片复制，不要自己拼接 URL。

:::note[以控制台显示的为准]
以上是撰写本文时的公开地址。如果控制台或 Token Factory 显示的 base URL 不同，请以显示的为准。
:::

## 凭证

Token Factory 使用你的 `rc-` API Key，模型服务使用它卡片上的 `sk-` Key，CLI 使用自己的 `rcc_` 令牌，平台接口使用浏览器会话，见[认证](/radeon-cloud-docs/zh-cn/api/authentication/)。

## 约定

请求和响应都是 JSON，`Content-Type: application/json`。时间戳使用 ISO 8601。出错时返回非 2xx 状态码和 JSON 响应体，见[错误](/radeon-cloud-docs/zh-cn/api/errors/)。

## Token Factory API

随时可用，无需启动任何东西，也不消耗积分。提供哪些模型由 AMD 决定。主要接口：

- [`POST /v1/chat/completions`](/radeon-cloud-docs/zh-cn/api/chat-completions/)：兼容 OpenAI 的聊天补全接口
- [`GET /v1/models`](/radeon-cloud-docs/zh-cn/api/models/)：可调用的模型
- [`POST /v1/messages`](/radeon-cloud-docs/zh-cn/api/messages/)：兼容 Anthropic，供 Claude Code 等客户端使用
- [`POST /v1/messages/count_tokens`](/radeon-cloud-docs/zh-cn/api/messages/#计算-token)：这些客户端发请求前先调用的 token 计数接口
- [`GET /v1/usage`](/radeon-cloud-docs/zh-cn/api/usage/)：你的用量和今天剩余的额度

有些模型使用 `/v1` 下的其他路径，例如语音合成用 `/v1/audio/speech`，文档解析用 `/v1/ocr`。[模型目录](/radeon-cloud-docs/zh-cn/models/overview/)里每个模型的页面都会列出它使用的路径。没有任何模型提供的路径返回 `404`。

所有路径加不加 `/api` 前缀都可以：`/api/v1/models` 和 `/v1/models` 是同一个接口。

请求会经过网关，网关只保留固定的一组字段，不在其中的参数会被丢弃，不会转发。字段列表见[聊天补全](/radeon-cloud-docs/zh-cn/api/chat-completions/)。每个 API Key 有频率限制、并发配额和每日用量上限，见[限流](/radeon-cloud-docs/zh-cn/api/rate-limits/)。

## 模型服务接口

在用 **部署类型：模型 API** 启动的实例上运行的 vLLM。模型和启动参数由你决定，实例运行期间消耗积分。

除了去掉路由前缀，请求会原样转发给你的服务。vLLM 提供的接口都能用，通常包括 `/v1/completions` 和 `/v1/embeddings`。前面没有网关，所以 Token Factory 的限流、模型列表和错误格式都不适用。

见[模型服务接口](/radeon-cloud-docs/zh-cn/api/model-services/)。

## 平台接口

| 用途 | 参考 |
|---|---|
| 启动、查看和销毁实例 | [实例](/radeon-cloud-docs/zh-cn/api/instances/) |
| 模板库和模型服务模板 | [模板](/radeon-cloud-docs/zh-cn/api/templates/) |
| 个人资料、可用资源、SSH 密钥、优惠码 | [账号](/radeon-cloud-docs/zh-cn/api/account/) |

## 下一步

接下来请阅读[认证](/radeon-cloud-docs/zh-cn/api/authentication/)。用错凭证是最常见的出错原因。
