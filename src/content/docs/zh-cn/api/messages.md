---
title: Messages（Anthropic）
description: 用 Claude Code 等 Anthropic 客户端调用 Token Factory 里的模型。
sidebar:
  order: 5
---

**Token Factory** 也能通过 Anthropic 的 Messages API 访问，为 Claude 开发的客户端，例如 Claude Code 和 `anthropic` SDK，只要换掉 base URL 和 API Key 就能使用。

这组接口由 Token Factory 的网关提供。实例上的[模型服务](/radeon-cloud-docs/zh-cn/api/model-services/)是你自己的 vLLM 服务，那边能不能用 `/v1/messages`，取决于它运行的 vLLM 版本。

<div class="rc-endpoint">
  <span class="rc-method" data-m="POST">POST</span>
  <span class="rc-path">/v1/messages</span>
  <span class="rc-auth">API Key（Bearer 或 x-api-key）</span>
</div>

也可以通过 `/api/v1/messages` 访问。

:::note[模型名来自本平台]
请使用 [`GET /v1/models`](/radeon-cloud-docs/zh-cn/api/models/) 返回的 `id`，而不是 Anthropic 的模型名。这里不提供 `claude-3-5-sonnet-20241022` 这类模型，请求会返回 `400`。
:::

## 请求

| 参数 | 类型 | | 说明 |
|---|---|---|---|
| `model` | string | <span class="rc-req">必填</span> | 要调用的模型，取自 Token Factory 的模型列表。 |
| `messages` | array | <span class="rc-req">必填</span> | 到目前为止的对话，用 Anthropic 的块格式。 |
| `max_tokens` | integer | <span class="rc-req">必填</span> | 生成的 token 上限。Anthropic 要求必填，网关也一样。 |
| `system` | string 或 array | <span class="rc-opt">选填</span> | 系统提示词，可以是字符串，也可以是一组 text 块。 |
| `temperature` | number | <span class="rc-opt">选填</span> | 采样温度，`0` 到 `1`。这是 Anthropic 的取值范围，不是 OpenAI 的，填 `1.5` 会返回 `400`。 |
| `stream` | boolean | <span class="rc-opt">选填</span> | 以 server-sent events 流式返回。默认 `false`。 |
| `tools` | array | <span class="rc-opt">选填</span> | 工具定义，前提是模型支持工具调用。 |
| `thinking` | object | <span class="rc-opt">选填</span> | 扩展思考配置，会映射到后端支持的推理控制项。**带 `budget_tokens` 的写法目前会被拒绝**，见下文。 |
| `output_config` | object | <span class="rc-opt">选填</span> | `effort` 控制支持该能力的模型的自适应推理深度。取值因模型而异，已验证档位的模型都接受 `low` 和 `medium`。 |
| `metadata` | object | <span class="rc-opt">选填</span> | `user_id` 用于粘性路由。Claude Code 把它的会话 id 放在这里。 |

:::caution[不在列表里的参数会被丢弃，不会透传]
和[聊天补全](/radeon-cloud-docs/zh-cn/api/chat-completions/)一样，请求先按上面的字段校验，重建后再发往后端。`top_p`、`top_k`、`stop_sequences` 不在这组里，会被静默移除。
:::

:::danger[`budget_tokens` 式的扩展思考会被拒绝]
`thinking: {"type": "enabled", "budget_tokens": N}`（Claude Code 默认就发这个）会被映射成
`reasoning.max_tokens`。目前提供的模型**都不支持按 token 数限制思考长度**，所以会返回 400：

```json
{
  "type": "error",
  "error": {
    "type": "invalid_request_error",
    "message": "\"thinking\" is not supported for this model. Remove the \"thinking\" parameter or use a model that supports extended thinking."
  }
}
```

这是有意为之。后端引擎会静默丢弃 `budget_tokens`，如果放行，你只会得到一个没有思考过程的回答。

在这个接口上开启思考，请使用 `output_config.effort`：

```json
{
  "model": "DeepSeek-V4-Flash",
  "output_config": { "effort": "high" },
  "messages": [{ "role": "user", "content": "..." }],
  "max_tokens": 1024
}
```

