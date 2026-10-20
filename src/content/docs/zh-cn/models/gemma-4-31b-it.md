---
title: Gemma-4-31B-IT
description: Google 的 31B 稠密视觉语言模型：262,144 token 上下文，支持文本和图片输入，思考按请求开启。
sidebar:
  order: 12
---

<div class="rc-endpoint">
  <span class="rc-method" data-m="POST">POST</span>
  <span class="rc-path">/v1/chat/completions</span>
  <span class="rc-auth">model: <code>Gemma-4-31B-IT</code></span>
</div>

## 模型简介

这里跑的权重是 **[google/gemma-4-31B-it](https://huggingface.co/google/gemma-4-31B-it)**，
Google Gemma 4 系列中 31B 的指令微调版。它是稠密模型，接受文本和图片，默认不思考，需要时按请求开启。
许可证为 Apache-2.0。

调用时 `model` 填 `Gemma-4-31B-IT`。[`GET /v1/models`](/radeon-cloud-docs/zh-cn/api/models/)
里这个模型的 `name` 是 `Gemma 4 31B`，这个名字不能当作模型 ID 使用。

### 架构

取自固定版本的
[`config.json`](https://huggingface.co/google/gemma-4-31B-it/raw/842da3794eaa0b77d5f08bae87a17459d91ff475/config.json)。
下表的层数和注意力参数来自 `text_config`：

| | |
|---|---|
| 架构 | `Gemma4ForConditionalGeneration`，`model_type = gemma4` |
| 文本骨干 | 稠密，`model_type = gemma4_text`，不是 MoE |
| 层数 | 60 —— **50 层滑动窗口 + 10 层全注意力** |
| 滑动窗口 | 1,024 token |
| 隐藏维度 | 5,376 |
| 注意力 | 32 个 Q 头。滑动窗口层：16 个 KV 头，头维度 256。全注意力层：4 个 KV 头，头维度 512 |
| K/V 投影 | 共用（`attention_k_eq_v = true`） |
| 中间维度 | 21,504 |
| 词表 | 262,144 |
| 原生上下文 | 262,144 |
| 权重精度 | `bfloat16` |

视觉塔见单独的 `vision_config`：

| | |
|---|---|
| 模型类型 | `gemma4_vision` |
| 层数 / 隐藏维度 / 头数 | 27 / 1,152 / 16 |
| Patch 大小 | 16 |
| 每张图片的视觉 token | 默认 280（`vision_soft_tokens_per_image`） |

31B 没有音频编码器，`audio_config` 为 `null`。

`generation_config.json` 的默认采样是 `temperature = 1.0`、`top_p = 0.95`、`top_k = 64`。
本端点接受 `temperature` 和 `top_p`，`top_k` 会被丢弃（见[模型目录总览](/radeon-cloud-docs/zh-cn/models/overview/#所有模型的共同点)）。

## 在 Radeon Cloud 上的行为

:::note[Token Factory 中国站 —— 2026-10-19 读取的目录]
以下数值来自 Token Factory 模型目录和服务配置。模型当前是否在线以
[`GET /v1/models`](/radeon-cloud-docs/zh-cn/api/models/) 为准，当前用量单价以控制台里的模型卡片为准。
:::

### 概览

| | |
|---|---|
| 上下文长度 | 262,144 token |
| 输入模态 | 文本、图片 |
| 流式 | ✅ |
| 工具调用 | ✅ |
| JSON 输出 | ✅ `json_object` |
| 思考 | ✅ —— **默认关闭**，按请求开启 |
| 推理引擎 | SGLang |
| 稳定性 | `experimental` |

### `messages`

使用常规的 `user` / `assistant` 对话。需要系统指令时，放一条 `system` 消息在数组首位；
chat template 会把首位的 `system` 消息当作系统提示。其他写法以及 `developer` 角色尚未在本模型上验证。

### 思考模式

**默认不思考**：除非请求里另有指定，chat template 会把 `enable_thinking` 设为 `false`。
要开启思考，在请求顶层加上：

```json
{"chat_template_kwargs": {"enable_thinking": true}}
```

用 Python OpenAI SDK 时写成 `extra_body={"chat_template_kwargs": {"enable_thinking": True}}`。
Token Factory 会把 `chat_template_kwargs` 原样转给推理引擎。这个模型如何处理 `reasoning_effort`
尚未验证，请用 `enable_thinking`。

| | |
|---|---|
| 思考文本 | `choices[0].message.reasoning`，流式时为 `choices[0].delta.reasoning` |
| 最终回答 | `choices[0].message.content` |

思考和正文共用同一份 `max_tokens` 预算。`content` 为空且 `finish_reason` 为 `"length"` 时，调大 `max_tokens`。

### 图片输入

图片用 `image_url` 内容块传入：

```json
{
  "role": "user",
  "content": [
    { "type": "image_url", "image_url": { "url": "data:image/png;base64,<BASE64_PNG>" } },
    { "type": "text", "text": "这张图里写了什么？" }
  ]
}
```

每张图片都占用上下文窗口。视觉塔默认把一张图片编码为 280 个 token。

### 音频输入

不支持。这个模型没有音频编码器，请只发送文本和图片。

### 限制

| | |
|---|---|
| 上下文窗口 | 262,144 token，prompt 与输出合并计算 |
| 输入 | 文本、图片 |
| JSON 输出 | `response_format: {"type": "json_object"}` |
| 思考开关 | `chat_template_kwargs.enable_thinking` |

### 示例

```bash
curl https://developer.amd.com.cn/radeon/api/v1/chat/completions \
  -H "Authorization: Bearer $RADEON_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "Gemma-4-31B-IT",
    "chat_template_kwargs": {"enable_thinking": true},
    "max_tokens": 4096,
    "messages": [
      { "role": "system", "content": "一句话回答。" },
      { "role": "user", "content": "天为什么是蓝的？" }
    ]
  }'
```

回答在 `content` 里，思考过程在 `reasoning` 里。
