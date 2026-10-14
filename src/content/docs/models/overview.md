---
title: Model reference
description: What each model on the free shared model API accepts and returns.
sidebar:
  order: 1
---

One page per model, for the models served at `https://developer.amd.com.cn/radeon/api/v1`.

[`GET /v1/models`](/radeon-cloud-docs/api/models/) is the source of truth for what is available —
a page existing here does not guarantee the model is currently published. All of them answer on
`/v1/chat/completions` except [MinerU2.5-Pro](/radeon-cloud-docs/models/mineru2-5-pro/), which is
document OCR and has its own endpoint.

:::note[MiniCPM-V4.7 added: verified 2026-10-13]
[MiniCPM-V-4.7-1B](/radeon-cloud-docs/models/minicpm-v4-7-1b/) and
[MiniCPM-V-4.7-35B-A3B](/radeon-cloud-docs/models/minicpm-v4-7-35b-a3b/) now have dedicated
API reference pages. Both accept text/images and use a 262,144-token context window, with optional
thinking controlled by `chat_template_kwargs.enable_thinking`. Their shared-endpoint limitations
are documented on each page. The older model entries retain their previous verification scope;
this addition is not a new full-catalog qualification. Behaviour can change with the serving stack.

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
| [MiMo-V2.6-Flash](/radeon-cloud-docs/models/mimo-v2-6-flash/) | 1,048,576 | ✅ | ✅ |
| [MiniCPM5-2B](/radeon-cloud-docs/models/minicpm5-2b/) | 131,072 | ❌ | ❌ |
| [MiniCPM-V-4.7-1B](/radeon-cloud-docs/models/minicpm-v4-7-1b/) | 262,144 | ✅ | ❌ by default; explicit model-specific switch |
| [MiniCPM-V-4.7-35B-A3B](/radeon-cloud-docs/models/minicpm-v4-7-35b-a3b/) | 262,144 | ✅ | ❌ by default; explicit model-specific switch |

[MiMo-V2.6-Flash](/radeon-cloud-docs/models/mimo-v2-6-flash/) has a separate audio reference.
Do not infer audio or video input from an image checkmark. Strict `json_schema` support is a
separate endpoint capability; it is **not available for the two MiniCPM-V4.7 shared endpoints**.

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
| MiMo-V2.6-Flash | `none` and the usual tiers — send `none` to disable thinking |

The parameter may also be omitted entirely. MiniCPM5-2B does not return separated thinking, so
`reasoning_effort` does not apply to it.

**MiniCPM-V4.7 is not part of this effort-tier table.** Both variants use
`chat_template_kwargs.enable_thinking` (`true`/`false`), defaulting to `false`. Do not send
another model's effort tiers to control them; see their model pages for Python SDK `extra_body` examples.

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

:::tip[For the effort-controlled models in the table, use `low` or `medium`]
Those two are the intersection of the models in this effort-tier table, not a universal setting
for newly added models such as MiniCPM-V4.7. The name of the top tier is not
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
| MiniCPM-V-4.7-1B | off by default; controlled by `chat_template_kwargs.enable_thinking` | ✅ in tested thinking SSE |
| MiniCPM-V-4.7-35B-A3B | off by default; controlled by `chat_template_kwargs.enable_thinking` | ✅ in tested thinking SSE |

Thinking text arrives in `choices[0].message.reasoning`. MiniCPM5-2B answers directly, so that
field is empty and `reasoning_tokens` is `0` — read `content` for its answer.

