---
title: Qwen3.8-Flash-Next
description: Qwen's preview of the Qwen4 architecture — what the vendor ships, and the two rules it enforces on this endpoint.
sidebar:
  order: 5
---

<div class="rc-endpoint">
  <span class="rc-method" data-m="POST">POST</span>
  <span class="rc-path">/v1/chat/completions</span>
  <span class="rc-auth">model: <code>Qwen3.8-Flash-Next</code></span>
</div>

## About the model

The weights served here are **Qwen3.8-Flash-Next-FP8** — the FP8-quantised build of
Qwen3.8-Flash-Next, using fine-grained FP8 with block size 128. Qwen states its metrics are nearly
identical to the unquantised original.

Qwen describes this release as an experimental preview of the architecture that will underpin
Qwen4, and the first open-weight model built on it. Three things are new relative to the Qwen3
line, per the model card:

- **Hybrid attention with QSA** — the Gated DeltaNet plus Gated Attention pairing is reworked into
  Gated DeltaNet plus **Qwen Sparse Attention**.
- **Gated Residual** — normalised residual streams get an extra gate, aimed at keeping deep, wide
  models trainable.
- **N-gram Embedding** — a parameter-scaling axis that costs less compute than MoE and is easier
  to offload.

Details are in Qwen's [blog post](https://qwen.ai/blog?id=qwen3.8-flash-next) and technical report.

:::note[This is not the same as "Qwen3.8-Flash"]
Qwen also operates a managed service model called **Qwen3.8-Flash** on Qwen Cloud, built on these
weights with additional production features — a 1M context window by default among them. What this
endpoint serves is the open-weight **Qwen3.8-Flash-Next**, at its native 262,144-token window.
:::

### Architecture

From the model card and the shipped `config.json`:

| | |
|---|---|
| Parameters | 125B total, **6B activated**, plus 51B n-gram embedding and 4B MTP |
| Layers | 48, laid out as 12 × (3 × Gated DeltaNet→MoE, then 1 × QSA→MoE) |
| Hidden dimension | 2,560 |
| Gated DeltaNet | 48 V heads, 16 QK heads, head dim 128 |
| Qwen Sparse Attention | 24 query heads, 2 KV heads, head dim 256, 64-dim RoPE |
| QSA indexer | MQA with 4 query heads and 1 shared key head, head dim 128 |
| **QSA budget** | **512 blocks / 2,048 tokens** |
| Mixture of Experts | 512 experts, **10 routed + 1 shared activated**, expert intermediate 640 |
| N-gram embedding | 20,000,000 bigrams/trigrams, applied at layer 2 |
| Gated Residual | 4 branches, bottleneck rank 320 |
| Vocabulary | 248,320 (padded) |
| Native context | 262,144, extensible to 1,000,000 |
| Multi-token prediction | 1 layer |
| Quantisation | FP8, block `[128, 128]`, dynamic activation scaling |
| Licence | Qwen Community License 1.0 |

Attention over the KV cache is capped at 2,048 selected tokens regardless of conversation length,
and 36 of the 48 layers are linear attention whose state does not grow with context.

:::note[The model card says "with Vision Encoder" — and this endpoint takes images]
Qwen lists the type as *Causal Language Model with Vision Encoder*, and the repository is tagged
`image-text-to-text`. See [Image input](#image-input).
:::

## On this endpoint

### At a glance

| | |
|---|---|
| Context length | 262,144 tokens |
| Input modalities | text + **images** |
| Streaming | ✅ |
| Tool calling | ✅ |
| JSON output | ✅ `json_object` |
| Thinking | ✅ — **on unless you turn it down** |
| Stability | `experimental` |

### `messages` — two hard rules

:::caution[Exactly one `system` message, and it must come first]
This comes from the Jinja chat template shipped with the weights — Qwen writes the check into
`tokenizer_config.json` — not from a gateway rule, so a
[dedicated endpoint](/radeon-cloud-docs/api/dedicated-endpoints/) running the same weights behaves
the same way.

```json
"messages": [
  { "role": "system", "content": "Answer in one sentence." },
  { "role": "user",   "content": "Why is the sky blue?" }
]
```
:::

:::caution[Spell the role `system`, not `developer`]
The accepted roles are `system`, `user`, `assistant`, `tool`. Newer OpenAI SDKs emit `developer` in
place of `system`; if yours does, override it back to `system`.
:::

### Thinking

**Omitting `reasoning_effort` does not disable thinking.** A plain request already returns a
populated `reasoning` and a non-zero `reasoning_tokens`. The model's internal default is `xhigh`,
its longest tier.

Accepted values:

| Tier | Notes |
|---|---|
| omitted | falls through to the model's own `xhigh` |
| `none` | |
| `low` | |
| `medium` | |
| `xhigh` | the longest tier |

:::caution[This model's top tier is called `xhigh`, not `high`]
When writing cross-model code: `low` and `medium` work everywhere, but the name of the top tier is
not portable — this model uses `xhigh` while
[MiniCPM5-2B](/radeon-cloud-docs/models/minicpm5-2b/) uses `high`. For the longest thinking, send
`xhigh` or omit the parameter entirely.
:::

Where the output lands:

| | |
|---|---|
| Thinking text | `choices[0].message.reasoning` |
| Token count | `usage.completion_tokens_details.reasoning_tokens` |
| Top-level alias | `usage.reasoning_tokens` — this model **does** emit it (same as DeepSeek-V4-Flash) |

### Image input

This model accepts `image_url` content parts.

| | |
|---|---|
| How to send | an `{"type":"image_url","image_url":{"url":"data:image/png;base64,…"}}` part in `content` |
| Metering | `usage.prompt_tokens_details.image_tokens` |
| Per-image ceiling | the weights ship `vision_max_n_token = 384`, so larger images still cap at 384 |

### Limits

| | |
|---|---|
| Context window | 262,144 tokens, counted as a **total budget** — prompt plus output, not an output-only allowance |
| JSON output | `response_format: {"type": "json_object"}` |
| Turning thinking on | `reasoning_effort` (or the equivalent `reasoning.effort`) |

`max_tokens` is capped against the **total** budget, prompt included — 262,144 covers input plus
output, not output alone.

### Example

```bash
curl https://developer.amd.com.cn/radeon/api/v1/chat/completions \
  -H "Authorization: Bearer $RADEON_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "Qwen3.8-Flash-Next",
    "reasoning_effort": "low",
    "messages": [
      { "role": "system", "content": "Answer in one sentence." },
      { "role": "user", "content": "Why is the sky blue?" }
    ]
  }'
```

One `system` message, first in the array, and an explicit `low` — that request shape also works
unchanged on [DeepSeek-V4-Flash](/radeon-cloud-docs/models/deepseek-v4-flash/).
