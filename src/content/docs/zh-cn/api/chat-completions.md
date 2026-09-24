---
title: 聊天补全
description: 根据对话生成模型回复——兼容 OpenAI。
sidebar:
  order: 4
---

主要的推理端点，属于 **Public Free Model APIs**，遵循 OpenAI 的聊天补全 schema。[独占端点](/radeon-cloud-docs/zh-cn/api/dedicated-endpoints/)用你自己的 vLLM 或 SGLang 提供同一条路径，下面说的请求过滤在那边一条都不适用。

<div class="rc-endpoint">
  <span class="rc-method" data-m="POST">POST</span>
  <span class="rc-path">/v1/chat/completions</span>
  <span class="rc-auth">Bearer 密钥或会话</span>
</div>

也可以通过 `/api/v1/chat/completions` 访问——两个路径是同一个端点。

## 请求

| 参数 | 类型 | | 说明 |
|---|---|---|---|
| `model` | string | <span class="rc-req">必填</span> | 要跑的模型。必须是 [`GET /v1/models`](/radeon-cloud-docs/zh-cn/api/models/) 返回的某一个。 |
| `messages` | array | <span class="rc-req">必填</span> | 到目前为止的对话。每一项有一个 `role`（`system`、`user`、`assistant` 或 `tool`）和 `content`。**`system` 消息能放在哪因模型而异，见下文。** |
| `stream` | boolean | <span class="rc-opt">选填</span> | 以 server-sent events 流式返回。默认 `false`。 |
| `temperature` | number | <span class="rc-opt">选填</span> | 采样温度。越高越随机。 |
| `top_p` | number | <span class="rc-opt">选填</span> | 核采样阈值。 |
| `max_tokens` | integer | <span class="rc-opt">选填</span> | 回复生成的 token 上限。 |
| `presence_penalty` | number | <span class="rc-opt">选填</span> | 惩罚已出现过的 token。 |
| `frequency_penalty` | number | <span class="rc-opt">选填</span> | 按出现频次惩罚 token。 |
| `response_format` | object | <span class="rc-opt">选填</span> | `{"type": "json_object"}` 适用于 `json_output` 为 true 的模型；严格 `json_schema` 只有 MiMo-V2.6-Flash 支持。 |
| `tools` | array | <span class="rc-opt">选填</span> | 工具定义，前提是模型支持工具调用。 |
| `tool_choice` | string 或 object | <span class="rc-opt">选填</span> | 模型可以或必须调用哪个工具。 |
| `reasoning_effort` | string | <span class="rc-opt">选填</span> | 控制思考长度。取值因模型而异，见下文对照表；`low` 和 `medium` 所有模型都收。**不传时是否思考也因模型而异。** |
| `reasoning.effort` | string | <span class="rc-opt">选填</span> | 同上，统一写法。不能和 `reasoning_effort` 同时用。 |

:::caution[`messages`：角色和 system 位置因模型而异]
接受的 `role` 只有 `system`、`user`、`assistant`、`tool`。**较新 OpenAI SDK 用来代替 `system` 的
`developer` 角色，并非每个模型都收**；`system` 消息能不能放在首位以外的位置，也因模型而异。

**所有模型都接受的写法**：最多一条 `system` 消息、放在数组下标 `0`、角色名写 `system`
而不是 `developer`。

```json
"messages": [
  { "role": "system", "content": "用一句话回答。" },
  { "role": "user",   "content": "天空为什么是蓝的？" }
]
```

逐模型的宽松程度见[模型参考页](/radeon-cloud-docs/zh-cn/models/overview/)。
:::

:::tip[怎么开思考]
在这个端点上，**开启思考只有 `reasoning_effort`（或等价的 `reasoning.effort`）一种写法**。

```json
{
  "model": "DeepSeek-V4-Flash",
  "reasoning_effort": "high",
  "messages": [{ "role": "user", "content": "..." }]
}
```

思考内容从响应的 `choices[0].message.reasoning` 里取（不是 `reasoning_content`）。
token 数从 **`usage.completion_tokens_details.reasoning_tokens`** 取。这个对象总是存在，
但只有引擎单独上报思考量的模型上它才是实测值——否则网关会按 `reasoning` 文本长度估算。
MiMo-V2.6-Flash 会显式返回 `0`，网关按原值采用。
顶层的 `usage.reasoning_tokens` 只有部分模型给，别依赖它。
要判断模型是否思考过，看 `reasoning` 是否非空，不要读这两个计数器。

**不传 `reasoning_effort` 不等于不思考**，各模型的默认值不一样：

| 模型 | 不传时 |
|---|---|
| DeepSeek-V4-Flash | 不思考（`reasoning` 为空，`reasoning_tokens` 为 0） |
| DeepSeek-V4-Flash-Vision-Exp | 不思考 |
| DeepSeek-V4.1-Flash | 不思考 |
| Qwen3.8-Flash-Next | **照样思考**，默认档位是 `xhigh`，也就是最长的一档 |
| Qwen3.8-27B | **照样思考**，默认档位是 `xhigh` |
| GLM-5.3-Flash | **照样思考** |
| MiMo-V2.6-Flash | **照样思考**，传 `reasoning_effort: "none"` 关掉 |
| MiniCPM5-2B | 不思考 |

要确定性地控制，就显式传值；想让两个 Qwen 模型和 GLM-5.3-Flash 少思考，传 `low`。

