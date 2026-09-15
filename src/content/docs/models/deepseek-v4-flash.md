---
title: DeepSeek-V4-Flash
description: DeepSeek's million-token agentic model — what the vendor ships, and how it behaves on this endpoint.
sidebar:
  order: 2
---

<div class="rc-endpoint">
  <span class="rc-method" data-m="POST">POST</span>
  <span class="rc-path">/v1/chat/completions</span>
  <span class="rc-auth">model: <code>DeepSeek-V4-Flash</code></span>
</div>

## About the model

The weights served here are **DeepSeek-V4-Flash-0731**, DeepSeek's official release of
DeepSeek-V4-Flash, superseding the earlier preview. The vendor positions it as an agentic model:
on the benchmarks published in its model card it beats DeepSeek-V4-Pro (Preview) despite a far
smaller activated parameter count. The accompanying technical report is titled *DeepSeek-V4:
Towards Highly Efficient Million-Token Context Intelligence*
([arXiv:2606.19348](https://arxiv.org/abs/2606.19348)).

### Architecture

From the shipped `config.json`:

| | |
|---|---|
| Architecture | `DeepseekV4ForCausalLM` (`deepseek_v4`) |
| Layers | 43 |
| Hidden dimension | 4,096 |
| Attention | 64 query heads, 1 KV head — MLA, `q_lora_rank` 1,024, 64-dim RoPE split |
| Mixture of Experts | 256 routed + 1 shared, **6 routed activated per token**, expert intermediate 2,048 |
| Vocabulary | 129,280 |
| Native context | 1,048,576 |
| Multi-token prediction | 1 layer |
| Quantisation | FP8 `e4m3`, block `[128, 128]`, dynamic activation scaling |
| Licence | MIT |

The million-token window is native — it is `max_position_embeddings` in the config, not a RoPE
extension applied at serve time.

### What the vendor recommends

The model card suggests `temperature = 1.0`, with `top_p = 0.95` for agentic use and `top_p = 1.0`
otherwise. Both parameters are accepted here, so you can follow that advice as written.

:::note[No Jinja chat template]
Unlike most open-weight releases, this one ships **no Jinja chat template** — prompt assembly lives
in a Python `encoding/` folder instead. That is why this model has no opinion about where a
`system` message sits: there is no template to raise on it. The
[Qwen3.8-Flash-Next](/radeon-cloud-docs/models/qwen3-8-flash-next/) page shows what happens when a
model does ship one.
:::

## On this endpoint

### At a glance

| | |
|---|---|
| Context length | **1,048,576** tokens |
| Input modalities | text only |
| Streaming | ✅ |
| Tool calling | ✅ |
| JSON output | ✅ `json_object` |
| Thinking | ✅ — **off unless you ask** |
| Stability | `experimental` |

### Thinking

**Omitting `reasoning_effort` means no thinking.** A plain request returns an empty `reasoning`
and `reasoning_tokens: 0`.

The model card describes three levels — `low`, `high`, `max`. This endpoint accepts all seven
values:

| `none` | `minimal` | `low` | `medium` | `high` | `xhigh` | `max` |
|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

They do not map to seven distinct behaviours: `minimal`/`low`/`medium` produce a similar amount of
thinking and `high`/`max` think noticeably longer — two effective tiers, broadly consistent with
the three the vendor documents.

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

### `messages`

A `system` message may sit at any position, there may be more than one, and the role may be spelled
either `system` or `developer`.

That is *not* true of [Qwen3.8-Flash-Next](/radeon-cloud-docs/models/qwen3-8-flash-next/). If one
code path has to serve both, write to that model's stricter rules: a single `system` message, first
in the array, with the role spelled `system`.

### Limits

| | |
|---|---|
| Context window | 1,048,576 tokens, counted as **prompt plus output** |
| JSON output | `response_format: {"type": "json_object"}` |
| Turning thinking on | `reasoning_effort` (or the equivalent `reasoning.effort`) |
| Input | text only; for images use [DeepSeek-V4-Flash-Vision-Exp](/radeon-cloud-docs/models/deepseek-v4-flash-vision-exp/) |

### Example

```bash
curl https://developer.amd.com.cn/radeon/api/v1/chat/completions \
  -H "Authorization: Bearer $RADEON_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "DeepSeek-V4-Flash",
    "reasoning_effort": "low",
    "temperature": 1.0,
    "top_p": 0.95,
    "messages": [
      { "role": "system", "content": "Answer in one sentence." },
      { "role": "user", "content": "Why is the sky blue?" }
    ]
  }'
```
