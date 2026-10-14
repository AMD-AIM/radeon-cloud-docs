---
title: 模型总览
description: 免费共享模型 API 上各模型分别接受什么、返回什么。
sidebar:
  order: 1
---

每个模型一页，对应 `https://developer.amd.com.cn/radeon/api/v1` 上提供的模型。

当前有哪些模型以 [`GET /v1/models`](/radeon-cloud-docs/zh-cn/api/models/) 为准 ——
这里有页面并不代表该模型当前在线。除 [MinerU2.5-Pro](/radeon-cloud-docs/zh-cn/models/mineru2-5-pro/)
是文档 OCR、走自己的端点以外，其余都在 `/v1/chat/completions` 上应答。

:::note[新增MiniCPM-V4.7：2026-10-13验证]
[MiniCPM-V-4.7-1B](/radeon-cloud-docs/zh-cn/models/minicpm-v4-7-1b/)和
[MiniCPM-V-4.7-35B-A3B](/radeon-cloud-docs/zh-cn/models/minicpm-v4-7-35b-a3b/)已新增独立接口页。
两款均支持文本/图像，使用262,144-token窗口，以`chat_template_kwargs.enable_thinking`控制可选思考。
共享端点的实际限制见各模型页。其它旧条目保留原验收范围，本次不是全目录重新认证；
推理引擎或部署版本变化可能改变行为。

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
| [MiMo-V2.6-Flash](/radeon-cloud-docs/zh-cn/models/mimo-v2-6-flash/) | 1,048,576 | ✅ | ✅ |
| [MiniCPM5-2B](/radeon-cloud-docs/zh-cn/models/minicpm5-2b/) | 131,072 | ❌ | ❌ |
| [MiniCPM-V-4.7-1B](/radeon-cloud-docs/zh-cn/models/minicpm-v4-7-1b/) | 262,144 | ✅ | 默认关闭，使用模型专用开关 |
| [MiniCPM-V-4.7-35B-A3B](/radeon-cloud-docs/zh-cn/models/minicpm-v4-7-35b-a3b/) | 262,144 | ✅ | 默认关闭，使用模型专用开关 |

[MiMo-V2.6-Flash](/radeon-cloud-docs/zh-cn/models/mimo-v2-6-flash/)另有音频输入说明。
不能从图像能力推导音频或视频能力；严格`json_schema`也是独立的端点能力，
**当前两款MiniCPM-V4.7共享端点不支持它**。

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
| MiMo-V2.6-Flash | `none` 及常见各档 —— 传 `none` 关闭思考 |

这个参数可以整个不传。MiniCPM5-2B 不返回分离的思考内容，`reasoning_effort` 对它不适用。

**MiniCPM-V4.7不属于上表的effort档位模型。** 两款使用`chat_template_kwargs.enable_thinking`
（`true`/`false`），默认`false`；不要套用其它模型的档位。Python SDK的`extra_body`示例见各模型页。

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

:::tip[上表采用effort控制的模型，共同档位为 `low` 或 `medium`]
这两个值是该effort表中模型的交集，不是MiniCPM-V4.7等新增模型的通用设置。
最高档的名字不通用——两个 Qwen 模型用 `xhigh`，
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
| MiniCPM-V-4.7-1B | 默认关闭；由 `chat_template_kwargs.enable_thinking` 控制 | 思考SSE实测返回 |
| MiniCPM-V-4.7-35B-A3B | 默认关闭；由 `chat_template_kwargs.enable_thinking` 控制 | 思考SSE实测返回 |

思考文本从 `choices[0].message.reasoning` 读。MiniCPM5-2B 直接给答案，该字段为空、
`reasoning_tokens` 为 `0`，答案从 `content` 读。

