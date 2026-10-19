---
title: MiMo-V2.6-Flash
description: "Xiaomi's omnimodal sparse MoE model, served here for text and image input, with a 1M-token context and sliding-window layers just 128 tokens wide."
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
MiMo-V2.6 line — a sparse Mixture-of-Experts model built for text, images, video and audio.
On this endpoint it takes text and images, and it always thinks before answering.

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

:::note[The 128-token sliding window is why long context behaves the way it does]
Only the **9 global layers** keep a full KV cache. The other 39 keep 128 tokens each. At a
512K-token prompt that is roughly 6 GB of KV instead of the ~32 GB a uniformly-global model of
this shape would need — which is how a 1M window fits at all.
:::

## On Radeon Cloud

### At a glance

| | |
|---|---|
| Context length | 1,048,576 tokens |
| Input modalities | **text, image** |
| Streaming | ✅ |
| Tool calling | ✅ |
| JSON output | ✅ `json_object` **and** `json_schema` |
| Thinking | ✅ — **always on** |
| Inference engine | SGLang |
| Stability | `experimental` |

The weights were built for audio and video too, but this endpoint rejects audio input. See [Audio input](#audio-input).

### `messages`

A `system` message may sit at any position, and there may be more than one.

:::note[`developer` is accepted here]
Unlike [GLM-5.3-Flash](/radeon-cloud-docs/models/glm-5-3-flash/), which rejects it while
deserialising the body, this endpoint accepts `role: "developer"` and answers normally. You do
not need to rewrite newer OpenAI SDK output back to `system`.
:::

### Thinking

Thinking is **always on**. Omit `reasoning_effort` entirely and the response still carries a
populated `reasoning`:

```json
"message": {
  "role": "assistant",
  "content": "4",
  "reasoning": "2+2 is 4."
}
```

`reasoning_effort` is accepted with any value (`none`, `minimal`, `low`, `medium`, `high`, `xhigh`,
`max`), but in tests on 2026-10-19 none of them changed the result: even `none` returned a short
`reasoning`. Usage reports `0` reasoning tokens, both at the top level and in
`completion_tokens_details`, so the thinking is counted only in `completion_tokens`.

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

Not available on this endpoint. An OpenAI `input_audio` part is rejected with `400` ("data did
not match any variant of untagged enum MessageContent"), as of 2026-10-19. Send text and images
only.

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
| Input | text, image |
| JSON output | `json_object` and strict `json_schema` |
| Thinking tiers | `reasoning_effort` accepts every value but doesn't change the output; thinking can't be turned off |

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

The answer is in `content`; the thinking trace is in `reasoning`.
