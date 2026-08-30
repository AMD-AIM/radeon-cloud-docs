---
title: 模型总览
description: 免费共享模型 API 上各模型分别接受什么、返回什么——逐项实测，不照抄上游文档。
sidebar:
  order: 1
---

每个模型一页。这些页面上的结论都是对着线上端点实测出来的；模型行为和它上游文档不一致的地方，
以这里为准。

当前有哪些模型以 [`GET /v1/models`](/radeon-cloud-docs/zh-cn/api/models/) 为准，目前是两个。

## 并排对照

| | [DeepSeek-V4-Flash](/radeon-cloud-docs/zh-cn/models/deepseek-v4-flash/) | [Qwen3.8-Flash-Next](/radeon-cloud-docs/zh-cn/models/qwen3-8-flash-next/) |
|---|---|---|
| 官方构建版本 | DeepSeek-V4-Flash-0731 | Qwen3.8-Flash-Next-FP8 |
| 参数 | 43 层，256+1 专家、激活 6 个 | 总 125B / **激活 6B**，512 专家、激活 10+1 |
| 注意力 | MLA —— 64 个 Q 头、1 个 KV 头 | 混合 —— 36 层线性注意力 + 12 层 QSA |
| 许可证 | MIT | Qwen Community License 1.0 |
| 上下文 | **1,048,576** | 262,144 |
| 输入模态 | 纯文本 | 纯文本 |
| 流式 | ✅ | ✅ |
| 工具调用 | ✅ | ✅ |
| 并行工具调用 | ❌ | ❌ |
| `response_format: json_object` | ✅ | ✅ |
| `response_format: json_schema` | ❌ | ❌ |
| 图像输入 | ❌ | ❌ |
| 思考 | ✅ | ✅ |
| 不传 `reasoning_effort` 时是否思考 | ❌ | ✅ |
| 实际可用的 `reasoning_effort` 档位 | `minimal` `low` `medium` `high` `xhigh` `max` | **只有 `low` `medium`** |
| `usage.reasoning_tokens` | ✅ | ❌ |
| `system` 可以放在任意位置 | ✅ | ❌ 只能在第一位 |
| 允许多个 `system` | ✅ | ❌ |
| `developer` 角色 | ✅ | ❌ |

`messages` 上的差异归根到底只是一件事：Qwen 带了一份 Jinja chat template，遇到不是“单个且在首位”的
`system` 就抛异常；而 DeepSeek 压根没带 Jinja 模板。

## 想用一套代码打所有模型

目前所有模型都接受的交集：

- 只放一个 `system` 消息，放在下标 `0`，角色名写 `system`——不要写 `developer`
- `reasoning_effort` 显式传 `low` 或 `medium`，不要省略
- 思考文本从 `choices[0].message.reasoning` 读
- 思考 token 数从 `usage.completion_tokens_details.reasoning_tokens` 读
- 要 JSON 用 `response_format: {"type": "json_object"}`，不要用 `json_schema`
- `content` 只放文本

## 所有模型共通的部分

不管调哪个模型都成立：

| | |
|---|---|
| 接受的参数 | `temperature`、`max_tokens`、`top_p`、`stream`、`response_format`、`tools`、`tool_choice` |
| 会被静默丢弃 | `stop`、`seed`、`logit_bias`、`logprobs`、`top_logprobs`、`top_k`、`min_p`、`repetition_penalty` |
| `thinking` 参数 | 返回 `400`——请改用 `reasoning_effort` |
| 上报的分词器 | `GPT` |
| 稳定性 | `experimental` |

不在接受列表里的参数，会在请求到达推理后端之前被剔除——不报错，也不生效。确实需要这些参数，
请用[独占端点](/radeon-cloud-docs/zh-cn/api/dedicated-endpoints/)，它会把请求体原样透传给
vLLM 或 SGLang。
