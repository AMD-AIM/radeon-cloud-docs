---
title: Hy4-flash
description: "Tencent's sparse MoE model with sliding-window and sparse-attention layers, a 1M-token context and image input. It thinks by default, and its chat template knows only two modes: off and high."
sidebar:
  order: 8.5
---

<div class="rc-endpoint">
  <span class="rc-method" data-m="POST">POST</span>
  <span class="rc-path">/v1/chat/completions</span>
  <span class="rc-auth">model: <code>Hy4-flash</code></span>
</div>

## About the model

The weights served here are **Hy4-flash** from Tencent, in its FP8 release `tencent/Hy4-flash-FP8`
— a sparse Mixture-of-Experts model that mixes two kinds of attention layer and takes images as
well as text. It thinks before answering unless you turn that off.

### Architecture

From the shipped `config.json`:

| | |
|---|---|
| Architecture | `HYV4FlashForConditionalGeneration`, `model_type = hy_v4_flash` |
| Layers | 42 — **12 sparse-attention + 30 sliding-window**; the first layer has a dense FFN, the other 41 are MoE |
| Hidden dimension | 3,072 |
| Attention | multi-head latent attention, 32 heads; query rank 1,024, KV rank 512; Q/K head 192 + 64 RoPE, V head 256; learnable attention sinks |
| Sparse attention | on the 12 sparse layers an indexer keeps the top **2,048** tokens per query |
| Sliding window | **512 tokens** |
| Mixture of Experts | 512 routed experts + 1 shared, **16 activated** per token, expert intermediate 1,536 |
| Vocabulary | 120,832 |
| Native context | 1,048,576 |
| Quantisation | FP8, `e4m3`, block `[128, 128]`, dynamic activation scaling |
| Licence | Tencent's own licence (`other` on Hugging Face) |

The vision encoder has 27 layers, hidden size 1,152, patch 16 and a 2×2 spatial merge.

## On Radeon Cloud

### At a glance

| | |
|---|---|
| Context length | 1,048,320 tokens |
| Input modalities | **text, image** |
| Streaming | ✅ |
| Tool calling | ✅ — but `tool_choice` cannot force a call, see [Tool calling](#tool-calling) |
| JSON output | ✅ `json_object` **and** `json_schema` |
| Thinking | ✅ — **on unless you send `reasoning_effort: "none"`** |
| Inference engine | SGLang |
| Stability | `experimental` |

:::note[Served at 1,048,320, not the native 1,048,576]
The weights declare 1,048,576 positions; this endpoint runs them at 1,048,320. Requests are
measured against 1,048,320.
:::

### `messages`

A `system` message may sit at any position, and there may be more than one. `role: "developer"`
is accepted and answered normally, so newer OpenAI SDK output does not need rewriting.

### Thinking

**Omitting `reasoning_effort` does not disable thinking.** A plain request already returns a
populated `reasoning`.

The model's chat template knows only **two modes: thinking off, and `high`**. On this endpoint
the OpenAI tiers land on them like this:

| `reasoning_effort` | Result |
|---|---|
| omitted | thinks |
| `none` | **does not think** — the response has no `reasoning` |
| `minimal` | **400** |
| `low` | **400** |
| `medium` | thinks |
| `high` | thinks |
| `xhigh` | thinks |
| `max` | thinks |

`reasoning: {"effort": "high"}` behaves like `reasoning_effort: "high"`.

:::caution[`low` and `minimal` are a 400 here]
Both are rejected by the model's chat template; `minimal` is reported as `low`:

```
reasoning_effort error : low, should be no_think/high
```

The template's own name for "off", `no_think`, is not accepted by the API either — the request is
rejected before it reaches the model:

```
Invalid enum value. Expected 'none' | 'minimal' | 'low' | 'medium' | 'high' | 'xhigh' | 'max', received 'no_think'
```

Send `none` to turn thinking off, and `medium` or above to keep it on.
:::

Where the output lands:

| | |
|---|---|
| Thinking text | `choices[0].message.reasoning` |
| Token count | `usage.completion_tokens_details.reasoning_tokens`, repeated at the top level as `usage.reasoning_tokens` |

:::caution[Thinking consumes your `max_tokens` budget]
Reasoning tokens are billed and counted as output. A small `max_tokens` can be spent entirely on
thinking, leaving `content` empty. Budget for both, or send `reasoning_effort: "none"`.
:::

### Image input

Images are passed as `image_url` parts, base64 data URLs included.
`usage.prompt_tokens_details.image_tokens` reports what the image cost — a 256×256 PNG came back
as 72 image tokens.

### Structured output

Both forms work:

| `response_format` | Result |
|---|---|
| `{"type": "json_object"}` | ✅ `{"a":1,"b":2}` |
| `{"type": "json_schema", "json_schema": {..., "strict": true}}` | ✅ `{"city": "Shanghai", "population_millions": 24.87}` |

### Tool calling

With `tools` and the default `tool_choice: "auto"`, the model calls a function when it decides
the question needs one — for example `get_weather({"city": "上海"})` for a weather question.

:::caution[`tool_choice` cannot force a call]
`tool_choice: "required"` and `tool_choice: {"type": "function", "function": {"name": "..."}}`
are accepted but not enforced. On a question that does not need the tool, the model answers in
plain text with no `tool_calls` and `finish_reason: "stop"`. If your code must get a tool call,
check for `tool_calls` and handle the plain-text case.
:::

### Limits

| | |
|---|---|
| Context window | 1,048,320 tokens, counted as a **total budget** — prompt plus output |
| Input | text, image |
| JSON output | `json_object` and strict `json_schema` |
| Thinking tiers | `none` turns thinking off; `medium`, `high`, `xhigh` and `max` keep it on; `minimal` and `low` are a 400 |
| Tool calling | `tool_choice: "auto"`; `required` and named functions are not enforced |

`max_tokens` is checked against the total budget, prompt included:

```
Requested token count exceeds the model's maximum context length of 1048320 tokens. You requested a total of 1048348 tokens: 28 tokens from the input messages and 1048320 tokens for the completion. Please reduce the number of tokens in the input messages or the completion to fit within the limit.
```

That is a 400.

:::caution[A 1M window takes a while to fill]
The full window is usable — a prompt of about 1,018,000 tokens was answered correctly — but the
first pass over an uncached prompt that long took about 140 seconds. Raise your client timeout
before sending prompts of several hundred thousand tokens.
:::

### Example

```bash
curl https://developer.amd.com.cn/radeon/api/v1/chat/completions \
  -H "Authorization: Bearer $RADEON_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "Hy4-flash",
    "reasoning_effort": "none",
    "messages": [
      { "role": "user", "content": "Why is the sky blue?" }
    ]
  }'
```

With `none` the answer comes back without a thinking pass. Drop the field, or send `high`, to let
the model think; `low` is a 400 — see [Thinking](#thinking).
