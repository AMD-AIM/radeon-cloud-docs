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
| `messages` | array | <span class="rc-req">Required</span> | Conversation so far. Each item has a `role` (`system`, `user`, `assistant`, or `tool`) and `content`. **Where a `system` message may sit differs per model — see below.** |
| `stream` | boolean | <span class="rc-opt">Optional</span> | Stream the response as server-sent events. Defaults to `false`. |
| `temperature` | number | <span class="rc-opt">Optional</span> | Sampling temperature. Higher is more random. |
| `top_p` | number | <span class="rc-opt">Optional</span> | Nucleus sampling threshold. |
| `max_tokens` | integer | <span class="rc-opt">Optional</span> | Cap on tokens generated in the response. |
| `presence_penalty` | number | <span class="rc-opt">Optional</span> | Penalises tokens already present. |
| `frequency_penalty` | number | <span class="rc-opt">Optional</span> | Penalises tokens by how often they've appeared. |
| `response_format` | object | <span class="rc-opt">Optional</span> | `{"type": "json_object"}` or a `json_schema`, on models where `json_output` is true. |
| `tools` | array | <span class="rc-opt">Optional</span> | Tool definitions, if the model supports tool calling. |
| `tool_choice` | string or object | <span class="rc-opt">Optional</span> | Which tool the model may or must call. |
| `reasoning_effort` | string | <span class="rc-opt">Optional</span> | Controls thinking length. Accepted tiers vary per model — see the table below; `low` and `medium` work everywhere. **Whether omitting it disables thinking also varies per model.** |
| `reasoning.effort` | string | <span class="rc-opt">Optional</span> | Same thing, unified form. Cannot be combined with `reasoning_effort`. |

:::caution[`messages`: roles and system-message placement differ per model]
The accepted `role` set is `system`, `user`, `assistant`, `tool`. **`developer` — the role newer
OpenAI SDKs emit in place of `system` — is not accepted by every model**, and neither is a `system`
message anywhere other than first.

| `messages` shape | Accepted by |
|---|---|
| one `system` message at index `0`, role spelled `system` | **every model** |

```json
"messages": [
  { "role": "system", "content": "Answer in one sentence." },
  { "role": "user",   "content": "Why is the sky blue?" }
]
```

Some models are more permissive than that — per-model detail is on the
[model reference pages](/radeon-cloud-docs/models/overview/).
:::

:::tip[How to turn thinking on]
On this endpoint, **`reasoning_effort` (or the equivalent `reasoning.effort`) is the only way**
to enable thinking.

```json
{
  "model": "DeepSeek-V4-Flash",
  "reasoning_effort": "high",
  "messages": [{ "role": "user", "content": "..." }]
}
```

The thinking text comes back in `choices[0].message.reasoning` (not `reasoning_content`). For the
token count use **`usage.completion_tokens_details.reasoning_tokens`** — every model reports it.
The top-level `usage.reasoning_tokens` is only emitted by some models (both DeepSeek models and
Qwen3.8-Flash-Next have it; MiniCPM5-2B does not), so do not rely on it.

**Omitting `reasoning_effort` does not mean no thinking.** The default differs per model:

| Model | When omitted |
|---|---|
| DeepSeek-V4-Flash | Does not think (`reasoning` empty, `reasoning_tokens` 0) |
| Qwen3.8-Flash-Next | **Still thinks** — the default tier is `xhigh`, the longest one |

Pass the value explicitly if you want deterministic behaviour; send `low` to make
Qwen3.8-Flash-Next think less.

**Which tiers a model accepts differs per model:**

| Model | Accepted values |
|---|---|
| DeepSeek-V4-Flash | `none` `minimal` `low` `medium` `high` `xhigh` `max` |
| DeepSeek-V4-Flash-Vision-Exp | `none` `minimal` `low` `medium` `high` `xhigh` `max` |
| Qwen3.8-Flash-Next | `none` `low` `medium` `xhigh` |
| MiniCPM5-2B | not applicable — answers directly |

For one code path across all models, **stick to `low` and `medium`** — those are the only two
every model accepts. Note that the name of the top tier is not portable: Qwen3.8-Flash-Next uses
`xhigh`, MiniCPM5-2B uses `high`. The full matrix is in the
[model reference](/radeon-cloud-docs/models/overview/).

There are also fewer effective tiers than enum values: on DeepSeek-V4-Flash, `minimal`/`low`/`medium`
think about the same amount, while `high`/`max` think noticeably longer — two tiers in practice.
:::

:::danger[Do not use `thinking` — it has no effect]
Some clients (Anthropic-flavored ones in particular) send
`thinking: {"type": "enabled", "budget_tokens": N}` to enable thinking. **This endpoint does not
support it**, and the serving backend has no notion of a token budget for thinking either.

`thinking` and `reasoning.enabled` now return **400**, with the error naming the parameter that
does work:

```json
{
  "error": {
    "message": "\"thinking\" is not supported on /v1/chat/completions and was not applied. Use \"reasoning_effort\" (or \"reasoning.effort\") to control thinking.",
    "type": "invalid_request_error",
    "code": "unsupported_parameter"
  }
}
```

An error beats a silent drop: these requests used to return 200 with no thinking at all, which is
hard for a caller to notice.

If you must speak Anthropic, the working control on
[`POST /v1/messages`](/radeon-cloud-docs/api/messages/) is `output_config: {"effort": "high"}`;
`thinking` is rejected there too.
:::

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
