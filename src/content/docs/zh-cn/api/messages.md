---
title: Messages（Anthropic）
description: 用 Claude Code 这类 Anthropic 客户端调用免费共享模型。
sidebar:
  order: 5
---

**Public Free Model APIs** 也能通过 Anthropic 的 Messages API 访问，所以照着 Claude 写的客户端——Claude Code、`anthropic` SDK、任何讲这套协议的东西——改掉基础 URL 和密钥就能用。

这套接口属于共享模型前面那层网关。[独占端点](/radeon-cloud-docs/zh-cn/api/dedicated-endpoints/)是你自己的 vLLM 或 SGLang，那两个都不讲 Anthropic 协议，所以 `/v1/messages` 在那边是 `404`。

<div class="rc-endpoint">
  <span class="rc-method" data-m="POST">POST</span>
  <span class="rc-path">/v1/messages</span>
  <span class="rc-auth">Bearer 密钥或 x-api-key</span>
</div>

也可以通过 `/api/v1/messages` 访问。

:::note[模型名来自本平台]
发 [`GET /v1/models`](/radeon-cloud-docs/zh-cn/api/models/) 返回的 `id`，不是 Anthropic 的模型名。`claude-3-5-sonnet-20241022` 这里不提供，会以 `400` 拒掉。
:::

## 请求

| 参数 | 类型 | | 说明 |
|---|---|---|---|
| `model` | string | <span class="rc-req">必填</span> | 要跑的模型，取自共享目录。 |
| `messages` | array | <span class="rc-req">必填</span> | 到目前为止的对话，用 Anthropic 的块格式。 |
| `max_tokens` | integer | <span class="rc-req">必填</span> | 生成的 token 上限。Anthropic 要求必填，网关也一样。 |
| `system` | string 或 array | <span class="rc-opt">选填</span> | 系统提示词，可以是字符串，也可以是一组 text 块。 |
| `temperature` | number | <span class="rc-opt">选填</span> | 采样温度，`0` 到 `1`。是 Anthropic 的取值范围，不是 OpenAI 的——填 `1.5` 会被 `400` 拒掉。 |
| `stream` | boolean | <span class="rc-opt">选填</span> | 以 server-sent events 流式返回。默认 `false`。 |
| `tools` | array | <span class="rc-opt">选填</span> | 工具定义，前提是模型支持工具调用。 |
| `thinking` | object | <span class="rc-opt">选填</span> | 扩展思考配置，会映射到后端认识的推理控制项上。 |
| `output_config` | object | <span class="rc-opt">选填</span> | `effort` 控制支持该能力的模型的自适应推理深度。 |
| `metadata` | object | <span class="rc-opt">选填</span> | `user_id` 用于粘性路由。Claude Code 把它的会话 id 放在这里。 |

:::caution[清单之外的参数会被丢掉，不是透传]
和[聊天补全](/radeon-cloud-docs/zh-cn/api/chat-completions/)一样，请求先按上面这组字段校验，再重建后才送往后端。`top_p`、`top_k`、`stop_sequences` 不在这组里，会被静默移除。
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

`/v1/messages` 是 SDK 自己拼上去的，所以 `base_url` 写到 `/api` 就停。

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

`stop_reason` 是 `end_turn`、`max_tokens`、`tool_use`、`refusal` 四个之一。它由后端那边 OpenAI 风格的 `finish_reason` 换算而来，认不出来的一律归为 `end_turn`。`stop_sequence` 恒为 `null`，因为停止序列压根就不会被转发。推理模型会在 `content` 里和 `text` 块一起给出 `thinking` 块。

## 计算 token

<div class="rc-endpoint">
  <span class="rc-method" data-m="POST">POST</span>
  <span class="rc-path">/v1/messages/count_tokens</span>
  <span class="rc-auth">Bearer 密钥或 x-api-key</span>
</div>

Anthropic SDK 在发请求前会先调它估算大小。请求体和 `/v1/messages` 一样，返回：

```json
{ "input_tokens": 24 }
```

`system` 和 `tools` 都算进去了，因为这两样都按输入计费。

:::caution[这是个估算值]
这个数来自网关自己的 tokenizer，不是问将要服务该请求的模型要的。它和 `/v1/messages` 返回的 `usage.input_tokens` 对不上，也不是 Anthropic 官方的计数。拿它来估算大小可以，别拿来对账——权威数字在真实响应的 `usage` 块里。
:::

## 错误

两条路径的错误都用 Anthropic 的信封，SDK 的错误处理不用改：

```json
{
  "type": "error",
  "error": {
    "type": "authentication_error",
    "message": "Unauthorized: No API key provided."
  }
}
```

网关前面那层**平台**拒掉的请求——密钥无效、准入控制——则是包在 `detail` 里的。见[错误](/radeon-cloud-docs/zh-cn/api/errors/)。

限流和 `/v1/chat/completions` 共用：两者落在同一份后端容量上，也计入同一批按密钥的关卡。见[限流](/radeon-cloud-docs/zh-cn/api/rate-limits/)。
