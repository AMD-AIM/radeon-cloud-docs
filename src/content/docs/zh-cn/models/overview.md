---
title: 模型目录
description: Token Factory 里各模型支持的输入和返回的内容。
sidebar:
  label: 总览
  order: 1
---

每个模型一页，对应 `https://developer.amd.com.cn/radeon/api/v1` 上提供的模型。

当前有哪些模型以 [`GET /v1/models`](/radeon-cloud-docs/zh-cn/api/models/) 为准 ——
这里有页面并不代表该模型当前在线。除以下五个各走自己的端点外，其余都在 `/v1/chat/completions` 上应答：
[MinerU2.5-Pro](/radeon-cloud-docs/zh-cn/models/mineru2-5-pro/)（文档 OCR）、
[OmniVoice](/radeon-cloud-docs/zh-cn/models/omnivoice/)（语音合成），以及
[Clef](/radeon-cloud-docs/zh-cn/models/clef/)、[d3](/radeon-cloud-docs/zh-cn/models/d3/) 和
[d3-flash](/radeon-cloud-docs/zh-cn/models/d3-flash/)（决策）。

:::note[最后更新：2026-10-19]
模型换了推理引擎，行为就可能跟着变。

**新增：[Gemma-4-31B-IT](/radeon-cloud-docs/zh-cn/models/gemma-4-31b-it/)。** 下面各表也补上了
[MiniCPM-V-4.7-1B](/radeon-cloud-docs/zh-cn/models/minicpm-v4-7-1b/) 和
[MiniCPM-V-4.7-35B-A3B](/radeon-cloud-docs/zh-cn/models/minicpm-v4-7-35b-a3b/)。

**MiniCPM5-1B 已不再对外提供**，其说明页已移除。
同体量级由 [MiniCPM5-2B](/radeon-cloud-docs/zh-cn/models/minicpm5-2b/) 提供。
:::

## 模型 ID 与卡片标题

`model` 字段要填模型 ID，一字不差。可以从 Token Factory 模型卡片上的 **Model** 一栏复制，
也可以读 [`GET /v1/models`](/radeon-cloud-docs/zh-cn/api/models/) 里的 `id`。
卡片标题和 `name` 字段可能与 ID 不同，都不能代替 ID 使用：

| 模型 ID（调用时填这个） | 卡片标题 | `/v1/models` 里的 `name` |
|---|---|---|
| `DeepSeek-V4-Flash` | DeepSeek-V4-Flash-0731 | DeepSeek-V4-Flash |
| `DeepSeek-V4.1-Flash` | DeepSeek-V4.1-Flash-1017 | DeepSeek-V4.1-Flash |
| `Gemma-4-31B-IT` | Gemma-4-31B-IT | Gemma 4 31B |

其余模型的 ID、卡片标题和 `name` 都相同。

## 规格

