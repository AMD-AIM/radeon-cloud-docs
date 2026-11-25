---
title: Hy4-flash
description: 腾讯的稀疏 MoE 模型，上下文 100 万 token，支持图像输入。默认思考，reasoning_effort 只接受 none 和 medium 及以上。
sidebar:
  order: 8.5
---

<div class="rc-endpoint">
  <span class="rc-method" data-m="POST">POST</span>
  <span class="rc-path">/v1/chat/completions</span>
  <span class="rc-auth">model: <code>Hy4-flash</code></span>
</div>

## 模型简介

**Hy4-flash** 是腾讯的稀疏 MoE 模型，混合使用稀疏注意力层和滑动窗口层，接受文本和图像，
默认先思考再回答。

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
| 工具调用 | ✅ —— `tool_choice` 不能强制调用，见[工具](#工具) |
| JSON 输出 | ✅ `json_object` **和** `json_schema` |
| 思考 | ✅ —— **默认开启，传 `reasoning_effort: "none"` 才关闭** |
| 推理引擎 | SGLang |
| 稳定性 | `experimental` |

### `messages`

`system` 消息可以出现在任意位置，也可以有多条。`developer` 可作为 `system` 的别名。

### 思考

思考**默认开启**。模型的 chat template 只有两种模式：关闭和 `high`。

| `reasoning_effort` | 结果 |
|---|---|
| 不传、`medium`、`high`、`xhigh`、`max` | 思考 |
| `none` | 不思考，返回里没有 `reasoning` |
| `minimal`、`low` | **400** |

:::caution[`low` 和 `minimal` 返回 400]
```
reasoning_effort error : low, should be no_think/high
```

报错里的 `no_think` 是模板自己的写法，API 不接受。要关闭思考请传 `none`。
:::

思考文本在 `choices[0].message.reasoning`，token 数在
`usage.completion_tokens_details.reasoning_tokens`，顶层 `usage.reasoning_tokens` 也有同一个值。

:::caution[思考会花掉 `max_tokens`]
思考 token 按输出计费，和回答共用 `max_tokens` 预算。`content` 为空时，调大 `max_tokens`
或传 `reasoning_effort: "none"`。
:::

### 图像输入

图片用 `image_url` 内容块传入，支持 base64 data URL：

```json
{
  "role": "user",
  "content": [
    { "type": "image_url", "image_url": { "url": "data:image/png;base64,..." } },
    { "type": "text", "text": "图里有什么？" }
  ]
}
```

图片用量在 `usage.prompt_tokens_details.image_tokens`，一张 256×256 的 PNG 计 72 个 token。

### 工具

`tools` 在默认的 `tool_choice: "auto"` 下正常工作：问题需要时，模型会调用函数。

:::caution[`tool_choice` 不能强制调用]
`tool_choice: "required"` 和指定函数都会被接受，但不会强制生效：问题用不到工具时，模型直接用文字回答，
没有 `tool_calls`。请先检查有没有 `tool_calls`，不要假定一定有。
:::

### 限制

| | |
|---|---|
| 上下文窗口 | 1,048,320 token，按**总预算**算——提示加输出 |
| 输入 | 文本、图像 |
| JSON 输出 | `json_object` 和严格的 `json_schema` |
| 思考档位 | `none`（关闭）、`medium`、`high`、`xhigh`、`max`；`minimal` 和 `low` 返回 400 |
| 工具调用 | `tool_choice: "auto"`；`required` 和指定函数不会强制生效 |

提示加 `max_tokens` 超出窗口时返回 400：

```
Requested token count exceeds the model's maximum context length of 1048320 tokens.
```

:::caution[长提示很慢]
整个窗口都能用，但接近 100 万 token 的提示，首个 token 可能要两分钟左右才返回。
发几十万 token 以上的提示前，先调大客户端超时。
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

传 `none` 直接返回答案，不思考；去掉这个字段就会思考。
