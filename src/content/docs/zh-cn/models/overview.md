---
title: 模型总览
description: 免费共享模型 API 上各模型分别接受什么、返回什么——逐项实测，不照抄上游文档。
sidebar:
  order: 1
---

每个模型一页。这些页面上的结论都是对着 `https://developer.amd.com.cn/radeon/api/v1` 实测出来的；
模型行为和它上游文档不一致的地方，以这里为准。

当前有哪些模型以 [`GET /v1/models`](/radeon-cloud-docs/zh-cn/api/models/) 为准，目前是四个。

:::note[本页数据的采集时间：2026-09-04]
模型换了推理引擎，行为就可能跟着变。碰到与本页不符的行为，以端点实际返回为准。
:::

## 规格

| 模型 | 上下文 | 图像输入 | 不传 `reasoning_effort` 时是否思考 |
|---|---|:---:|:---:|
| [DeepSeek-V4-Flash](/radeon-cloud-docs/zh-cn/models/deepseek-v4-flash/) | 1,048,576 | ❌ | ❌ |
| [DeepSeek-V4-Flash-Vision-Exp](/radeon-cloud-docs/zh-cn/models/deepseek-v4-flash-vision-exp/) | 1,048,576 | ✅ | ❌ |
| [Qwen3.8-Flash-Next](/radeon-cloud-docs/zh-cn/models/qwen3-8-flash-next/) | 262,144 | ✅ | ✅ |
| [MiniCPM5-1B](/radeon-cloud-docs/zh-cn/models/minicpm5-1b/) | 131,072 | ❌ | ❌ |

## `reasoning_effort` 支持的取值

各模型接受的档位不一样，按下表取值：

| 模型 | 支持的取值 |
|---|---|
| DeepSeek-V4-Flash | `none` `minimal` `low` `medium` `high` `xhigh` `max` |
| DeepSeek-V4-Flash-Vision-Exp | `none` `minimal` `low` `medium` `high` `xhigh` `max` |
| Qwen3.8-Flash-Next | `none` `low` `medium` `xhigh` |
| MiniCPM5-1B | `low` `medium` `high` |

这个参数可以整个不传，四个模型都接受。

:::tip[一套代码打所有模型，就用 `low` 或 `medium`]
这两个值是四个模型的交集。注意最高档的名字不通用：Qwen3.8-Flash-Next 用 `xhigh`，
MiniCPM5-1B 用 `high`，两者不能互换。要按模型选值时，读
[`GET /v1/models`](/radeon-cloud-docs/zh-cn/api/models/) 确认当前发布的是哪几个模型，再对照上表。
:::

## 思考行为

| 模型 | 不传 `reasoning_effort` 时 | `usage.reasoning_tokens`（顶层）|
|---|:---:|:---:|
| DeepSeek-V4-Flash | 不思考 | ✅ |
| DeepSeek-V4-Flash-Vision-Exp | 不思考 | ✅ |
| Qwen3.8-Flash-Next | **照样思考** | ✅ |
| MiniCPM5-1B | 不思考 | ❌ |

思考文本一律从 `choices[0].message.reasoning` 读。

token 数用 **`usage.completion_tokens_details.reasoning_tokens`**——这个字段四个模型都有。顶层的
`usage.reasoning_tokens` 只有三个模型给，跨模型统计别用它。

## `messages` 怎么写

| 模型 | `system` 消息 | 角色名 |
|---|---|---|
| DeepSeek-V4-Flash | 位置任意，可多条 | `system` 或 `developer` |
| DeepSeek-V4-Flash-Vision-Exp | 位置任意，可多条 | `system` 或 `developer` |
| Qwen3.8-Flash-Next | **只放一条，且必须在首位** | `system` |
| MiniCPM5-1B | 位置任意，可多条 | `system` |

Qwen3.8-Flash-Next 的限制来自它自带的 Jinja chat template，不是网关加的规则。

**四个模型都能接受的写法**：一条 `system` 消息、放在数组下标 `0`、角色名写 `system`。

## 结构化输出与工具

四个模型都支持：

- `response_format: {"type": "json_object"}`
- `tools` + `tool_choice` 的函数调用（实测四个模型都能正确发起调用）

`parallel_tool_calls` 参数四个模型都接受，但一轮返回多个 `tool_calls` 属于模型自主行为，
不要在设计上依赖它。

## 图像输入

两个模型收图，`content` 数组里放 `image_url` 内容块即可：

| 模型 | 单图计量 |
|---|---|
| DeepSeek-V4-Flash-Vision-Exp | `usage.prompt_tokens_details.image_tokens`，示例值 115 |
| Qwen3.8-Flash-Next | `usage.prompt_tokens_details.image_tokens`，示例值 144 |

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

两个模型都过了同一项实测：一张写着 `7412` 的图，问"图中大号数字是多少"，都答对；同一个问题
不附图时答不出来。

要发图请先确认目标模型在上表里——另外两个模型是纯文本的。

## 想用一套代码打所有模型

四个模型都接受的写法：

- 一条 `system` 消息，放在下标 `0`，角色名写 `system`
- `reasoning_effort` 用 `low` 或 `medium`，或者整个不传
- 思考文本从 `choices[0].message.reasoning` 读
- 思考 token 数从 `usage.completion_tokens_details.reasoning_tokens` 读
- 要 JSON 用 `response_format: {"type": "json_object"}`
- `content` 只放文本；要发图先确认模型支持
- `max_tokens` 按目标模型的窗口算，四个模型从 131,072 到 1,048,576 差了 8 倍

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
