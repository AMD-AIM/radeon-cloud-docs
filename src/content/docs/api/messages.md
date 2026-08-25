---
title: Messages (Anthropic)
description: Call the free shared models with an Anthropic-compatible client such as Claude Code.
sidebar:
  order: 5
---

The **Public Free Model APIs** are also reachable through Anthropic's Messages API, so a client
built against Claude — Claude Code, the `anthropic` SDK, anything speaking that protocol —
works by changing the base URL and the key.

This surface belongs to the gateway in front of the shared models. A
[dedicated endpoint](/radeon-cloud-docs/api/dedicated-endpoints/) is your own vLLM or SGLang,
neither of which speaks the Anthropic protocol, so `/v1/messages` is a `404` there.

<div class="rc-endpoint">
  <span class="rc-method" data-m="POST">POST</span>
  <span class="rc-path">/v1/messages</span>
  <span class="rc-auth">Bearer key or x-api-key</span>
</div>

Also reachable at `/api/v1/messages`.

:::note[Model names come from this platform]
Send an `id` from [`GET /v1/models`](/radeon-cloud-docs/api/models/), not an Anthropic model
name. `claude-3-5-sonnet-20241022` is not served here and will be rejected with `400`.
:::

## Request

| Parameter | Type | | Description |
|---|---|---|---|
| `model` | string | <span class="rc-req">Required</span> | Model to run, from the shared catalog. |
| `messages` | array | <span class="rc-req">Required</span> | Conversation so far, in Anthropic's block format. |
| `max_tokens` | integer | <span class="rc-req">Required</span> | Cap on tokens generated. Anthropic requires this; so does the gateway. |
| `system` | string or array | <span class="rc-opt">Optional</span> | System prompt, as a string or as an array of text blocks. |
| `temperature` | number | <span class="rc-opt">Optional</span> | Sampling temperature, `0` to `1`. Anthropic's range, not OpenAI's — `1.5` is rejected with `400`. |
| `stream` | boolean | <span class="rc-opt">Optional</span> | Stream the response as server-sent events. Defaults to `false`. |
| `tools` | array | <span class="rc-opt">Optional</span> | Tool definitions, if the model supports tool calling. |
| `thinking` | object | <span class="rc-opt">Optional</span> | Extended-thinking configuration. Mapped onto the reasoning controls the backend understands. |
| `output_config` | object | <span class="rc-opt">Optional</span> | `effort` controls adaptive reasoning depth on models that support it. |
| `metadata` | object | <span class="rc-opt">Optional</span> | `user_id` is used for sticky routing. Claude Code puts its session id here. |

:::caution[Unlisted parameters are dropped, not forwarded]
As on [chat completions](/radeon-cloud-docs/api/chat-completions/), the request is validated
against the set above and rebuilt before it reaches the backend. `top_p`, `top_k` and
`stop_sequences` are not in that set, so they are removed silently.
:::

## Example

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

The SDK appends `/v1/messages` itself, which is why `base_url` stops at `/api`.

## Response

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

`stop_reason` is one of `end_turn`, `max_tokens`, `tool_use`, or `refusal`. It is derived from
the backend's OpenAI-style `finish_reason`, and an unrecognised one becomes `end_turn`.
`stop_sequence` is always `null`, because stop sequences aren't forwarded in the first place.
Reasoning models emit `thinking` blocks in `content` alongside the `text` ones.

## Counting tokens

<div class="rc-endpoint">
  <span class="rc-method" data-m="POST">POST</span>
  <span class="rc-path">/v1/messages/count_tokens</span>
  <span class="rc-auth">Bearer key or x-api-key</span>
</div>

Anthropic SDKs call this before sending, to size a request. Takes the same body as
`/v1/messages` and returns:

```json
{ "input_tokens": 24 }
```

`system` and `tools` are included in the count, because both are billed as input.

:::caution[This is an estimate]
The count comes from the gateway's own tokenizer, not from the model that will serve the
request. It will not match the `usage.input_tokens` you get back from `/v1/messages`, and it
is not Anthropic's counter either. Use it for sizing, not for billing — the authoritative
numbers are in the `usage` block of the actual response.
:::

## Errors

Errors on both paths use Anthropic's envelope, so SDK error handling works unchanged:

```json
{
  "type": "error",
  "error": {
    "type": "authentication_error",
    "message": "Unauthorized: No API key provided."
  }
}
```

Refusals from the platform in front of the gateway — an invalid key, admission control — are
wrapped in `detail` instead. See [Errors](/radeon-cloud-docs/api/errors/).

Rate limits are shared with `/v1/chat/completions`: both land on the same backend capacity and
count against the same per-key gates. See [Rate limits](/radeon-cloud-docs/api/rate-limits/).
