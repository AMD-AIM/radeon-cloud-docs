---
title: MiniCPM-V-4.7-1B
description: OpenBMB 的小型视觉语言模型——稠密 Qwen3.5 骨干、BF16 权重与可选思考。
sidebar:
  order: 10
---

<div class="rc-endpoint">
  <span class="rc-method" data-m="POST">POST</span>
  <span class="rc-path">/v1/chat/completions</span>
  <span class="rc-auth">model: <code>MiniCPM-V-4.7-1B</code></span>
</div>

## 关于这个模型

这里提供的是 **[OpenBMB/MiniCPM-V-4.7-1B](https://huggingface.co/openbmb/MiniCPM-V-4.7-1B)**
官方权重，采用稠密 Qwen3.5 语言骨干，接受文本和图像，默认直接回答，需要显式开启思考。
它不是独立提供的纯文本 MiniCPM5-2B；同系列的大型 MoE 版本见
[MiniCPM-V-4.7-35B-A3B](/radeon-cloud-docs/zh-cn/models/minicpm-v4-7-35b-a3b/)。

### 架构

取自官方权重固定版本的
[`config.json`](https://huggingface.co/openbmb/MiniCPM-V-4.7-1B/raw/984a89aafcd5160164f4f0d04b4be0f4eec03cb8/config.json)。
下表的层数与注意力维度来自 `text_config`：

| | |
|---|---|
| 架构 | `MiniCPMV4_7ForConditionalGeneration`，`model_type = minicpmv4_7` |
| 语言骨干 | 稠密 Qwen3.5，`model_type = qwen3_5_text` |
| 层数 | 24 —— **18 层线性注意力 + 6 层全注意力**；每第 4 层为全注意力 |
| 隐藏维度 | 1,024 |
| 全注意力 | 8 个 Q 头、2 个 KV 头；头维度 **256** |
| 线性注意力 | 16 个 key 头、16 个 value 头；key/value 头维度均为 128，卷积核大小为 4 |
| 中间维度 | 3,584 |
| 词表 | 248,094 |
| 原生上下文 | 262,144 |
| 精度 | `bfloat16` —— **未量化权重** |

独立的 `vision_config` 描述视觉塔：

| | |
|---|---|
| 模型类型 | `minicpmv4_7_vision` |
| 层数 / 隐藏维度 / 头数 | 27 / 1,152 / 16 |
| 中间维度 | 4,304 |
| patch 大小 | 14 |
| 配置图像尺寸 | 980，不代表上传图片的尺寸上限 |

外层配置通过 `downsample_mode = 16x` 指定默认视觉压缩。

## 本端点上的行为

:::note[中国区共享 API —— 2026-10-13 验证]
以下服务行为适用于 `https://developer.amd.com.cn/radeon/api/v1`，不代表其它区域或独占部署。
当前可用状态和价格以 [`GET /v1/models`](/radeon-cloud-docs/zh-cn/api/models/) 为准。
:::

### 概览

| | |
|---|---|
| 上下文长度 | 262,144 token |
| 输入模态 | 文本、图像 |
| 流式 | ✅ |
| 工具调用 | ✅ —— 包括工具结果回填与流式调用 |
| JSON 输出 | ✅ `json_object`；本模型在此部署上不支持严格 `json_schema` |
| 思考 | ✅ —— **默认关闭，需要显式开启** |
| 推理引擎 | SGLang |
| 稳定性 | 目录标签尚未核实，以当前模型目录为准 |

### `messages`

使用常规的 `user` / `assistant` 对话；需要系统指令时，使用一条置于首位的 `system`。
本模型尚未验证多条或非首位 `system` 消息，以及 `developer` 角色。
图片与文本部件放在同一条用户消息的 `content` 数组中。

### 思考

思考**默认关闭**。开启时，在请求顶层传入：

```json
{"chat_template_kwargs": {"enable_thinking": true}}
```

Python OpenAI SDK 使用 `extra_body={"chat_template_kwargs": {"enable_thinking": True}}`。
显式关闭时将 `enable_thinking` 设为 `false`。本模型尚未确立 `reasoning_effort` 档位
或独立思考 token 预算的支持契约。

| | |
|---|---|
| 非流式思考文本 | `choices[].message.reasoning` |
| SSE 思考文本 | `choices[].delta.reasoning` |
| 最终回答 | `choices[].message.content`；SSE 为 `choices[].delta.content` |
| 独立思考 token 数（如有） | `usage.completion_tokens_details.reasoning_tokens` 或 `usage.reasoning_tokens` |

读取 **`reasoning`，不是 `reasoning_content`**，并与最终答案分开保存。文本字段缺失或为 null
是合法情况。流式请求使用 `stream: true`；通过 `stream_options: {"include_usage": true}`
请求最终用量，并处理 `choices: []` 的纯 usage 分片。用量计数沿用返回值，不要将两个思考
计数字段相加，也不要再次加进总数；字段缺失表示未提供，不代表一定为零。
思考 SSE 已通过测试；非流式字段名遵循网关契约，但该轮没有单独复验非流式思考。

### 图像输入

单图与两图请求已通过功能测试。使用 `image_url` 内容部件：

```json
{
  "role": "user",
  "content": [
    {"type": "image_url", "image_url": {"url": "data:image/png;base64,<BASE64_PNG>"}},
    {"type": "text", "text": "描述这张图片，并抄写其中可见的文字。"}
  ]
}
```

将 `<BASE64_PNG>` 替换为图片的 base64 数据，MIME 类型应与文件格式一致。
多图时按问题引用顺序重复添加 `image_url` 部件。这不代表无限图片数量或 OCR 准确率保证。
图像用量由 `usage.prompt_tokens_details.image_tokens` 报告；视觉 tokens 占用上下文，
base64 也会增加请求体大小。

服务使用 **16x** 视觉压缩。`mm_processor_kwargs`（包括 `downsample_mode="4x"`）
**不透传**，传入该参数不会改变压缩配置。

### 工具

`tools` 搭配 `tool_choice="auto"`、`"required"` 或指定函数均已通过测试，工具结果回填和
流式工具调用也已验证。模型只提出调用请求，由应用执行工具；执行前校验工具名与参数，
先将包含 `tool_calls` 的 assistant 消息追加到对话，再将各项结果以 `role: "tool"` 消息
回填，保留各自对应的 `tool_call_id`，然后请求最终回答。

仅在 `finish_reason="tool_calls"` 且调用完整时执行工具。流式响应需按 choice 和 tool-call
的 index 累加 `delta.tool_calls`，再解析完整的参数 JSON。回填后的最终回答也需检查
`finish_reason`，不能把 `length` 当作正常完成。
`parallel_tool_calls` **不透传**，因此 `false` 不能保证一轮只有一个调用。应用需处理实际
返回的全部调用，必要时自行串行执行。

### 结构化输出

| `response_format` | 本模型在当前部署上的结果 |
|---|---|
| `{"type":"json_object"}` | ✅ —— 在提示词中要求 JSON，并解析 `choices[0].message.content` |
| `{"type":"json_schema","json_schema":{...}}` | ❌ —— `MiniCPM-V-4.7-1B` 在此部署上返回 400 |

JSON 对象模式和工具参数 JSON 不等于响应受到严格 Schema 约束。解析前先确认响应完整，
再由应用校验必需字段与类型。这是本款 MiniCPM 部署的限制，不代表共享 API 的所有模型。

### 限制

| | |
|---|---|
| 上下文窗口 | 262,144 token，**输入与生成输出合并计算** |
| 配置的输出上限 | 32,768 token，同时受剩余上下文约束 |
| 输入 | 文本、图像；这里的 `video_url` 返回 400，音频未验证 |
| JSON 输出 | `json_object`；本模型在这里不支持严格 `json_schema` |
| 思考开关 | `chat_template_kwargs.enable_thinking` |
| 请求覆盖 | `parallel_tool_calls` 与 `mm_processor_kwargs` 不透传 |

:::caution[配置窗口不等于已完成满窗口验收]
系统提示、历史对话、工具定义、聊天模板和图像都占上下文；思考也占输出预算，不能提交
256K 输入后再额外生成输出。完整 256K 公网端到端请求尚未完成验收。
长 Agent 循环、思考与结构化输出组合，以及本模型的 Anthropic/Responses 兼容性也尚未验证。
:::

普通文本或图片回答，以及工具执行后的最终回答，应在 `finish_reason="stop"` 后才视为完整。
SSE 需检查结束时的 choice；`length` 或缺少结束原因均不能默认为成功完成。
大请求还可能受入口、超时及[限流](/radeon-cloud-docs/zh-cn/api/rate-limits/)约束。

### 示例

使用准确的模型 ID，不加 `openbmb/` 前缀。将控制台中的 Model API Key 设置为环境变量
`RADEON_API_KEY`，不要把真实密钥提交到代码中。

```bash
curl --fail-with-body https://developer.amd.com.cn/radeon/api/v1/chat/completions \
  -H "Authorization: Bearer $RADEON_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "MiniCPM-V-4.7-1B",
    "messages": [{"role": "user", "content": "计算 17 加 25，只回复数字。"}],
    "temperature": 0,
    "max_tokens": 64
  }'
```

检查 `finish_reason` 后读取 `choices[0].message.content`，token 计数从 `usage` 读取。
2026-10-13 核实的计量价为每百万 tokens：**输入 $0.035 / 输出 $0.07 / 缓存命中输入 $0.0007**。
这是用量/额度记账单价，不代表自动现金扣款；实时价格看模型目录，实际用量看中国区控制台。