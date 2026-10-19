---
title: Qwen3.8-27B
description: 通义 27B 稠密视觉语言模型：上下文、思考档位、图片输入与消息规则。
sidebar:
  order: 6
---

<div class="rc-endpoint">
  <span class="rc-method" data-m="POST">POST</span>
  <span class="rc-path">/v1/chat/completions</span>
  <span class="rc-auth">model: <code>Qwen3.8-27B</code></span>
</div>

## 规格

| | |
|---|---|
| 架构 | `Qwen3_5ForConditionalGeneration`，`model_type = qwen3_5` |
| 层数 | 64 |
| 隐藏维度 | 5,120 |
| 注意力 | 24 个 Q 头、4 个 KV 头（GQA），头维度 256 |
| 中间维度 | 17,408 |
| 词表 | 248,320 |
| 视觉塔 | 27 层，宽度 1,152，16 头，patch 16，空间合并 2 |
| 精度 | `bfloat16`——未量化 |

## 概览

| | |
|---|---|
| 上下文长度 | 262,144 token |
| 输入模态 | 文本 + 图片 |
| 流式 | ✅ |
| 工具调用 | ✅ |
| JSON 输出 | ✅ `json_object` |
| 思考 | ✅——默认开启 |
| 推理引擎 | SGLang |
| 稳定性 | `experimental` |

:::note[2026-09-22 起由 SGLang 提供]
本页最初是按更早的 vLLM 部署写的，当时窗口为 131,072 token。上表的上下文长度和推理引擎是当前值。
思考档位、`system` 规则和角色名来自模型自带的 chat template，与推理引擎无关。
[思考模式](#思考模式)和[图片输入](#图片输入)里提到的 `usage` 字段是在更早的部署上测得的。
:::

## 思考模式

不主动调低就一直开着；不传 `reasoning_effort` 时落到 `xhigh`。

| 取值 | |
|---|---|
| 不传 | 落到 `xhigh` |
| `low` | ✅ |
| `medium` | ✅ |
| `xhigh` | ✅ 最长的一档 |
| `high` `minimal` `max` | ❌ 400 |

:::caution[这个模型的顶层档位叫 `xhigh`，不是 `high`]
传 `reasoning_effort: "high"` 会被拒：

```
Unexpected reasoning effort high. Supported types are xhigh (default), medium, and low.
```

要最长的思考请传 `xhigh`，或者不传这个参数。
:::

思考文本在 `choices[0].message.reasoning`。更早的部署不返回 `usage.completion_tokens_details`，
思考 token 只算在 `usage.completion_tokens` 里。有 `completion_tokens_details.reasoning_tokens`
就读它，没有就退回读 `completion_tokens`。

思考和正文共用同一份 `max_tokens` 预算。`content` 返回空时，调大 `max_tokens`
或传 `reasoning_effort: "low"`。

## `messages`

`system` 消息可以不给，但最多一条，且必须放在最前。出现第二条、或排在 `user` 之后会被拒：

```
System message must be at the beginning.
```

角色名请写 `system`。chat template 会拒绝其他角色名，包括 `developer`：

```
Unexpected message role.
```

## 图片输入

在 `content` 里放 `image_url` 内容块，`data:` URL 和 `https://` URL 都接受。

```json
{
  "model": "Qwen3.8-27B",
  "messages": [{
    "role": "user",
    "content": [
      { "type": "image_url", "image_url": { "url": "data:image/png;base64,iVBORw0KGgo..." } },
      { "type": "text", "text": "这张图里写了什么？" }
    ]
  }]
}
```

更早的部署把图片用量报在 `usage.prompt_tokens_details.multimodal_tokens.image`，
而其他模型用的是 `usage.prompt_tokens_details.image_tokens`。统计图片 token 的代码两处都要读。

## 限制

| | |
|---|---|
| 上下文窗口 | 262,144 token，prompt 与输出合并计算 |
| JSON 输出 | `response_format: {"type": "json_object"}` |
| 思考档位 | `low`、`medium`、`xhigh` |

## 示例

```bash
curl https://developer.amd.com.cn/radeon/api/v1/chat/completions \
  -H "Authorization: Bearer $RADEON_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "Qwen3.8-27B",
    "reasoning_effort": "low",
    "max_tokens": 512,
    "messages": [
      { "role": "system", "content": "一句话回答。" },
      { "role": "user", "content": "天为什么是蓝的？" }
    ]
  }'
```
