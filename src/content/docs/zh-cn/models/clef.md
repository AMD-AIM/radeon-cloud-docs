---
title: Clef
description: 决策模型：针对一个情境回答带类型的问题并给出概率，使用独立接口。
sidebar:
  order: 14
---

<div class="rc-endpoint">
  <span class="rc-method" data-m="POST">POST</span>
  <span class="rc-path">/v1/systemone</span>
  <span class="rc-auth">model: <code>Clef</code></span>
</div>

:::caution[这个模型不在 `/v1/chat/completions` 上]
Clef 不写文字。你描述一个情境、提出若干有名字的问题，它在一次前向计算里给出每个可能答案的概率。
`messages`、`max_tokens`、`temperature`、`stream` 都不适用。
:::

Clef 是 Cloudflare 的 27B 决策模型，由 Qwen3.8-27B 后训练而来。适合原本要让对话模型做分类、
路由或打分、再去解析它回复的场景。

## 概览

| | |
|---|---|
| 端点 | `POST /v1/systemone` |
| 输入 | `state`（文本或任意 JSON），可选图片 |
| 输出 | 每个问题一个答案，附概率 |
| 问题类型 | `choice`、`noul`、`score` |
| 流式 | ❌ |
| 计费 | 按输入 token，对应 `usage.input_tokens`；`output_tokens` 恒为 `0` |
| 情境长度 | 超过 16,384 token 的部分会被截掉 |
| 稳定性 | `experimental` |

## 请求

| 字段 | | |
|---|---|---|
| `model` | 必填 | `Clef` |
| `state` | 必填 | 要判断的情境：字符串或任意 JSON 值 |
| `questions` | 必填 | 对象，键是你自己起的问题名，值是问题，至少一个 |
| `images` | 可选 | 图片数组，每项是 `data:` URL 字符串 |

`temperature`、`prompt_format_version`、`return_prompt_token_ids` 会被点名拒绝（`422`）。
问题里出现未知的键也会被拒绝，所以把 `instructions` 拼错成 `instruction` 会直接报错，而不是被悄悄忽略。

### 问题类型

| `type` | `criteria` | 答案 |
|---|---|---|
| `choice` | 选项对象 `{"选项名": "这个选项的含义", …}`，1–255 项 | `choice`、`confidence`，以及每个选项的 `probabilities` |
| `noul` | 可选 `{"true": "…", "false": "…"}`；`instructions` 和 `criteria` 至少给一个 | `noul`：答案为"是"（或 `true` 成立）的概率，0–1 |
| `score` | 有序数组，1–10 个等级，从低到高 | `score`（期望等级，从 0 数起）、`confidence`、`legend`，以及每个等级的 `probabilities` |

每个问题都可以带 `instructions`，即用自然语言写的问题本身。

## 响应

```json
{
  "answers": {
    "status": {
      "type": "choice",
      "choice": "overdue",
      "confidence": 0.9895,
      "probabilities": { "paid": 0.0041, "overdue": 0.9930, "draft": 0.0029 }
    },
    "large": { "type": "noul", "noul": 0.9934 },
    "urgency": {
      "type": "score",
      "score": 1.5326,
      "confidence": 0.2989,
      "legend": { "0": "Can wait", "1": "This week", "2": "Today" },
      "probabilities": { "0": 0.0575, "1": 0.3524, "2": 0.5901 }
    }
  },
  "usage": { "input_tokens": 340, "output_tokens": 0 },
  "model": "Clef"
}
```

请用概率，而不只看最高的那个答案：`noul` 为 0.55 和 0.99 都算"是"，但只有后者适合直接自动执行。

## 示例

```bash
curl https://developer.amd.com.cn/radeon/api/v1/systemone \
  -H "Authorization: Bearer $RADEON_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "Clef",
    "state": {"invoice": {"vendor": "Acme", "total": 1250.0, "currency": "USD", "status": "overdue"}},
    "questions": {
      "status": {
        "type": "choice",
        "instructions": "What is the invoice status?",
        "criteria": {"paid": "Invoice is paid.", "overdue": "Invoice is past due.", "draft": "Not sent."}
      },
      "large": {"type": "noul", "instructions": "Is the total above 1000 USD?"},
      "urgency": {"type": "score", "instructions": "How urgent is follow-up?", "criteria": ["Can wait", "This week", "Today"]}
    }
  }'
```

带图片：

```json
{
  "model": "Clef",
  "state": "Look at the attached picture.",
  "images": ["data:image/png;base64,iVBORw0KGgo..."],
  "questions": {
    "colour": {
      "type": "choice",
      "instructions": "What colour fills the image?",
      "criteria": {"red": "Red", "green": "Green", "blue": "Blue"}
    }
  }
}
```

:::caution[校验错误不是 OpenAI 的格式]
问题写错时返回 `422`，响应体是 FastAPI 的 `{"detail": [ … ]}`，会指出出错的字段，例如
`["body", "questions", "q", "noul", "instruction"]`。鉴权和限流错误仍是常规的 `{"error": { … }}`。
:::

:::note[短情境很快]
几百个输入 token 不到一秒就能答完。接近 16,384 token 上限的情境大约要 20 秒。
:::
