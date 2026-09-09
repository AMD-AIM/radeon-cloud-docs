---
title: MiniCPM5-2B
description: 面壁的 2B 稠密模型——本端点上上下文最短的一个，也是唯一一个接受 reasoning_effort 却不产生思考内容的模型。
sidebar:
  order: 5
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
| 思考 | ❌ —— **见下**，参数收但不产生分离的思考内容 |
| 推理引擎 | vLLM |
| 稳定性 | `experimental` |

### 思考

**这个模型接受 `reasoning_effort`，但它不起作用。** 用一道多步应用题、`max_tokens: 600`
逐档实测：

| `reasoning_effort` | HTTP | `reasoning` | `reasoning_tokens` |
|---|:---:|:---:|:---:|
| 省略 | `200` | 空 | `0` |
| `low` | `200` | 空 | `0` |
| `medium` | `200` | 空 | `0` |
| `high` | `200` | 空 | `0` |
| `none` `minimal` `xhigh` `max` | `422` | — | — |

同一道题发给 [Qwen3.8-Flash-Next](/radeon-cloud-docs/zh-cn/models/qwen3-8-flash-next/)
返回了 392 个 reasoning token，所以问题在模型本身，不在端点。

:::caution[不要指望用这个模型拿到分离的思考过程]
模型仍然会推理，只是**把推理写在 `content` 里**，和不思考的模型一样。
如果你的代码靠读 `choices[0].message.reasoning` 来渲染思考面板，
对这个模型会渲染出一个空面板。要么按模型分支，要么只读 `content`。

传 `reasoning_effort` 不会报错，但也换不来任何东西。
:::

### `messages`

`system` 消息可以放在任意位置，也可以有多条。角色名要写 `system`——
这个模型不接受 `developer`（`422`）。

### 工具

`tools` 和 `parallel_tool_calls` 都接受。给它一个 `get_weather` 工具、问巴黎天气，
模型正确发出了调用，`finish_reason` 返回 `tool_calls`。但请记住**这是个 2B 模型**：
在交给它工具驱动的活之前，请用你自己的 prompt 多测几次。

### 限制

| | |
|---|---|
| 上下文窗口 | 131,072 token，**prompt 与输出合并计算** |
| JSON 输出 | `response_format: {"type": "json_object"}` |
| 输入 | 仅文本——带图像会返回 `400 Model MiniCPM5-2B does not support image input` |

:::caution[这是本端点上最小的窗口]
131,072 远小于其它模型（两个 DeepSeek 都是 1,048,576）。从别的模型迁过来时，
记得把 `max_tokens` 一起调小。
:::
