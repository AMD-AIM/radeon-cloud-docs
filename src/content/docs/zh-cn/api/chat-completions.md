---
title: 聊天补全
description: 根据对话生成模型回复，兼容 OpenAI。
sidebar:
  order: 4
---

**Token Factory** 主要的推理接口，遵循 OpenAI 的聊天补全 schema。实例上的[模型服务](/radeon-cloud-docs/zh-cn/api/model-services/)用你自己的 vLLM 提供同一路径，下面的请求过滤在那边都不适用。

<div class="rc-endpoint">
  <span class="rc-method" data-m="POST">POST</span>
  <span class="rc-path">/v1/chat/completions</span>
  <span class="rc-auth">API Key 或会话</span>
</div>

也可以通过 `/api/v1/chat/completions` 访问，两个路径是同一个接口。

## 请求

| 参数 | 类型 | | 说明 |
|---|---|---|---|
| `model` | string | <span class="rc-req">必填</span> | 要调用的模型。必须是 [`GET /v1/models`](/radeon-cloud-docs/zh-cn/api/models/) 返回的某一个。 |
| `messages` | array | <span class="rc-req">必填</span> | 到目前为止的对话。每一项有一个 `role`（`system`、`user`、`assistant` 或 `tool`）和 `content`。**`system` 消息能放在哪因模型而异，见下文。** |
| `stream` | boolean | <span class="rc-opt">选填</span> | 以 server-sent events 流式返回。默认 `false`。 |
| `temperature` | number | <span class="rc-opt">选填</span> | 采样温度。越高越随机。 |
| `top_p` | number | <span class="rc-opt">选填</span> | 核采样阈值。 |
| `max_tokens` | integer | <span class="rc-opt">选填</span> | 回复生成的 token 上限。 |
| `presence_penalty` | number | <span class="rc-opt">选填</span> | 惩罚已出现过的 token。 |
| `frequency_penalty` | number | <span class="rc-opt">选填</span> | 按出现频次惩罚 token。 |
| `response_format` | object | <span class="rc-opt">选填</span> | `{"type": "json_object"}` 或一个 `json_schema`，适用于 `json_output` 为 true 的模型。 |
| `tools` | array | <span class="rc-opt">选填</span> | 工具定义，前提是模型支持工具调用。 |
| `tool_choice` | string 或 object | <span class="rc-opt">选填</span> | 模型可以或必须调用哪个工具。 |
| `reasoning_effort` | string | <span class="rc-opt">选填</span> | 控制思考长度。取值因模型而异，见下文对照表；`low` 和 `medium` 所有模型都接受。**不传时是否思考也因模型而异。** |
| `reasoning.effort` | string | <span class="rc-opt">选填</span> | 同上，统一写法。不能和 `reasoning_effort` 同时用。 |

:::caution[`messages`：角色和 system 位置因模型而异]
接受的 `role` 只有 `system`、`user`、`assistant`、`tool`。**较新 OpenAI SDK 用来代替 `system` 的
`developer` 角色，并非每个模型都接受**；`system` 消息能不能放在首位以外的位置，也因模型而异。

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

思考内容从响应的 `choices[0].message.reasoning` 里取（不是 `reasoning_content`），
token 数从 **`usage.completion_tokens_details.reasoning_tokens`** 取。除 Qwen3.8-27B 外每个模型都有这个字段；Qwen3.8-27B 不返回 `completion_tokens_details`，
它的思考 token 计入 `usage.completion_tokens`。
顶层的 `usage.reasoning_tokens` 只有部分模型给（DeepSeek 两个模型和 Qwen3.8-Flash-Next 有，MiniCPM5-2B 没有），不要依赖它。

**不传 `reasoning_effort` 不等于不思考**，各模型的默认值不一样：

| 模型 | 不传时 |
|---|---|
| DeepSeek-V4-Flash | 不思考（`reasoning` 为空，`reasoning_tokens` 为 0） |
| DeepSeek-V4-Flash-Vision-Exp | 不思考 |
| DeepSeek-V4.1-Flash | 不思考 |
| Qwen3.8-Flash-Next | **照样思考**，默认档位是 `xhigh`，也就是最长的一档 |
| Qwen3.8-27B | **照样思考**，默认档位是 `xhigh` |
| GLM-5.3-Flash | **照样思考** |
| MiMo-V2.6-Flash | **照样思考**，传 `none` 也关不掉 |
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
| MiMo-V2.6-Flash | 任何取值都接受，但不起作用 |
| MiniCPM5-2B | 不适用，直接给出答案 |

要用同一套代码调用所有模型，**请用 `low` 或 `medium`**，只有这两个值所有模型都接受。
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

这样做是为了不静默丢弃参数：以前这类请求会返回 200，但完全没有思考，调用方很难发现。

如果一定要用 Anthropic 格式，[`POST /v1/messages`](/radeon-cloud-docs/zh-cn/api/messages/)
上能用的是 `output_config: {"effort": "high"}`；那里的 `thinking` 同样会被拒绝。
:::

:::caution[不在列表里的参数会被丢弃，不会透传]
请求先按上面的 schema 校验，然后在送往服务后端前**逐字段重建**。不在列表里的字段会被静默移除，既不报错，也不生效。

其中包括一些 OpenAI 或 vLLM 客户端通常会用的参数：`stop`、`seed`、`logit_bias`、
`logprobs`、`top_logprobs`、`top_k`、`min_p`、`repetition_penalty`。如果需要其中任何一个，
请在实例上部署[模型服务](/radeon-cloud-docs/zh-cn/api/model-services/)，它会把请求体原样转发给 vLLM。
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

模型正常结束时，`finish_reason` 为 `stop`；达到 `max_tokens` 时为 `length`；需要调用工具时为 `tool_calls`。

推理模型会在 `usage` 里多返回 `reasoning_tokens`；命中前缀缓存时还会多返回
`usage.prompt_tokens_details.cached_tokens`。

## 流式

设置 `stream: true` 后，会以 server-sent events 返回。每个事件带的是增量而不是整条消息，流以 `data: [DONE]` 结束。

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

平台不会缓冲流式响应，模型生成的 token 会立即发送给你。

## 超时

非流式请求最长 10 分钟，超时后平台会终止请求。流式的话，这 10 分钟算的是**两个分片之间的间隔**，而不是整次生成的总时长。长生成应该用流式，既能看到进度，也能让连接保持活跃。

## 错误

`401` 表示 API Key 无效。`429` 表示触发限流，见[限流](/radeon-cloud-docs/zh-cn/api/rate-limits/)。`502` 或 `503` 表示后端不可达或已满载，请退避后重试。

模型名不在模型列表里时，**网关** 直接返回 `400` 和 `Requested model <名称> not supported`，请求不会到达后端。模型自身产生的错误，例如上下文超长，会连同后端的状态码和信息原样返回。错误响应格式见[错误](/radeon-cloud-docs/zh-cn/api/errors/)。
