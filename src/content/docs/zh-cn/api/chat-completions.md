---
title: 聊天补全
description: 根据对话生成模型回复——兼容 OpenAI。
sidebar:
  order: 4
---

主要的推理端点，遵循 OpenAI 的聊天补全 schema。

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
| `messages` | array | <span class="rc-req">必填</span> | 到目前为止的对话。每一项有一个 `role`（`system`、`user` 或 `assistant`）和 `content`。 |
| `stream` | boolean | <span class="rc-opt">选填</span> | 以 server-sent events 流式返回。默认 `false`。 |
| `temperature` | number | <span class="rc-opt">选填</span> | 采样温度。越高越随机。 |
| `top_p` | number | <span class="rc-opt">选填</span> | 核采样阈值。 |
| `max_tokens` | integer | <span class="rc-opt">选填</span> | 回复生成的 token 上限。 |
| `stop` | string 或 array | <span class="rc-opt">选填</span> | 终止生成的序列。 |
| `presence_penalty` | number | <span class="rc-opt">选填</span> | 惩罚已出现过的 token。 |
| `frequency_penalty` | number | <span class="rc-opt">选填</span> | 按出现频次惩罚 token。 |
| `seed` | integer | <span class="rc-opt">选填</span> | 尽力而为的可复现性。 |
| `tools` | array | <span class="rc-opt">选填</span> | 工具定义，前提是模型支持工具调用。 |

请求体会原样传给服务后端，所以后端认的任何参数都能送到。某个模型认哪些参数，写在它 Token Factory 卡片的「支持的参数」里——模型不认的参数会被悄悄丢掉，而不是报错。

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

一个非流式请求最多跑 10 分钟，之后平台放弃。长生成应该用流式，既能看到进度，也能让连接保持活跃。

## 错误

`401` 密钥无效。`429` 触发限流——见[限流](/radeon-cloud-docs/zh-cn/api/rate-limits/)。`502` 或 `503` 后端不可达或已饱和，退避后重试。模型自己报的错，比如模型名不存在或上下文超长，会带着后端自己的状态码和消息透传出来。
