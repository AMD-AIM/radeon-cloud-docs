---
title: Hy4-flash
description: "Tencent's sparse MoE model with a 1M-token context and image input. It thinks by default; reasoning_effort takes none, or medium and above."
sidebar:
  order: 8.5
---

<div class="rc-endpoint">
  <span class="rc-method" data-m="POST">POST</span>
  <span class="rc-path">/v1/chat/completions</span>
  <span class="rc-auth">model: <code>Hy4-flash</code></span>
</div>

## About the model

**Hy4-flash** is Tencent's sparse Mixture-of-Experts model. It mixes sparse-attention and
sliding-window layers, takes text and images, and thinks before answering unless you turn that
off.

### Architecture

From the shipped `config.json`:

| | |
|---|---|
| Architecture | `HYV4FlashForConditionalGeneration`, `model_type = hy_v4_flash` |
| Layers | 42 — **12 sparse-attention + 30 sliding-window**; the first layer has a dense FFN, the other 41 are MoE |
| Hidden dimension | 3,072 |
| Attention | multi-head latent attention, 32 heads; query rank 1,024, KV rank 512; Q/K head 192 + 64 RoPE, V head 256; learnable attention sinks |
| Sparse attention | on the 12 sparse layers an indexer keeps the top **2,048** tokens per query |
| Sliding window | **512 tokens** |
| Mixture of Experts | 512 routed experts + 1 shared, **16 activated** per token, expert intermediate 1,536 |
| Vocabulary | 120,832 |
| Native context | 1,048,576 |
| Quantisation | FP8, `e4m3`, block `[128, 128]`, dynamic activation scaling |
| Licence | Tencent's own licence (`other` on Hugging Face) |

The vision encoder has 27 layers, hidden size 1,152, patch 16 and a 2×2 spatial merge.

## On Radeon Cloud

### At a glance

| | |
|---|---|
| Context length | 1,048,320 tokens |
| Input modalities | **text, image** |
| Streaming | ✅ |
| Tool calling | ✅ — `tool_choice` cannot force a call, see [Tools](#tools) |
| JSON output | ✅ `json_object` **and** `json_schema` |
| Thinking | ✅ — **on unless you send `reasoning_effort: "none"`** |
| Inference engine | SGLang |
| Stability | `experimental` |

### `messages`

A `system` message may sit at any position, and there may be more than one. `developer` is
accepted as an alias for `system`.

### Thinking

Thinking is **on by default**. The model's chat template has only two modes, off and `high`:

| `reasoning_effort` | Result |
|---|---|
| omitted, `medium`, `high`, `xhigh`, `max` | thinks |
| `none` | does not think; the response has no `reasoning` |
| `minimal`, `low` | **400** |

:::caution[`low` and `minimal` are a 400]
```
reasoning_effort error : low, should be no_think/high
```

The message names the template's `no_think`, but the API does not accept that value. Send `none`
to turn thinking off.
:::

Thinking text is in `choices[0].message.reasoning`. Its token count is in
`usage.completion_tokens_details.reasoning_tokens`, and again at the top level as
`usage.reasoning_tokens`.

:::caution[Thinking spends your `max_tokens`]
Reasoning tokens are billed as output and draw on the same `max_tokens` budget as the answer. If
`content` comes back empty, raise `max_tokens` or send `reasoning_effort: "none"`.
:::

### Image input

Pass images as `image_url` content parts; base64 data URLs work:

```json
{
  "role": "user",
  "content": [
    { "type": "image_url", "image_url": { "url": "data:image/png;base64,..." } },
    { "type": "text", "text": "What is in this image?" }
  ]
}
```

Image usage is reported in `usage.prompt_tokens_details.image_tokens` — a 256×256 PNG counts as
72 tokens.

### Tools

`tools` works with the default `tool_choice: "auto"`: the model calls a function when the
question needs one.

:::caution[`tool_choice` cannot force a call]
`tool_choice: "required"` and a named function are accepted but not enforced. On a question that
doesn't need the tool, the model answers in text with no `tool_calls`. Check for `tool_calls`
rather than assuming one.
:::

### Limits

| | |
|---|---|
| Context window | 1,048,320 tokens, counted as a **total budget** — prompt plus output |
| Input | text, image |
| JSON output | `json_object` and strict `json_schema` |
| Thinking tiers | `none` (off), `medium`, `high`, `xhigh`, `max`; `minimal` and `low` are a 400 |
| Tool calling | `tool_choice: "auto"`; `required` and named functions are not enforced |

A prompt plus `max_tokens` over the window is a 400:

```
Requested token count exceeds the model's maximum context length of 1048320 tokens.
```

:::caution[Long prompts are slow]
The whole window is usable, but a prompt near 1M tokens can take about two minutes before the
first token. Raise your client timeout before sending prompts of several hundred thousand tokens.
:::

### Example

```bash
curl https://developer.amd.com.cn/radeon/api/v1/chat/completions \
  -H "Authorization: Bearer $RADEON_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "Hy4-flash",
    "reasoning_effort": "none",
    "messages": [
      { "role": "user", "content": "Why is the sky blue?" }
    ]
  }'
```

`none` returns the answer without thinking. Omit it to let the model think.
