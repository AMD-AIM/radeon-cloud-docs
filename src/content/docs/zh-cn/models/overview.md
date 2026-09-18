---
title: 模型总览
description: 免费共享模型 API 上各模型分别接受什么、返回什么。
sidebar:
  order: 1
---

每个模型一页，对应 `https://developer.amd.com.cn/radeon/api/v1` 上提供的模型。

当前有哪些模型以 [`GET /v1/models`](/radeon-cloud-docs/zh-cn/api/models/) 为准。其中六个在
`/v1/chat/completions` 上应答；[MinerU2.5-Pro](/radeon-cloud-docs/zh-cn/models/mineru2-5-pro/)
是文档 OCR，走自己的端点。

:::note[最后更新：2026-09-15]
模型换了推理引擎，行为就可能跟着变。

**MiniCPM5-1B 已不再对外提供**，其说明页已移除。
同体量级由 [MiniCPM5-2B](/radeon-cloud-docs/zh-cn/models/minicpm5-2b/) 提供。
:::

## 规格

| 模型 | 上下文 | 图像输入 | 不传 `reasoning_effort` 时是否思考 |
|---|---|:---:|:---:|
| [DeepSeek-V4-Flash](/radeon-cloud-docs/zh-cn/models/deepseek-v4-flash/) | 1,048,576 | ❌ | ❌ |
| [DeepSeek-V4-Flash-Vision-Exp](/radeon-cloud-docs/zh-cn/models/deepseek-v4-flash-vision-exp/) | 1,048,576 | ✅ | ❌ |
| [DeepSeek-V4.1-Flash](/radeon-cloud-docs/zh-cn/models/deepseek-v4-1-flash/) | 1,048,576 | ✅ | ❌ |
| [Qwen3.8-Flash-Next](/radeon-cloud-docs/zh-cn/models/qwen3-8-flash-next/) | 262,144 | ✅ | ✅ |
| [Qwen3.8-27B](/radeon-cloud-docs/zh-cn/models/qwen3-8-27b/) | 131,072 | ✅ | ✅ |
| [GLM-5.3-Flash](/radeon-cloud-docs/zh-cn/models/glm-5-3-flash/) | 262,144 | ❌ | ✅ |
| [MiniCPM5-2B](/radeon-cloud-docs/zh-cn/models/minicpm5-2b/) | 131,072 | ❌ | ❌ |

[MinerU2.5-Pro](/radeon-cloud-docs/zh-cn/models/mineru2-5-pro/) 不在此表：它在 `POST /v1/ocr`
上收 PDF 或图片、返回 Markdown、按页计费，下面的参数对它不适用。

## `reasoning_effort` 支持的取值

各模型接受的档位不一样，按下表取值：

| 模型 | 支持的取值 |
|---|---|
| DeepSeek-V4-Flash | `none` `minimal` `low` `medium` `high` `xhigh` `max` |
| DeepSeek-V4-Flash-Vision-Exp | `none` `minimal` `low` `medium` `high` `xhigh` `max` |
| DeepSeek-V4.1-Flash | `none` `minimal` `low` `medium` `high` `xhigh` `max` |
| Qwen3.8-Flash-Next | `none` `low` `medium` `xhigh` |
| Qwen3.8-27B | `low` `medium` `xhigh` |
| GLM-5.3-Flash | `low` `medium` `high` |

这个参数可以整个不传。MiniCPM5-2B 不返回分离的思考内容，`reasoning_effort` 对它不适用。

:::caution[`high` 在 Qwen3.8-27B 上是 400]
`high` 是多数 OpenAI 兼容客户端表达「多想一会儿」时发的值，也恰恰是唯一一个
DeepSeek 系列都收、而 [Qwen3.8-27B](/radeon-cloud-docs/zh-cn/models/qwen3-8-27b/) **拒收**的值：

```
Unexpected reasoning effort high. Supported types are xhigh (default), medium, and low.
```

那个模型的顶层档位叫 `xhigh`，`minimal` 和 `max` 同样被它拒绝。
:::

:::danger[…而 `xhigh` 在 GLM-5.3-Flash 上是 400]
[GLM-5.3-Flash](/radeon-cloud-docs/zh-cn/models/glm-5-3-flash/) 和 Qwen 系列恰好相反，
只收 OpenAI 那三个值：

```
reasoning_effort: unknown variant `xhigh`, expected one of `low`, `medium`, `high`
```

所以「多想一会儿」的两个写法在本平台是互斥的：`xhigh` 在 GLM-5.3-Flash 上报 400，
`high` 在 Qwen3.8-27B 上报 400。**没有任何一个值能同时命中两边的最高档。**
:::

:::tip[一套代码打所有思考模型，就用 `low` 或 `medium`]
这两个值是上表所有模型的交集。最高档的名字不通用——两个 Qwen 模型用 `xhigh`，
GLM-5.3-Flash 用 `high`，DeepSeek 系列 `xhigh`、`max`、`high` 都收，彼此不能互换。要按模型选值时，读
[`GET /v1/models`](/radeon-cloud-docs/zh-cn/api/models/) 确认当前发布的是哪几个模型，再对照上表。
:::

## 思考行为

| 模型 | 不传 `reasoning_effort` 时 | `usage.reasoning_tokens`（顶层）|
|---|:---:|:---:|
| DeepSeek-V4-Flash | 不思考 | ✅ |
| DeepSeek-V4-Flash-Vision-Exp | 不思考 | ✅ |
| DeepSeek-V4.1-Flash | 不思考 | ✅ |
| Qwen3.8-Flash-Next | **照样思考** | ✅ |
| Qwen3.8-27B | **照样思考** | ❌ |
| GLM-5.3-Flash | **照样思考** | ❌ |
| MiniCPM5-2B | 不思考 | ❌ |

