---
title: MiniCPM5-2B
description: OpenBMB's 2B dense model — the shortest context on this endpoint, served unquantised.
sidebar:
  order: 9
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
| Thinking | ❌ |
| Engine | vLLM |
| Stability | `experimental` |

### Thinking

This model answers directly. It does not return separated thinking, so
`choices[0].message.reasoning` stays empty and
`usage.completion_tokens_details.reasoning_tokens` is `0`.

Read the answer from `choices[0].message.content`. For separated thinking, use
[DeepSeek-V4-Flash](/radeon-cloud-docs/models/deepseek-v4-flash/) or
[Qwen3.8-Flash-Next](/radeon-cloud-docs/models/qwen3-8-flash-next/).

### `messages`

A `system` message may sit at any position, and there may be more than one. Spell the role
`system`.

### Tools

Both `tools` and `parallel_tool_calls` are accepted. Offered a `get_weather` tool and asked for
the weather in Paris, the model issued the call and returned
`finish_reason: "tool_calls"`. As with any model this size, try it against your own prompts
before relying on it for tool-driven work.

### Limits

| | |
|---|---|
| Context window | 131,072 tokens, counted as **prompt plus output** |
| JSON output | `response_format: {"type": "json_object"}` |
| Input | text only |

:::caution[This is the smallest window on the endpoint]
131,072 is far below the others (both DeepSeek models serve 1,048,576). When migrating from another
model, bring `max_tokens` down with it.
:::
