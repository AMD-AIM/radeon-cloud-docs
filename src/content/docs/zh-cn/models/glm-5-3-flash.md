---
title: GLM-5.3-Flash
description: 智谱 GLM-5.3-Flash——默认就思考，而且是全平台唯一把最高档叫 `high` 的模型。
sidebar:
  order: 7
---

<div class="rc-endpoint">
  <span class="rc-method" data-m="POST">POST</span>
  <span class="rc-path">/v1/chat/completions</span>
  <span class="rc-auth">model: <code>GLM-5.3-Flash</code></span>
</div>

## 关于这个模型

GLM-5.3-Flash 是智谱 GLM-5.3 系列里偏速度的一款。它是纯文本推理模型：回答前会先思考，
而且**不用你开也会思考**。

## 在这个端点上

### 一览

| | |
|---|---|
| 上下文长度 | 262,144 token |
| 输入模态 | 仅文本——**不收图片** |
| 流式 | ✅ |
| 工具调用 | ✅ |
| JSON 输出 | ✅ `json_object` |
| 思考 | ✅ —— **不主动调低就一直开着** |

### 思考

**不传 `reasoning_effort` 并不会关掉思考。** 统计 48 小时真实流量，没传这个参数的请求里
仍有 60.5% 返回了非空的 `reasoning`。思考多少跟着提问走：中位数是 77 个思考 token，
单次最长用到 32,000 个。

支持的取值：

| 档位 | 说明 |
|---|---|
| 不传 | 照样思考 |
| `low` | |
| `medium` | |
| `high` | 最高档 |

:::danger[`xhigh` 在这里是 400——这个模型是例外]
平台上其他思考模型的最高档都叫 `xhigh`，而
[Qwen3.8-Flash-Next](/radeon-cloud-docs/zh-cn/models/qwen3-8-flash-next/) 和
[Qwen3.8-27B](/radeon-cloud-docs/zh-cn/models/qwen3-8-27b/) 恰恰**拒收** `high`。
GLM-5.3-Flash 正好反过来：`high` 能用，`xhigh` 不能。

```
reasoning_effort: unknown variant `xhigh`, expected one of `low`, `medium`, `high`
```

`none`、`minimal`、`max` 同样被拒。**只有 `low`、`medium`、`high` 三个值可用**，
也就是 OpenAI 那三档，再没有别的。

同一套代码要同时打这个模型和 Qwen 系列时，「多想一会儿」没法共用一个字面量：
这边发 `high`，那边发 `xhigh`，或者两边都干脆不传。
:::

没有任何一个 `reasoning_effort` 值能关掉思考——`none` 不在枚举里。想让回复短一些，
请改用 `max_tokens` 限制，并从 `content` 而不是 `reasoning` 里读答案。

思考内容出现在 `choices[0].message.reasoning`。这个模型不返回
`usage.completion_tokens_details`，所以思考 token 不单独上报，它们被计入
`usage.completion_tokens`。

:::caution[思考会吃掉 `max_tokens` 预算]
思考 token 按输出计费、也占输出配额。`max_tokens` 给小了，可能全被思考用光，
`content` 返回 `null`、`finish_reason` 是 `length`。要么把两部分一起算进预算，要么调低档位。
:::

### 限制

| | |
|---|---|
| 上下文窗口 | 262,144 token，是**总预算**——输入加输出，不是只给输出的额度 |
| JSON 输出 | `response_format: {"type": "json_object"}` |
| 控制思考 | `reasoning_effort`（或等价的 `reasoning.effort`）——`low`、`medium`、`high` |

`max_tokens` 是对**总预算**封顶的，输入也算在内。长 prompt 之外再要 65,536 个输出 token 会失败：

```
This model's maximum context length is 262144 tokens. However, you requested 65536 output tokens …
```

### 示例

```bash
curl https://developer.amd.com.cn/radeon/api/v1/chat/completions \
  -H "Authorization: Bearer $RADEON_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "GLM-5.3-Flash",
    "reasoning_effort": "high",
    "messages": [
      { "role": "user", "content": "天为什么是蓝的？" }
    ]
  }'
```

把 `high` 换成 `xhigh`，同样一条请求在这个模型上就是 400——见[上面的警告](#思考)。
