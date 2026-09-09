---
title: MiniCPM5-1B
description: OpenBMB's 1B model — the lightest one here, behaving like the rest of the vLLM-served set.
sidebar:
  order: 5
---

<div class="rc-endpoint">
  <span class="rc-method" data-m="POST">POST</span>
  <span class="rc-path">/v1/chat/completions</span>
  <span class="rc-auth">model: <code>MiniCPM5-1B</code></span>
</div>

## Specification

The weights served here are **`OpenBMB/MiniCPM5-1B`**, read from the `config.json` shipped with
them:

| | |
|---|---|
| Architecture | `LlamaForCausalLM`, `model_type = llama` |
| Layers | 24 |
| Hidden size | 1,536 |
| Attention | 16 query heads, 2 KV heads (GQA) |
| Intermediate size | 4,608 |
| Vocabulary | 130,560 |
| Context | 131,072 |
| Precision | `bfloat16` — **not quantised** |

The only dense (non-MoE) model on this endpoint, and the only unquantised one. Its 131,072-token
context is the shortest here.

## On this endpoint

### At a glance

| | |
|---|---|
| Context length | 131,072 tokens |
| Input modalities | text only |
| Streaming | ✅ |
| Tool calling | ✅ (see below) |
| JSON output | ✅ `json_object` |
| Thinking | ✅ — **off by default** |
| Engine | vLLM |
| Stability | `experimental` |

### Thinking

**Off by default**: with `reasoning_effort` omitted, `reasoning_tokens` comes back as 0.

| Tier | Status |
|---|:---:|
| omitted / `low` / `medium` / `high` | supported |

:::caution[This model's top tier is `high`, and it does not take `none`]
**Exactly inverted** relative to
[Qwen3.8-Flash-Next](/radeon-cloud-docs/models/qwen3-8-flash-next/), whose top tier is `xhigh`.
`none` works there and not here — to switch thinking off, drop the parameter entirely. For
cross-model code, use `low` or `medium`.
:::

| | |
|---|---|
| Thinking text | `choices[0].message.reasoning` |
| Token count | `usage.completion_tokens_details.reasoning_tokens` |
| Not emitted | `usage.reasoning_tokens` — **no top-level field** |

### `messages`

A `system` message may sit at any position, and there may be more than one. Spell the role
`system` — this model does not take `developer`.

### Tools

Both `tools` and `parallel_tool_calls` are accepted. Offered a `get_weather` tool and told to call
it, the model issued the call correctly. Keep in mind that **this is a 1B model**: on a second probe
run the same prompt was answered in prose without a call. Measure it against your own prompts, more
than once, before handing it tool-driven work.

### Limits

| | |
|---|---|
| Context window | 131,072 tokens, counted as **prompt plus output** |
| JSON output | `response_format: {"type": "json_object"}` |
| Turning thinking on | `reasoning_effort` (or the equivalent `reasoning.effort`) |
| Input | text only, no images |

:::caution[This is the smallest window on the endpoint]
131,072 is far below the others (both DeepSeek models serve 1,048,576). When migrating from another
model, bring `max_tokens` down with it.
:::
