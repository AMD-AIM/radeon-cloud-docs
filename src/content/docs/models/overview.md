---
title: Model reference
description: What each model on the free shared model API accepts and returns — measured, not copied from upstream docs.
sidebar:
  order: 1
---

One page per model. Everything here was measured against
`https://developer.amd.com.cn/radeon/api/v1`; where a model's behaviour disagrees with its upstream
documentation, these pages win.

[`GET /v1/models`](/radeon-cloud-docs/api/models/) is the source of truth for what is available.
Today that is four chat models. The video model is listed separately below — it is not in that
catalog.

:::note[Measured on 2026-09-04, revised 2026-09-09]
Behaviour can change when a model moves to a different inference engine. If the endpoint disagrees
with this page, the endpoint is right.

**MiniCPM5-1B is no longer published.** Its page has been removed;
[MiniCPM5-2B](/radeon-cloud-docs/models/minicpm5-2b/) serves the same size class.
:::

## Video

One video model. It is called through a different endpoint, billed per second instead of per token,
and takes minutes rather than seconds:

| Model | Endpoint | Price |
|---|---|---|
| [MiniMax-H3](/radeon-cloud-docs/models/minimax-h3/) | [`POST /v1/videos`](/radeon-cloud-docs/api/videos/) | $0.08 per second |

Everything from here down describes the four chat models.

## Specifications

| Model | Context | Image input | Thinks with `reasoning_effort` omitted |
|---|---|:---:|:---:|
| [DeepSeek-V4-Flash](/radeon-cloud-docs/models/deepseek-v4-flash/) | 1,048,576 | ❌ | ❌ |
| [DeepSeek-V4-Flash-Vision-Exp](/radeon-cloud-docs/models/deepseek-v4-flash-vision-exp/) | 1,048,576 | ✅ | ❌ |
| [Qwen3.8-Flash-Next](/radeon-cloud-docs/models/qwen3-8-flash-next/) | 262,144 | ✅ | ✅ |
| [MiniCPM5-2B](/radeon-cloud-docs/models/minicpm5-2b/) | 131,072 | ❌ | ❌ |

## Supported `reasoning_effort` values

The accepted tiers differ per model:

| Model | Accepted values |
|---|---|
| DeepSeek-V4-Flash | `none` `minimal` `low` `medium` `high` `xhigh` `max` |
| DeepSeek-V4-Flash-Vision-Exp | `none` `minimal` `low` `medium` `high` `xhigh` `max` |
| Qwen3.8-Flash-Next | `none` `low` `medium` `xhigh` |

The parameter may also be omitted entirely. MiniCPM5-2B does not return separated thinking, so
`reasoning_effort` does not apply to it.

:::tip[For one client across the thinking models, use `low` or `medium`]
Those two are the intersection. Note that the name of the top tier is not portable:
Qwen3.8-Flash-Next spells it `xhigh` while the DeepSeek models also accept `max`, and the two are
not interchangeable. To pick per model, read
[`GET /v1/models`](/radeon-cloud-docs/api/models/) for what is currently published and match it
against the table above.
:::

## Thinking behaviour

| Model | With `reasoning_effort` omitted | `usage.reasoning_tokens` (top level) |
|---|:---:|:---:|
| DeepSeek-V4-Flash | does not think | ✅ |
| DeepSeek-V4-Flash-Vision-Exp | does not think | ✅ |
| Qwen3.8-Flash-Next | **thinks anyway** | ✅ |
| MiniCPM5-2B | does not think | ❌ |

Thinking text arrives in `choices[0].message.reasoning`. MiniCPM5-2B answers directly, so that
field is empty and `reasoning_tokens` is `0` — read `content` for its answer.

For the token count use **`usage.completion_tokens_details.reasoning_tokens`** — present on all four
models. The top-level `usage.reasoning_tokens` is only emitted by three of them, so do not use it
for cross-model accounting.

## Writing `messages`

| Model | `system` messages | Role name |
|---|---|---|
| DeepSeek-V4-Flash | any position, more than one allowed | `system` or `developer` |
| DeepSeek-V4-Flash-Vision-Exp | any position, more than one allowed | `system` or `developer` |
| Qwen3.8-Flash-Next | **exactly one, and it must come first** | `system` |
| MiniCPM5-2B | any position, more than one allowed | `system` |

The constraint on Qwen3.8-Flash-Next comes from the Jinja chat template shipped with the weights,
not from a gateway rule.

**The shape all four accept**: a single `system` message at index `0`, with the role spelled
`system`.

## Structured output and tools

All four models support:

- `response_format: {"type": "json_object"}`
- function calling via `tools` + `tool_choice` (all four issued a correct call when measured)

`parallel_tool_calls` is accepted by all four, but emitting several `tool_calls` in one turn is the
model's own choice — do not build on it.

## Image input

Two models take images; put an `image_url` content part in the `content` array:

| Model | Per-image metering |
|---|---|
| DeepSeek-V4-Flash-Vision-Exp | `usage.prompt_tokens_details.image_tokens`, 115 in the sample |
| Qwen3.8-Flash-Next | `usage.prompt_tokens_details.image_tokens`, 144 in the sample |

```json
{
  "model": "DeepSeek-V4-Flash-Vision-Exp",
  "messages": [{
    "role": "user",
    "content": [
      { "type": "image_url", "image_url": { "url": "data:image/png;base64,iVBORw0KGgo..." } },
      { "type": "text", "text": "What does this image say?" }
    ]
  }]
}
```

Both passed the same check: an image reading `7412`, asked "what is the large number in this
image", answered correctly — and could not answer the same question without the image.

Check the table above before sending images; the other two models are text-only.

## Writing one client for every model

The shape all four accept:

- a single `system` message at index `0`, with the role spelled `system`
- `reasoning_effort` of `low` or `medium`, or omitted entirely
- read thinking text from `choices[0].message.reasoning`
- read thinking tokens from `usage.completion_tokens_details.reasoning_tokens`
- use `response_format: {"type": "json_object"}` for JSON
- keep `content` textual unless the target model supports images
- size `max_tokens` against the target model's window — these four span 131,072 to 1,048,576, an
  eightfold difference

## True for every model

| | |
|---|---|
| Accepted parameters | `temperature`, `max_tokens`, `top_p`, `stream`, `response_format`, `tools`, `tool_choice`, `parallel_tool_calls`, `reasoning_effort` |
| Silently dropped | `stop`, `seed`, `logit_bias`, `logprobs`, `top_logprobs`, `top_k`, `min_p`, `repetition_penalty` |
| How to turn thinking on | `reasoning_effort` (or the equivalent `reasoning.effort`) |
| Reported tokenizer | `GPT` |
| Stability | `experimental` |

Parameters outside the accepted list are stripped before the request reaches the inference backend —
no error, no effect. If you need them, use a
[dedicated endpoint](/radeon-cloud-docs/api/dedicated-endpoints/), which forwards the request body
to vLLM or SGLang untouched.
