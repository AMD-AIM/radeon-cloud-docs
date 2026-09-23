---
title: MiMo-V2.6-Flash
description: Xiaomi's omnimodal sparse MoE model — the only endpoint here that takes audio, and the only one whose sliding-window layers are just 128 tokens wide.
sidebar:
  order: 8
---

<div class="rc-endpoint">
  <span class="rc-method" data-m="POST">POST</span>
  <span class="rc-path">/v1/chat/completions</span>
  <span class="rc-auth">model: <code>MiMo-V2.6-Flash</code></span>
</div>

## About the model

The weights served here are **MiMo-V2.6-Flash**, the efficiency-balanced member of Xiaomi's
MiMo-V2.6 line — a sparse Mixture-of-Experts model that accepts text, images, video and audio
in one endpoint, and thinks before answering unless told not to.

### Architecture

From the shipped `config.json`:

| | |
|---|---|
| Architecture | `MiMoV2ForCausalLM`, `model_type = mimo_v2` |
| Parameters | 309B total, **15B activated** per token |
| Layers | 48 — **39 sliding-window + 9 global**; the first block is global attention with a dense FFN, the other 47 are MoE |
| Hidden dimension | 4,096 |
| Attention | 64 query heads; 4 KV heads on the global layers, 8 on the sliding-window ones |
| Head dimensions | **192 for Q/K, 128 for V** — asymmetric |
| Sliding window | **128 tokens** |
| Mixture of Experts | 256 routed experts, **8 activated** per token, expert intermediate 2,048, **no shared expert** |
| Multi-token prediction | 3 layers declared in `config.json`; the shipped `dflash/` drafter is 5 layers |
| Vocabulary | 152,576 |
| Native context | 1,048,576 |
| Quantisation | `quant_method: fp8` `e4m3`, block `[128, 128]`, **stored as MXFP4** (`store_dtype: mxfp4`, block 32) |
| Licence | MIT |

The vision tower is a 681M-parameter MiMo ViT (28 layers, 24 sliding-window + 4 full, patch 16,
spatial merge 2×2). Audio goes through a 308M AudioTokenizer plus a 127M patch encoder.

:::note[The 128-token sliding window is what makes the long context practical]
Only the **9 global layers** keep a full KV cache; the other 39 keep 128 tokens each. Most of the
depth therefore does not grow its cache as the prompt grows, which is what allows a window this
wide on a model of this shape.
:::

## On this endpoint

### At a glance

| | |
|---|---|
| Context length | 1,048,576 tokens |
| Input modalities | **text, image, audio** |
| Streaming | ✅ |
| Tool calling | ✅ |
| JSON output | ✅ `json_object` **and** `json_schema` |
| Thinking | ✅ — **on unless you turn it off** |
| Inference engine | SGLang |
| Stability | `experimental` |

This is the only model on this API that accepts **audio**, and the only one that accepts a
**strict `json_schema`** rather than just `json_object`.

### `messages`

A `system` message may sit at any position, and there may be more than one.

:::note[`developer` is accepted here]
Unlike [GLM-5.3-Flash](/radeon-cloud-docs/models/glm-5-3-flash/), which rejects it while
deserialising the body, this endpoint accepts `role: "developer"` and answers normally. You do
not need to rewrite newer OpenAI SDK output back to `system`.
:::

### Thinking

Thinking is **on by default**. Omit `reasoning_effort` entirely and the response still carries a
populated `reasoning`:

```json
"message": {
  "role": "assistant",
  "content": "4",
  "reasoning": "2+2 is 4."
}
```

To turn it off, send `reasoning_effort: "none"` — `reasoning` then comes back empty.

:::caution[Budget for the thinking, not just the answer]
Thinking length varies a lot at the recommended sampling settings. The same image question has
returned a 62-character `reasoning` on one call and exhausted a 2,000-token budget on the
next, leaving `content` empty and `finish_reason: "length"`. If you see empty `content`, raise
`max_tokens` before assuming the request failed.
:::

### Image input

Images are passed as `image_url` parts, base64 data URLs included:

```json
{
  "role": "user",
  "content": [
    { "type": "image_url", "image_url": { "url": "data:image/png;base64,..." } },
    { "type": "text", "text": "How many blue circles?" }
  ]
}
```

`usage.prompt_tokens_details.image_tokens` reports what the image cost — a 1200×420 PNG came
back as 494 image tokens.

### Audio input

Audio uses the OpenAI `input_audio` part:

```json
{
  "role": "user",
  "content": [
    { "type": "input_audio", "input_audio": { "data": "<base64>", "format": "wav" } },
    { "type": "text", "text": "What is this sound?" }
  ]
}
```

The audio front end resamples to 24 kHz. No other model on this API accepts this part type.

### Structured output

Both forms work:

| `response_format` | Result |
|---|---|
| `{"type": "json_object"}` | ✅ `{"北京": 2174, "上海": 2487}` |
| `{"type": "json_schema", "json_schema": {..., "strict": true}}` | ✅ `{"city":"北京","pop":2174}` |

### Limits

| | |
|---|---|
| Context window | 1,048,576 tokens, counted as a **total budget** — prompt plus output |
| Input | text, image, audio |
| JSON output | `json_object` and strict `json_schema` |
| Thinking tiers | `reasoning_effort` — send `none` to disable; other tiers are accepted but the model is not tier-calibrated the way the DeepSeek models are |

:::caution[A 1M window is not a 1M window you want to use]
The context length is real — a 524,288-token prompt is accepted and answered. But time to first
token grows with the prompt, and at that length it is long enough to trip a default client timeout.
Treat anything past ~128K as a fallback, not a normal operating point, and raise your client
timeout before you try it.
:::

### Example

```bash
curl https://developer.amd.com.cn/radeon/api/v1/chat/completions \
  -H "Authorization: Bearer $RADEON_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "MiMo-V2.6-Flash",
    "messages": [
      { "role": "user", "content": "Why is the sky blue?" }
    ]
  }'
```

Add `"reasoning_effort": "none"` to get the answer without the thinking trace.
