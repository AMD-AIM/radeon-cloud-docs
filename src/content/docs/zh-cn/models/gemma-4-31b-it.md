---
title: Gemma-4-31B-IT
description: Google 的 31B 稠密视觉语言模型——256K 上下文、二值思考开关、图像输入与工具调用。
sidebar:
  order: 9
---

<div class="rc-endpoint">
  <span class="rc-method" data-m="POST">POST</span>
  <span class="rc-path">/v1/chat/completions</span>
  <span class="rc-auth">model: <code>Gemma-4-31B-IT</code></span>
</div>

## 模型简介

本端点提供 Google 指令微调版 **Gemma 4 31B** 权重。这是一款稠密视觉语言模型：
输入文本与图像，输出文本。模型卡声明其上下文窗口为 256K，并原生支持函数调用和可选思考模式。

### 架构

以下数据来自本端点实际加载权重的 `config.json`：

| | |
|---|---|
| 架构 | `Gemma4ForConditionalGeneration`，`model_type = gemma4` |
| 参数 | 30.7B 总参数，稠密模型 |
| 层数 | 60——**50 层滑动窗口 + 10 层全局注意力** |
| 隐藏 / 中间维度 | 5,376 / 21,504 |
| 注意力 | 32 个 Q 头、16 个 KV 头，头维度 256 |
| 滑动窗口 | 1,024 token |
| 词表 | 262,144 |
| 原生上下文 | 262,144 |
| 视觉塔 | 27 层，宽度 1,152，16 头，patch 16 |
| 图像表示 | 当前配置中每张图 280 个 soft token |
| 权重 | BF16 |

模型提示格式以 Google 的模型卡和 thinking 指南为准。官方控制项是布尔值
`enable_thinking`；Gemma 4 没有定义命名的思考强度档位。

## 本端点上的行为

### 概览

| | |
|---|---|
| 上下文长度 | 262,144 token |
| 输入模态 | 文本 + 图像 |
| 流式 | ✅ |
| 工具调用 | ✅ |
| JSON 输出 | ✅ `json_object` |
| 思考 | ✅——**默认关闭**，只有开 / 关 |
| 推理引擎 | SGLang |
| 稳定性 | `experimental` |

### 价格

目录接口返回的是每 token 美元价，换算成每百万 token：

| | 每百万 token（美元）|
|---|---:|
| 输入 | $0.50 |
| 输出 | $3.00 |
| 缓存输入读取 | $0.05 |

目录把本条目标记为 `free: false`。因此，即使控制台分组仍沿用历史名称
**Public Free Model APIs**，调用也会按上述价格计量。

实际价格以运行时 [`GET /v1/models`](/radeon-cloud-docs/zh-cn/api/models/) 返回的目录为准。

### 思考

思考**默认关闭**。不传 `reasoning_effort` 时，模型直接回答，`reasoning_tokens` 为 `0`。

:::caution[Gemma 4 只有开关，没有思考强度档]
Google 官方 Transformers 部署使用 `enable_thinking=False` 或 `enable_thinking=True`。
官方模型卡、thinking 指南和权重自带的 chat template 都没有把 `minimal`、`low`、
`medium`、`high`、`xhigh`、`max` 定义为不同的 Gemma 思考档位。

本 OpenAI 兼容端点把 `reasoning_effort: "none"` 映射为**关闭**，把任何协议接受的
非 `none` 值映射为同一个 `enable_thinking: true` 开关。文档统一用 `high` 表示**开启**，
但它不是经过校准的“高强度”档位。
:::

| 请求 | Gemma 行为 |
|---|---|
| 不传 `reasoning_effort` | 关闭思考 |
| `reasoning_effort: "none"` | 关闭思考 |
| `reasoning_effort: "high"` | 开启思考 |

思考文本在 `choices[0].message.reasoning`；token 数同时出现在
`usage.completion_tokens_details.reasoning_tokens` 和顶层别名
`usage.reasoning_tokens`。

### `messages`

Google 官方 Gemma 4 提示格式支持标准 `system`、`user`、`assistant` 角色。
为了让请求在不同实现间都能工作，请只放一条 `system` 消息、置于首位，并使用角色名 `system`。

### 图像输入

在 `content` 数组中发送 `image_url` 内容块；支持 base64 data URL：

```json
{
  "model": "Gemma-4-31B-IT",
  "messages": [{
    "role": "user",
    "content": [
      { "type": "image_url", "image_url": { "url": "data:image/png;base64,..." } },
      { "type": "text", "text": "这张图片中有什么？" }
    ]
  }]
}
```

图片用量在 `usage.prompt_tokens_details.image_tokens`。实测一张 32×32 PNG 上报
256 个 image token。权重配置以 280 个 soft token 表示每张图片；计费应以公网 API
实际返回的计量值为准。

### 上限

| | |
|---|---|
| 上下文窗口 | 262,144 token，按 prompt + 输出总和计算 |
| 输入 | 文本和图像 |
| JSON 输出 | `response_format: {"type": "json_object"}` |
| 思考控制 | 二值：不传 / `none` 为关；`high` 为开 |

### 示例

```bash
curl https://developer.amd.com.cn/radeon/api/v1/chat/completions \
  -H "Authorization: Bearer $RADEON_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "Gemma-4-31B-IT",
    "reasoning_effort": "high",
    "messages": [
      { "role": "system", "content": "回答要清晰、简洁。" },
      { "role": "user", "content": "天空为什么是蓝色的？" }
    ]
  }'
```

删除 `reasoning_effort`，或设为 `none`，即可直接回答而不走思考过程。

## 官方资料

- [Gemma 4 thinking 模式](https://ai.google.dev/gemma/docs/capabilities/thinking?hl=zh-cn)
- [Google Gemma 4 31B 模型卡](https://huggingface.co/google/gemma-4-31B-it)