思考文本从 `choices[0].message.reasoning` 读。MiniCPM5-2B 直接给答案，该字段为空、
`reasoning_tokens` 为 `0`，答案从 `content` 读。

token 数用 **`usage.completion_tokens_details.reasoning_tokens`**，除
[Qwen3.8-27B](/radeon-cloud-docs/zh-cn/models/qwen3-8-27b/) 外每个模型都给——那一个
压根不返回 `completion_tokens_details` 对象，所以它的思考 token 无法与其余输出分开统计，
但仍然计入 `usage.completion_tokens`，也仍然计费。

:::caution[两个 Qwen 模型默认就在思考，而且思考要花 `max_tokens`]
Qwen3.8-Flash-Next 和 Qwen3.8-27B 上，不带 `reasoning_effort` 的请求照样思考，
而思考和正文共用同一份 `max_tokens` 预算。对非思考模型够用的预算，换到这里可能返回空 `content`。
要么调大 `max_tokens`，要么传 `reasoning_effort: "low"`。
:::

## `messages` 怎么写

| 模型 | `system` 消息 | 角色名 |
|---|---|---|
| DeepSeek-V4-Flash | 位置任意，可多条 | `system` 或 `developer` |
| DeepSeek-V4-Flash-Vision-Exp | 位置任意，可多条 | `system` 或 `developer` |
| DeepSeek-V4.1-Flash | 位置任意，可多条 | `system` 或 `developer` |
| Qwen3.8-Flash-Next | **只放一条，且必须在首位** | `system` |
| Qwen3.8-27B | **最多一条，且必须在首位** | `system` 或 `developer` |
| MiniCPM5-2B | 位置任意，可多条 | `system` |

两个 Qwen 模型的限制来自它们自带的 Jinja chat template，不是网关加的规则。
Qwen3.8-27B 违规时报 `System message must be at the beginning.`

**所有模型都能接受的写法**：一条 `system` 消息、放在数组下标 `0`、角色名写 `system`。

## 结构化输出与工具

每个对话模型都支持：

- `response_format: {"type": "json_object"}`
- `tools` + `tool_choice` 的函数调用

`parallel_tool_calls` 参数各模型都接受，但一轮返回多个 `tool_calls` 属于模型自主行为，
不要在设计上依赖它。

## 图像输入

四个模型收图，`content` 数组里放 `image_url` 内容块即可：

| 模型 | 单图计量 |
|---|---|
| DeepSeek-V4-Flash-Vision-Exp | `usage.prompt_tokens_details.image_tokens`，示例值 115 |
| DeepSeek-V4.1-Flash | `usage.prompt_tokens_details.image_tokens`，示例值 202 |
| Qwen3.8-Flash-Next | `usage.prompt_tokens_details.image_tokens`，示例值 144 |
| Qwen3.8-27B | `usage.prompt_tokens_details.multimodal_tokens.image`，示例值 72 |

:::caution[Qwen3.8-27B 的图片计数多嵌了一层]
四个里有三个报 `prompt_tokens_details.image_tokens`，Qwen3.8-27B 报的是
`prompt_tokens_details.multimodal_tokens.image`。跨模型统计图片用量的代码两种都要读。
:::

```json
{
  "model": "DeepSeek-V4-Flash-Vision-Exp",
  "messages": [{
    "role": "user",
    "content": [
      { "type": "image_url", "image_url": { "url": "data:image/png;base64,iVBORw0KGgo..." } },
      { "type": "text", "text": "这张图里写了什么？" }
    ]
  }]
}
```

要发图请先确认目标模型在上表里——其余对话模型是纯文本的。要从 PDF 或扫描件里取文字，用
[MinerU2.5-Pro](/radeon-cloud-docs/zh-cn/models/mineru2-5-pro/)：返回 Markdown，按页计费。

## 想用一套代码打所有模型

所有对话模型都接受的写法：

- 一条 `system` 消息，放在下标 `0`，角色名写 `system`
- `reasoning_effort` 用 `low` 或 `medium`，或者整个不传（**别用 `high`**，Qwen3.8-27B 会 400）
- 思考文本从 `choices[0].message.reasoning` 读
- 思考 token 数从 `usage.completion_tokens_details.reasoning_tokens` 读（Qwen3.8-27B 不给）
- 要 JSON 用 `response_format: {"type": "json_object"}`
- `content` 只放文本；要发图先确认模型支持，并注意 Qwen3.8-27B 的计量字段不同
- `max_tokens` 按目标模型的窗口算，从 131,072 到 1,048,576 差了 8 倍

## 所有模型共通的部分

| | |
|---|---|
| 接受的参数 | `temperature`、`max_tokens`、`top_p`、`stream`、`response_format`、`tools`、`tool_choice`、`parallel_tool_calls`、`reasoning_effort` |
| 会被静默丢弃 | `stop`、`seed`、`logit_bias`、`logprobs`、`top_logprobs`、`top_k`、`min_p`、`repetition_penalty` |
| 开启思考的写法 | 只有 `reasoning_effort`（或等价的 `reasoning.effort`）|
| 上报的分词器 | `GPT` |
| 稳定性 | `experimental` |

不在接受列表里的参数，会在请求到达推理后端之前被剔除——不报错，也不生效。确实需要这些参数，
请用[独占端点](/radeon-cloud-docs/zh-cn/api/dedicated-endpoints/)，它会把请求体原样透传给
vLLM 或 SGLang。
