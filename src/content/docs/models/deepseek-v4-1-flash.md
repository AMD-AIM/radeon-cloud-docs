---
title: DeepSeek-V4.1-Flash
description: DeepSeek's million-token vision model — context, thinking tiers, image input and message rules.
sidebar:
  order: 4
---

<div class="rc-endpoint">
  <span class="rc-method" data-m="POST">POST</span>
  <span class="rc-path">/v1/chat/completions</span>
  <span class="rc-auth">model: <code>DeepSeek-V4.1-Flash</code></span>
</div>

## Specification

| | |
|---|---|
| Architecture | `DeepseekV41ForCausalLM`, `model_type = deepseek_v41` |
| Layers | 40 |
| Hidden dimension | 5,120 |
| Attention | MLA — 64 query heads, 1 KV head, head dim 512, RoPE dim 64 |
| Mixture of Experts | 384 routed + 1 shared, 6 routed activated, expert intermediate 2,304 |
| Sparse-attention indexer | 32 heads, head dim 128, top-512 tokens |
| Engram | 16,000,000 n-grams (compressed to 99,092), 8 heads, max n-gram 4 |
| Multi-token prediction | 3 layers |
| Vocabulary | 129,280 |
| Vision tower | 32 layers, width 1,024, 16 heads, patch 14, `max_image_tokens = 1024` |
| Quantisation | FP8 weights, block `[32, 32]`, `ue8m0` scales; experts in FP4 |

## At a glance

| | |
|---|---|
| Context length | 1,048,576 tokens |
| Input modalities | text + images |
| Streaming | ✅ |
| Tool calling | ✅ |
| JSON output | ✅ `json_object` |
| Thinking | ✅ — off by default |
| Inference engine | SGLang |
| Stability | `experimental` |

## Thinking

Omit `reasoning_effort` and the model answers directly, with no thinking pass.

Every tier is accepted: `none`, `minimal`, `low`, `medium`, `high`, `xhigh`, `max`.

Thinking text arrives in `choices[0].message.reasoning`, and the token count in
`usage.completion_tokens_details.reasoning_tokens`.

## `messages`

`system` messages may appear at any position, and there may be more than one. Both `system` and
`developer` are accepted as the role name.

## Image input

Send an `image_url` content part:

```json
{
  "model": "DeepSeek-V4.1-Flash",
  "messages": [{
    "role": "user",
    "content": [
      { "type": "image_url", "image_url": { "url": "data:image/png;base64,iVBORw0KGgo..." } },
      { "type": "text", "text": "What does this image say?" }
    ]
  }]
}
```

Image usage is reported at `usage.prompt_tokens_details.image_tokens`. The weights cap a single
image at 1,024 tokens.

## Limits

| | |
|---|---|
| Context window | 1,048,576 tokens, prompt plus output |
| JSON output | `response_format: {"type": "json_object"}` |
| Thinking tiers | `none` `minimal` `low` `medium` `high` `xhigh` `max` |

Exceeding the window returns:

```
Requested token count exceeds the model's maximum context length of 1048576 tokens.
```

## Example

```bash
curl https://developer.amd.com.cn/radeon/api/v1/chat/completions \
  -H "Authorization: Bearer $RADEON_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "DeepSeek-V4.1-Flash",
    "reasoning_effort": "medium",
    "messages": [
      { "role": "user", "content": "Why is the sky blue?" }
    ]
  }'
```
