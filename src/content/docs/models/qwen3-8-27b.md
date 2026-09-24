---
title: Qwen3.8-27B
description: Qwen's 27B dense vision-language model — context, thinking tiers, image input and message rules.
sidebar:
  order: 6
---

<div class="rc-endpoint">
  <span class="rc-method" data-m="POST">POST</span>
  <span class="rc-path">/v1/chat/completions</span>
  <span class="rc-auth">model: <code>Qwen3.8-27B</code></span>
</div>

## Specification

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
| Context length | 131,072 tokens |
| Input modalities | text + images |
| Streaming | ✅ |
| Tool calling | ✅ |
| JSON output | ✅ `json_object` |
| Thinking | ✅ — on by default |
| Inference engine | vLLM |
| Stability | `experimental` |

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

Thinking text arrives in `choices[0].message.reasoning`. The engine does not itemise thinking, so
`usage.completion_tokens_details.reasoning_tokens` is filled in by the gateway, estimated from the
length of the `reasoning` text rather than counted. The tokens themselves are included in
`usage.completion_tokens`, and billed there.

Thinking draws on the same `max_tokens` budget as the answer. If `content` comes back empty, raise
`max_tokens` or send `reasoning_effort: "low"`.

## `messages`

A `system` message is optional, but there can be at most one and it must come first. A second one,
or one after a `user` turn, is rejected:

```
System message must be at the beginning.
```

Both `system` and `developer` are accepted as the role name.

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

Image usage is reported at `usage.prompt_tokens_details.multimodal_tokens.image`.

## Limits

| | |
|---|---|
| Context window | 131,072 tokens, prompt plus output |
| JSON output | `response_format: {"type": "json_object"}` |
| Thinking tiers | `low`, `medium`, `xhigh` |

`max_tokens` is checked against the whole window:

```
max_tokens=999999 cannot be greater than max_model_len=max_total_tokens=131072.
```

:::caution[`GET /v1/models` reports a larger window than this model enforces]
The catalogue entry currently advertises `262144` for this model, but the server it runs on is
started with `max_model_len=131072` and rejects anything above that. Size your requests against
131,072, not against the number in the model listing.
:::

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
