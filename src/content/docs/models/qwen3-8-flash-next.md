---
title: Qwen3.8-Flash-Next
description: 256K context, thinking on by default, and strict rules about where a system message may sit.
sidebar:
  order: 3
---

The stricter of the two models on the **Public Free Model APIs**. Two of its rules reject requests
that every other OpenAI-compatible endpoint accepts, so read this page before pointing existing
client code at it.

<div class="rc-endpoint">
  <span class="rc-method" data-m="POST">POST</span>
  <span class="rc-path">/v1/chat/completions</span>
  <span class="rc-auth">model: <code>Qwen3.8-Flash-Next</code></span>
</div>

## At a glance

| | |
|---|---|
| Context length | 262,144 tokens |
| Input modalities | text only |
| Output modalities | text |
| Streaming | ✅ |
| Tool calling | ✅ (no parallel calls) |
| JSON output | ✅ `json_object` · ❌ `json_schema` |
| Thinking | ✅ — **on unless you turn it down** |
| Stability | `experimental` |

## `messages` — the two rules that bite

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

This comes from the model's own chat template — Qwen ships the constraint in
`tokenizer_config.json`. A [dedicated endpoint](/radeon-cloud-docs/api/dedicated-endpoints/)
running the same weights refuses the same requests.
:::

:::danger[The `developer` role is not accepted]
Newer OpenAI SDKs emit `developer` where older ones emit `system`. This model's accepted role set
is `system`, `user`, `assistant`, `tool` — `developer` is not in it, and it fails during
request-body deserialisation, so the status is **`422`, not `400`**:

```
Failed to deserialize the JSON body into the target type: messages[0]: unknown role: developer
```

If your client library defaults to `developer`, override it to `system`.
:::

## Thinking

**Omitting `reasoning_effort` does not disable thinking.** A plain request already comes back with
a populated `reasoning` and a non-zero `reasoning_tokens`. The model's internal default is `xhigh`,
the longest tier.

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
The model names `xhigh` as its default tier, yet the endpoint's request schema only accepts
`low`, `medium`, `high` — so `xhigh` is reachable only by omitting the parameter, and `high` is
accepted by the schema then refused by the model. **Send `low` or `medium` explicitly.** Those are
the only two values that work end to end.
:::

Where the output lands:

| | |
|---|---|
| Thinking text | `choices[0].message.reasoning` |
| Token count | `usage.completion_tokens_details.reasoning_tokens` |
| Not emitted | `usage.reasoning_tokens` — **this model has no top-level field**, unlike DeepSeek-V4-Flash |

## Limits and refusals

| What you send | What comes back |
|---|---|
| `max_tokens` beyond the window | `400` `max_tokens=… cannot be greater than max_model_len=max_total_tokens=262144.` |
| `response_format: json_schema` | `400` `Model Qwen3.8-Flash-Next does not support JSON schema output mode` |
| An `image_url` content part | `400` `Model Qwen3.8-Flash-Next does not support image input.` |
| `thinking: {...}` | `400` — use `reasoning_effort` |

`max_tokens` is capped against the **total** budget, prompt included — 262,144 covers input plus
output, not output alone.

## Example

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
