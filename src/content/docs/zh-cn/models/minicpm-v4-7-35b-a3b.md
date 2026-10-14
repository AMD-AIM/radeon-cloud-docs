---
title: MiniCPM-V-4.7-35B-A3B
description: OpenBMB 35B稀疏视觉语言模型接口文档——文本、图像、工具调用、JSON与可选思考。
sidebar:
  order: 11
---

<div class="rc-endpoint">
  <span class="rc-method" data-m="POST">POST</span>
  <span class="rc-path">/v1/chat/completions</span>
  <span class="rc-auth">model: <code>MiniCPM-V-4.7-35B-A3B</code></span>
</div>

本页说明 **MiniCPM-V-4.7-35B-A3B 在共享模型 API 上的调用方式**。服务使用
[OpenBMB 官方权重](https://huggingface.co/openbmb/MiniCPM-V-4.7-35B-A3B)，是V4.7系列中总参数35B、
每token约激活3B参数的MoE视觉语言模型；A3B不代表整模型只有3B参数。
小型稠密版本见 [MiniCPM-V-4.7-1B](/radeon-cloud-docs/zh-cn/models/minicpm-v4-7-1b/)。
两者均不同于独立提供的纯文本 [MiniCPM5-2B](/radeon-cloud-docs/zh-cn/models/minicpm5-2b/)。

:::note[适用范围：中国区共享 API，2026-10-13 验证]
示例使用 `https://developer.amd.com.cn/radeon/api/v1`。当前可用模型和价格以
[`GET /v1/models`](/radeon-cloud-docs/zh-cn/api/models/) 为准；存在文档不等于模型始终在线。
本页不代表其它区域或独占端点具备相同配置和行为。
:::

## 接口与上限

| 项目 | 值 |
|---|---|
| API Base URL | `https://developer.amd.com.cn/radeon/api/v1` |
| 请求中的准确 `model` | `MiniCPM-V-4.7-35B-A3B` |
| 鉴权 | `Authorization: Bearer <YOUR_API_KEY>`，使用控制台中的 Model API Key |
| 输入 / 输出 | 文本、图片 / 文本、JSON 或结构化工具调用 |
| 上下文窗口 | **262,144 tokens**，输入与生成输出共用 |
| 配置的输出上限 | **32,768 tokens**，同时受剩余上下文预算约束 |
| 思考 | 默认关闭；通过 `chat_template_kwargs.enable_thinking=true` 开启 |
| 推理引擎 / 权重精度 | SGLang / BF16 |

系统提示、历史对话、工具定义、聊天模板和视觉 tokens 都占上下文；思考也占生成预算。
应为回答预留空间，不能提交 256K 输入后再额外生成输出。当前已配置完整窗口，但**尚未完成
完整 256K 公网端到端验收**；大请求还可能受入口、超时及[限流](/radeon-cloud-docs/zh-cn/api/rate-limits/)约束。

### 计量价格

2026-10-13 验证的平台计量价：

| 输入 | 输出 | 缓存命中输入 | 单位 |
|---:|---:|---:|---|
| 0.035 | 0.07 | 0.0007 | USD / 百万 tokens |

这是用量/额度记账单价，不表示每个请求都会产生现金扣款。实时价格读取模型目录，实际用量见
[Usage](/radeon-cloud-docs/zh-cn/api/usage/)；不要根据共享 API 的名称推断计量价格为零。

## 文本调用

模型 ID 不加 `openbmb/` 前缀。将 `RADEON_API_KEY` 设置为环境变量，不要把真实密钥提交到代码中。

| 请求字段 | 用途 |
|---|---|
| `model`、`messages` | 必填：准确模型ID与对话消息 |
| `max_tokens`、`temperature` | 输出预算与采样；示例使用有界输出 |
| `stream`、`stream_options.include_usage` | SSE流式及最后的usage分片 |
| `tools`、`tool_choice` | 函数定义及auto、required、none或指定函数 |
| `response_format` | 使用`{"type":"json_object"}`，此端点不支持strict Schema |
| `chat_template_kwargs.enable_thinking` | 可选布尔值，默认`false`；SDK通过`extra_body`传入 |

```bash
curl --fail-with-body https://developer.amd.com.cn/radeon/api/v1/chat/completions \
  -H "Authorization: Bearer $RADEON_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "MiniCPM-V-4.7-35B-A3B",
    "messages": [{"role": "user", "content": "计算17加25，只回复数字。"}],
    "temperature": 0,
    "max_tokens": 64
  }'
```

答案从 `choices[0].message.content` 读取，token 计数从 `usage` 读取。
对话使用常规的 `user` / `assistant` 消息；需要系统指令时，使用一条置于首位的 `system`。
本页没有验证更宽松的 system 排列或 developer 角色写法。

## 单图与多图

安装 Python OpenAI SDK 后，可将本地 PNG 编码成 base64 data URL：

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
        {"type": "text", "text": "描述这张图片，并抄写其中可见的文字。"},
    ]}],
    max_tokens=256,
)
print(result.choices[0].message.content)
```

多图时，在同一个 `content` 数组中按问题引用的顺序放入多个 `image_url` 内容块，再附文本问题。
单图及两图按序理解已通过功能测试；这不代表无限图片数量或 OCR 准确率保证。data URL 的 MIME
类型应与文件格式匹配。base64 会增加请求体大小，解码后的视觉 tokens 也占上下文。

共享端点使用默认 **16x** 视觉压缩配置；**不透传** `mm_processor_kwargs` 请求覆盖，
包括 `downsample_mode="4x"`。不要传入该参数后期待分辨率或 token 用量发生变化。

## 工具调用

`tools` 搭配 `tool_choice="auto"`、`"required"` 或指定函数均通过功能测试。
模型只提出调用请求，**由客户端执行工具**。下面是一次完整回填：

```python
import json
import os
from openai import OpenAI

