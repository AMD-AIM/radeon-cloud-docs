---
title: MiniCPM-V-4.7-35B-A3B
description: API reference for OpenBMB's 35B sparse vision-language model — text, images, tools, JSON and optional thinking.
sidebar:
  order: 11
---

<div class="rc-endpoint">
  <span class="rc-method" data-m="POST">POST</span>
  <span class="rc-path">/v1/chat/completions</span>
  <span class="rc-auth">model: <code>MiniCPM-V-4.7-35B-A3B</code></span>
</div>

## About the model

This page documents **MiniCPM-V-4.7-35B-A3B on the shared Model API**, using the official
[OpenBMB weights](https://huggingface.co/openbmb/MiniCPM-V-4.7-35B-A3B). It is the 35B-total,
approximately 3B-active MoE vision-language model in the V4.7 family; A3B does not mean the
whole model contains only 3B parameters. The smaller dense option is
[MiniCPM-V-4.7-1B](/radeon-cloud-docs/models/minicpm-v4-7-1b/).
Neither model replaces the separate text-only [MiniCPM5-2B](/radeon-cloud-docs/models/minicpm5-2b/).

:::note[Scope: China shared API, verified 2026-10-13]
The examples use `https://developer.amd.com.cn/radeon/api/v1`. Availability and current prices
come from [`GET /v1/models`](/radeon-cloud-docs/api/models/). A page existing here does not
guarantee current availability. This is not a claim about every regional or dedicated endpoint.
:::

## On this endpoint

### At a glance

| Item | Value |
|---|---|
| API base URL | `https://developer.amd.com.cn/radeon/api/v1` |
| Exact request `model` | `MiniCPM-V-4.7-35B-A3B` |
| Authentication | `Authorization: Bearer <YOUR_API_KEY>`; use your Model API key from the console |
| Input / output | Text and images / text, JSON or structured tool calls |
| Context window | **262,144 tokens**, shared by the prompt and generated output |
| Configured output limit | **32,768 tokens**, also constrained by the remaining context budget |
| Thinking | Off by default; enable with `chat_template_kwargs.enable_thinking=true` |
| Serving engine / weight precision | SGLang / BF16 |

System and conversation text, tool definitions, chat-template tokens and visual tokens all
consume context. Thinking also uses the generation budget. Leave room for the answer rather
than sending a 256K prompt plus additional output. The full window is configured, but a full
256K end-to-end request has **not** been qualified; large requests can also encounter ingress,
timeout and [rate-limit](/radeon-cloud-docs/api/rate-limits/) constraints.

### Metering prices

The platform rates verified on 2026-10-13 were:

| Input | Output | Cached input | Unit |
|---:|---:|---:|---|
| 0.035 | 0.07 | 0.0007 | USD / 1M tokens |

These are usage/allowance accounting rates, not a claim that every request incurs a cash
charge. Read current pricing from the model catalog and actual usage from your China-region
console. [Usage](/radeon-cloud-docs/api/usage/) describes the response format; its global-host
example is not a query for China-region usage. Do not infer zero metering from the shared API's name.

### Text chat

Use the exact model ID, without `openbmb/`. Set `RADEON_API_KEY` in your environment; do not
commit a real key to source code.

| Parameter | Type | | Description |
|---|---|---|---|
| `model` | string | <span class="rc-req">Required</span> | Exact model ID shown above |
| `messages` | array | <span class="rc-req">Required</span> | Conversation and any image content parts |
| `max_tokens` | integer | <span class="rc-opt">Optional</span> | Generation budget, including thinking |
| `temperature` | number | <span class="rc-opt">Optional</span> | Sampling temperature |
| `stream` | boolean | <span class="rc-opt">Optional</span> | Enable SSE; default `false` |
| `stream_options.include_usage` | boolean | <span class="rc-opt">Optional</span> | Request final stream usage |
| `tools` | array | <span class="rc-opt">Optional</span> | Function definitions |
| `tool_choice` | string or object | <span class="rc-opt">Optional</span> | `auto`, `required`, `none`, or named function |
| `response_format` | object | <span class="rc-opt">Optional</span> | `{"type":"json_object"}`; strict Schema unavailable |
| `chat_template_kwargs.enable_thinking` | boolean | <span class="rc-opt">Optional</span> | Default `false`; SDK uses `extra_body` |

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

Read the answer from `choices[0].message.content` and token counts from `usage`.
Use standard `user` / `assistant` conversation turns; if you include a system instruction,
use one leading `system` message. More permissive system/developer-role layouts are not
qualified by this page.

### Images and multiple images

With the Python OpenAI SDK installed, this example sends a local PNG as a base64 data URL:

```python
import base64
import os
from pathlib import Path
from openai import OpenAI

client = OpenAI(base_url="https://developer.amd.com.cn/radeon/api/v1",
                api_key=os.environ["RADEON_API_KEY"])
encoded = base64.b64encode(Path("image.png").read_bytes()).decode("ascii")
result = client.chat.completions.create(
    model="MiniCPM-V-4.7-35B-A3B",
    messages=[{"role": "user", "content": [
        {"type": "image_url", "image_url": {"url": f"data:image/png;base64,{encoded}"}},
        {"type": "text", "text": "Describe the image and transcribe any visible text."},
    ]}],
    max_tokens=256,
)
print(result.choices[0].message.content)
```

For multiple images, add an `image_url` part for each image in the same `content` array, in the
order referenced by the question. Single-image and two-image requests passed functional tests;
this is not an unlimited-image or OCR-accuracy guarantee. Match the data URL MIME type to the
file format. Base64 increases request size, and decoded visual tokens consume context.

The shared endpoint uses the default **16x** visual compression profile. Request-level
`mm_processor_kwargs` overrides, including `downsample_mode="4x"`, are **not forwarded** on
this endpoint. Do not send them expecting different resolution or token usage.

### Function calling

`tools` plus `tool_choice="auto"`, `"required"`, or a named function passed the functional
checks. The model requests calls; **your application executes the tools**. Example round trip:

```python
import json
import os
from openai import OpenAI

client = OpenAI(base_url="https://developer.amd.com.cn/radeon/api/v1",
                api_key=os.environ["RADEON_API_KEY"])
model = "MiniCPM-V-4.7-35B-A3B"
tools = [{"type": "function", "function": {
    "name": "add_numbers", "description": "Add two integers.",
    "parameters": {"type": "object", "properties": {
        "a": {"type": "integer"}, "b": {"type": "integer"}},
        "required": ["a", "b"], "additionalProperties": False},
}}]
messages = [{"role": "user", "content": "Use add_numbers to calculate 17 + 25."}]
first = client.chat.completions.create(
    model=model, messages=messages, tools=tools,
    tool_choice={"type": "function", "function": {"name": "add_numbers"}},
    temperature=0, max_tokens=256,
)
if first.choices[0].finish_reason != "tool_calls":
  raise RuntimeError("Tool generation did not finish normally; do not execute a partial call.")
message = first.choices[0].message
calls = message.tool_calls or []
if not calls:
    raise RuntimeError("No tool call returned; inspect finish_reason and the response.")
messages.append({"role": "assistant", "content": message.content, "tool_calls": [
    {"id": call.id, "type": "function", "function": {
        "name": call.function.name, "arguments": call.function.arguments}}
    for call in calls
]})
for call in calls:
    args = json.loads(call.function.arguments)
    if (call.function.name != "add_numbers" or not isinstance(args, dict)
            or set(args) != {"a", "b"}
            or any(type(args[k]) is not int for k in ("a", "b"))):
        raise ValueError("Unexpected tool name or arguments")
    messages.append({"role": "tool", "tool_call_id": call.id,
                     "content": json.dumps({"sum": args["a"] + args["b"]})})
final = client.chat.completions.create(
    model=model, messages=messages, tools=tools, tool_choice="none", max_tokens=64,
)
print(final.choices[0].message.content)
```

Always validate tool names and arguments before execution and preserve each `tool_call_id`.
Tool-result continuation and streamed tool calls were tested. For tool SSE, accumulate
`delta.tool_calls` by choice and tool-call index before parsing complete argument JSON.

`parallel_tool_calls` is not forwarded. In particular, `false` does **not** guarantee a single
call here. Handle all returned calls; schedule them serially in your application if necessary.

### JSON output

Ordinary JSON object mode is available:

```bash
curl --fail-with-body https://developer.amd.com.cn/radeon/api/v1/chat/completions \
  -H "Authorization: Bearer $RADEON_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "MiniCPM-V-4.7-35B-A3B",
    "messages": [{"role": "user", "content": "Return a JSON object with integer value 42 and string label ok."}],
    "response_format": {"type": "json_object"},
    "temperature": 0,
    "max_tokens": 128
  }'
```

Parse `choices[0].message.content` as JSON. **Strict `response_format.type="json_schema"` is
not available through this shared endpoint**: it currently returns 400. JSON object mode and
JSON tool arguments do not provide strict response-schema enforcement; validate your application's
expected fields yourself.

### Thinking and streaming

Thinking is **off by default** for this model. With the Python SDK, pass the model-specific
switch through `extra_body`; it becomes the top-level `chat_template_kwargs` field on the wire:

```python
import os
from openai import OpenAI

client = OpenAI(base_url="https://developer.amd.com.cn/radeon/api/v1",
                api_key=os.environ["RADEON_API_KEY"])
thinking_parts, answer_parts = [], []
finish_reason, usage = None, None
stream = client.chat.completions.create(
    model="MiniCPM-V-4.7-35B-A3B",
    messages=[{"role": "user", "content": "Solve x+y=23 and x-y=7. Give x and y."}],
    extra_body={"chat_template_kwargs": {"enable_thinking": True}},
    stream=True, stream_options={"include_usage": True}, max_tokens=512,
)
for chunk in stream:
  if chunk.usage is not None:
    usage = chunk.usage
  for choice in chunk.choices:
    if choice.finish_reason is not None:
      finish_reason = choice.finish_reason
    thought = getattr(choice.delta, "reasoning", None)
    if isinstance(thought, str) and thought:
      thinking_parts.append(thought)
    if isinstance(choice.delta.content, str) and choice.delta.content:
      answer_parts.append(choice.delta.content)
if finish_reason != "stop":
  raise RuntimeError(f"Incomplete answer: finish_reason={finish_reason!r}")
print("".join(answer_parts))  # Keep thinking_parts separate from the final answer.
if usage is not None:
  print(usage.model_dump(exclude_none=True))
```

To disable it explicitly, set `enable_thinking` to `false`. No `reasoning_effort` tier or
thinking-token-budget contract is established for this model; do not copy another model's tiers.

| Response | Thinking text | Final answer |
|---|---|---|
| Non-streaming | `choices[].message.reasoning` | `choices[].message.content` |
| SSE | `choices[].delta.reasoning` | `choices[].delta.content` |

Read `reasoning`, not `reasoning_content`; absent/null text and usage-only chunks are valid.
Thinking SSE and normal text/tool SSE passed tests. Non-streaming field names follow the gateway
contract; a separate non-streaming thinking run was not part of this qualification.
Keep the `usage` counts as returned. A separate thinking-token count may be in
`usage.reasoning_tokens` or `usage.completion_tokens_details.reasoning_tokens`; do not add both
or add them again to totals. If neither is supplied, the separate count is unavailable, not necessarily zero.
If `finish_reason` is `length`, the generation budget was reached; do not treat a partial answer
or partial tool-argument string as complete.

### Limits and unverified paths

- **Video**: `video_url` is not accepted on this shared chat endpoint (400); video support is
  not enabled by the model's image capability. Audio input is not qualified for this endpoint/model.
- **Strict JSON Schema, parallel-call control and 4x overrides**: unavailable as described above.
- Full-window 256K requests, long agent loops, thinking combined with structured output, and this
  model's Anthropic/Responses compatibility have not been qualified by these tests.
- A 401 concerns authentication, 429 concerns quotas, and 5xx concerns service/upstream errors;
  none is evidence that an unsupported parameter has been applied. See
  [Errors](/radeon-cloud-docs/api/errors/) and [Rate limits](/radeon-cloud-docs/api/rate-limits/).