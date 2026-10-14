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
| `response_format` | object | <span class="rc-opt">选填</span> | JSON对象模式与严格JSON Schema是独立能力，请按模型页核对；两款MiniCPM-V4.7共享端点支持`json_object`，不支持`json_schema`。 |
| `tools` | array | <span class="rc-opt">选填</span> | 工具定义，前提是模型支持工具调用。 |
| `tool_choice` | string 或 object | <span class="rc-opt">选填</span> | 模型可以或必须调用哪个工具。 |
| `reasoning_effort` | string | <span class="rc-opt">选填</span> | 控制支持该参数的模型的思考强度。档位和默认行为依模型而定，见下文；这个请求参数与响应中的 `reasoning` 思考文本字段不同。 |
| `reasoning.effort` | string | <span class="rc-opt">选填</span> | 同上，统一写法。不能和 `reasoning_effort` 同时用。 |
| `chat_template_kwargs.enable_thinking` | boolean | <span class="rc-opt">选填</span> | [MiniCPM-V-4.7-1B](/radeon-cloud-docs/zh-cn/models/minicpm-v4-7-1b/)和[MiniCPM-V-4.7-35B-A3B](/radeon-cloud-docs/zh-cn/models/minicpm-v4-7-35b-a3b/)已验证的专用开关，默认`false`；Python SDK通过`extra_body`传入，不直接套用到其它模型。 |

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
对支持思考强度控制的模型，使用 **`reasoning_effort`** 或等价的 **`reasoning.effort`**。
应按所选模型核对控制参数和默认行为，不假定同一设置适用于所有模型。

```json
{
  "model": "DeepSeek-V4-Flash",
  "reasoning_effort": "high",
  "messages": [{ "role": "user", "content": "..." }]
}
```

