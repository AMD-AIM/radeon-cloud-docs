---
title: Model catalog
description: What each model in Token Factory accepts and returns.
sidebar:
  label: Overview
  order: 1
---

One page per model, for the models served at `https://developer.amd.com.cn/radeon/api/v1`.

[`GET /v1/models`](/radeon-cloud-docs/api/models/) is the source of truth for what is available —
a page existing here does not guarantee the model is currently published. All of them answer on
`/v1/chat/completions` except five, which have their own endpoints:
[MinerU2.5-Pro](/radeon-cloud-docs/models/mineru2-5-pro/) (document OCR),
[OmniVoice](/radeon-cloud-docs/models/omnivoice/) (text-to-speech), and
[Clef](/radeon-cloud-docs/models/clef/), [d3](/radeon-cloud-docs/models/d3/) and
[d3-flash](/radeon-cloud-docs/models/d3-flash/) (decisions).

:::note[Last updated 2026-10-19]
Behaviour can change when a model moves to a different inference engine.

**New: [Gemma-4-31B-IT](/radeon-cloud-docs/models/gemma-4-31b-it/).** The tables below now also
cover [MiniCPM-V-4.7-1B](/radeon-cloud-docs/models/minicpm-v4-7-1b/) and
[MiniCPM-V-4.7-35B-A3B](/radeon-cloud-docs/models/minicpm-v4-7-35b-a3b/).

**MiniCPM5-1B is no longer published.** Its page has been removed;
[MiniCPM5-2B](/radeon-cloud-docs/models/minicpm5-2b/) serves the same size class.

**[DeepSeek-V4-Flash-Vision-Exp](/radeon-cloud-docs/models/deepseek-v4-flash-vision-exp/)** was marked
**Retiring 10/23** on its Token Factory card (checked 2026-10-21).
:::

## Model ID and card title

Send the model ID in `model`, exactly as written. Copy it from the **Model** field on the model's
card in Token Factory, or from `id` in [`GET /v1/models`](/radeon-cloud-docs/api/models/). The
card title and the `name` field can differ from the ID, and neither is accepted in its place:

| Model ID (send this) | Card title | `name` in `/v1/models` |
|---|---|---|
| `DeepSeek-V4-Flash` | DeepSeek-V4-Flash-0731 | DeepSeek-V4-Flash |
| `DeepSeek-V4.1-Flash` | DeepSeek-V4.1-Flash-1017 | DeepSeek-V4.1-Flash |
| `Gemma-4-31B-IT` | Gemma-4-31B-IT | Gemma 4 31B |

For every other model, the ID, the card title and `name` are the same.

## Specifications