For token counts, use the fields actually returned: `usage.completion_tokens_details.reasoning_tokens`
or `usage.reasoning_tokens`. The V4.7 thinking SSE tests returned the latter. Do not add the two
counts together or add them again to totals. Missing detail is not necessarily zero thinking.
See [Thinking response fields](/radeon-cloud-docs/api/chat-completions/#thinking-response-fields).

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
| MiniCPM5-2B | any position, more than one allowed | `system` |

In the older role tests summarized above, only the three DeepSeek models accepted `developer`
as an alias for `system`. The other four rejected
it outright — Qwen3.8-27B with `Unexpected message role.`, and Qwen3.8-Flash-Next, GLM-5.3-Flash
and MiniCPM5-2B with a deserialisation error naming the offending index:

```
Failed to deserialize the JSON body into the target type: messages[0]: unknown role: developer
```

Newer OpenAI SDKs emit `developer` in place of `system`. If yours does, override it back.

The constraints on the two Qwen models come from the Jinja chat template shipped with their
weights, not from a gateway rule. Qwen3.8-27B reports a violation as
`System message must be at the beginning.`

**The shape every model accepts**: a single `system` message at index `0`, with the role spelled
`system`.

For MiniCPM-V4.7, use standard conversation turns and one leading `system` instruction if needed;
more permissive system/developer-role layouts have not been qualified here.

## Structured output and tools

The older model pages describe their tested support for:

- `response_format: {"type": "json_object"}`
- function calling via `tools` + `tool_choice`

Both MiniCPM-V4.7 models have passed `json_object`, `auto`/`required`/named tool selection,
tool-result continuation and tool-call SSE tests. Strict `json_schema` requests currently return 400.

**The shared gateway does not forward `parallel_tool_calls`.** Receiving a successful response
does not mean this control was applied; `false` cannot guarantee one returned call. This differs
from the backend's own capabilities.

## Image input

For image-capable models, put an `image_url` content part in the `content` array. The sample
counts below depend on the supplied image and are not fixed per-image prices:

| Model | Per-image metering |
|---|---|
| DeepSeek-V4-Flash-Vision-Exp | `usage.prompt_tokens_details.image_tokens`, 115 in the sample |
| DeepSeek-V4.1-Flash | `usage.prompt_tokens_details.image_tokens`, 202 in the sample |
| Qwen3.8-Flash-Next | `usage.prompt_tokens_details.image_tokens`, 144 in the sample |
| Qwen3.8-27B | `usage.prompt_tokens_details.multimodal_tokens.image`, 72 in the sample |
| MiniCPM-V-4.7-1B | `usage.prompt_tokens_details.image_tokens`, 64 for the tested 280×280 single-color PNG at default 16x |
| MiniCPM-V-4.7-35B-A3B | `usage.prompt_tokens_details.image_tokens`, 64 for the same default-profile sample |

:::caution[Qwen3.8-27B nests the image count one level deeper]
The other rows above report `prompt_tokens_details.image_tokens`. Qwen3.8-27B reports
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

Check the model's own page and current catalog before sending images; the table is not a complete
inventory of every modality. MiniCPM-V4.7 accepts multiple image parts, but not `video_url` on this
shared endpoint; its 4x processor override is not forwarded. To pull text
out of a PDF or a scan, use [MinerU2.5-Pro](/radeon-cloud-docs/models/mineru2-5-pro/) — it returns
Markdown and is billed per page.

## Writing one client for every model

For a client spanning these models:

- a single `system` message at index `0`, with the role spelled `system`
- choose model-specific thinking controls; do not force an effort tier on MiniCPM-V4.7,
  which uses `chat_template_kwargs.enable_thinking`
- read thinking text from `choices[0].message.reasoning`
- read thinking counts from whichever documented usage field is returned; do not double count
- use `response_format: {"type": "json_object"}` only where supported; it is tested on both V4.7 models
- keep `content` textual unless the target model supports images
- size `max_tokens` against the target model's window — they span 131,072 to 1,048,576, an
  eightfold difference

## True for every model

| | |
|---|---|
| Common request fields | `temperature`, `max_tokens`, `top_p`, `stream`, `response_format`, `tools`, `tool_choice`; individual capabilities still depend on the model |
| Not forwarded on the shared endpoint | `parallel_tool_calls`, `mm_processor_kwargs`; other filtered parameters are listed in the chat API reference |
| How to turn thinking on | Model-specific: effort controls where documented; `chat_template_kwargs.enable_thinking` for MiniCPM-V4.7 |
| Reported tokenizer | `GPT` |
| Stability | `experimental` |

Parameters outside the accepted list are stripped before the request reaches the inference backend —
no error, no effect. If you need them, use a
[dedicated endpoint](/radeon-cloud-docs/api/dedicated-endpoints/), which forwards the request body
to vLLM or SGLang untouched.
