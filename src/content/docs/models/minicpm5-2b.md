---
title: MiniCPM5-2B
description: OpenBMB's 2B dense model — the smallest window here, and the only one that accepts reasoning_effort without acting on it.
sidebar:
  order: 5
---

<div class="rc-endpoint">
  <span class="rc-method" data-m="POST">POST</span>
  <span class="rc-path">/v1/chat/completions</span>
  <span class="rc-auth">model: <code>MiniCPM5-2B</code></span>
</div>

## Specification

The weights served here are **`openbmb/MiniCPM5-2B`**, read from the `config.json` shipped with
them:

| | |
|---|---|
| Architecture | `LlamaForCausalLM`, `model_type = llama` |
| Layers | 42 |
| Hidden size | 2,048 |
| Attention | 16 query heads, 2 KV heads (GQA) |
| Intermediate size | 6,144 |
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
| Thinking | ❌ — **see below**, the parameter is accepted but nothing is separated |
| Engine | vLLM |
| Stability | `experimental` |

### Thinking

**`reasoning_effort` is accepted here but has no observable effect.** Measured at every tier it
takes, with a multi-step word problem and `max_tokens: 600`:

| `reasoning_effort` | HTTP | `reasoning` | `reasoning_tokens` |
|---|:---:|:---:|:---:|
| omitted | `200` | empty | `0` |
| `low` | `200` | empty | `0` |
| `medium` | `200` | empty | `0` |
| `high` | `200` | empty | `0` |
| `none` `minimal` `xhigh` `max` | `422` | — | — |

The same prompt sent to [Qwen3.8-Flash-Next](/radeon-cloud-docs/models/qwen3-8-flash-next/)
returned 392 reasoning tokens, so this is the model, not the endpoint.

:::caution[Do not use this model to get separated thinking]
The model still reasons — it just does it **inline in `content`**, the way a non-thinking model
does. If your code reads `choices[0].message.reasoning` to show a thinking pane, it will render
an empty pane for this model. Branch on the model, or read `content` only.

Sending `reasoning_effort` costs you nothing here, but it buys you nothing either.
:::

### `messages`

A `system` message may sit at any position, and there may be more than one. Spell the role
`system` — this model does not take `developer` (`422`).

### Tools

Both `tools` and `parallel_tool_calls` are accepted. Offered a `get_weather` tool and asked for
the weather in Paris, the model issued the call correctly and returned
`finish_reason: "tool_calls"`. Keep in mind that **this is a 2B model**: measure it against your
own prompts, more than once, before handing it tool-driven work.

### Limits

| | |
|---|---|
| Context window | 131,072 tokens, counted as **prompt plus output** |
| JSON output | `response_format: {"type": "json_object"}` |
| Input | text only — an image part returns `400 Model MiniCPM5-2B does not support image input` |

:::caution[This is the smallest window on the endpoint]
131,072 is far below the others (both DeepSeek models serve 1,048,576). When migrating from another
model, bring `max_tokens` down with it.
:::
