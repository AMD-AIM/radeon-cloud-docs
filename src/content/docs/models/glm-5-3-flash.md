---
title: GLM-5.3-Flash
description: Zhipu's GLM-5.3-Flash — thinking is on by default, and this is the one model whose top effort tier is `high`.
sidebar:
  order: 7
---

<div class="rc-endpoint">
  <span class="rc-method" data-m="POST">POST</span>
  <span class="rc-path">/v1/chat/completions</span>
  <span class="rc-auth">model: <code>GLM-5.3-Flash</code></span>
</div>

## About the model

GLM-5.3-Flash is the speed-oriented member of Zhipu's GLM-5.3 line. It is a text-only reasoning
model: it thinks before answering, and it does so without being asked.

## On this endpoint

### At a glance

| | |
|---|---|
| Context length | 262,144 tokens |
| Input modalities | text only — **no image input** |
| Streaming | ✅ |
| Tool calling | ✅ |
| JSON output | ✅ `json_object` |
| Thinking | ✅ — **on unless you turn it down** |

### Thinking

**Omitting `reasoning_effort` does not disable thinking.** Across 48 hours of production traffic,
60.5% of requests that sent no `reasoning_effort` still came back with a populated `reasoning` and
a non-zero `reasoning_tokens`. Whether the model thinks, and for how long, tracks the prompt: the
median was 77 reasoning tokens, and the longest single response used 32,000.

Accepted values:

| Tier | Notes |
|---|---|
| omitted | still thinks |
| `low` | |
| `medium` | |
| `high` | the longest tier |

:::danger[`xhigh` is a 400 here — this model is the exception]
Every other thinking model on this platform takes `xhigh` as its top tier, and
[Qwen3.8-Flash-Next](/radeon-cloud-docs/models/qwen3-8-flash-next/) and
[Qwen3.8-27B](/radeon-cloud-docs/models/qwen3-8-27b/) reject `high`. GLM-5.3-Flash is the mirror
image: `high` works, `xhigh` does not.

```
reasoning_effort: unknown variant `xhigh`, expected one of `low`, `medium`, `high`
```

`none`, `minimal` and `max` are rejected the same way. Only `low`, `medium` and `high` are
accepted — the OpenAI trio, and nothing else.

Portable code that has to run against both this model and the Qwen models cannot share one literal
for "think hard": send `high` here and `xhigh` there, or omit the parameter on both.
:::

There is no `reasoning_effort` value that turns thinking off — `none` is not in the enum. To keep
a response short, cap `max_tokens` instead, and read the answer from `content` rather than
`reasoning`.

Thinking text arrives in `choices[0].message.reasoning`. This model does not return
`usage.completion_tokens_details`, so thinking tokens are not reported separately; they are
included in `usage.completion_tokens`.

:::caution[Thinking consumes your `max_tokens` budget]
Reasoning tokens are billed and counted as output. A small `max_tokens` can be spent entirely on
thinking, leaving `content` as `null` and `finish_reason` as `length`. Budget for both, or lower
the tier.
:::

### Limits

| | |
|---|---|
| Context window | 262,144 tokens, counted as a **total budget** — prompt plus output, not an output-only allowance |
| JSON output | `response_format: {"type": "json_object"}` |
| Controlling thinking | `reasoning_effort` (or the equivalent `reasoning.effort`) — `low`, `medium`, `high` |

`max_tokens` is capped against the **total** budget, prompt included. Requesting 65,536 output
tokens on top of a long prompt fails with:

```
This model's maximum context length is 262144 tokens. However, you requested 65536 output tokens …
```

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

Swap `high` for `xhigh` and the same request becomes a 400 on this model — see
[the warning above](#thinking).