**各模型接受的档位不一样**：

| 模型 | 支持的取值 |
|---|---|
| DeepSeek-V4-Flash | `none` `minimal` `low` `medium` `high` `xhigh` `max` |
| DeepSeek-V4-Flash-Vision-Exp | `none` `minimal` `low` `medium` `high` `xhigh` `max` |
| DeepSeek-V4.1-Flash | `none` `minimal` `low` `medium` `high` `xhigh` `max` |
| Qwen3.8-Flash-Next | `none` `low` `medium` `xhigh` |
| Qwen3.8-27B | `low` `medium` `xhigh` |
| GLM-5.3-Flash | `low` `medium` `high` |
| MiMo-V2.6-Flash | `none` 及常见各档 —— 传 `none` 关闭思考 |
| MiniCPM5-2B | 不适用——直接给答案 |

要写一套代码跑所有模型，**用 `low` 或 `medium`**——只有这两个所有模型都认。
最高档的名字不通用，而且两种写法互斥：Qwen3.8-27B 传 `high` 返回 400，
GLM-5.3-Flash 传 `xhigh` 返回 422。
完整对照表见[模型总览](/radeon-cloud-docs/zh-cn/models/overview/)。
:::

:::danger[不要用 `thinking`，它不生效]
有些客户端（尤其是 Anthropic 风格的）会发 `thinking: {"type": "enabled", "budget_tokens": N}`
来开思考。**这个端点不支持它**，服务后端也不支持按 token 数给思考定额。

现在遇到 `thinking` 或 `reasoning.enabled` 会直接返回 **400**，并在报错里指向
`reasoning_effort`：

```json
{
  "error": {
    "message": "\"thinking\" is not supported on /v1/chat/completions and was not applied. Use \"reasoning_effort\" (or \"reasoning.effort\") to control thinking.",
    "type": "invalid_request_error",
    "code": "unsupported_parameter"
  }
}
```

宁可报错也不静默丢弃：早先这类请求会返回 200，但一点思考都没有，调用方很难发现。

非要走 Anthropic 格式的话，[`POST /v1/messages`](/radeon-cloud-docs/zh-cn/api/messages/)
上能用的是 `output_config: {"effort": "high"}`；那里的 `thinking` 同样会被拒绝。
:::

:::caution[清单之外的参数会被丢掉，不是透传]
请求先按上面的 schema 校验，然后在送往服务后端前**逐字段重建**。不在接受集里的字段会被静默移除——不报错，也不生效。

这里面包括一些 OpenAI 或 vLLM 客户端会合理期待能用的参数：`stop`、`seed`、`logit_bias`、
`logprobs`、`top_logprobs`、`top_k`、`min_p`、`repetition_penalty`。真需要它们里的任何一个，
用[独占端点](/radeon-cloud-docs/zh-cn/api/dedicated-endpoints/)，那条路会把你的请求体直接送给 vLLM 或 SGLang。
:::

## 示例

```bash
curl https://developer.amd.com.cn/radeon/api/v1/chat/completions \
  -H "Authorization: Bearer $RADEON_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "DeepSeek-V4-Flash",
    "messages": [
      {"role": "system", "content": "You are a concise assistant."},
      {"role": "user", "content": "What is ROCm?"}
    ],
    "temperature": 0.7,
    "max_tokens": 256
  }'
```

## 响应

```json
{
  "id": "chatcmpl-8f3b21d0",
  "object": "chat.completion",
  "created": 1756108800,
  "model": "DeepSeek-V4-Flash",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "ROCm is AMD's open software platform for GPU computing..."
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 24,
    "completion_tokens": 118,
    "total_tokens": 142
  }
}
```

模型自己说完了，`finish_reason` 是 `stop`；撞到 `max_tokens` 是 `length`；想调用工具是 `tool_calls`。

推理模型会在 `usage` 里多一个 `reasoning_tokens`；命中前缀缓存时还会多出
`usage.prompt_tokens_details.cached_tokens`。

## 流式

设 `stream: true` 就能收到 server-sent events。每个事件带的是增量而不是整条消息，流以 `data: [DONE]` 结束。

```python
from openai import OpenAI

client = OpenAI(
    base_url="https://developer.amd.com.cn/radeon/api/v1",
    api_key="rc-...",
)

stream = client.chat.completions.create(
    model="DeepSeek-V4-Flash",
    messages=[{"role": "user", "content": "Explain ROCm in two sentences."}],
    stream=True,
)

for chunk in stream:
    delta = chunk.choices[0].delta.content
    if delta:
        print(delta, end="", flush=True)
```

平台不会缓冲流式响应，模型产出 token 的同时就送到你手上。

## 超时

一个非流式请求最多跑 10 分钟，之后平台放弃。流式的话，这 10 分钟算的是**两个分片之间的间隔**，而不是整次生成的总时长。长生成应该用流式，既能看到进度，也能让连接保持活跃。

## 错误

`401` 密钥无效。`429` 触发限流——见[限流](/radeon-cloud-docs/zh-cn/api/rate-limits/)。`502` 或 `503` 后端不可达或已饱和，退避后重试。

目录里没有的模型名由**网关**直接拒掉，返回 `400` 和 `Requested model <名字> not supported`，请求根本到不了后端。模型自己报的错，比如上下文超长，会带着后端自己的状态码和消息透传出来。响应体形状见[错误](/radeon-cloud-docs/zh-cn/api/errors/)。