client = OpenAI(base_url="https://developer.amd.com.cn/radeon/api/v1",
                api_key=os.environ["RADEON_API_KEY"])
model = "MiniCPM-V-4.7-35B-A3B"
tools = [{"type": "function", "function": {
    "name": "add_numbers", "description": "将两个整数相加。",
    "parameters": {"type": "object", "properties": {
        "a": {"type": "integer"}, "b": {"type": "integer"}},
        "required": ["a", "b"], "additionalProperties": False},
}}]
messages = [{"role": "user", "content": "请调用add_numbers计算17加25。"}]
first = client.chat.completions.create(
    model=model, messages=messages, tools=tools,
    tool_choice={"type": "function", "function": {"name": "add_numbers"}},
    temperature=0, max_tokens=256,
)
if first.choices[0].finish_reason != "tool_calls":
  raise RuntimeError("工具调用未正常生成完毕，不执行可能残缺的调用。")
message = first.choices[0].message
calls = message.tool_calls or []
if not calls:
    raise RuntimeError("未返回工具调用，请检查finish_reason和响应内容。")
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
        raise ValueError("工具名或参数不符合预期")
    messages.append({"role": "tool", "tool_call_id": call.id,
                     "content": json.dumps({"sum": args["a"] + args["b"]})})
final = client.chat.completions.create(
    model=model, messages=messages, tools=tools, tool_choice="none", max_tokens=64,
)
print(final.choices[0].message.content)
```

执行前验证工具名和参数，回填时保留对应的 `tool_call_id`。工具结果回填和流式工具调用已通过测试。
接收工具 SSE 时，按 choice 与 tool-call 的 index 累加 `delta.tool_calls`，等参数字符串完整后再解析 JSON。

当前不透传 `parallel_tool_calls`，因此 `false` **不能保证一轮只有一个调用**。
客户端需处理实际返回的全部调用；如业务不允许并发，可在客户端串行执行。

## JSON 输出

支持普通 JSON 对象模式：

```bash
curl --fail-with-body https://developer.amd.com.cn/radeon/api/v1/chat/completions \
  -H "Authorization: Bearer $RADEON_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "MiniCPM-V-4.7-35B-A3B",
    "messages": [{"role": "user", "content": "输出JSON对象，value为整数42，label为字符串ok。"}],
    "response_format": {"type": "json_object"},
    "temperature": 0,
    "max_tokens": 128
  }'
```

将 `choices[0].message.content` 解析为 JSON。**当前共享端点不支持严格
`response_format.type="json_schema"`，请求会返回400。** JSON对象模式和工具参数能解析为JSON，
都不等于响应受到严格Schema约束；应用应自行校验必需字段和类型。

## 思考与流式

本模型**默认关闭思考**。Python SDK 通过 `extra_body` 传入专用开关，在 HTTP 请求中对应
顶层 `chat_template_kwargs` 字段：

```python
import os
from openai import OpenAI

client = OpenAI(base_url="https://developer.amd.com.cn/radeon/api/v1",
                api_key=os.environ["RADEON_API_KEY"])
thinking_parts, answer_parts = [], []
stream = client.chat.completions.create(
    model="MiniCPM-V-4.7-35B-A3B",
    messages=[{"role": "user", "content": "解方程x+y=23、x-y=7，给出x和y。"}],
    extra_body={"chat_template_kwargs": {"enable_thinking": True}},
    stream=True, stream_options={"include_usage": True}, max_tokens=512,
)
for chunk in stream:
    for choice in chunk.choices:
        thought = getattr(choice.delta, "reasoning", None)
        if isinstance(thought, str) and thought:
            thinking_parts.append(thought)
        if isinstance(choice.delta.content, str) and choice.delta.content:
            answer_parts.append(choice.delta.content)
print("".join(answer_parts))  # thinking_parts单独保存，不拼入最终答案。
```

显式关闭时将 `enable_thinking` 设为 `false`。尚未为本模型确立 `reasoning_effort` 档位
或思考 token 定额的支持契约，不要直接照搬其它模型的参数。

| 响应方式 | 思考文本 | 最终回答 |
|---|---|---|
| 非流式 | `choices[].message.reasoning` | `choices[].message.content` |
| SSE | `choices[].delta.reasoning` | `choices[].delta.content` |

读取 `reasoning`，不是 `reasoning_content`；字段缺失/null及没有choices的usage分片都是合法情况。
思考SSE和普通文本/工具SSE已测试；非流式字段名遵循网关契约，该轮未单独进行非流式思考推理复验。
详见[响应字段及计量说明](/radeon-cloud-docs/zh-cn/api/chat-completions/#思考响应字段)。
`finish_reason="length"` 表示生成预算用尽，不应把残缺答案或未完成的工具参数JSON当作完整结果。

## 不支持或尚未验证的路径

- **视频**：共享聊天端点不接受 `video_url`（400）；支持图片不等于视频已开放。音频输入未在本端点/模型上验证。
- **严格JSON Schema、parallel控制、4x覆盖**：当前不可用，见上文。
- 完整256K请求、长Agent循环、思考与结构化输出组合，以及本模型的Anthropic/Responses兼容性未完成该项验收。
- 401是鉴权问题，429是额度/限流，5xx是服务或上游错误；均不能证明不支持的参数已被应用。
  参阅[错误](/radeon-cloud-docs/zh-cn/api/errors/)和[限流](/radeon-cloud-docs/zh-cn/api/rate-limits/)。