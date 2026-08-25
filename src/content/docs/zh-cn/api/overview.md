---
title: API 概览
description: 基础 URL、约定，以及 AMD Radeon Cloud API 提供了什么。
sidebar:
  order: 1
---

AMD Radeon Cloud API 分成两半，在脑子里分开看会清楚很多。

**Model API** 兼容 OpenAI，用 Bearer 令牌认证。你的应用调它来跑推理。

**Platform API** 管理模板、实例和账户。控制台调的就是它，你也可以自己驱动它，把启动和销毁写成脚本。

## 基础 URL

| 接口 | 基础 URL |
|---|---|
| Model API — 共享 | `https://developer.amd.com.cn/radeon/api/v1` |
| Model API — 独占 | `https://<host>/spaces/<instance-id>/<port>/v1` |
| Platform API | `https://radeon-global.anruicloud.com` |

独占的基础 URL 在实例启动时生成，会显示在启动对话框和 **Active Instance** 里。别自己拼——端口取决于服务栈（vLLM 是 8000，SGLang 是 30000）。

:::note[部署环境不止一套]
AMD Radeon Cloud 背后有多个主机名。上面这些是撰写时的公开地址；始终优先用控制台给你的基础 URL，而不是写死的字符串。
:::

## 约定

请求和响应都是 JSON，`Content-Type: application/json`。时间戳是 ISO 8601。出错时返回非 2xx 状态和一个 JSON 体——见[错误](/radeon-cloud-docs/zh-cn/api/errors/)。

Model API 严格照搬 OpenAI 的 schema，包括基于 server-sent events 的流式输出，因为请求会原封不动地转发给服务后端。一个参数在 OpenAI 上能用，在这里基本也能用。

## Model API 提供什么

共享端点支持两个操作：

- [`POST /v1/chat/completions`](/radeon-cloud-docs/zh-cn/api/chat-completions/)
- [`GET /v1/models`](/radeon-cloud-docs/zh-cn/api/models/)

旧版 completions、embeddings 和图像端点在共享端点上**不可用**。

[独占端点](/radeon-cloud-docs/zh-cn/api/dedicated-endpoints/)直接透传给 vLLM 或 SGLang，所以那台服务器有什么它就有什么——通常包括 `/v1/completions` 和 `/v1/embeddings`。

## Platform API 提供什么

| 范围 | 参考 |
|---|---|
| 启动、查看、销毁实例 | [实例](/radeon-cloud-docs/zh-cn/api/instances/) |
| 创建和管理模板 | [模板](/radeon-cloud-docs/zh-cn/api/templates/) |
| 资料、API 密钥、SSH 密钥、额度 | [账户](/radeon-cloud-docs/zh-cn/api/account/) |
| Model API 用量和配额 | [用量](/radeon-cloud-docs/zh-cn/api/usage/) |

## 从哪开始

接着读[认证](/radeon-cloud-docs/zh-cn/api/authentication/)——两半的认证方式不同，这一点比这套 API 里的任何其他东西都更容易把人绊倒。
