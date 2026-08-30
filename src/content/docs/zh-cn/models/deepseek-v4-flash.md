---
title: DeepSeek-V4-Flash
description: 100 万 token 上下文、支持工具调用、思考默认关闭——两个模型里比较宽松的那个。
sidebar:
  order: 2
---

**免费共享模型 API** 上下文更大的那个模型。它对 `messages` 的形状也比另一个宽容得多。

<div class="rc-endpoint">
  <span class="rc-method" data-m="POST">POST</span>
  <span class="rc-path">/v1/chat/completions</span>
  <span class="rc-auth">model: <code>DeepSeek-V4-Flash</code></span>
</div>

## 概览

| | |
|---|---|
| 上下文长度 | **1,048,576** token |
| 输入模态 | 仅文本 |
| 输出模态 | 文本 |
| 流式 | ✅ |
| 工具调用 | ✅（不支持并行调用）|
| JSON 输出 | ✅ `json_object` · ❌ `json_schema` |
| 思考 | ✅ —— **不主动要就不思考** |
| 稳定性 | `experimental` |

## 思考

**不传 `reasoning_effort` 就不会思考。** 基线请求返回的 `reasoning` 是空的、`reasoning_tokens` 为 0。

六个档位全部接受：

| 档位 | 状态 |
|---|:---:|
| `minimal` | `200` |
| `low` | `200` |
| `medium` | `200` |
| `high` | `200` |
| `xhigh` | `200` |
| `max` | `200` |

但**实际生效的档位比枚举值少**：`minimal`/`low`/`medium` 的思考量差不多，`high`/`max` 明显更长
——实践中只有两档。

结果放在哪：

| | |
|---|---|
| 思考文本 | `choices[0].message.reasoning` |
| token 数 | `usage.completion_tokens_details.reasoning_tokens` |
| 额外提供 | `usage.reasoning_tokens` —— 这个模型有顶层字段 |

:::note[不思考时字段名会变]
传了 `reasoning_effort` 时，`message` 里是 `reasoning`；而不思考的普通请求里出现的是
`reasoning_content`，且为空。**读 `reasoning`，把键不存在当成"没思考"**，不要按哪个键存在来分支。
:::

## `messages`

我们测过的所有形状它都接受：

| 形状 | 状态 |
|---|:---:|
| `system` 在首位，后接 `user` | `200` |
| `system` 出现在 user 轮之后 | `200` |
| `system` 在末尾 | `200` |
| 两个 `system` 消息 | `200` |
| 用 `developer` 代替 `system` | `200` |

但 [Qwen3.8-Flash-Next](/radeon-cloud-docs/zh-cn/models/qwen3-8-flash-next/) **不是这样**。如果你
打算用一套代码在模型之间切换，请按那个模型更严格的规则来写。

## 上限与拒绝

| 你发的 | 返回 |
|---|---|
| `max_tokens` 超出窗口 | `400` `Requested token count exceeds the model's maximum context length of 1048576 tokens.` |
| `response_format: json_schema` | `400` `Model DeepSeek-V4-Flash does not support JSON schema output mode` |
| `content` 里带 `image_url` | `400` `Model DeepSeek-V4-Flash does not support image input.` |
| `thinking: {...}` | `400` —— 请改用 `reasoning_effort` |

## 示例

```bash
curl https://developer.amd.com.cn/radeon/api/v1/chat/completions \
  -H "Authorization: Bearer $RADEON_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "DeepSeek-V4-Flash",
    "reasoning_effort": "low",
    "messages": [
      { "role": "system", "content": "用一句话回答。" },
      { "role": "user", "content": "天空为什么是蓝的？" }
    ]
  }'
```
