---
title: DeepSeek-V4-Flash-Vision-Exp
description: The vision variant of DeepSeek-V4-Flash — one extra vision tower, otherwise the same behaviour as the text model.
sidebar:
  order: 3
---

<div class="rc-endpoint">
  <span class="rc-method" data-m="POST">POST</span>
  <span class="rc-path">/v1/chat/completions</span>
  <span class="rc-auth">model: <code>DeepSeek-V4-Flash-Vision-Exp</code></span>
</div>

## What this is

A vision tower bolted onto the [DeepSeek-V4-Flash](/radeon-cloud-docs/models/deepseek-v4-flash/)
weights; the `Exp` in the name is *experimental*. It pairs a one-million-token context with image
input — as do [DeepSeek-V4.1-Flash](/radeon-cloud-docs/models/deepseek-v4-1-flash/) and
[MiMo-V2.6-Flash](/radeon-cloud-docs/models/mimo-v2-6-flash/).

The language side shares its architecture with the text model, field for field. The table below is
read from the `config.json` of the weights this endpoint actually loads.

| | |
|---|---|
| Architecture | `DeepseekV4ForCausalLM`, `model_type = deepseek_v4` |
| Layers | 43 |
| Hidden size | 4,096 |
| Attention | 64 query heads, **1 KV head**, head dim 512 (MLA) |
| Mixture of experts | 256 routed + 1 shared, 6 activated per token, expert intermediate 2,048 |
| Sparse index | a DSA indexer with `index_n_heads` / `index_topk` |
| Sliding window | 128 |
| Vocabulary | 129,280 |
| Native context | 1,048,576 |
| Quantisation | FP8 `e4m3`, block size `[128, 128]`, dynamic activation scaling, `ue8m0` scale format |

The vision tower (same `config.json`, expressed as flat `vision_*` keys rather than a nested
`vision_config`):

| | |
|---|---|
| Layers / width / heads | 32 layers, 1,024 wide, 16 heads |
| Patch size | 14 |
| Intermediate size | 2,816 |
| Downsample ratio | 3 |
| **Per-image token ceiling** | **384** |
| Minimum pixels | 147,456 |
| Maximum width:height ratio | 8 |

`vision_max_n_token = 384` is a hard ceiling: a larger image is compressed to 384 tokens, so very
high-resolution inputs do not cost linearly more — and do not carry more detail either.

## On this endpoint

### At a glance

| | |
|---|---|
| Context length | 1,048,576 tokens |
| Input modalities | text + images |
| Streaming | ✅ |
| Tool calling | ✅ |
| JSON output | ✅ `json_object` |
| Thinking | ✅ — **off by default**, ask for it explicitly |
| Stability | `experimental` |

### Image input

| | |
|---|---|
| How to send | an `{"type":"image_url","image_url":{"url":"data:image/png;base64,…"}}` part in `content` |
| Metering | `usage.prompt_tokens_details.image_tokens` |
| Per-image ceiling | 384 tokens (above) |

```bash
curl https://developer.amd.com.cn/radeon/api/v1/chat/completions \
  -H "Authorization: Bearer $RADEON_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "DeepSeek-V4-Flash-Vision-Exp",
    "messages": [{
      "role": "user",
      "content": [
        { "type": "image_url", "image_url": { "url": "data:image/png;base64,iVBORw0KGgo..." } },
        { "type": "text", "text": "What does this image say?" }
      ]
    }]
  }'
```

### `messages`

As permissive as the text model: a `system` message may sit at any position, there may be more than
one, and the role may be spelled either `system` or `developer`.

This differs from [Qwen3.8-Flash-Next](/radeon-cloud-docs/models/qwen3-8-flash-next/), which accepts
only a single leading `system`. For one client driving both, follow the stricter shape.

### Thinking

**Off by default.** With `reasoning_effort` omitted, `reasoning_tokens` comes back as 0; you have to
ask for thinking explicitly.

All seven `reasoning_effort` values are accepted (`none`, `minimal`, `low`, `medium`, `high`,
`xhigh`, `max`, plus omission) — the most permissive model on this endpoint.

| | |
|---|---|
| Thinking text | `choices[0].message.reasoning` |
| Token count | `usage.completion_tokens_details.reasoning_tokens` |
| Top-level alias | `usage.reasoning_tokens` — this model **does** emit it |

### Limits

| | |
|---|---|
| Context window | 1,048,576 tokens, counted as **prompt plus output** |
| JSON output | `response_format: {"type": "json_object"}` |
| Turning thinking on | `reasoning_effort` (or the equivalent `reasoning.effort`) |
