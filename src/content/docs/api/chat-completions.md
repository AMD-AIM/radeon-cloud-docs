---
title: Chat completions
description: Generate a model response from a conversation — OpenAI-compatible.
sidebar:
  order: 4
---

The main inference endpoint on the **Public Free Model APIs**. It follows OpenAI's chat
completions schema. A [dedicated endpoint](/radeon-cloud-docs/api/dedicated-endpoints/) serves
the same path from your own vLLM or SGLang, and none of the request filtering below applies
there.

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
| `messages` | array | <span class="rc-req">Required</span> | Conversation so far. Each item has a `role` (`system`, `user`, `assistant`, or `tool`) and `content`. |
| `stream` | boolean | <span class="rc-opt">Optional</span> | Stream the response as server-sent events. Defaults to `false`. |
| `temperature` | number | <span class="rc-opt">Optional</span> | Sampling temperature. Higher is more random. |
| `top_p` | number | <span class="rc-opt">Optional</span> | Nucleus sampling threshold. |
| `max_tokens` | integer | <span class="rc-opt">Optional</span> | Cap on tokens generated in the response. |
| `presence_penalty` | number | <span class="rc-opt">Optional</span> | Penalises tokens already present. |
| `frequency_penalty` | number | <span class="rc-opt">Optional</span> | Penalises tokens by how often they've appeared. |
| `response_format` | object | <span class="rc-opt">Optional</span> | `{"type": "json_object"}` or a `json_schema`, on models where `json_output` is true. |
| `tools` | array | <span class="rc-opt">Optional</span> | Tool definitions, if the model supports tool calling. |
| `tool_choice` | string or object | <span class="rc-opt">Optional</span> | Which tool the model may or must call. |
| `reasoning_effort` | string | <span class="rc-opt">Optional</span> | Reasoning budget on models that declare support for it. |

:::caution[Unlisted parameters are dropped, not forwarded]
The request is validated against the schema above and then **rebuilt field by field** before it
reaches the serving backend. Anything outside the accepted set is removed silently — no error,
no effect.

That includes some parameters an OpenAI or vLLM client would reasonably expect to work:
`stop`, `seed`, `logit_bias`, `logprobs`, `top_logprobs`, `top_k`, `min_p`, and
`repetition_penalty`. If you need any of them, run a
[dedicated endpoint](/radeon-cloud-docs/api/dedicated-endpoints/), which passes your body
straight to vLLM or SGLang.
:::

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

Reasoning models add `reasoning_tokens` to `usage`, and a prompt-cache hit adds
`usage.prompt_tokens_details.cached_tokens`.

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

A non-streaming request can take up to 10 minutes before the platform gives up. When streaming, the same 10 minutes applies to the gap between chunks rather than to the whole generation. Long generations should stream, both so you see progress and so the connection stays active.

## Errors

`401` invalid key. `429` rate limited — see [Rate limits](/radeon-cloud-docs/api/rate-limits/). `502` or `503` the backend is unreachable or saturated; retry with backoff.

A model name that isn't in the catalog is rejected by the gateway with `400` and
`Requested model <name> not supported` — the request never reaches a backend. Errors the model
itself raises, such as a context-length overflow, are passed through with the backend's own
status and message. See [Errors](/radeon-cloud-docs/api/errors/) for the response shapes.
