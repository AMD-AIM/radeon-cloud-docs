---
title: GLM-5.3-Flash
description: "Z.AI's sparse MoE vision-language model: text and image input, thinking on by default, and the two reasoning tiers that take effect."
sidebar:
  order: 7
---

<div class="rc-endpoint">
  <span class="rc-method" data-m="POST">POST</span>
  <span class="rc-path">/v1/chat/completions</span>
  <span class="rc-auth">model: <code>GLM-5.3-Flash</code></span>
</div>

**GLM-5.3-Flash** is Z.AI's speed-oriented member of the GLM-5.3 line: a sparse
Mixture-of-Experts model that reads text and images and thinks before it answers.

## Specifications

From the shipped `config.json`:

| | |
|---|---|
| Architecture | `Glm5NextForConditionalGeneration`, `model_type = glm5_next` |
| Layers | 45 — the first 3 dense, the rest MoE |
| Hidden dimension | 4,096 |
| Attention | 64 query heads, 64 KV heads — full MHA, not grouped |
| Dense intermediate | 12,288 |
| Mixture of Experts | 288 routed experts + 1 shared, **8 routed activated** per token, expert intermediate 2,048 |
| Multi-token prediction | 1 layer |
| Vision tower | 24 layers, width 1,024, 16 heads, patch 14, spatial merge 2 |
| Vocabulary | 154,880 |
| Native context | 1,048,576; served here at 262,144 |
| Quantisation | FP8, `e4m3`, block `[128, 128]`, dynamic activation scaling |
| Licence | MIT |

## At a glance

| | |
|---|---|
| Context length | 262,144 tokens, prompt plus output |
| Input modalities | text + images |
| Streaming | ✅ |
| Tool calling | ✅ — `tool_choice` of `auto`, `required` or a named function |
| JSON output | ✅ `json_object` and `json_schema` |
| Thinking | ✅ — on by default |
| Stability | `experimental` |

## Thinking

Thinking is on by default, and no `reasoning_effort` value turns it off. Only `low` and `high`
change it; any other value thinks as much as omitting the parameter.

| Value | Thinking |
|---|---|
| omitted | full (the default) |
| `high` | shorter |
| `low` | shortest — sometimes only a few tokens |
| `none` `minimal` `medium` `xhigh` `max` | accepted; same as omitted |

`reasoning.effort` works the same as `reasoning_effort`.

Thinking text arrives in `choices[0].message.reasoning` (`choices[0].delta.reasoning` when
streaming), and its token count in `usage.completion_tokens_details.reasoning_tokens`.

Thinking draws on the same `max_tokens` budget as the answer and is billed as output. If `content`
comes back empty with `finish_reason: "length"`, raise `max_tokens` or send
`reasoning_effort: "low"`.

## `messages`

A `system` message may sit at any position, and there may be more than one.

Spell the role `system`. A `developer` message is accepted without an error, but the model does
not follow it.

## Image input

Send one or more `image_url` content parts. `data:` URLs and publicly reachable `https://` URLs
both work; PNG, JPEG and WebP are accepted.

```json
{
  "model": "GLM-5.3-Flash",
  "messages": [{
    "role": "user",
    "content": [
      { "type": "image_url", "image_url": { "url": "data:image/png;base64,iVBORw0KGgo..." } },
      { "type": "text", "text": "What does this image say?" }
    ]
  }]
}
```

- Images are billed as input tokens and reported in `usage.prompt_tokens_details.image_tokens`. A
  900×240 image costs about 300; larger images are scaled down to at most about 8,000.
- An image that can't be fetched or decoded returns 400.
- Video input is not supported.

## Limits

| | |
|---|---|
| Context window | 262,144 tokens, prompt plus output; a request whose prompt plus `max_tokens` exceeds it returns 400 |
| Images | up to about 8,000 tokens each |
| JSON output | `response_format` of type `json_object` or `json_schema` |
| Thinking tiers | `low` and `high`; any other value is the same as omitting it |

## Example

```bash
curl https://developer.amd.com.cn/radeon/api/v1/chat/completions \
  -H "Authorization: Bearer $RADEON_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "GLM-5.3-Flash",
    "reasoning_effort": "low",
    "max_tokens": 1024,
    "messages": [
      { "role": "system", "content": "Answer in one sentence." },
      { "role": "user", "content": "Why is the sky blue?" }
    ]
  }'
```
