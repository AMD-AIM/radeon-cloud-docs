---
title: Model reference
description: What each model on the free shared model API accepts and returns.
sidebar:
  order: 1
---

One page per model, for the models served at `https://developer.amd.com.cn/radeon/api/v1`.

[`GET /v1/models`](/radeon-cloud-docs/api/models/) is the source of truth for what is available.
Seven of them answer on `/v1/chat/completions`;
[MinerU2.5-Pro](/radeon-cloud-docs/models/mineru2-5-pro/) is document OCR and has its own endpoint.

:::note[Last updated 2026-09-18]
Behaviour can change when a model moves to a different inference engine.

**MiniCPM5-1B is no longer published.** Its page has been removed;
[MiniCPM5-2B](/radeon-cloud-docs/models/minicpm5-2b/) serves the same size class.
:::

## Specifications

| Model | Context | Image input | Thinks with `reasoning_effort` omitted |
|---|---|:---:|:---:|
| [DeepSeek-V4-Flash](/radeon-cloud-docs/models/deepseek-v4-flash/) | 1,048,576 | ❌ | ❌ |
| [DeepSeek-V4-Flash-Vision-Exp](/radeon-cloud-docs/models/deepseek-v4-flash-vision-exp/) | 1,048,576 | ✅ | ❌ |
| [DeepSeek-V4.1-Flash](/radeon-cloud-docs/models/deepseek-v4-1-flash/) | 1,048,576 | ✅ | ❌ |
| [Qwen3.8-Flash-Next](/radeon-cloud-docs/models/qwen3-8-flash-next/) | 262,144 | ✅ | ✅ |
| [Qwen3.8-27B](/radeon-cloud-docs/models/qwen3-8-27b/) | 131,072 | ✅ | ✅ |
| [GLM-5.3-Flash](/radeon-cloud-docs/models/glm-5-3-flash/) | 262,144 | ❌ | ✅ |
| [MiniCPM5-2B](/radeon-cloud-docs/models/minicpm5-2b/) | 131,072 | ❌ | ❌ |

[MinerU2.5-Pro](/radeon-cloud-docs/models/mineru2-5-pro/) is not in this table: it takes a PDF or
an image on `POST /v1/ocr`, returns Markdown, and is billed per page. The parameters below do not
apply to it.

## Supported `reasoning_effort` values

The accepted tiers differ per model:

| Model | Accepted values |
|---|---|
| DeepSeek-V4-Flash | `none` `minimal` `low` `medium` `high` `xhigh` `max` |
| DeepSeek-V4-Flash-Vision-Exp | `none` `minimal` `low` `medium` `high` `xhigh` `max` |
| DeepSeek-V4.1-Flash | `none` `minimal` `low` `medium` `high` `xhigh` `max` |
| Qwen3.8-Flash-Next | `none` `low` `medium` `xhigh` |
| Qwen3.8-27B | `low` `medium` `xhigh` |
| GLM-5.3-Flash | `low` `medium` `high` |

The parameter may also be omitted entirely. MiniCPM5-2B does not return separated thinking, so
`reasoning_effort` does not apply to it.

:::caution[`high` is a 400 on Qwen3.8-27B]
`high` is what most OpenAI-compatible clients send for "think hard", and it is the one value that
is accepted by the DeepSeek models and **rejected** by
[Qwen3.8-27B](/radeon-cloud-docs/models/qwen3-8-27b/):

```
Unexpected reasoning effort high. Supported types are xhigh (default), medium, and low.
```

That model's top tier is `xhigh`. `minimal` and `max` are rejected by it too.
:::

:::caution[`xhigh` is a 422 on GLM-5.3-Flash]
[GLM-5.3-Flash](/radeon-cloud-docs/models/glm-5-3-flash/) is the mirror image of the Qwen models:
it takes the OpenAI trio and nothing else.

```
reasoning_effort: unknown variant `xhigh`, expected one of `low`, `medium`, `high`
```

So the two names for "think hard" are mutually exclusive across this catalogue: `xhigh` fails on
GLM-5.3-Flash, `high` fails on Qwen3.8-27B. No single literal reaches the top tier of both. Note
the status codes differ too — GLM-5.3-Flash returns **422** because the value is rejected during
deserialisation, while Qwen3.8-27B returns **400** from a validator.
:::

:::tip[For one client across the thinking models, use `low` or `medium`]
Those two are the intersection of every model in the table. The name of the top tier is not
portable — the Qwen models spell it `xhigh`, GLM-5.3-Flash spells it `high`, the DeepSeek models
accept `xhigh` and `max` and `high`, and they are not interchangeable. To pick per model, read
[`GET /v1/models`](/radeon-cloud-docs/api/models/) for what is currently published and match it
against the table above.
:::

