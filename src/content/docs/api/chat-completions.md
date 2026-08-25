---
title: Chat completions
description: Generate a model response from a conversation — OpenAI-compatible.
sidebar:
  order: 4
---

The main inference endpoint. It follows OpenAI's chat completions schema.

<div class="rc-endpoint">
  <span class="rc-method" data-m="POST">POST</span>
  <span class="rc-path">/v1/chat/completions</span>
  <span class="rc-auth">Bearer key or session</span>
</div>

Also reachable at `/api/v1/chat/completions` — the two paths are the same endpoint.

## Request

| Parameter | Type | | Description |
|---|---|---|---|
| `model` | string | <span class="rc-req">Required</span> | Model to run. Must be one returned by [`GET /v1/models`](/radeon-cloud-docs/api/models/). |
| `messages` | array | <span class="rc-req">Required</span> | Conversation so far. Each item has a `role` (`system`, `user`, or `assistant`) and `content`. |
| `stream` | boolean | <span class="rc-opt">Optional</span> | Stream the response as server-sent events. Defaults to `false`. |
| `temperature` | number | <span class="rc-opt">Optional</span> | Sampling temperature. Higher is more random. |
| `top_p` | number | <span class="rc-opt">Optional</span> | Nucleus sampling threshold. |
| `max_tokens` | integer | <span class="rc-opt">Optional</span> | Cap on tokens generated in the response. |
| `stop` | string or array | <span class="rc-opt">Optional</span> | Sequences that end generation. |
| `presence_penalty` | number | <span class="rc-opt">Optional</span> | Penalises tokens already present. |
| `frequency_penalty` | number | <span class="rc-opt">Optional</span> | Penalises tokens by how often they've appeared. |
| `seed` | integer | <span class="rc-opt">Optional</span> | Best-effort reproducibility. |
| `tools` | array | <span class="rc-opt">Optional</span> | Tool definitions, if the model supports tool calling. |

The request body is passed to the serving backend unchanged, so any parameter that backend accepts will reach it. Which parameters a given model honours is listed in its Token Factory card under supported parameters — a parameter the model ignores is silently dropped rather than rejected.

## Example

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

## Response

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

`finish_reason` is `stop` when the model finished on its own, `length` when it hit `max_tokens`, and `tool_calls` when it wants a tool invoked.

## Streaming

Set `stream: true` to receive server-sent events. Each event carries a delta rather than the whole message, and the stream ends with `data: [DONE]`.

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

Streaming responses aren't buffered by the platform, so tokens arrive as the model produces them.

## Timeouts

A non-streaming request can take up to 10 minutes before the platform gives up. Long generations should stream, both so you see progress and so the connection stays active.

## Errors

`401` invalid key. `429` rate limited — see [Rate limits](/radeon-cloud-docs/api/rate-limits/). `502` or `503` the backend is unreachable or saturated; retry with backoff. Errors from the model itself, such as an unknown model name or a context-length overflow, are passed through with the backend's own status and message.
