---
title: Models overview
description: What each model on the Public Free Model APIs accepts and returns — measured, not copied from upstream.
sidebar:
  order: 1
---

One page per model. Everything on these pages was measured against the live endpoint, so where a
model disagrees with its upstream documentation, these pages follow the endpoint.

[`GET /v1/models`](/radeon-cloud-docs/api/models/) is the source of truth for which models exist
right now; it currently returns two.

## Side by side

| | [DeepSeek-V4-Flash](/radeon-cloud-docs/models/deepseek-v4-flash/) | [Qwen3.8-Flash-Next](/radeon-cloud-docs/models/qwen3-8-flash-next/) |
|---|---|---|
| Context | **1,048,576** | 262,144 |
| Input | text | text |
| Streaming | ✅ | ✅ |
| Tool calling | ✅ | ✅ |
| Parallel tool calls | ❌ | ❌ |
| `response_format: json_object` | ✅ | ✅ |
| `response_format: json_schema` | ❌ | ❌ |
| Image input | ❌ | ❌ |
| Thinking | ✅ | ✅ |
| Thinks when `reasoning_effort` omitted | ❌ | ✅ |
| Usable `reasoning_effort` tiers | `minimal` `low` `medium` `high` `xhigh` `max` | **`low` `medium` only** |
| `usage.reasoning_tokens` | ✅ | ❌ |
| `system` anywhere in `messages` | ✅ | ❌ first position only |
| More than one `system` | ✅ | ❌ |
| `developer` role | ✅ | ❌ |

## Writing one code path for both

The intersection that works on every model today:

- one `system` message, at index `0`, using the role name `system` — not `developer`
- `reasoning_effort` set explicitly to `low` or `medium`, never omitted
- read thinking text from `choices[0].message.reasoning`
- read thinking token count from `usage.completion_tokens_details.reasoning_tokens`
- `response_format: {"type": "json_object"}` for JSON, never `json_schema`
- text-only `content`

## Common to every model

These hold regardless of which model you call:

| | |
|---|---|
| Accepted parameters | `temperature`, `max_tokens`, `top_p`, `stream`, `response_format`, `tools`, `tool_choice` |
| Dropped silently | `stop`, `seed`, `logit_bias`, `logprobs`, `top_logprobs`, `top_k`, `min_p`, `repetition_penalty` |
| `thinking` parameter | Rejected with `400` — use `reasoning_effort` |
| Tokenizer reported | `GPT` |
| Stability | `experimental` |

Anything outside the accepted set is removed before the request reaches the serving backend — no
error, no effect. If you need those parameters, run a
[dedicated endpoint](/radeon-cloud-docs/api/dedicated-endpoints/), which passes your body straight
through to vLLM or SGLang.
