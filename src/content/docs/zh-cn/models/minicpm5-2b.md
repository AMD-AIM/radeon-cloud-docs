---
title: MiniCPM5-2B
description: 面壁的 2B 稠密模型——本端点上上下文最短的一个，未量化供应。
sidebar:
  order: 8
---

<div class="rc-endpoint">
  <span class="rc-method" data-m="POST">POST</span>
  <span class="rc-path">/v1/chat/completions</span>
  <span class="rc-auth">model: <code>MiniCPM5-2B</code></span>
</div>

## 规格

跑的是 **`openbmb/MiniCPM5-2B`**，取自随权重发布的 `config.json`：

| | |
|---|---|
| 架构 | `LlamaForCausalLM`，`model_type = llama` |
| 层数 | 42 |
| 隐藏维度 | 2,048 |
| 注意力 | 16 个 Q 头、2 个 KV 头（GQA）|
| 中间维度 | 6,144 |
| 词表 | 130,560 |
| 上下文 | 131,072 |
| 精度 | `bfloat16` —— **未量化** |

本端点上唯一一个稠密（非 MoE）模型，也是唯一一个未量化的模型。上下文 131,072 是这里最短的。

## 本端点上的行为

### 概览

| | |
|---|---|
| 上下文长度 | 131,072 token |
| 输入模态 | 仅文本 |
| 流式 | ✅ |
| 工具调用 | ✅（见下）|
| JSON 输出 | ✅ `json_object` |
| 思考 | ❌ |
| 推理引擎 | vLLM |
| 稳定性 | `experimental` |

### 思考

这个模型直接给答案，不返回分离的思考内容：`choices[0].message.reasoning` 为空，
`usage.completion_tokens_details.reasoning_tokens` 为 `0`。

答案从 `choices[0].message.content` 读。需要分离的思考过程时，用
[DeepSeek-V4-Flash](/radeon-cloud-docs/zh-cn/models/deepseek-v4-flash/) 或
[Qwen3.8-Flash-Next](/radeon-cloud-docs/zh-cn/models/qwen3-8-flash-next/)。

### `messages`

`system` 消息可以放在任意位置，也可以有多条。角色名写 `system`。

### 工具

`tools` 和 `parallel_tool_calls` 都接受。给它一个 `get_weather` 工具、问巴黎天气，
模型发出了调用，`finish_reason` 返回 `tool_calls`。和任何同等体量的模型一样，
交给它工具驱动的活之前，先用你自己的 prompt 试一试。

### 限制

| | |
|---|---|
| 上下文窗口 | 131,072 token，**prompt 与输出合并计算** |
| JSON 输出 | `response_format: {"type": "json_object"}` |
| 输入 | 仅文本 |

:::caution[这是本端点上最小的窗口]
131,072 远小于其它模型（两个 DeepSeek 都是 1,048,576）。从别的模型迁过来时，
记得把 `max_tokens` 一起调小。
:::
