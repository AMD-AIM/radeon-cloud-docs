---
title: DeepSeek-V4-Flash
description: 1M-token context, tool calling, and optional thinking — the permissive one of the two.
sidebar:
  order: 2
---

The larger-context model on the **Public Free Model APIs**. It is also the more forgiving of the
two about how you shape `messages`.

<div class="rc-endpoint">
  <span class="rc-method" data-m="POST">POST</span>
  <span class="rc-path">/v1/chat/completions</span>
  <span class="rc-auth">model: <code>DeepSeek-V4-Flash</code></span>
</div>

## At a glance

| | |
|---|---|
| Context length | **1,048,576** tokens |
| Input modalities | text only |
| Output modalities | text |
| Streaming | ✅ |
| Tool calling | ✅ (no parallel calls) |
| JSON output | ✅ `json_object` · ❌ `json_schema` |
| Thinking | ✅ — **off unless you ask** |
| Stability | `experimental` |

## Thinking

**Omitting `reasoning_effort` means no thinking.** The baseline response comes back with an empty
`reasoning` and `reasoning_tokens: 0`.

All six tiers are accepted:

| Tier | Status |
|---|:---:|
| `minimal` | `200` |
| `low` | `200` |
| `medium` | `200` |
| `high` | `200` |
| `xhigh` | `200` |
| `max` | `200` |

There are fewer *effective* tiers than enum values: `minimal`/`low`/`medium` produce a similar
amount of thinking, while `high`/`max` think noticeably longer — two tiers in practice.

Where the output lands:

| | |
|---|---|
| Thinking text | `choices[0].message.reasoning` |
| Token count | `usage.completion_tokens_details.reasoning_tokens` |
| Also available | `usage.reasoning_tokens` — this model emits the top-level field |

:::note[The field name shifts when thinking is off]
With `reasoning_effort` set, `message` contains `reasoning`. On a plain request with no thinking,
the key present is `reasoning_content` instead — empty. Read `reasoning` and treat a missing key
as "did not think"; do not branch on which key exists.
:::

## `messages`

This model accepts every shape we tested:

| Shape | Status |
|---|:---:|
| `system` first, then `user` | `200` |
| `system` after a user turn | `200` |
| `system` last | `200` |
| Two `system` messages | `200` |
| `developer` instead of `system` | `200` |

That is *not* true of [Qwen3.8-Flash-Next](/radeon-cloud-docs/models/qwen3-8-flash-next/) — if you
plan to switch models behind one code path, write to that model's stricter rules.

## Limits and refusals

| What you send | What comes back |
|---|---|
| `max_tokens` beyond the window | `400` `Requested token count exceeds the model's maximum context length of 1048576 tokens.` |
| `response_format: json_schema` | `400` `Model DeepSeek-V4-Flash does not support JSON schema output mode` |
| An `image_url` content part | `400` `Model DeepSeek-V4-Flash does not support image input.` |
| `thinking: {...}` | `400` — use `reasoning_effort` |

## Example

```bash
curl https://developer.amd.com.cn/radeon/api/v1/chat/completions \
  -H "Authorization: Bearer $RADEON_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "DeepSeek-V4-Flash",
    "reasoning_effort": "low",
    "messages": [
      { "role": "system", "content": "Answer in one sentence." },
      { "role": "user", "content": "Why is the sky blue?" }
    ]
  }'
```
