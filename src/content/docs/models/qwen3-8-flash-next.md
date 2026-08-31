---
title: Qwen3.8-Flash-Next
description: Qwen's preview of the Qwen4 architecture — what the vendor ships, and the two rules it enforces on this endpoint.
sidebar:
  order: 3
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

The QSA budget is the number worth remembering: attention over the KV cache is capped at 2,048
selected tokens regardless of how long the conversation is, and 36 of the 48 layers are linear
attention whose state does not grow with context at all.

:::caution[The model card says "with Vision Encoder" — image input is still refused here]
Qwen lists the type as *Causal Language Model with Vision Encoder*, and the repository is tagged
`image-text-to-text`. **This endpoint rejects image content anyway** — see
[Limits and refusals](#limits-and-refusals). Treat the model as text-only when calling it here.
:::

## On this endpoint

Everything below was measured against the live endpoint. Where it disagrees with the model card,
the endpoint wins.

### At a glance

| | |
|---|---|
| Context length | 262,144 tokens |
| Input modalities | text only |
| Streaming | ✅ |
| Tool calling | ✅ (no parallel calls) |
| JSON output | ✅ `json_object` · ❌ `json_schema` |
| Thinking | ✅ — **on unless you turn it down** |
| Stability | `experimental` |

### `messages` — the two rules that bite

:::danger[Exactly one `system` message, and it must be first]
Anything else is refused:

| Shape | Status |
|---|:---:|
| `system` first, then `user` | `200` |
| `system` after a user turn | **`400`** |
| `system` last | **`400`** |
| Two `system` messages | **`400`** |

```json
{
  "error": {
    "message": "System message must be at the beginning.",
    "type": "BadRequestError",
    "code": 400
  }
}
```

This is the model's own Jinja chat template raising, not a gateway rule — Qwen ships the check in
`tokenizer_config.json`. A [dedicated endpoint](/radeon-cloud-docs/api/dedicated-endpoints/)
running the same weights refuses the same requests.
:::

:::danger[The `developer` role is not accepted]
Newer OpenAI SDKs emit `developer` where older ones emit `system`. The accepted role set is
`system`, `user`, `assistant`, `tool` — `developer` is not in it, and it fails during request-body
deserialisation, so the status is **`422`, not `400`**:

```
Failed to deserialize the JSON body into the target type: messages[0]: unknown role: developer
```

If your client library defaults to `developer`, override it to `system`.
:::

### Thinking

**Omitting `reasoning_effort` does not disable thinking.** A plain request already returns a
populated `reasoning` and a non-zero `reasoning_tokens`. The model's internal default is `xhigh`,
its longest tier.

Only two tiers can actually be requested:

| Tier | Status | Why |
|---|:---:|---|
| `low` | `200` | |
| `medium` | `200` | |
| `high` | **`400`** | Passes request validation, then the model refuses: `Unexpected reasoning effort high. Supported types are xhigh (default), medium, and low.` |
| `xhigh` | **`422`** | Rejected during deserialisation — not in the endpoint's enum |
| `max` | **`422`** | Same |
| `minimal` | **`422`** | Same |

:::caution[`xhigh` is the default but cannot be requested]
The model names `xhigh` as its default, yet the endpoint's request schema only accepts `low`,
`medium`, `high` — so `xhigh` is reachable only by omitting the parameter, and `high` passes the
schema then gets refused by the model. **Send `low` or `medium` explicitly.** Those are the only
two values that work end to end.
:::

Where the output lands:

| | |
|---|---|
| Thinking text | `choices[0].message.reasoning` |
| Token count | `usage.completion_tokens_details.reasoning_tokens` |
| Not emitted | `usage.reasoning_tokens` — **no top-level field**, unlike DeepSeek-V4-Flash |

### Limits and refusals

| What you send | What comes back |
|---|---|
| `max_tokens` beyond the window | `400` `max_tokens=… cannot be greater than max_model_len=max_total_tokens=262144.` |
| `response_format: json_schema` | `400` `Model Qwen3.8-Flash-Next does not support JSON schema output mode` |
| An `image_url` content part | `400` `Model Qwen3.8-Flash-Next does not support image input.` |
| `thinking: {...}` | `400` — use `reasoning_effort` |

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
