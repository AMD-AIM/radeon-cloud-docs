---
title: GLM-5.3-Flash
description: Z.AI's sparse MoE reasoning model — thinking is on by default, and its top effort tier is spelled differently from every other model here.
sidebar:
  order: 7
---

<div class="rc-endpoint">
  <span class="rc-method" data-m="POST">POST</span>
  <span class="rc-path">/v1/chat/completions</span>
  <span class="rc-auth">model: <code>GLM-5.3-Flash</code></span>
</div>

## About the model

The weights served here are **GLM-5.3-Flash**, Z.AI's speed-oriented member of the GLM-5.3 line —
a sparse Mixture-of-Experts model that thinks before answering, and does so without being asked.

### Architecture

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
| Vocabulary | 154,880 |
| Native context | 1,048,576 |
| Quantisation | FP8, `e4m3`, block `[128, 128]`, dynamic activation scaling |
| Licence | MIT |

:::note[Served at 262,144, not the native 1,048,576]
The weights declare a 1M-token window, but this endpoint runs them with `--max-model-len 262144`.
262,144 is what you get here; requests are measured against that, not against the number in
`config.json`.
:::

:::note[The weights carry a vision encoder — this endpoint does not use it]
`config.json` includes a `glm5_next_vision` tower (24 layers, 448 px, patch 14) and image/video
token ids, so the release is multimodal. This deployment serves text only. See
[Image input](#image-input) for what an image request actually returns.
:::

## On this endpoint

### At a glance

| | |
|---|---|
| Context length | 262,144 tokens |
| Input modalities | text only |
| Streaming | ✅ |
| Tool calling | ✅ |
| JSON output | ✅ `json_object` |
| Thinking | ✅ — **on unless you turn it down** |
| Inference engine | vLLM |
| Stability | `experimental` |

### `messages`

A `system` message may sit at any position, and there may be more than one — unlike
[Qwen3.8-Flash-Next](/radeon-cloud-docs/models/qwen3-8-flash-next/), which allows exactly one and
insists it comes first.

:::caution[Spell the role `system`, not `developer`]
The accepted roles are `system`, `user`, `assistant`, `tool`. Newer OpenAI SDKs emit `developer`
in place of `system`; if yours does, override it back to `system`. There is no fallback — the
request is rejected while the body is being deserialised, with a **422**:

```
Failed to deserialize the JSON body into the target type: messages[0]: unknown role: developer
```
:::

### Thinking

**Omitting `reasoning_effort` does not disable thinking.** A plain request already returns a
populated `reasoning`. How long the model thinks tracks the prompt rather than the tier — a
one-line question may produce a few dozen reasoning tokens, a puzzle several thousand.

Accepted values:

| Tier | Notes |
|---|---|
| omitted | still thinks |
| `low` | |
| `medium` | |
| `high` | the longest tier |

:::caution[`xhigh` is a 422 here — this model is the exception]
Every other thinking model on this platform takes `xhigh` as its top tier, and
[Qwen3.8-Flash-Next](/radeon-cloud-docs/models/qwen3-8-flash-next/) and
[Qwen3.8-27B](/radeon-cloud-docs/models/qwen3-8-27b/) reject `high`. GLM-5.3-Flash is the mirror
image: `high` works, `xhigh` does not.

```
Failed to deserialize the JSON body into the target type: reasoning_effort: unknown variant `xhigh`, expected one of `low`, `medium`, `high` at line 1 column 131
```

The status is **422**, not the 400 that Qwen3.8-27B returns for the same class of mistake — the
value is rejected while the request body is being deserialised, before any validator sees it.

`none`, `minimal` and `max` produce the same 422 with their own name in the message. Only `low`,
`medium` and `high` are accepted — the OpenAI trio, and nothing else.

Portable code that has to run against both this model and the Qwen models cannot share one literal
for "think hard": send `high` here and `xhigh` there, or omit the parameter on both.
:::

There is no `reasoning_effort` value that turns thinking off — `none` is not in the enum. To keep
a response short, cap `max_tokens` instead, and read the answer from `content` rather than
`reasoning`.

Where the output lands:

| | |
|---|---|
| Thinking text | `choices[0].message.reasoning` |
| Token count | `usage.completion_tokens_details.reasoning_tokens` |

:::caution[Thinking consumes your `max_tokens` budget]
Reasoning tokens are billed and counted as output. A small `max_tokens` can be spent entirely on
thinking, leaving `content` as `null` and `finish_reason` as `length`. Budget for both, or lower
the tier.
:::

### Image input

Not available on this endpoint, despite the vision tower in the weights. An `image_url` part comes
back as a 400 whose message describes a server-side path setting rather than the real reason:

```
Invalid `--allowed-local-media-path`: The path <path> does not exist.
```

Send text only. For images use
[DeepSeek-V4-Flash-Vision-Exp](/radeon-cloud-docs/models/deepseek-v4-flash-vision-exp/),
[DeepSeek-V4.1-Flash](/radeon-cloud-docs/models/deepseek-v4-1-flash/) or either Qwen3.8 model.

### Limits

| | |
|---|---|
| Context window | 262,144 tokens, counted as a **total budget** — prompt plus output, not an output-only allowance |
| Input | text only; for images use [DeepSeek-V4.1-Flash](/radeon-cloud-docs/models/deepseek-v4-1-flash/) |
| JSON output | `response_format: {"type": "json_object"}` |
| Thinking tiers | `reasoning_effort` (or the equivalent `reasoning.effort`) — `low`, `medium`, `high` |

`max_tokens` is capped against the **total** budget, prompt included:

```
This model's maximum context length is 262144 tokens. However, you requested 128000 output tokens and your prompt contains at least 134145 input tokens, for a total of at least 262145 tokens. Please reduce the length of the input prompt or the number of requested output tokens.
```

That one is a 400, unlike the 422 above.

### Example

```bash
curl https://developer.amd.com.cn/radeon/api/v1/chat/completions \
  -H "Authorization: Bearer $RADEON_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "GLM-5.3-Flash",
    "reasoning_effort": "high",
    "messages": [
      { "role": "user", "content": "Why is the sky blue?" }
    ]
  }'
```

Swap `high` for `xhigh` and the same request becomes a 422 on this model — see
[Thinking](#thinking).
