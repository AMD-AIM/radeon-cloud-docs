---
title: Qwen3.8-27B
description: "Qwen's 27B dense vision-language model: context, thinking tiers, image input and message rules."
sidebar:
  order: 6
---

<div class="rc-endpoint">
  <span class="rc-method" data-m="POST">POST</span>
  <span class="rc-path">/v1/chat/completions</span>
  <span class="rc-auth">model: <code>Qwen3.8-27B</code></span>
</div>

## Specifications

| | |
|---|---|
| Architecture | `Qwen3_5ForConditionalGeneration`, `model_type = qwen3_5` |
| Layers | 64 |
| Hidden dimension | 5,120 |
| Attention | 24 query heads, 4 KV heads (GQA), head dim 256 |
| Intermediate dimension | 17,408 |
| Vocabulary | 248,320 |
| Vision tower | 27 layers, width 1,152, 16 heads, patch 16, spatial merge 2 |
| Precision | `bfloat16` — unquantised |

## At a glance

| | |
|---|---|
| Context length | 262,144 tokens |
| Input modalities | text + images |
| Streaming | ✅ |
| Tool calling | ✅ |
| JSON output | ✅ `json_object` |
| Thinking | ✅ — on by default |
| Inference engine | SGLang |
| Stability | `experimental` |

:::note[Served by SGLang since 2026-09-22]
This page was first written against an earlier vLLM deployment with a 131,072-token window. The
context length and engine above are current. The thinking tiers, the `system` rule and the role
names come from the model's chat template, so they don't depend on the engine. The `usage` fields
described under [Thinking](#thinking) and [Image input](#image-input) were measured on the earlier
deployment.
:::

## Thinking

Thinking is on unless you turn it down; omitting `reasoning_effort` falls through to `xhigh`.

| Value | |
|---|---|
| omitted | falls through to `xhigh` |
| `low` | ✅ |
| `medium` | ✅ |
| `xhigh` | ✅ longest tier |
| `high` `minimal` `max` | ❌ 400 |

:::caution[This model's top tier is `xhigh`, not `high`]
`reasoning_effort: "high"` is rejected:

```
Unexpected reasoning effort high. Supported types are xhigh (default), medium, and low.
```

Send `xhigh` for the longest thinking, or omit the parameter.
:::

Thinking text arrives in `choices[0].message.reasoning`. The earlier deployment did not return
`usage.completion_tokens_details`, so thinking tokens were only counted inside
`usage.completion_tokens`. Read `completion_tokens_details.reasoning_tokens` when it is present,
and fall back to `completion_tokens` when it is not.

Thinking draws on the same `max_tokens` budget as the answer. If `content` comes back empty, raise
`max_tokens` or send `reasoning_effort: "low"`.

## `messages`

A `system` message is optional, but there can be at most one and it must come first. A second one,
or one after a `user` turn, is rejected:

```
System message must be at the beginning.
```

Spell the role `system`. The chat template rejects any other role name, `developer` included:

```
Unexpected message role.
```

## Image input

Send an `image_url` content part. Both `data:` URLs and `https://` URLs are accepted.

```json
{
  "model": "Qwen3.8-27B",
  "messages": [{
    "role": "user",
    "content": [
      { "type": "image_url", "image_url": { "url": "data:image/png;base64,iVBORw0KGgo..." } },
      { "type": "text", "text": "What does this image say?" }
    ]
  }]
}
```

The earlier deployment reported image usage at
`usage.prompt_tokens_details.multimodal_tokens.image`, where the other models use
`usage.prompt_tokens_details.image_tokens`. Code that counts image tokens should read both.

## Limits

| | |
|---|---|
| Context window | 262,144 tokens, prompt plus output |
| JSON output | `response_format: {"type": "json_object"}` |
| Thinking tiers | `low`, `medium`, `xhigh` |

## Example

```bash
curl https://developer.amd.com.cn/radeon/api/v1/chat/completions \
  -H "Authorization: Bearer $RADEON_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "Qwen3.8-27B",
    "reasoning_effort": "low",
    "max_tokens": 512,
    "messages": [
      { "role": "system", "content": "Answer in one sentence." },
      { "role": "user", "content": "Why is the sky blue?" }
    ]
  }'
```