## Thinking behaviour

| Model | With `reasoning_effort` omitted | `usage.reasoning_tokens` (top level) |
|---|:---:|:---:|
| DeepSeek-V4-Flash | does not think | ✅ |
| DeepSeek-V4-Flash-Vision-Exp | does not think | ✅ |
| DeepSeek-V4.1-Flash | does not think | ✅ |
| Qwen3.8-Flash-Next | **thinks anyway** | ✅ |
| Qwen3.8-27B | **thinks anyway** | ❌ |
| GLM-5.3-Flash | **thinks anyway** | ❌ |
| MiniCPM5-2B | does not think | ❌ |

Thinking text arrives in `choices[0].message.reasoning`. MiniCPM5-2B answers directly, so that
field is empty and `reasoning_tokens` is `0` — read `content` for its answer.

For the token count use **`usage.completion_tokens_details.reasoning_tokens`**, which every model
here reports **except [Qwen3.8-27B](/radeon-cloud-docs/models/qwen3-8-27b/)** — that one omits the
`completion_tokens_details` object entirely, so its thinking tokens cannot be separated from the
rest of its output. They are still counted in `usage.completion_tokens`, and still billed.

:::caution[Thinking is on by default on both Qwen models and on GLM-5.3-Flash, and it spends `max_tokens`]
On Qwen3.8-Flash-Next and Qwen3.8-27B a request with no `reasoning_effort` still thinks, and the
thinking pass draws on the same `max_tokens` budget as the answer. A budget that was generous for
a non-thinking model can come back with an empty `content`. Either raise `max_tokens` or send
`reasoning_effort: "low"`.
:::

## Writing `messages`

| Model | `system` messages | Role name |
|---|---|---|
| DeepSeek-V4-Flash | any position, more than one allowed | `system` or `developer` |
| DeepSeek-V4-Flash-Vision-Exp | any position, more than one allowed | `system` or `developer` |
| DeepSeek-V4.1-Flash | any position, more than one allowed | `system` or `developer` |
| Qwen3.8-Flash-Next | **exactly one, and it must come first** | `system` |
| Qwen3.8-27B | **at most one, and it must come first** | `system` or `developer` |
| GLM-5.3-Flash | any position, more than one allowed | `system` |
| MiniCPM5-2B | any position, more than one allowed | `system` |

The constraints on the two Qwen models come from the Jinja chat template shipped with their
weights, not from a gateway rule. Qwen3.8-27B reports a violation as
`System message must be at the beginning.`

**The shape every model accepts**: a single `system` message at index `0`, with the role spelled
`system`.

## Structured output and tools

Every chat model here supports:

- `response_format: {"type": "json_object"}`
- function calling via `tools` + `tool_choice`

`parallel_tool_calls` is accepted everywhere, but emitting several `tool_calls` in one turn is the
model's own choice — do not build on it.

## Image input

Four models take images; put an `image_url` content part in the `content` array:

| Model | Per-image metering |
|---|---|
| DeepSeek-V4-Flash-Vision-Exp | `usage.prompt_tokens_details.image_tokens`, 115 in the sample |
| DeepSeek-V4.1-Flash | `usage.prompt_tokens_details.image_tokens`, 202 in the sample |
| Qwen3.8-Flash-Next | `usage.prompt_tokens_details.image_tokens`, 144 in the sample |
| Qwen3.8-27B | `usage.prompt_tokens_details.multimodal_tokens.image`, 72 in the sample |

:::caution[Qwen3.8-27B nests the image count one level deeper]
Three of the four report `prompt_tokens_details.image_tokens`. Qwen3.8-27B reports
`prompt_tokens_details.multimodal_tokens.image` instead, so code that tallies image usage across
models has to read both shapes.
:::

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

Check the table above before sending images; the remaining chat models are text-only. To pull text
out of a PDF or a scan, use [MinerU2.5-Pro](/radeon-cloud-docs/models/mineru2-5-pro/) — it returns
Markdown and is billed per page.

## Writing one client for every model

The shape every chat model here accepts:

- a single `system` message at index `0`, with the role spelled `system`
- `reasoning_effort` of `low` or `medium`, or omitted entirely — **not `high`** (400 on
  Qwen3.8-27B) and **not `xhigh`** (422 on GLM-5.3-Flash)
- read thinking text from `choices[0].message.reasoning`
- read thinking tokens from `usage.completion_tokens_details.reasoning_tokens` (Qwen3.8-27B
  omits it)
- use `response_format: {"type": "json_object"}` for JSON
- keep `content` textual unless the target model supports images
- size `max_tokens` against the target model's window — they span 131,072 to 1,048,576, an
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
