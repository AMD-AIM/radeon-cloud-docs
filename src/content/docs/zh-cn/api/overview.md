---
title: API 概览
description: 基础 URL、约定，以及 AMD Radeon Cloud API 提供了什么。
sidebar:
  order: 1
---

AMD Radeon Cloud API 分成两半，在脑子里分开看会清楚很多。

**Model API** 负责跑推理。它有两种形态，控制台里叫 **Public Free Model APIs** 和 **Dedicated Model APIs**。两者共用一把密钥和一套 HTTP 形状，此外几乎没有共同点——主机不同、关卡不同、错误体也不同——所以本参考把它们分开写，每一页都会写明讲的是哪一种。

**Platform API** 管理模板、实例和账户。控制台调的就是它，你也可以自己驱动它，把启动和销毁写成脚本。

## 基础 URL

| 接口 | 基础 URL |
|---|---|
| Public Free Model APIs | `https://developer.amd.com.cn/radeon/api/v1` |
| Dedicated Model APIs | `https://<host>/spaces/<instance-id>/<port>/v1` |
| Platform API | `https://radeon-global.anruicloud.com` |

独占的基础 URL 在实例启动时生成，会显示在启动对话框和 **Active Instance** 里。别自己拼——端口取决于服务栈（vLLM 是 8000，SGLang 是 30000）。

:::note[部署环境不止一套]
AMD Radeon Cloud 背后有多个主机名。上面这些是撰写时的公开地址；始终优先用控制台给你的基础 URL，而不是写死的字符串。
:::

## 约定

请求和响应都是 JSON，`Content-Type: application/json`。时间戳是 ISO 8601。出错时返回非 2xx 状态和一个 JSON 体——见[错误](/radeon-cloud-docs/zh-cn/api/errors/)。

## Public Free Model APIs

常开，不用起实例，不花额度。上哪些模型由 AMD 决定。五个操作：

- [`POST /v1/chat/completions`](/radeon-cloud-docs/zh-cn/api/chat-completions/) —— 兼容 OpenAI
- [`GET /v1/models`](/radeon-cloud-docs/zh-cn/api/models/)
- [`POST /v1/messages`](/radeon-cloud-docs/zh-cn/api/messages/) —— 兼容 Anthropic，供 Claude Code 这类客户端使用
- [`POST /v1/messages/count_tokens`](/radeon-cloud-docs/zh-cn/api/messages/#计算-token) —— 这类客户端发起的 token 计数预检
- [`POST /v1/ocr`](/radeon-cloud-docs/zh-cn/models/mineru2-5-pro/) —— 文档 OCR，收 PDF 或图片，返回 Markdown

每条路径同样可以用 `/api/v1/...` 访问，两种写法是同一个端点。

旧版 completions、embeddings、图像、音频、rerank 以及 `/v1/responses` 这里**不提供**，会返回 `404`。
这说的是独立端点：音频仍可以作为 `input_audio` 内容块走 `/v1/chat/completions`，
[MiMo-V2.6-Flash](/radeon-cloud-docs/zh-cn/models/mimo-v2-6-flash/) 接受这种输入。

这些请求要过一层网关。请求体先按一组固定字段校验、再重建，然后才送往服务后端——所以这组字段之外的参数是被丢掉而不是被转发的，接受的字段清单见[聊天补全](/radeon-cloud-docs/zh-cn/api/chat-completions/)。按密钥的限流、并发额度和花费上限都生效，见[限流](/radeon-cloud-docs/zh-cn/api/rate-limits/)。

## Dedicated Model APIs

跑在你自己启动、自己花额度的实例上的 vLLM 或 SGLang。模型和服务参数都由你定。

请求会剥掉路由前缀后原样转发给你的服务器，所以那台服务器实现了什么就有什么——通常包括 `/v1/completions` 和 `/v1/embeddings`，也没有共享端点那套参数过滤。这条路上没有网关，所以共享端点的限流、共享目录和共享错误体统统不适用。

见[独占端点](/radeon-cloud-docs/zh-cn/api/dedicated-endpoints/)。

## Platform API 提供什么

| 范围 | 参考 |
|---|---|
| 启动、查看、销毁实例 | [实例](/radeon-cloud-docs/zh-cn/api/instances/) |
| 创建和管理模板 | [模板](/radeon-cloud-docs/zh-cn/api/templates/) |
| 资料、API 密钥、SSH 密钥、额度 | [账户](/radeon-cloud-docs/zh-cn/api/account/) |
| Model API 用量和配额 | [用量](/radeon-cloud-docs/zh-cn/api/usage/) |

## 从哪开始

接着读[认证](/radeon-cloud-docs/zh-cn/api/authentication/)——两半的认证方式不同，这一点比这套 API 里的任何其他东西都更容易把人绊倒。