token计数按响应实际返回的`usage.completion_tokens_details.reasoning_tokens`或
`usage.reasoning_tokens`读取；V4.7思考SSE实测返回后者。两项不要相加，也不要再加进总计数；
缺少明细不代表一定没有思考。详见[思考响应字段](/radeon-cloud-docs/zh-cn/api/chat-completions/#思考响应字段)。

:::caution[两个 Qwen 模型和 GLM-5.3-Flash 默认就在思考，而且思考要花 `max_tokens`]
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
| Qwen3.8-27B | **最多一条，且必须在首位** | `system` |
| GLM-5.3-Flash | 位置任意，可多条 | `system` |
| MiniCPM5-2B | 位置任意，可多条 | `system` |

在上表对应的旧角色验收中，只有三个DeepSeek模型接受`developer`作为`system`别名；
其余四个拒绝——
Qwen3.8-27B 报 `Unexpected message role.`，Qwen3.8-Flash-Next、GLM-5.3-Flash 和
MiniCPM5-2B 报反序列化错误，并指出是第几条消息：

```
Failed to deserialize the JSON body into the target type: messages[0]: unknown role: developer
```

较新的 OpenAI SDK 会发 `developer` 代替 `system`，如果你用的是这种，请改回。

两个 Qwen 模型的限制来自它们自带的 Jinja chat template，不是网关加的规则。
Qwen3.8-27B 违规时报 `System message must be at the beginning.`

**所有模型都能接受的写法**：一条 `system` 消息、放在数组下标 `0`、角色名写 `system`。

MiniCPM-V4.7使用常规对话消息；需要系统指令时采用一条首位`system`。
本次未认证更宽松的system布局或developer角色。

## 结构化输出与工具

旧模型页分别记录了以下能力的验收范围：

- `response_format: {"type": "json_object"}`
- `tools` + `tool_choice` 的函数调用

两款MiniCPM-V4.7已通过`json_object`、auto/required/指定函数、工具结果回填和工具SSE测试；
严格`json_schema`目前返回400。

**共享网关不透传`parallel_tool_calls`。** HTTP成功不表示该控制已生效，`false`不能保证只返回
一个调用；这与模型后端本身支持什么是两回事。

## 图像输入

支持图片的模型使用`content`数组中的`image_url`内容块。下表计数依具体输入图片而变，
不是固定每图价格：

| 模型 | 单图计量 |
|---|---|
| DeepSeek-V4-Flash-Vision-Exp | `usage.prompt_tokens_details.image_tokens`，示例值 115 |
| DeepSeek-V4.1-Flash | `usage.prompt_tokens_details.image_tokens`，示例值 202 |
| Qwen3.8-Flash-Next | `usage.prompt_tokens_details.image_tokens`，示例值 144 |
| Qwen3.8-27B | `usage.prompt_tokens_details.multimodal_tokens.image`，示例值 72 |
| MiniCPM-V-4.7-1B | `usage.prompt_tokens_details.image_tokens`；默认16x下，280×280纯色PNG样例为64 |
| MiniCPM-V-4.7-35B-A3B | `usage.prompt_tokens_details.image_tokens`；相同默认配置样例为64 |

:::caution[Qwen3.8-27B 的图片计数多嵌了一层]
上表其余行报`prompt_tokens_details.image_tokens`，Qwen3.8-27B 报的是
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

发送图片前以所选模型页和当前目录确认能力，上表不是全部模态的完整清单。
MiniCPM-V4.7支持多个图片块，但共享端点不接受`video_url`，也不透传4x处理参数。
要从 PDF 或扫描件里取文字，用
[MinerU2.5-Pro](/radeon-cloud-docs/zh-cn/models/mineru2-5-pro/)：返回 Markdown，按页计费。

## 想用一套代码打所有模型

跨模型客户端应注意：

- 一条 `system` 消息，放在下标 `0`，角色名写 `system`
- 按模型选择思考控制；MiniCPM-V4.7用`chat_template_kwargs.enable_thinking`，不要强制传effort档位
- 思考文本从 `choices[0].message.reasoning` 读
- 思考token读取实际返回的已说明usage字段，不重复相加
- 只有支持的模型才使用`response_format: {"type": "json_object"}`；两款V4.7已实测通过
- `content` 只放文本；要发图先确认模型支持，并注意 Qwen3.8-27B 的计量字段不同
- `max_tokens` 按目标模型的窗口算，从 131,072 到 1,048,576 差了 8 倍

## 所有模型共通的部分

| | |
|---|---|
| 常用请求字段 | `temperature`、`max_tokens`、`top_p`、`stream`、`response_format`、`tools`、`tool_choice`；具体能力依模型而定 |
| 共享端点不透传 | `parallel_tool_calls`、`mm_processor_kwargs`；其它被过滤的参数见聊天API参考 |
| 开启思考的写法 | 按模型：支持时使用effort控制；MiniCPM-V4.7使用`chat_template_kwargs.enable_thinking` |
| 上报的分词器 | `GPT` |
| 稳定性 | `experimental` |

不在接受列表里的参数，会在请求到达推理后端之前被剔除——不报错，也不生效。确实需要这些参数，
请用[独占端点](/radeon-cloud-docs/zh-cn/api/dedicated-endpoints/)，它会把请求体原样透传给
vLLM 或 SGLang。
