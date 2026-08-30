---
title: Qwen3.8-Flash-Next
description: 256K 上下文、思考默认开启，以及关于 system 消息位置的两条硬规则。
sidebar:
  order: 3
---

**免费共享模型 API** 上比较严格的那个模型。它有两条规则会拒掉几乎所有其它 OpenAI 兼容端点都接受的
请求，把现成的客户端代码指过来之前请先读这页。

<div class="rc-endpoint">
  <span class="rc-method" data-m="POST">POST</span>
  <span class="rc-path">/v1/chat/completions</span>
  <span class="rc-auth">model: <code>Qwen3.8-Flash-Next</code></span>
</div>

## 概览

| | |
|---|---|
| 上下文长度 | 262,144 token |
| 输入模态 | 仅文本 |
| 输出模态 | 文本 |
| 流式 | ✅ |
| 工具调用 | ✅（不支持并行调用）|
| JSON 输出 | ✅ `json_object` · ❌ `json_schema` |
| 思考 | ✅ —— **不主动调低就一直在思考** |
| 稳定性 | `experimental` |

## `messages` —— 会咬人的两条规则

:::danger[有且只能有一个 `system` 消息，而且必须在第一位]
其它写法一律拒绝：

| 形状 | 状态 |
|---|:---:|
| `system` 在首位，后接 `user` | `200` |
| `system` 出现在 user 轮之后 | **`400`** |
| `system` 在末尾 | **`400`** |
| 两个 `system` 消息 | **`400`** |

```json
{
  "error": {
    "message": "System message must be at the beginning.",
    "type": "BadRequestError",
    "code": 400
  }
}
```

这条限制来自模型自带的 chat template——Qwen 把它写在 `tokenizer_config.json` 里。用同一份权重跑
[独占端点](/radeon-cloud-docs/zh-cn/api/dedicated-endpoints/)，一样会拒。
:::

:::danger[不接受 `developer` 角色]
较新的 OpenAI SDK 会用 `developer` 代替 `system`。这个模型接受的角色只有 `system`、`user`、
`assistant`、`tool`，`developer` 不在其中；而且它是在**请求体反序列化阶段**失败的，所以状态码是
**`422` 而不是 `400`**：

```
Failed to deserialize the JSON body into the target type: messages[0]: unknown role: developer
```

如果你的客户端库默认发 `developer`，把它改回 `system`。
:::

## 思考

**不传 `reasoning_effort` 并不会关掉思考。** 普通请求返回的 `reasoning` 已经有内容、
`reasoning_tokens` 也非 0。模型内部的默认档位是 `xhigh`，也就是最长的那一档。

真正能传进去的只有两档：

| 档位 | 状态 | 原因 |
|---|:---:|---|
| `low` | `200` | |
| `medium` | `200` | |
| `high` | **`400`** | 过得了请求校验，但模型拒绝：`Unexpected reasoning effort high. Supported types are xhigh (default), medium, and low.` |
| `xhigh` | **`422`** | 反序列化阶段就被拒——不在端点的枚举里 |
| `max` | **`422`** | 同上 |
| `minimal` | **`422`** | 同上 |

:::caution[`xhigh` 是默认值，却传不进去]
模型自称默认档位是 `xhigh`，但端点的请求 schema 只接受 `low`、`medium`、`high`——于是 `xhigh` 只有
"不传该参数"这一条路能走到，而 `high` 过得了 schema 却被模型拒绝。**请显式传 `low` 或 `medium`**，
这是仅有的两个端到端都能走通的值。
:::

结果放在哪：

| | |
|---|---|
| 思考文本 | `choices[0].message.reasoning` |
| token 数 | `usage.completion_tokens_details.reasoning_tokens` |
| 不提供 | `usage.reasoning_tokens` —— **这个模型没有顶层字段**，和 DeepSeek-V4-Flash 不同 |

## 上限与拒绝

| 你发的 | 返回 |
|---|---|
| `max_tokens` 超出窗口 | `400` `max_tokens=… cannot be greater than max_model_len=max_total_tokens=262144.` |
| `response_format: json_schema` | `400` `Model Qwen3.8-Flash-Next does not support JSON schema output mode` |
| `content` 里带 `image_url` | `400` `Model Qwen3.8-Flash-Next does not support image input.` |
| `thinking: {...}` | `400` —— 请改用 `reasoning_effort` |

`max_tokens` 是按**总预算**算的，包含 prompt：262,144 是输入加输出的总和，不是单给输出的额度。

## 示例

```bash
curl https://developer.amd.com.cn/radeon/api/v1/chat/completions \
  -H "Authorization: Bearer $RADEON_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "Qwen3.8-Flash-Next",
    "reasoning_effort": "low",
    "messages": [
      { "role": "system", "content": "用一句话回答。" },
      { "role": "user", "content": "天空为什么是蓝的？" }
    ]
  }'
```

一个 `system` 消息、放在数组首位、显式传 `low`——这个请求形状原样打
[DeepSeek-V4-Flash](/radeon-cloud-docs/zh-cn/models/deepseek-v4-flash/) 也能通。