**默认思考** 指请求里没要求思考时模型也会思考，见[思考模式](#思考模式)。

| 模型 | 上下文 | 图像输入 | 默认思考 |
|---|---|:---:|:---:|
| [DeepSeek-V4-Flash](/radeon-cloud-docs/zh-cn/models/deepseek-v4-flash/) | 1,048,576 | ❌ | ❌ |
| [DeepSeek-V4-Flash-Vision-Exp](/radeon-cloud-docs/zh-cn/models/deepseek-v4-flash-vision-exp/) | 1,048,576 | ✅ | ❌ |
| [DeepSeek-V4.1-Flash](/radeon-cloud-docs/zh-cn/models/deepseek-v4-1-flash/) | 1,048,576 | ✅ | ❌ |
| [Qwen3.8-Flash-Next](/radeon-cloud-docs/zh-cn/models/qwen3-8-flash-next/) | 262,144 | ✅ | ✅ |
| [Qwen3.8-27B](/radeon-cloud-docs/zh-cn/models/qwen3-8-27b/) | 262,144 | ✅ | ✅ |
| [GLM-5.3-Flash](/radeon-cloud-docs/zh-cn/models/glm-5-3-flash/) | 262,144 | ❌ | ✅ |
| [MiMo-V2.6-Flash](/radeon-cloud-docs/zh-cn/models/mimo-v2-6-flash/) | 1,048,576 | ✅ | ✅ |
| [MiniCPM5-2B](/radeon-cloud-docs/zh-cn/models/minicpm5-2b/) | 131,072 | ❌ | ❌ |
| [MiniCPM-V-4.7-1B](/radeon-cloud-docs/zh-cn/models/minicpm-v4-7-1b/) | 262,144 | ✅ | ❌ |
| [MiniCPM-V-4.7-35B-A3B](/radeon-cloud-docs/zh-cn/models/minicpm-v4-7-35b-a3b/) | 262,144 | ✅ | ❌ |
| [Gemma-4-31B-IT](/radeon-cloud-docs/zh-cn/models/gemma-4-31b-it/) | 262,144 | ✅ | ❌ |

以下五个模型不在此表，下面的参数对它们不适用：

| 模型 | 端点 | 输入 | 返回 | 计费单位 |
|---|---|---|---|---|
| [MinerU2.5-Pro](/radeon-cloud-docs/zh-cn/models/mineru2-5-pro/) | `POST /v1/ocr` | PDF 或图片 | Markdown | 页 |
| [OmniVoice](/radeon-cloud-docs/zh-cn/models/omnivoice/) | `POST /v1/audio/speech` | 文本，最多 4,096 个字符 | 音频文件 | 输入字符 |
| [Clef](/radeon-cloud-docs/zh-cn/models/clef/) | `POST /v1/systemone` | 情境、可选图片、带类型的问题 | 每个答案的概率 | 输入 token |
| [d3](/radeon-cloud-docs/zh-cn/models/d3/) | `POST /v1/systemone` | 情境、可选图片和视频、带类型的问题 | 每个答案的概率 | 输入 token |
| [d3-flash](/radeon-cloud-docs/zh-cn/models/d3-flash/) | `POST /v1/systemone` | 情境、可选图片和视频、带类型的问题 | 每个答案的概率 | 输入 token |

## 用量单价

Token Factory 的用量以 pts 计量。pts 不是钱，也和积分无关，见[用量和配额](/radeon-cloud-docs/zh-cn/api/usage/)。
下表是 2026-10-19 从模型卡片上读取的单价，除注明外单位都是每百万 token 多少 pts。
单价可能调整，以模型卡片上的当前值为准。

| 模型 | 输入 | 输出 | 缓存命中 |
|---|---:|---:|---:|
| DeepSeek-V4-Flash | 0.14 | 0.28 | 0.0028 |
| DeepSeek-V4-Flash-Vision-Exp | 0.14 | 0.28 | 0.0028 |
| DeepSeek-V4.1-Flash | 0.28 | 0.56 | 0.0056 |
| Qwen3.8-Flash-Next | 0.14 | 0.28 | 0.0028 |
| Qwen3.8-27B | 0.035 | 0.07 | 0.0007 |
| GLM-5.3-Flash | 0.28 | 0.56 | 0.0056 |
| MiMo-V2.6-Flash | 0.14 | 0.28 | 0.0028 |
| MiniCPM5-2B | 0.035 | 0.07 | 0.0007 |
| MiniCPM-V-4.7-1B | 0.035 | 0.07 | 0.0007 |
| MiniCPM-V-4.7-35B-A3B | 0.035 | 0.07 | 0.0007 |
| Gemma-4-31B-IT | 0.035 | 0.07 | 0.0007 |
| Clef | 0.035 | — | — |
| d3 | 0.035 | — | — |
| d3-flash | 0.035 | — | — |
| OmniVoice | 每百万字符 0.035 | — | — |
| MinerU2.5-Pro | 每页 0.001 | — | — |

卡片上有三处和实际计费不一致：

- Clef、d3、d3-flash 和 OmniVoice 的卡片上还显示了 **Cache read** 单价，但这几个模型不按缓存命中计费。
- OmniVoice 卡片上的输入单价标的是每百万 token，实际按每百万输入字符计费。
- MinerU2.5-Pro 的卡片上没有单价，实际按处理的页数计费。

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
| MiMo-V2.6-Flash | `none` `minimal` `low` `medium` `high` `xhigh` `max` |

这个参数可以整个不传。MiniCPM5-2B 不返回分离的思考内容，`reasoning_effort` 对它不适用。

MiMo-V2.6-Flash 接受所有取值，但不会按取值调整：2026-10-19 的测试中，包括 `none` 在内的每个取值，返回的都是同样简短的 `reasoning`。它的思考无法关闭。

MiniCPM-V-4.7-1B、MiniCPM-V-4.7-35B-A3B 和 Gemma-4-31B-IT 用
`chat_template_kwargs: {"enable_thinking": true}` 开启思考。它们如何处理 `reasoning_effort` 尚未验证。

:::caution[`high` 在 Qwen3.8-27B 上是 400]
`high` 是多数 OpenAI 兼容客户端表达「多想一会儿」时发的值，也恰恰是唯一一个
DeepSeek 系列都收、而 [Qwen3.8-27B](/radeon-cloud-docs/zh-cn/models/qwen3-8-27b/) **拒收**的值：

```
Unexpected reasoning effort high. Supported types are xhigh (default), medium, and low.
```

那个模型的顶层档位叫 `xhigh`，`minimal` 和 `max` 同样被它拒绝。
:::

:::caution[`xhigh` 在 GLM-5.3-Flash 上是 422]
[GLM-5.3-Flash](/radeon-cloud-docs/zh-cn/models/glm-5-3-flash/) 和 Qwen 系列恰好相反，
只收 OpenAI 那三个值：

```
reasoning_effort: unknown variant `xhigh`, expected one of `low`, `medium`, `high`
```

所以「多想一会儿」的两个写法在本平台是互斥的：`xhigh` 在 GLM-5.3-Flash 上失败，
`high` 在 Qwen3.8-27B 上失败。**没有任何一个值能同时命中两边的最高档。**
注意状态码也不同——GLM-5.3-Flash 返回 **422**（值在反序列化阶段就被拒），
Qwen3.8-27B 返回的是校验器报的 **400**。
:::

:::tip[一套代码打所有思考模型，就用 `low` 或 `medium`]
这两个值是上表所有模型的交集。最高档的名字不通用——两个 Qwen 模型用 `xhigh`，
GLM-5.3-Flash 用 `high`，DeepSeek 系列 `xhigh`、`max`、`high` 都收，彼此不能互换。要按模型选值时，读
[`GET /v1/models`](/radeon-cloud-docs/zh-cn/api/models/) 确认当前发布的是哪几个模型，再对照上表。
:::

## 思考模式

| 模型 | 请求里不带思考参数时 | 顶层 `reasoning_tokens` |
|---|:---:|:---:|
| DeepSeek-V4-Flash | 不思考 | ✅ |
| DeepSeek-V4-Flash-Vision-Exp | 不思考 | ✅ |
| DeepSeek-V4.1-Flash | 不思考 | ✅ |
| Qwen3.8-Flash-Next | **照样思考** | ✅ |
| Qwen3.8-27B | **照样思考** | ❌ |
| GLM-5.3-Flash | **照样思考** | ❌ |
| MiMo-V2.6-Flash | **照样思考** | ❌ |
| MiniCPM5-2B | 不思考 | ❌ |
| MiniCPM-V-4.7-1B | 不思考 | 未验证 |
| MiniCPM-V-4.7-35B-A3B | 不思考 | 未验证 |
| Gemma-4-31B-IT | 不思考 | 未验证 |

Qwen3.8-27B 的用量字段是在它更早的 vLLM 部署上测得的。

思考文本从 `choices[0].message.reasoning` 读。MiniCPM5-2B 直接给答案，该字段为空、
`reasoning_tokens` 为 `0`，答案从 `content` 读。

token 数用 **`usage.completion_tokens_details.reasoning_tokens`**，有两个例外：
[Qwen3.8-27B](/radeon-cloud-docs/zh-cn/models/qwen3-8-27b/) 在更早的部署上完全不返回
`completion_tokens_details` 对象；[MiMo-V2.6-Flash](/radeon-cloud-docs/zh-cn/models/mimo-v2-6-flash/)
即使思考了也在这里报 `0`。所以它们的思考 token 无法与其余输出分开统计，
但仍然计入 `usage.completion_tokens`，也仍然计费。

:::caution[两个 Qwen 模型和 GLM-5.3-Flash 默认就在思考，而且思考要花 `max_tokens`]
Qwen3.8-Flash-Next 和 Qwen3.8-27B 上，不带 `reasoning_effort` 的请求照样思考，
而思考和正文共用同一份 `max_tokens` 预算。对非思考模型够用的预算，换到这里可能返回空 `content`。
要么调大 `max_tokens`，要么传 `reasoning_effort: "low"`。
:::

## 编写 `messages`

| 模型 | `system` 消息 | 角色名 |
|---|---|---|
| DeepSeek-V4-Flash | 位置任意，可多条 | `system` 或 `developer` |
| DeepSeek-V4-Flash-Vision-Exp | 位置任意，可多条 | `system` 或 `developer` |
| DeepSeek-V4.1-Flash | 位置任意，可多条 | `system` 或 `developer` |
| Qwen3.8-Flash-Next | **只放一条，且必须在首位** | `system` |
| Qwen3.8-27B | **最多一条，且必须在首位** | `system` |
| GLM-5.3-Flash | 位置任意，可多条 | `system` |
| MiMo-V2.6-Flash | 位置任意，可多条 | `system` 或 `developer` |
| MiniCPM5-2B | 位置任意，可多条 | `system` |
| MiniCPM-V-4.7-1B | 一条，放在首位；其他位置未验证 | `system` |
| MiniCPM-V-4.7-35B-A3B | 一条，放在首位；其他位置未验证 | `system` |
| Gemma-4-31B-IT | 一条，放在首位；其他位置未验证 | `system` |

三个 DeepSeek 模型和 MiMo-V2.6-Flash 把 `developer` 当作 `system` 的别名接受。
Qwen3.8-27B 报 `Unexpected message role.`，Qwen3.8-Flash-Next、GLM-5.3-Flash 和
MiniCPM5-2B 报反序列化错误，并指出是第几条消息：

```
Failed to deserialize the JSON body into the target type: messages[0]: unknown role: developer
```

MiniCPM-V-4.7 两个模型和 Gemma-4-31B-IT 尚未验证 `developer` 角色。
较新的 OpenAI SDK 会发 `developer` 代替 `system`，如果你用的是这种，请改回。

两个 Qwen 模型的限制来自它们自带的 Jinja chat template，不是网关加的规则。
Qwen3.8-27B 违规时报 `System message must be at the beginning.`

**所有模型都能接受的写法**：一条 `system` 消息、放在数组下标 `0`、角色名写 `system`。

## 结构化输出与工具

每个对话模型都支持：

- `response_format: {"type": "json_object"}`
- `tools` + `tool_choice` 的函数调用

`parallel_tool_calls` 参数各模型都接受，但一轮返回多个 `tool_calls` 属于模型自主行为，
不要在设计上依赖它。

## 图片输入

八个对话模型收图，`content` 数组里放 `image_url` 内容块即可：

| 模型 | 图片用量报在哪里 |
|---|---|
| DeepSeek-V4-Flash-Vision-Exp | `usage.prompt_tokens_details.image_tokens`，示例值 115 |
| DeepSeek-V4.1-Flash | `usage.prompt_tokens_details.image_tokens`，示例值 202 |
| Qwen3.8-Flash-Next | `usage.prompt_tokens_details.image_tokens`，示例值 144 |
| Qwen3.8-27B | `usage.prompt_tokens_details.multimodal_tokens.image`，示例值 72，测于更早的部署 |
| MiMo-V2.6-Flash | `usage.prompt_tokens_details.image_tokens` |
| MiniCPM-V-4.7-1B | `usage.prompt_tokens_details.image_tokens` |
| MiniCPM-V-4.7-35B-A3B | `usage.prompt_tokens_details.image_tokens` |
| Gemma-4-31B-IT | 未验证 |

:::caution[Qwen3.8-27B 的图片计数多嵌了一层]
在更早的部署上，Qwen3.8-27B 报的是 `prompt_tokens_details.multimodal_tokens.image`，
而不是 `prompt_tokens_details.image_tokens`。跨模型统计图片用量的代码两种都要读。
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

## 用一套代码调用所有模型

所有对话模型都接受的写法：

- 一条 `system` 消息，放在下标 `0`，角色名写 `system`
- `reasoning_effort` 用 `low` 或 `medium`，或者整个不传（**别用 `high`**，Qwen3.8-27B 会 400；
  **也别用 `xhigh`**，GLM-5.3-Flash 会 422）
- 思考文本从 `choices[0].message.reasoning` 读
- 思考 token 数从 `usage.completion_tokens_details.reasoning_tokens` 读（Qwen3.8-27B 在更早的部署上不给，MiMo-V2.6-Flash 报 `0`）
- 要 JSON 用 `response_format: {"type": "json_object"}`
- `content` 只放文本；要发图先确认模型支持，并注意 Qwen3.8-27B 的计量字段可能不同
- `max_tokens` 按目标模型的窗口算，从 131,072 到 1,048,576 差了 8 倍

## 所有模型的共同点

| | |
|---|---|
| 接受的参数 | `temperature` `max_tokens` `top_p` `stream` `response_format` `tools` `tool_choice` `parallel_tool_calls` `reasoning_effort` |
| 原样转发 | `chat_template_kwargs` |
| 会被静默丢弃 | `stop` `seed` `logit_bias` `logprobs` `top_logprobs` `top_k` `min_p` `repetition_penalty` |
| 开启思考的写法 | `reasoning_effort`（或等价的 `reasoning.effort`）；MiniCPM-V-4.7 两个模型和 Gemma-4-31B-IT 用 `chat_template_kwargs.enable_thinking` |
| 上报的分词器 | `GPT` |
| 稳定性 | `experimental` |

其他参数会在请求到达推理后端之前被剔除——不报错，也不生效。确实需要这些参数，
请自己部署[模型服务](/radeon-cloud-docs/zh-cn/api/model-services/)，它会把请求体原样透传给
vLLM 或 SGLang。