非流式思考文本从 `choices[].message.reasoning` 读取，SSE 思考增量从
`choices[].delta.reasoning` 读取；最终回答在相应的 `content` 字段中。
解析方式和 token 计数见[思考响应字段](#思考响应字段)。

**不传 `reasoning_effort` 不等于不思考**，各模型的默认值不一样：

| 模型 | 不传时 |
|---|---|
| DeepSeek-V4-Flash | 不思考（`reasoning` 为空，`reasoning_tokens` 为 0） |
| DeepSeek-V4-Flash-Vision-Exp | 不思考 |
| DeepSeek-V4.1-Flash | 不思考 |
| Qwen3.8-Flash-Next | **照样思考**，默认档位是 `xhigh`，也就是最长的一档 |
| Qwen3.8-27B | **照样思考**，默认档位是 `xhigh` |
| GLM-5.3-Flash | **照样思考** |
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
| MiniCPM5-2B | 不适用——直接给答案 |

对上表中支持思考强度控制的模型，`low` 和 `medium` 是共同档位；不要据此推断其它模型
或模型专用参数也支持。最高档的名字不通用：Qwen3.8-27B 传 `high` 返回 400，
GLM-5.3-Flash 传 `xhigh` 返回 422。单次请求不能同时传 `reasoning_effort` 和
`reasoning.effort`。完整对照表见[模型总览](/radeon-cloud-docs/zh-cn/models/overview/)。
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
请求经过校验，在送往服务后端前**逐字段重建**，不是通用透传。未声明的字段可能被静默移除，
部分不支持的控制项则会明确报错。MiniCPM-V4.7已说明的`chat_template_kwargs`开关有专用转发路径，
不代表任意引擎参数都能透传。

这里面包括一些 OpenAI 或 vLLM 客户端会合理期待能用的参数：`stop`、`seed`、`logit_bias`、
`logprobs`、`top_logprobs`、`top_k`、`min_p`、`repetition_penalty`。
`parallel_tool_calls`和`mm_processor_kwargs`也不透传，不要期待V4.7的4x覆盖或单调用限制生效。
确实需要后端原生参数时，
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

思考 token 明细依模型和响应而定，见下文。命中前缀缓存时可能返回
`usage.prompt_tokens_details.cached_tokens`。

## 思考响应字段

**统一共享聊天端点的思考文本字段是 `reasoning`，不是 `reasoning_content`。**
网关会归一化后端返回的思考字段；这是现有响应约定，不是新的思考模式。
独占端点则可能保留其后端原生的字段名。

| 响应方式 | 思考文本 | 最终回答文本 |
|---|---|---|
| 非流式 | `choices[].message.reasoning` | `choices[].message.content` |
| 流式 SSE | `choices[].delta.reasoning` | `choices[].delta.content` |

- 字段可能不存在、为 `null` 或空字符串。不是所有模型或请求都产生思考，也不是每个分片
  都有文本；不要因为没有 `reasoning_content` 就判断思考内容丢失。
- SSE 按 `choices[].index` 分别累加非空字符串增量。思考与最终回答分开保存、展示，
  不要将两者直接拼成最终答案。
- 仅包含 usage 的分片可能为 `choices: []`。使用 SDK 时遍历 `chunk.choices`，不要假定
  `choices[0]` 一定存在。原始 SSE 以 `data: [DONE]` 结束。
- `reasoning` 是网关在 OpenAI 兼容响应中的扩展字段。Python OpenAI SDK 可通过
  `getattr(delta, "reasoning", None)` 或 `getattr(message, "reasoning", None)` 安全读取。
  只识别 `reasoning_content` 的客户端应改为读取 `reasoning`；共享端点不承诺返回有内容的
  `reasoning_content` 别名。

计数优先读取响应实际提供的 `usage.completion_tokens_details.reasoning_tokens`；部分响应
改在或同时在 `usage.reasoning_tokens` 返回。两处都有时不要相加；两处都没有时，表示没有
独立思考计数，不代表一定为零。`completion_tokens` 和 `total_tokens` 沿用响应值，不要
再加一次思考 tokens，也不要按文本字符数估算 token 数。这些计数字段不是思考文本本身。

输出字段一致不代表所有模型都接受相同的开关、effort 档位或思考 token 预算；控制参数
仍以所选模型为准，见上文。

## 流式

设 `stream: true` 就能收到 server-sent events。每个事件带的是增量而不是整条消息，流以 `data: [DONE]` 结束。

```python
import os

from openai import OpenAI

client = OpenAI(
    base_url="https://developer.amd.com.cn/radeon/api/v1",
  api_key=os.environ["RADEON_API_KEY"],
)

stream = client.chat.completions.create(
    model="DeepSeek-V4-Flash",
    messages=[{"role": "user", "content": "Explain ROCm in two sentences."}],
  reasoning_effort="high",  # 按所选模型使用受支持的档位。
    stream=True,
  stream_options={"include_usage": True},
)

thinking_by_choice = {}
answer_by_choice = {}
usage = None

for chunk in stream:
  if chunk.usage is not None:
    usage = chunk.usage
  for choice in chunk.choices:
    delta = choice.delta
    thinking = getattr(delta, "reasoning", None)
    if isinstance(thinking, str) and thinking:
      thinking_by_choice.setdefault(choice.index, []).append(thinking)
    if isinstance(delta.content, str) and delta.content:
      answer_by_choice.setdefault(choice.index, []).append(delta.content)

# 这里只输出最终回答；thinking_by_choice 可在单独的思考区域展示。
print("".join(answer_by_choice.get(0, [])))
if usage is not None:
  print(usage.model_dump(exclude_none=True))
```

字典随分片到达逐步累加内容。交互式客户端可以立即将新的 `reasoning` 和 `content` 增量
显示在不同区域。SDK 负责处理 `[DONE]`，循环也兼容没有 choices 的 usage 分片。

## 超时

一个非流式请求最多跑 10 分钟，之后平台放弃。流式的话，这 10 分钟算的是**两个分片之间的间隔**，而不是整次生成的总时长。长生成应该用流式，既能看到进度，也能让连接保持活跃。

## 错误

`401` 密钥无效。`429` 触发限流——见[限流](/radeon-cloud-docs/zh-cn/api/rate-limits/)。`502` 或 `503` 后端不可达或已饱和，退避后重试。

目录里没有的模型名由**网关**直接拒掉，返回 `400` 和 `Requested model <名字> not supported`，请求根本到不了后端。模型自己报的错，比如上下文超长，会带着后端自己的状态码和消息透传出来。响应体形状见[错误](/radeon-cloud-docs/zh-cn/api/errors/)。
