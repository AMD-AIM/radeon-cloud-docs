---
title: 聊天补全
description: 根据对话生成模型回复——兼容 OpenAI。
sidebar:
  order: 4
---

主要的推理端点，属于 **Public Free Model APIs**，遵循 OpenAI 的聊天补全 schema。[独占端点](/radeon-cloud-docs/zh-cn/api/dedicated-endpoints/)用你自己的 vLLM 或 SGLang 提供同一条路径，下面说的请求过滤在那边一条都不适用。

<div class="rc-endpoint">
  <span class="rc-method" data-m="POST">POST</span>
  <span class="rc-path">/v1/chat/completions</span>
  <span class="rc-auth">Bearer 密钥或会话</span>
</div>

也可以通过 `/api/v1/chat/completions` 访问——两个路径是同一个端点。

## 请求

| 参数 | 类型 | | 说明 |
|---|---|---|---|
| `model` | string | <span class="rc-req">必填</span> | 要跑的模型。必须是 [`GET /v1/models`](/radeon-cloud-docs/zh-cn/api/models/) 返回的某一个。 |
| `messages` | array | <span class="rc-req">必填</span> | 到目前为止的对话。每一项有一个 `role`（`system`、`user`、`assistant` 或 `tool`）和 `content`。 |
| `stream` | boolean | <span class="rc-opt">选填</span> | 以 server-sent events 流式返回。默认 `false`。 |
| `temperature` | number | <span class="rc-opt">选填</span> | 采样温度。越高越随机。 |
| `top_p` | number | <span class="rc-opt">选填</span> | 核采样阈值。 |
| `max_tokens` | integer | <span class="rc-opt">选填</span> | 回复生成的 token 上限。 |
| `presence_penalty` | number | <span class="rc-opt">选填</span> | 惩罚已出现过的 token。 |
| `frequency_penalty` | number | <span class="rc-opt">选填</span> | 按出现频次惩罚 token。 |
| `response_format` | object | <span class="rc-opt">选填</span> | `{"type": "json_object"}` 或一个 `json_schema`，适用于 `json_output` 为 true 的模型。 |
| `tools` | array | <span class="rc-opt">选填</span> | 工具定义，前提是模型支持工具调用。 |
| `tool_choice` | string 或 object | <span class="rc-opt">选填</span> | 模型可以或必须调用哪个工具。 |
| `reasoning_effort` | string | <span class="rc-opt">选填</span> | 推理预算，适用于声明支持它的模型。 |

:::caution[清单之外的参数会被丢掉，不是透传]
请求先按上面的 schema 校验，然后在送往服务后端前**逐字段重建**。不在接受集里的字段会被静默移除——不报错，也不生效。

这里面包括一些 OpenAI 或 vLLM 客户端会合理期待能用的参数：`stop`、`seed`、`logit_bias`、
`logprobs`、`top_logprobs`、`top_k`、`min_p`、`repetition_penalty`。真需要它们里的任何一个，
用[独占端点](/radeon-cloud-docs/zh-cn/api/dedicated-endpoints/)，那条路会把你的请求体直接送给 vLLM 或 SGLang。
:::

## 示例

```bash
curl https://developer.amd.com.cn/radeon/api/v1/chat/completions \
  -H "Authorization: Bearer $RADEON_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "DeepSeek-V4-Flash",
    "messages": [
      {"role": "system", "content": "You are a concise assistant."},
      {"role": "user", "content": "What is ROCm?"}
    ],
    "temperature": 0.7,
    "max_tokens": 256
  }'
```

## 响应

```json
{
  "id": "chatcmpl-8f3b21d0",
  "object": "chat.completion",
  "created": 1756108800,
  "model": "DeepSeek-V4-Flash",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "ROCm is AMD's open software platform for GPU computing..."
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 24,
    "completion_tokens": 118,
    "total_tokens": 142
  }
}
```

模型自己说完了，`finish_reason` 是 `stop`；撞到 `max_tokens` 是 `length`；想调用工具是 `tool_calls`。

推理模型会在 `usage` 里多一个 `reasoning_tokens`；命中前缀缓存时还会多出
`usage.prompt_tokens_details.cached_tokens`。

## 流式

设 `stream: true` 就能收到 server-sent events。每个事件带的是增量而不是整条消息，流以 `data: [DONE]` 结束。

```python
from openai import OpenAI

client = OpenAI(
    base_url="https://developer.amd.com.cn/radeon/api/v1",
    api_key="rc-...",
)

stream = client.chat.completions.create(
    model="DeepSeek-V4-Flash",
    messages=[{"role": "user", "content": "Explain ROCm in two sentences."}],
    stream=True,
)

for chunk in stream:
    delta = chunk.choices[0].delta.content
    if delta:
        print(delta, end="", flush=True)
```

平台不会缓冲流式响应，模型产出 token 的同时就送到你手上。

## 超时

一个非流式请求最多跑 10 分钟，之后平台放弃。流式的话，这 10 分钟算的是**两个分片之间的间隔**，而不是整次生成的总时长。长生成应该用流式，既能看到进度，也能让连接保持活跃。

## 错误

`401` 密钥无效。`429` 触发限流——见[限流](/radeon-cloud-docs/zh-cn/api/rate-limits/)。`502` 或 `503` 后端不可达或已饱和，退避后重试。

目录里没有的模型名由**网关**直接拒掉，返回 `400` 和 `Requested model <名字> not supported`，请求根本到不了后端。模型自己报的错，比如上下文超长，会带着后端自己的状态码和消息透传出来。响应体形状见[错误](/radeon-cloud-docs/zh-cn/api/errors/)。
