---
title: MiniCPM-V-4.7-35B-A3B
description: OpenBMB's 35B sparse vision-language model — a Qwen3.5-MoE backbone, BF16 weights and optional thinking.
sidebar:
  order: 11
---

<div class="rc-endpoint">
  <span class="rc-method" data-m="POST">POST</span>
  <span class="rc-path">/v1/chat/completions</span>
  <span class="rc-auth">model: <code>MiniCPM-V-4.7-35B-A3B</code></span>
</div>

## About the model

The weights served here are **[OpenBMB/MiniCPM-V-4.7-35B-A3B](https://huggingface.co/openbmb/MiniCPM-V-4.7-35B-A3B)**,
the V4.7 family's 35B-total, approximately 3B-active MoE vision-language model, with a Qwen3.5-MoE
text backbone. It accepts text and images and answers without thinking unless enabled explicitly.
The smaller dense option is [MiniCPM-V-4.7-1B](/radeon-cloud-docs/models/minicpm-v4-7-1b/).
Neither model is the separate text-only MiniCPM5-2B; A3B does not mean the whole model is 3B.

### Architecture

From the official weights' pinned
[`config.json`](https://huggingface.co/openbmb/MiniCPM-V-4.7-35B-A3B/raw/4c7623a9326e0f74313bbc7292d852a9e3018a70/config.json).
Layer and attention dimensions below refer to `text_config`:

| | |
|---|---|
| Architecture | `MiniCPMV4_7ForConditionalGeneration`, `model_type = minicpmv4_7` |
| Text backbone | Qwen3.5-MoE, `model_type = qwen3_5_moe_text` |
| Layers | 40 — **30 linear-attention + 10 full-attention**; every fourth layer is full attention |
| Hidden dimension | 2,048 |
| Full attention | 16 Q heads, 2 KV heads; head dimension **256** |
| Linear attention | 16 key heads, 32 value heads; key/value head dimensions 128; convolution kernel 4 |
| Mixture of Experts | 256 experts, **8 selected** per token |
| Intermediate dimension | Routed experts: 512; shared expert: 512 |
| Vocabulary | 248,144 |
| Native context | 262,144 |
| Precision | `bfloat16` — **unquantised weights** |

The separate `vision_config` describes the vision tower:

| | |
|---|---|
| Model type | `minicpmv4_7_vision` |
| Layers / hidden dimension / heads | 27 / 1,152 / 16 |
| Intermediate dimension | 4,304 |
| Patch size | 14 |
| Configured image size | 980 — not an uploaded-image size limit |

The outer configuration sets the default visual compression to `downsample_mode = 16x`.

## On this endpoint

:::note[China shared API — verified 2026-10-13]
These service behaviours apply to `https://developer.amd.com.cn/radeon/api/v1`, not every
regional or dedicated deployment. Current availability and prices come from
[`GET /v1/models`](/radeon-cloud-docs/api/models/).
:::

### At a glance

| | |
|---|---|
| Context length | 262,144 tokens |
| Input modalities | Text, image |
| Streaming | ✅ |
| Tool calling | ✅ — including tool-result continuation and streamed calls |
| JSON output | ✅ `json_object`; strict `json_schema` unavailable for this model here |
| Thinking | ✅ — **off by default**, enable explicitly |
| Inference engine | SGLang |
| Stability | Catalog tag not verified; consult the current model catalog |

### `messages`

Use ordinary `user` / `assistant` turns. If needed, put one `system` message first.
Multiple or later `system` messages and the `developer` role have not been qualified for this model.
Images go in a user message's `content` array, alongside text parts.

### Thinking

Thinking is **off by default**. To enable it, send this top-level request field:

```json
{"chat_template_kwargs": {"enable_thinking": true}}
```

With the Python OpenAI SDK, use `extra_body={"chat_template_kwargs": {"enable_thinking": True}}`.
Set `enable_thinking` to `false` to disable it explicitly. A `reasoning_effort` tier or separate
thinking-token-budget contract has not been established for this model.

| | |
|---|---|
| Thinking text, non-streaming | `choices[].message.reasoning` |
| Thinking text, SSE | `choices[].delta.reasoning` |
| Final answer | `choices[].message.content`, or `choices[].delta.content` in SSE |
| Separate thinking-token count, when supplied | `usage.completion_tokens_details.reasoning_tokens` or `usage.reasoning_tokens` |

Read **`reasoning`, not `reasoning_content`**, and keep it separate from the final answer.
Absent/null text fields are valid. For SSE, enable `stream: true`; request final usage with
`stream_options: {"include_usage": true}` and handle usage-only chunks with `choices: []`.
Keep usage counts as returned: do not sum the two thinking counters or add them again to totals.
A missing counter means unavailable, not necessarily zero. Thinking SSE was tested;
non-streaming field names follow the gateway contract but were not separately re-tested in this round.

### Image input

Single-image and two-image requests passed functional tests. Use an `image_url` content part:

```json
{
  "role": "user",
  "content": [
    {"type": "image_url", "image_url": {"url": "data:image/png;base64,<BASE64_PNG>"}},
    {"type": "text", "text": "Describe the image and transcribe any visible text."}
  ]
}
```

Replace `<BASE64_PNG>` with the image's base64 data and match the MIME type to its format.
For multiple images, repeat the `image_url` part in question order. This is not an unlimited-image
or OCR-accuracy guarantee. Image usage is reported in `usage.prompt_tokens_details.image_tokens`;
visual tokens consume context, and base64 increases request size.

The service uses **16x** visual compression. `mm_processor_kwargs`, including
`downsample_mode="4x"`, is **not forwarded**; sending it does not change the compression profile.

### Tools

`tools` with `tool_choice="auto"`, `"required"`, or a named function passed tests, as did
tool-result continuation and streamed tool calls. The model requests a call; your application
executes it. Validate names and arguments. Append the assistant message containing `tool_calls`
to the conversation, then append each result as a `role: "tool"` message with its matching
`tool_call_id` before requesting the final answer.

Only execute complete calls after `finish_reason="tool_calls"`. For SSE, accumulate
`delta.tool_calls` by choice and tool-call index before parsing argument JSON. Check the final
answer's `finish_reason` as well: `length` is not a complete answer.
`parallel_tool_calls` is **not forwarded**; `false` cannot guarantee one call. Handle all returned
calls and execute them serially in your application when needed.

### Structured output

| `response_format` | Result for this model on this deployment |
|---|---|
| `{"type":"json_object"}` | ✅ — ask for JSON in the prompt and parse `choices[0].message.content` |
| `{"type":"json_schema","json_schema":{...}}` | ❌ — returns 400 for `MiniCPM-V-4.7-35B-A3B` here |

JSON object mode and JSON tool arguments do not enforce a response schema. Check for a complete
response before parsing, then validate required fields and types in your application.
This restriction describes this MiniCPM deployment, not every model on the shared API.

### Limits

| | |
|---|---|
| Context window | 262,144 tokens, **prompt plus generated output** |
| Configured output limit | 32,768 tokens, also constrained by remaining context |
| Input | Text and images; `video_url` returns 400 here; audio unverified |
| JSON output | `json_object`; no strict `json_schema` for this model here |
| Thinking switch | `chat_template_kwargs.enable_thinking` |
| Request overrides | `parallel_tool_calls` and `mm_processor_kwargs` not forwarded |

:::caution[Configured context is not full-window qualification]
System text, history, tool definitions, the chat template and images consume context; thinking
also consumes the output budget. Do not send 256K input tokens and expect additional output.
Full 256K public end-to-end requests have not been qualified. Long agent loops, thinking combined
with structured output, and this model's Anthropic/Responses compatibility are also unverified.
:::

For normal text/image answers and the final answer after tool execution, require
`finish_reason="stop"` before treating output as complete. In SSE, inspect the terminal choice;
`length` or a missing finish reason must not silently pass as a finished answer. Large requests
can encounter ingress, timeout and [rate-limit](/radeon-cloud-docs/api/rate-limits/) constraints.

### Example

Use the exact model ID without `openbmb/`. Set `RADEON_API_KEY` to your console's Model API key
in the environment; never commit a real key.

```bash
curl --fail-with-body https://developer.amd.com.cn/radeon/api/v1/chat/completions \
  -H "Authorization: Bearer $RADEON_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "MiniCPM-V-4.7-35B-A3B",
    "messages": [{"role": "user", "content": "Calculate 17 + 25. Reply with the number only."}],
    "temperature": 0,
    "max_tokens": 64
  }'
```

Read `choices[0].message.content` after checking `finish_reason`; token counts are in `usage`.
Metering rates verified on 2026-10-13 were **$0.035 input / $0.07 output / $0.0007 cached input
per million tokens**. These are usage/allowance accounting rates, not a claim of automatic cash
charges. Check current rates in the model catalog and actual usage in the China-region console.