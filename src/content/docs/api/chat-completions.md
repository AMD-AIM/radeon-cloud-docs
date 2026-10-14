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
| `response_format` | object | <span class="rc-opt">Optional</span> | JSON object mode and strict JSON Schema are separate capabilities. Check the model page; the two MiniCPM-V4.7 shared endpoints support `json_object`, not `json_schema`. |
| `tools` | array | <span class="rc-opt">Optional</span> | Tool definitions, if the model supports tool calling. |
| `tool_choice` | string or object | <span class="rc-opt">Optional</span> | Which tool the model may or must call. |
| `reasoning_effort` | string | <span class="rc-opt">Optional</span> | Controls thinking effort on models that support this parameter. Accepted tiers and defaults vary per model — see below. This request parameter is separate from the response's `reasoning` text field. |
| `reasoning.effort` | string | <span class="rc-opt">Optional</span> | Same thing, unified form. Cannot be combined with `reasoning_effort`. |
| `chat_template_kwargs.enable_thinking` | boolean | <span class="rc-opt">Optional</span> | Verified model-specific switch for [MiniCPM-V-4.7-1B](/radeon-cloud-docs/models/minicpm-v4-7-1b/) and [MiniCPM-V-4.7-35B-A3B](/radeon-cloud-docs/models/minicpm-v4-7-35b-a3b/). Defaults to `false`; Python SDK callers use `extra_body`. Do not assume the same control for other models. |

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
For models that support effort control, use **`reasoning_effort`** or the equivalent
**`reasoning.effort`**. Check the selected model's controls and defaults rather than assuming
one setting works for every model.

```json
{
  "model": "DeepSeek-V4-Flash",
  "reasoning_effort": "high",
  "messages": [{ "role": "user", "content": "..." }]
}
```

