---
title: MiniCPM5-1B
description: 面壁的 1B 小模型——本端点上最轻的一个，行为与 vLLM 系其它模型一致。
sidebar:
  order: 5
---

<div class="rc-endpoint">
  <span class="rc-method" data-m="POST">POST</span>
  <span class="rc-path">/v1/chat/completions</span>
  <span class="rc-auth">model: <code>MiniCPM5-1B</code></span>
</div>

## 规格

跑的是 **`OpenBMB/MiniCPM5-1B`**，取自随权重发布的 `config.json`：

| | |
|---|---|
| 架构 | `LlamaForCausalLM`，`model_type = llama` |
| 层数 | 24 |
| 隐藏维度 | 1,536 |
| 注意力 | 16 个 Q 头、2 个 KV 头（GQA）|
| 中间维度 | 4,608 |
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
| 思考 | ✅ —— **默认不思考** |
| 推理引擎 | vLLM |
| 稳定性 | `experimental` |

### 思考

**默认不思考**：不传 `reasoning_effort` 时 `reasoning_tokens` 为 0。

| 档位 | 状态 |
|---|:---:|
| 不传 / `low` / `medium` / `high` | 支持 |

:::caution[本模型的最高档叫 `high`，而且不接受 `none`]
和 [Qwen3.8-Flash-Next](/radeon-cloud-docs/zh-cn/models/qwen3-8-flash-next/) **恰好相反**：
那个模型的最高档是 `xhigh`，这里是 `high`。另外 `none` 在那边可用、在这里不可用——
要关掉思考，把这个参数整个去掉就行。跨模型写一套代码时，用 `low` 或 `medium`。
:::

| | |
|---|---|
| 思考文本 | `choices[0].message.reasoning` |
| token 数 | `usage.completion_tokens_details.reasoning_tokens` |
| 不提供 | `usage.reasoning_tokens` —— **没有顶层字段** |

### `messages`

`system` 消息放在哪个位置都行，也可以放多条。角色名请写 `system`，本模型不认 `developer`。

### 工具

`tools` 与 `parallel_tool_calls` 都被接受。实测给一个 `get_weather` 工具并要求调用，它正确发起了调用。
但请注意它**只有 1B**：同一个提示在另一轮探测里它就直接用文本回答了。把工具调用交给它之前，
请按你自己的 prompt 多跑几次。

### 上限

| | |
|---|---|
| 上下文窗口 | 131,072 token，**按 prompt + 输出 的总和算** |
| JSON 输出 | 只支持 `response_format: {"type": "json_object"}` |
| 开启思考 | 只能用 `reasoning_effort`（或等价的 `reasoning.effort`）|
| 输入 | 纯文本，不收图片 |

:::caution[这个窗口是本端点最小的]
131,072 比其它模型小很多（DeepSeek 两个是 1,048,576）。从其它模型迁过来时，
记得把 `max_tokens` 一并改小。
:::
