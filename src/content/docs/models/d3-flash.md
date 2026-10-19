---
title: d3-flash
description: Decision model (9B) from vLLM Semantic Router. A faster sibling of d3 with the same API.
sidebar:
  order: 16
---

<div class="rc-endpoint">
  <span class="rc-method" data-m="POST">POST</span>
  <span class="rc-path">/v1/systemone</span>
  <span class="rc-auth">model: <code>d3-flash</code></span>
</div>

:::caution[This model is not on `/v1/chat/completions`]
d3-flash does not write text: it answers typed questions with a probability for every option.
`messages`, `max_tokens`, `temperature` and `stream` do not apply.
:::

d3-flash is the 9B model of Decision 3.0, the decision models of
[vLLM Semantic Router](https://huggingface.co/vllm-sr), built on Qwen3.5-9B. It takes the same
requests and returns the same replies as [d3](/radeon-cloud-docs/models/d3/), with the same
32,768-token input limit, about three times faster on this deployment and a little less accurate.
Read the d3 page for the request fields, question types, response and errors.

## At a glance

| | |
|---|---|
| Endpoint | `POST /v1/systemone` |
| Input | a `state` (text or any JSON), plus optional images and videos |
| Output | one answer per question, with a probability for every option |
| Question types | `choice`, `noul`, `score` |
| Input limit | 32,768 tokens per question; longer requests are refused, not truncated |
| Latency | about 0.1 s for a three-question text request, one at a time |
| Streaming | ❌ |
| Billing | per input token, reported as `usage.input_tokens`; `output_tokens` is always `0` |
| Stability | `experimental` |
| License | Apache-2.0 |

## Example

```bash
curl https://developer.amd.com.cn/radeon/api/v1/systemone \
  -H "Authorization: Bearer $RADEON_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "d3-flash",
    "state": "Write a Python function that merges two sorted lists.",
    "questions": {
      "kind": {"type": "choice", "instructions": "What kind of work is this?",
               "criteria": {"code": "Writing or fixing code", "math": "Mathematics", "chat": "Anything else"}},
      "reasoning": {"type": "noul", "instructions": "Does answering this need multi-step reasoning?"}
    }
  }'
```

:::tip[Choosing between d3 and d3-flash]
Start with d3-flash for routing, filtering and other high-volume checks. Switch a question to
[d3](/radeon-cloud-docs/models/d3/) where its answers are close calls: the two can disagree on
those, as on the `reasoning` question above (`noul` 0.41 on d3-flash, 0.58 on d3).
:::