The thinking text comes back in `choices[].message.reasoning` for non-streaming responses and
`choices[].delta.reasoning` for SSE. The final answer is in the corresponding `content` field.
See [Thinking response fields](#thinking-response-fields) for parsing and token-count handling.

**Omitting `reasoning_effort` does not mean no thinking.** The default differs per model:

| Model | When omitted |
|---|---|
| DeepSeek-V4-Flash | Does not think (`reasoning` empty, `reasoning_tokens` 0) |
| DeepSeek-V4-Flash-Vision-Exp | Does not think |
| DeepSeek-V4.1-Flash | Does not think |
| Qwen3.8-Flash-Next | **Still thinks** — the default tier is `xhigh`, the longest one |
| Qwen3.8-27B | **Still thinks** — the default tier is `xhigh` |
| GLM-5.3-Flash | **Still thinks** |
| MiniCPM5-2B | Does not think |

Pass the value explicitly if you want deterministic behaviour; send `low` to make the Qwen models
and GLM-5.3-Flash think less.

**Which tiers a model accepts differs per model:**

| Model | Accepted values |
|---|---|
| DeepSeek-V4-Flash | `none` `minimal` `low` `medium` `high` `xhigh` `max` |
| DeepSeek-V4-Flash-Vision-Exp | `none` `minimal` `low` `medium` `high` `xhigh` `max` |
| DeepSeek-V4.1-Flash | `none` `minimal` `low` `medium` `high` `xhigh` `max` |
| Qwen3.8-Flash-Next | `none` `low` `medium` `xhigh` |
| Qwen3.8-27B | `low` `medium` `xhigh` |
| GLM-5.3-Flash | `low` `medium` `high` |
| MiniCPM5-2B | not applicable — answers directly |

For the models listed with effort control above, `low` and `medium` are common tiers;
do not infer support for other models or model-specific controls. The name of the top tier is
not portable: Qwen3.8-27B returns 400 for `high`, while GLM-5.3-Flash returns 422 for `xhigh`.
Do not send both `reasoning_effort` and `reasoning.effort` in one request. The full matrix is in
the [model reference](/radeon-cloud-docs/models/overview/).
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
The request is validated and **rebuilt field by field** before it reaches the serving backend.
It is not a general passthrough: undeclared fields may be removed silently, while some unsupported
controls are explicitly rejected. The documented MiniCPM-V4.7 `chat_template_kwargs` switch is
a specific forwarding path, not permission to pass arbitrary engine options.

That includes some parameters an OpenAI or vLLM client would reasonably expect to work:
`stop`, `seed`, `logit_bias`, `logprobs`, `top_logprobs`, `top_k`, `min_p`, and
`repetition_penalty`. `parallel_tool_calls` and `mm_processor_kwargs` are also not forwarded;
in particular, do not expect a MiniCPM-V4.7 4x override or a single-call restriction to take effect.
If you need backend-native options, run a
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

Reasoning-token details depend on the model and response — see below. A prompt-cache hit can
add `usage.prompt_tokens_details.cached_tokens`.

## Thinking response fields

**On this shared chat endpoint, read thinking text from `reasoning`, not `reasoning_content`.**
The gateway normalizes the backend's thinking field; this is the existing response convention,
not an additional thinking mode. A dedicated endpoint can retain its backend's native field names.

| Response | Thinking text | Final-answer text |
|---|---|---|
| Non-streaming | `choices[].message.reasoning` | `choices[].message.content` |
| Streaming SSE | `choices[].delta.reasoning` | `choices[].delta.content` |

- Either field can be absent, `null`, or empty. Not every model or request produces thinking,
  and not every chunk contains text. Do not treat a missing `reasoning_content` as missing thinking.
- For SSE, append non-empty string deltas separately for each `choices[].index`. Keep thinking
  separate from the final answer; do not concatenate both into the user-facing answer.
- A usage-only chunk can have `choices: []`. When using an SDK, iterate over `chunk.choices`
  instead of assuming `choices[0]` exists. Raw SSE finishes with `data: [DONE]`.
- `reasoning` is a gateway extension to the OpenAI-compatible response. With the Python OpenAI
  SDK, use `getattr(delta, "reasoning", None)` or `getattr(message, "reasoning", None)` to read
  it safely. Clients that only recognize `reasoning_content` need to read `reasoning` instead;
  the shared endpoint does not promise a populated `reasoning_content` alias.

For counts, use `usage.completion_tokens_details.reasoning_tokens` when present; some responses
instead or additionally expose `usage.reasoning_tokens`. If both are present, do not add them
together. If neither is present, the separate thinking-token count is unavailable, not necessarily
zero. Keep `completion_tokens` and `total_tokens` as returned — do not add thinking counts again
or estimate token counts from the length of the text. These counts are not the thinking text itself.

The output convention does not imply that every model accepts the same enable/disable switch,
effort tiers, or thinking-token budget. See the model-specific controls above.

## Streaming

Set `stream: true` to receive server-sent events. Each event carries a delta rather than the whole message, and the stream ends with `data: [DONE]`.

```python
import os

from openai import OpenAI

client = OpenAI(
    base_url="https://developer.amd.com.cn/radeon/api/v1",
  api_key=os.environ["RADEON_API_KEY"],
)

stream = client.chat.completions.create(
    model="DeepSeek-V4-Flash",
    messages=[{"role": "user", "content": "Explain ROCm in two sentences."}],
  reasoning_effort="high",  # Choose a value supported by the selected model.
    stream=True,
  stream_options={"include_usage": True},
)

thinking_by_choice = {}
answer_by_choice = {}
usage = None

for chunk in stream:
  if chunk.usage is not None:
    usage = chunk.usage
  for choice in chunk.choices:
    delta = choice.delta
    thinking = getattr(delta, "reasoning", None)
    if isinstance(thinking, str) and thinking:
      thinking_by_choice.setdefault(choice.index, []).append(thinking)
    if isinstance(delta.content, str) and delta.content:
      answer_by_choice.setdefault(choice.index, []).append(delta.content)

# Final answer only; keep thinking_by_choice for a separate optional display.
print("".join(answer_by_choice.get(0, [])))
if usage is not None:
  print(usage.model_dump(exclude_none=True))
```

The dictionaries accumulate incremental chunks as they arrive. An interactive client can display
each new `reasoning` or `content` fragment immediately in separate UI areas. The SDK handles
the `[DONE]` marker; the loop also tolerates usage-only chunks with no choices.

## Timeouts

A non-streaming request can take up to 10 minutes before the platform gives up. When streaming, the same 10 minutes applies to the gap between chunks rather than to the whole generation. Long generations should stream, both so you see progress and so the connection stays active.

## Errors

`401` invalid key. `429` rate limited — see [Rate limits](/radeon-cloud-docs/api/rate-limits/). `502` or `503` the backend is unreachable or saturated; retry with backoff.

A model name that isn't in the catalog is rejected by the gateway with `400` and
`Requested model <name> not supported` — the request never reaches a backend. Errors the model
itself raises, such as a context-length overflow, are passed through with the backend's own
status and message. See [Errors](/radeon-cloud-docs/api/errors/) for the response shapes.