思考内容会以 `thinking` 块的形式出现在 `content` 里，和 `text` 块并列。

`effort` 在内部对应 `reasoning_effort`，**可用的取值同样因模型而异**：上面的 `high` 在
DeepSeek-V4-Flash 上可用，在 Qwen3.8-Flash-Next 上会返回 400。要兼容多个模型，只用 `low` 和 `medium`，已验证档位的模型都接受这两个值。
MiniCPM-V-4.7-1B、MiniCPM-V-4.7-35B-A3B 和 Gemma-4-31B-IT 如何处理 `effort` 尚未验证。
完整对照表见 [`POST /v1/chat/completions`](/radeon-cloud-docs/zh-cn/api/chat-completions/)。

也可以改用聊天补全接口的 `reasoning_effort`。
:::

## 示例

```bash
curl https://developer.amd.com.cn/radeon/api/v1/messages \
  -H "x-api-key: $RADEON_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "DeepSeek-V4-Flash",
    "max_tokens": 256,
    "system": "You are a concise assistant.",
    "messages": [
      {"role": "user", "content": "What is ROCm?"}
    ]
  }'
```

```python
from anthropic import Anthropic

client = Anthropic(
    base_url="https://developer.amd.com.cn/radeon/api",
    api_key="rc-...",
)

message = client.messages.create(
    model="DeepSeek-V4-Flash",
    max_tokens=256,
    messages=[{"role": "user", "content": "Explain ROCm in two sentences."}],
)
print(message.content[0].text)
```

SDK 会自动加上 `/v1/messages`，所以 `base_url` 只写到 `/api`。

## 响应

```json
{
  "id": "msg_9f3b21d0-4c8a-4f2e-b7d1-2a6c38e5b190",
  "type": "message",
  "role": "assistant",
  "model": "DeepSeek-V4-Flash",
  "content": [
    { "type": "text", "text": "ROCm is AMD's open software platform for GPU computing..." }
  ],
  "stop_reason": "end_turn",
  "stop_sequence": null,
  "usage": {
    "input_tokens": 24,
    "output_tokens": 118,
    "cache_creation_input_tokens": 0,
    "cache_read_input_tokens": 0
  }
}
```

`stop_reason` 是 `end_turn`、`max_tokens`、`tool_use`、`refusal` 四个之一。它由后端 OpenAI 风格的 `finish_reason` 转换而来，无法识别的值一律归为 `end_turn`。`stop_sequence` 始终为 `null`，因为停止序列不会被转发。推理模型会在 `content` 里和 `text` 块一起给出 `thinking` 块。

## 计算 token

<div class="rc-endpoint">
  <span class="rc-method" data-m="POST">POST</span>
  <span class="rc-path">/v1/messages/count_tokens</span>
  <span class="rc-auth">API Key（Bearer 或 x-api-key）</span>
</div>

Anthropic SDK 在发请求前会先调用它估算输入大小。请求体和 `/v1/messages` 一样，返回：

```json
{ "input_tokens": 24 }
```

计数包括 `system` 和 `tools`，因为它们都算作输入。

:::caution[这是个估算值]
这个数字由网关自己的 tokenizer 计算，不是由实际处理请求的模型给出的。它和 `/v1/messages` 返回的 `usage.input_tokens` 不一致，也不是 Anthropic 官方的计数。可以用来估算大小，但不要用来对账，准确的数字以实际响应的 `usage` 为准。
:::

## 错误

两个接口的错误都采用 Anthropic 的格式，SDK 的错误处理无需修改：

```json
{
  "type": "error",
  "error": {
    "type": "authentication_error",
    "message": "Unauthorized: No API key provided."
  }
}
```

网关之前的 **平台** 拒绝的请求（例如 API Key 无效、准入控制）则放在 `detail` 里。见[错误](/radeon-cloud-docs/zh-cn/api/errors/)。

限流和 `/v1/chat/completions` 共用：两者使用同一份后端容量，也计入同样的按 API Key 的限制。见[限流](/radeon-cloud-docs/zh-cn/api/rate-limits/)。
