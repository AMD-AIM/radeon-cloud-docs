---
title: Gemma-4-31B-IT
description: Google's dense 31B vision-language model — 256K context, binary thinking mode, image input and tool calling.
sidebar:
  order: 9
---

<div class="rc-endpoint">
  <span class="rc-method" data-m="POST">POST</span>
  <span class="rc-path">/v1/chat/completions</span>
  <span class="rc-auth">model: <code>Gemma-4-31B-IT</code></span>
</div>

## About the model

The endpoint serves Google's instruction-tuned **Gemma 4 31B** weights. This is a dense
vision-language model: it accepts text and images and produces text. The model card describes a
256K context window, native function calling and an optional thinking mode.

### Architecture

From the `config.json` loaded by this endpoint:

| | |
|---|---|
| Architecture | `Gemma4ForConditionalGeneration`, `model_type = gemma4` |
| Parameters | 30.7B total, dense |
| Layers | 60 — **50 sliding-window + 10 full-attention** |
| Hidden / intermediate size | 5,376 / 21,504 |
| Attention | 32 query heads, 16 KV heads, head dim 256 |
| Sliding window | 1,024 tokens |
| Vocabulary | 262,144 |
| Native context | 262,144 |
| Vision tower | 27 layers, width 1,152, 16 heads, patch size 16 |
| Image representation | 280 soft tokens per image in the shipped config |
| Weights | BF16 |

Google's model card and thinking guide are the source of truth for the model's prompt format. The
official control is the boolean `enable_thinking`; Gemma 4 does not define named effort tiers.

## On this endpoint

### At a glance

| | |
|---|---|
| Context length | 262,144 tokens |
| Input modalities | text + images |
| Streaming | ✅ |
| Tool calling | ✅ |
| JSON output | ✅ `json_object` |
| Thinking | ✅ — **off by default**, binary on/off |
| Inference engine | SGLang |
| Stability | `experimental` |

### Pricing

The catalogue reports USD per token. The equivalent per-million-token prices are:

| | USD per 1M tokens |
|---|---:|
| Input | $0.50 |
| Output | $3.00 |
| Cached input read | $0.05 |

The catalogue marks this entry as `free: false`, so calls are metered at these prices even though
the console section retains the historical **Public Free Model APIs** label.

Read [`GET /v1/models`](/radeon-cloud-docs/api/models/) at runtime for the current catalogue value.

### Thinking

Thinking is **off by default**. With `reasoning_effort` omitted, the model answers directly and
reports `reasoning_tokens: 0`.

:::caution[Gemma 4 has an on/off switch, not effort tiers]
Google's official Transformers deployment uses `enable_thinking=False` or
`enable_thinking=True`. The official model card, thinking guide and shipped chat template do not
define `minimal`, `low`, `medium`, `high`, `xhigh` or `max` as distinct Gemma thinking levels.

This OpenAI-compatible endpoint maps `reasoning_effort: "none"` to **off** and any accepted
non-`none` value to the same `enable_thinking: true` switch. Use `high` as the documented spelling
for **on**, but do not interpret it as a calibrated high-effort tier.
:::

| Request | Gemma behaviour |
|---|---|
| omit `reasoning_effort` | thinking off |
| `reasoning_effort: "none"` | thinking off |
| `reasoning_effort: "high"` | thinking on |

Thinking text arrives in `choices[0].message.reasoning`. Its token count is available in both
`usage.completion_tokens_details.reasoning_tokens` and the top-level
`usage.reasoning_tokens` alias.

### `messages`

The official Gemma 4 prompt format supports the standard `system`, `user` and `assistant` roles.
For portable requests, put one `system` message first and spell the role `system`.

### Image input

Send an `image_url` content part; base64 data URLs work:

```json
{
  "model": "Gemma-4-31B-IT",
  "messages": [{
    "role": "user",
    "content": [
      { "type": "image_url", "image_url": { "url": "data:image/png;base64,..." } },
      { "type": "text", "text": "What is shown in this image?" }
    ]
  }]
}
```

Image usage is reported at `usage.prompt_tokens_details.image_tokens`. A tested 32×32 PNG was
reported as 256 image tokens. The shipped model config represents each image with 280 soft tokens;
the public API's metered count is the value to use for billing.

### Limits

| | |
|---|---|
| Context window | 262,144 tokens, counted as prompt plus output |
| Input | text and images |
| JSON output | `response_format: {"type": "json_object"}` |
| Thinking control | binary: omitted / `none` is off; `high` turns it on |

### Example

```bash
curl https://developer.amd.com.cn/radeon/api/v1/chat/completions \
  -H "Authorization: Bearer $RADEON_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "Gemma-4-31B-IT",
    "reasoning_effort": "high",
    "messages": [
      { "role": "system", "content": "Answer clearly and concisely." },
      { "role": "user", "content": "Why is the sky blue?" }
    ]
  }'
```

Remove `reasoning_effort`, or set it to `none`, to answer without a thinking pass.

## Official references

- [Gemma 4 thinking mode](https://ai.google.dev/gemma/docs/capabilities/thinking)
- [Google Gemma 4 31B model card](https://huggingface.co/google/gemma-4-31B-it)