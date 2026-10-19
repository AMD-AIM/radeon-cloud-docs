---
title: Gemma-4-31B-IT
description: "Google's 31B dense vision-language model: a 262,144-token window, text and image input, and thinking you turn on per request."
sidebar:
  order: 12
---

<div class="rc-endpoint">
  <span class="rc-method" data-m="POST">POST</span>
  <span class="rc-path">/v1/chat/completions</span>
  <span class="rc-auth">model: <code>Gemma-4-31B-IT</code></span>
</div>

## About the model

The weights served here are **[google/gemma-4-31B-it](https://huggingface.co/google/gemma-4-31B-it)**,
the instruction-tuned 31B model of Google's Gemma 4 family. It is a dense model that takes text
and images, and it answers without thinking unless you turn thinking on. Licence: Apache-2.0.

Send `Gemma-4-31B-IT` as `model`. [`GET /v1/models`](/radeon-cloud-docs/api/models/) lists this
model with `name` set to `Gemma 4 31B`; that name is not accepted as a model ID.

### Architecture

From the pinned
[`config.json`](https://huggingface.co/google/gemma-4-31B-it/raw/842da3794eaa0b77d5f08bae87a17459d91ff475/config.json).
Layer and attention dimensions below refer to `text_config`:

| | |
|---|---|
| Architecture | `Gemma4ForConditionalGeneration`, `model_type = gemma4` |
| Text backbone | dense, `model_type = gemma4_text`; no Mixture of Experts |
| Layers | 60 — **50 sliding-window + 10 full-attention** |
| Sliding window | 1,024 tokens |
| Hidden dimension | 5,376 |
| Attention | 32 query heads. Sliding-window layers: 16 KV heads, head dimension 256. Full-attention layers: 4 KV heads, head dimension 512 |
| Key/value projection | shared (`attention_k_eq_v = true`) |
| Intermediate dimension | 21,504 |
| Vocabulary | 262,144 |
| Native context | 262,144 |
| Checkpoint precision | `bfloat16` |

The separate `vision_config` describes the vision tower:

| | |
|---|---|
| Model type | `gemma4_vision` |
| Layers / hidden dimension / heads | 27 / 1,152 / 16 |
| Patch size | 16 |
| Visual tokens per image | 280 by default (`vision_soft_tokens_per_image`) |

The 31B model has no audio encoder: `audio_config` is `null`.

`generation_config.json` sets `temperature = 1.0`, `top_p = 0.95` and `top_k = 64`. This endpoint
accepts `temperature` and `top_p`; `top_k` is dropped (see the
[catalog overview](/radeon-cloud-docs/models/overview/#common-to-every-model)).

## On Radeon Cloud

:::note[Token Factory, China site — catalog read 2026-10-19]
The values below come from the Token Factory catalog and the serving configuration. Current
availability comes from [`GET /v1/models`](/radeon-cloud-docs/api/models/), and current usage
rates are on the model's card in the console.
:::

### At a glance

| | |
|---|---|
| Context length | 262,144 tokens |
| Input modalities | text, image |
| Streaming | ✅ |
| Tool calling | ✅ |
| JSON output | ✅ `json_object` |
| Thinking | ✅ — **off by default**, turn on per request |
| Inference engine | SGLang |
| Stability | `experimental` |

### `messages`

Use ordinary `user` and `assistant` turns. If you need a `system` message, send one, first in the
array; the chat template reads a leading `system` message as the system prompt. Other
arrangements, and the `developer` role, have not been verified for this model.

### Thinking

Thinking is **off by default**: the chat template sets `enable_thinking` to `false` unless the
request says otherwise. To turn it on, send this top-level field:

```json
{"chat_template_kwargs": {"enable_thinking": true}}
```

With the Python OpenAI SDK, pass it as `extra_body={"chat_template_kwargs": {"enable_thinking": True}}`.
Token Factory forwards `chat_template_kwargs` to the inference engine unchanged. How this model
treats `reasoning_effort` has not been verified; use `enable_thinking`.

| | |
|---|---|
| Thinking text | `choices[0].message.reasoning`, or `choices[0].delta.reasoning` when streaming |
| Final answer | `choices[0].message.content` |

Thinking draws on the same `max_tokens` budget as the answer. If `content` comes back empty with
`finish_reason: "length"`, raise `max_tokens`.

### Image input

Send images as `image_url` content parts:

```json
{
  "role": "user",
  "content": [
    { "type": "image_url", "image_url": { "url": "data:image/png;base64,<BASE64_PNG>" } },
    { "type": "text", "text": "What does this image say?" }
  ]
}
```

Each image counts against the context window. The vision tower encodes an image as 280 tokens by
default.

### Audio input

Not supported. The model has no audio encoder, so send text and images only.

### Limits

| | |
|---|---|
| Context window | 262,144 tokens, prompt plus output |
| Input | text, image |
| JSON output | `response_format: {"type": "json_object"}` |
| Thinking switch | `chat_template_kwargs.enable_thinking` |

### Example

```bash
curl https://developer.amd.com.cn/radeon/api/v1/chat/completions \
  -H "Authorization: Bearer $RADEON_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "Gemma-4-31B-IT",
    "chat_template_kwargs": {"enable_thinking": true},
    "max_tokens": 4096,
    "messages": [
      { "role": "system", "content": "Answer in one sentence." },
      { "role": "user", "content": "Why is the sky blue?" }
    ]
  }'
```

The answer is in `content`; the thinking is in `reasoning`.
