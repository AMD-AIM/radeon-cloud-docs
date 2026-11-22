---
title: Hy4-flash
description: 腾讯的稀疏 MoE 模型，滑动窗口层与稀疏注意力层混合，上下文 100 万 token，支持图像输入。默认思考，chat template 只认两种模式：关闭和 high。
sidebar:
  order: 8.5
---

<div class="rc-endpoint">
  <span class="rc-method" data-m="POST">POST</span>
  <span class="rc-path">/v1/chat/completions</span>
  <span class="rc-auth">model: <code>Hy4-flash</code></span>
</div>

## 模型简介

这里提供的权重是腾讯的 **Hy4-flash**，使用其 FP8 版本 `tencent/Hy4-flash-FP8` ——
一个混合两种注意力层的稀疏 MoE 模型，除文本外也接受图像。除非你关掉，它总会先思考再回答。

### 架构

取自随权重发布的 `config.json`：

| | |
|---|---|
| 架构 | `HYV4FlashForConditionalGeneration`，`model_type = hy_v4_flash` |
| 层数 | 42 —— **12 层稀疏注意力 + 30 层滑动窗口**；第一层是稠密 FFN，其余 41 层是 MoE |
| 隐藏维度 | 3,072 |
| 注意力 | 多头潜在注意力（MLA），32 个头；query 秩 1,024，KV 秩 512；Q/K 头 192 + 64 RoPE，V 头 256；带可学习的 attention sink |
| 稀疏注意力 | 12 层稀疏层上由索引器为每个 query 保留前 **2,048** 个 token |
| 滑动窗口 | **512 token** |
| 专家混合 | 512 个路由专家 + 1 个共享专家，每 token **激活 16 个**，专家中间维度 1,536 |
| 词表 | 120,832 |
| 原生上下文 | 1,048,576 |
| 量化 | FP8，`e4m3`，块 `[128, 128]`，激活动态缩放 |
| 许可证 | 腾讯自有许可证（Hugging Face 上标为 `other`） |

视觉编码器 27 层，隐藏维度 1,152，patch 16，空间合并 2×2。

## 在 Radeon Cloud 上的行为

### 概览

| | |
|---|---|
| 上下文长度 | 1,048,320 token |
| 输入模态 | **文本、图像** |
| 流式 | ✅ |
| 工具调用 | ✅ —— 但 `tool_choice` 不能强制调用，见[工具调用](#工具调用) |
| JSON 输出 | ✅ `json_object` **和** `json_schema` |
| 思考 | ✅ —— **默认开启，传 `reasoning_effort: "none"` 才关闭** |
| 推理引擎 | SGLang |
| 稳定性 | `experimental` |

:::note[按 1,048,320 提供，不是原生的 1,048,576]
权重声明了 1,048,576 个位置，本端点按 1,048,320 运行，请求按 1,048,320 计算。
:::

### `messages`

`system` 消息可以出现在任意位置，也可以有多条。`role: "developer"` 也接受并正常作答，
较新 OpenAI SDK 的输出不需要改写。

### 思考

**不传 `reasoning_effort` 并不会关闭思考**，普通请求返回的 `reasoning` 就有内容。

模型自带的 chat template 只认**两种模式：关闭思考，以及 `high`**。本端点上 OpenAI 的各档位对应如下：

| `reasoning_effort` | 结果 |
|---|---|
| 不传 | 思考 |
| `none` | **不思考** —— 返回里没有 `reasoning` |
| `minimal` | **400** |
| `low` | **400** |
| `medium` | 思考 |
| `high` | 思考 |
| `xhigh` | 思考 |
| `max` | 思考 |

`reasoning: {"effort": "high"}` 与 `reasoning_effort: "high"` 效果相同。

:::caution[`low` 和 `minimal` 在这里是 400]
两者都被模型的 chat template 拒绝，`minimal` 在报错里显示为 `low`：

```
reasoning_effort error : low, should be no_think/high
```

模板自己表示“关闭”的写法 `no_think` 也不被 API 接受——请求还没到模型就被拒掉：

```
Invalid enum value. Expected 'none' | 'minimal' | 'low' | 'medium' | 'high' | 'xhigh' | 'max', received 'no_think'
```

要关闭思考传 `none`，要开启就传 `medium` 或更高的档位。
:::

输出的位置：

| | |
|---|---|
| 思考文本 | `choices[0].message.reasoning` |
| token 数 | `usage.completion_tokens_details.reasoning_tokens`，顶层 `usage.reasoning_tokens` 也有同一个值 |

:::caution[思考会花掉 `max_tokens` 预算]
思考 token 计入输出并计费。`max_tokens` 太小时可能全部花在思考上，`content` 为空。
要么给足预算，要么传 `reasoning_effort: "none"`。
:::

### 图像输入

图片用 `image_url` 内容块传入，支持 base64 data URL。
`usage.prompt_tokens_details.image_tokens` 报告图片的用量——一张 256×256 的 PNG 计 72 个图像 token。

### 结构化输出

两种写法都可以：

| `response_format` | 结果 |
|---|---|
| `{"type": "json_object"}` | ✅ `{"a":1,"b":2}` |
| `{"type": "json_schema", "json_schema": {..., "strict": true}}` | ✅ `{"city": "Shanghai", "population_millions": 24.87}` |

### 工具调用

传 `tools`、`tool_choice` 用默认的 `"auto"` 时，模型认为需要才会调用函数——例如问天气时返回
`get_weather({"city": "上海"})`。

:::caution[`tool_choice` 不能强制调用]
`tool_choice: "required"` 和 `tool_choice: {"type": "function", "function": {"name": "..."}}`
都被接受，但不会强制生效：问题本身用不到工具时，模型直接用文字作答，没有 `tool_calls`，
`finish_reason` 为 `"stop"`。代码必须拿到工具调用时，请检查 `tool_calls` 并处理纯文本的情况。
:::

### 限制

| | |
|---|---|
| 上下文窗口 | 1,048,320 token，按**总预算**算——提示加输出 |
| 输入 | 文本、图像 |
| JSON 输出 | `json_object` 和严格的 `json_schema` |
| 思考档位 | `none` 关闭思考；`medium`、`high`、`xhigh`、`max` 保持开启；`minimal` 和 `low` 返回 400 |
| 工具调用 | `tool_choice: "auto"`；`required` 和指定函数不会强制生效 |

`max_tokens` 按总预算校验，提示也算在内：

```
Requested token count exceeds the model's maximum context length of 1048320 tokens. You requested a total of 1048348 tokens: 28 tokens from the input messages and 1048320 tokens for the completion. Please reduce the number of tokens in the input messages or the completion to fit within the limit.
```

这是 400。

:::caution[100 万的窗口填满需要时间]
整个窗口都能用——约 1,018,000 token 的提示能正确作答——但这么长、又没有缓存的提示，
第一次处理约要 140 秒。发几十万 token 以上的提示前，先调大客户端超时。
:::

### 示例

```bash
curl https://developer.amd.com.cn/radeon/api/v1/chat/completions \
  -H "Authorization: Bearer $RADEON_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "Hy4-flash",
    "reasoning_effort": "none",
    "messages": [
      { "role": "user", "content": "天空为什么是蓝色的？" }
    ]
  }'
```

传 `none` 时直接返回答案，不经过思考。去掉这个字段或改传 `high` 就会思考；`low` 是 400，见[思考](#思考)。