**Thinks by default** means the model thinks even when the request doesn't ask it to. See
[Thinking](#thinking).

| Model | Context | Image input | Thinks by default |
|---|---|:---:|:---:|
| [DeepSeek-V4-Flash](/radeon-cloud-docs/models/deepseek-v4-flash/) | 1,048,576 | ❌ | ❌ |
| [DeepSeek-V4-Flash-Vision-Exp](/radeon-cloud-docs/models/deepseek-v4-flash-vision-exp/) | 1,048,576 | ✅ | ❌ |
| [DeepSeek-V4.1-Flash](/radeon-cloud-docs/models/deepseek-v4-1-flash/) | 1,048,576 | ✅ | ❌ |
| [Qwen3.8-Flash-Next](/radeon-cloud-docs/models/qwen3-8-flash-next/) | 262,144 | ✅ | ✅ |
| [Qwen3.8-27B](/radeon-cloud-docs/models/qwen3-8-27b/) | 262,144 | ✅ | ✅ |
| [GLM-5.3-Flash](/radeon-cloud-docs/models/glm-5-3-flash/) | 262,144 | ❌ | ✅ |
| [MiMo-V2.6-Flash](/radeon-cloud-docs/models/mimo-v2-6-flash/) | 1,048,576 | ✅ | ✅ |
| [MiniCPM5-2B](/radeon-cloud-docs/models/minicpm5-2b/) | 131,072 | ❌ | ❌ |
| [MiniCPM-V-4.7-1B](/radeon-cloud-docs/models/minicpm-v4-7-1b/) | 262,144 | ✅ | ❌ |
| [MiniCPM-V-4.7-35B-A3B](/radeon-cloud-docs/models/minicpm-v4-7-35b-a3b/) | 262,144 | ✅ | ❌ |
| [Gemma-4-31B-IT](/radeon-cloud-docs/models/gemma-4-31b-it/) | 262,144 | ✅ | ❌ |

Five models are not in this table, and the parameters below do not apply to them:

| Model | Endpoint | Takes | Returns | Billed per |
|---|---|---|---|---|
| [MinerU2.5-Pro](/radeon-cloud-docs/models/mineru2-5-pro/) | `POST /v1/ocr` | a PDF or an image | Markdown | page |
| [OmniVoice](/radeon-cloud-docs/models/omnivoice/) | `POST /v1/audio/speech` | text, up to 4,096 characters | an audio file | input character |
| [Clef](/radeon-cloud-docs/models/clef/) | `POST /v1/systemone` | a state, optional images, typed questions | a probability for every answer | input token |
| [d3](/radeon-cloud-docs/models/d3/) | `POST /v1/systemone` | a state, optional images and videos, typed questions | a probability for every answer | input token |
| [d3-flash](/radeon-cloud-docs/models/d3-flash/) | `POST /v1/systemone` | a state, optional images and videos, typed questions | a probability for every answer | input token |

## Usage rates

Token Factory meters usage in points (pts). Points aren't money and are separate from your
credits; see [Usage and quota](/radeon-cloud-docs/api/usage/). The rates below were read from the
model cards on 2026-10-19 and are in pts per million tokens unless noted. Rates can change, so check
the model's card for the current values.

| Model | Input | Output | Cache read |
|---|---:|---:|---:|
| DeepSeek-V4-Flash | 0.14 | 0.28 | 0.0028 |
| DeepSeek-V4-Flash-Vision-Exp | 0.14 | 0.28 | 0.0028 |
| DeepSeek-V4.1-Flash | 0.28 | 0.56 | 0.0056 |
| Qwen3.8-Flash-Next | 0.14 | 0.28 | 0.0028 |
| Qwen3.8-27B | 0.035 | 0.07 | 0.0007 |
| GLM-5.3-Flash | 0.28 | 0.56 | 0.0056 |
| MiMo-V2.6-Flash | 0.14 | 0.28 | 0.0028 |
| MiniCPM5-2B | 0.035 | 0.07 | 0.0007 |
| MiniCPM-V-4.7-1B | 0.035 | 0.07 | 0.0007 |
| MiniCPM-V-4.7-35B-A3B | 0.035 | 0.07 | 0.0007 |
| Gemma-4-31B-IT | 0.035 | 0.07 | 0.0007 |
| Clef | 0.035 | — | — |
| d3 | 0.035 | — | — |
| d3-flash | 0.035 | — | — |
| OmniVoice | 0.035 per million characters | — | — |
| MinerU2.5-Pro | 0.001 per page | — | — |

Three things on the cards differ from what is billed:

- The Clef, d3, d3-flash and OmniVoice cards also show a **Cache read** rate. Those models are not
  billed for cache reads.
- The OmniVoice card labels its input rate per 1M tokens. It is billed per million input characters.
- The MinerU2.5-Pro card shows no rate. It is billed per page processed.

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
| MiMo-V2.6-Flash | `none` `minimal` `low` `medium` `high` `xhigh` `max` |

The parameter may also be omitted entirely. MiniCPM5-2B does not return separated thinking, so
`reasoning_effort` does not apply to it.

MiMo-V2.6-Flash accepts every value but doesn't act on it: in tests on 2026-10-19, every value,
`none` included, returned the same short `reasoning`. You can't turn its thinking off.

MiniCPM-V-4.7-1B, MiniCPM-V-4.7-35B-A3B and Gemma-4-31B-IT turn thinking on with
`chat_template_kwargs: {"enable_thinking": true}` instead. How they treat `reasoning_effort` has
not been verified.

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

## Thinking

| Model | Without a thinking parameter | Top-level `reasoning_tokens` |
|---|:---:|:---:|
| DeepSeek-V4-Flash | does not think | ✅ |
| DeepSeek-V4-Flash-Vision-Exp | does not think | ✅ |
| DeepSeek-V4.1-Flash | does not think | ✅ |
| Qwen3.8-Flash-Next | **thinks anyway** | ✅ |
| Qwen3.8-27B | **thinks anyway** | ❌ |
| GLM-5.3-Flash | **thinks anyway** | ❌ |
| MiMo-V2.6-Flash | **thinks anyway** | ❌ |
| MiniCPM5-2B | does not think | ❌ |
| MiniCPM-V-4.7-1B | does not think | not verified |
| MiniCPM-V-4.7-35B-A3B | does not think | not verified |
| Gemma-4-31B-IT | does not think | not verified |

The Qwen3.8-27B usage values were measured on its earlier vLLM deployment.

Thinking text arrives in `choices[0].message.reasoning`. MiniCPM5-2B answers directly, so that
field is empty and `reasoning_tokens` is `0` — read `content` for its answer.

For the token count use **`usage.completion_tokens_details.reasoning_tokens`**. There are two
exceptions. [Qwen3.8-27B](/radeon-cloud-docs/models/qwen3-8-27b/) omitted the
`completion_tokens_details` object on its earlier deployment, and
[MiMo-V2.6-Flash](/radeon-cloud-docs/models/mimo-v2-6-flash/) reports `0` there even when it
thinks. Their thinking tokens cannot be separated from the rest of the output. They are still
counted in `usage.completion_tokens`, and still billed.

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
| Qwen3.8-27B | **at most one, and it must come first** | `system` |
| GLM-5.3-Flash | any position, more than one allowed | `system` |
| MiMo-V2.6-Flash | any position, more than one allowed | `system` or `developer` |
| MiniCPM5-2B | any position, more than one allowed | `system` |
| MiniCPM-V-4.7-1B | one, first; other placements not verified | `system` |
| MiniCPM-V-4.7-35B-A3B | one, first; other placements not verified | `system` |
| Gemma-4-31B-IT | one, first; other placements not verified | `system` |

The three DeepSeek models and MiMo-V2.6-Flash accept `developer` as an alias for `system`.
Qwen3.8-27B rejects it with `Unexpected message role.`, and Qwen3.8-Flash-Next, GLM-5.3-Flash and
MiniCPM5-2B reject it with a deserialisation error naming the offending index:

```
Failed to deserialize the JSON body into the target type: messages[0]: unknown role: developer
```

The `developer` role has not been verified on the MiniCPM-V-4.7 models or Gemma-4-31B-IT. Newer
OpenAI SDKs emit `developer` in place of `system`. If yours does, override it back.

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

Eight chat models take images; put an `image_url` content part in the `content` array:

| Model | Where image usage is reported |
|---|---|
| DeepSeek-V4-Flash-Vision-Exp | `usage.prompt_tokens_details.image_tokens`, 115 in the sample |
| DeepSeek-V4.1-Flash | `usage.prompt_tokens_details.image_tokens`, 202 in the sample |
| Qwen3.8-Flash-Next | `usage.prompt_tokens_details.image_tokens`, 144 in the sample |
| Qwen3.8-27B | `usage.prompt_tokens_details.multimodal_tokens.image`, 72 in the sample, on its earlier deployment |
| MiMo-V2.6-Flash | `usage.prompt_tokens_details.image_tokens` |
| MiniCPM-V-4.7-1B | `usage.prompt_tokens_details.image_tokens` |
| MiniCPM-V-4.7-35B-A3B | `usage.prompt_tokens_details.image_tokens` |
| Gemma-4-31B-IT | not verified |

:::caution[Qwen3.8-27B nested the image count one level deeper]
On its earlier deployment, Qwen3.8-27B reported `prompt_tokens_details.multimodal_tokens.image`
instead of `prompt_tokens_details.image_tokens`. Code that tallies image usage across models
should read both shapes.
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

## One client for every model

The shape every chat model here accepts:

- a single `system` message at index `0`, with the role spelled `system`
- `reasoning_effort` of `low` or `medium`, or omitted entirely — **not `high`** (400 on
  Qwen3.8-27B) and **not `xhigh`** (422 on GLM-5.3-Flash)
- read thinking text from `choices[0].message.reasoning`
- read thinking tokens from `usage.completion_tokens_details.reasoning_tokens` (Qwen3.8-27B
  omitted it on its earlier deployment, and MiMo-V2.6-Flash reports `0`)
- use `response_format: {"type": "json_object"}` for JSON
- keep `content` textual unless the target model supports images
- size `max_tokens` against the target model's window — they span 131,072 to 1,048,576, an
  eightfold difference

## Common to every model

| | |
|---|---|
| Accepted parameters | `temperature`, `max_tokens`, `top_p`, `stream`, `response_format`, `tools`, `tool_choice`, `parallel_tool_calls`, `reasoning_effort` |
| Forwarded unchanged | `chat_template_kwargs` |
| Silently dropped | `stop`, `seed`, `logit_bias`, `logprobs`, `top_logprobs`, `top_k`, `min_p`, `repetition_penalty` |
| How to turn thinking on | `reasoning_effort` (or the equivalent `reasoning.effort`); `chat_template_kwargs.enable_thinking` on the MiniCPM-V-4.7 models and Gemma-4-31B-IT |
| Reported tokenizer | `GPT` |
| Stability | `experimental` |

Other parameters are stripped before the request reaches the inference backend — no error, no
effect. If you need them, serve the model yourself as a
[model service](/radeon-cloud-docs/api/model-services/), which forwards the request body to vLLM
untouched.
