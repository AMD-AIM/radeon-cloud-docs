---
title: GLM-5.3-Flash
description: 智谱 Z.AI 的稀疏 MoE 推理模型——默认就思考，而最高档的拼法和这里其他模型都不一样。
sidebar:
  order: 7
---

<div class="rc-endpoint">
  <span class="rc-method" data-m="POST">POST</span>
  <span class="rc-path">/v1/chat/completions</span>
  <span class="rc-auth">model: <code>GLM-5.3-Flash</code></span>
</div>

## 关于这个模型

这里跑的权重是 **GLM-5.3-Flash**，Z.AI 的 GLM-5.3 系列里偏速度的一款——
稀疏 MoE 模型，回答前先思考，而且不用你开也会思考。

### 架构

取自随权重发布的 `config.json`：

| | |
|---|---|
| 架构 | `Glm5NextForConditionalGeneration`，`model_type = glm5_next` |
| 层数 | 45——前 3 层稠密，其余为 MoE |
| 隐藏维度 | 4,096 |
| 注意力 | 64 个查询头、64 个 KV 头——完整 MHA，不是分组 |
| 稠密中间层 | 12,288 |
| 专家混合 | 288 个路由专家 + 1 个共享，每 token **激活 8 个路由专家**，专家中间层 2,048 |
| 多 token 预测 | 1 层 |
| 词表 | 154,880 |
| 原生上下文 | 1,048,576 |
| 量化 | FP8，`e4m3`，块 `[128, 128]`，动态激活缩放 |
| 许可证 | MIT |

:::note[实际提供 262,144，而非原生的 1,048,576]
权重声明的是 100 万 token 窗口，但这个端点用 `--max-model-len 262144` 启动。
**以 262,144 为准**，请求是按它校验的，不是按 `config.json` 里的数字。
:::

:::note[权重自带视觉编码器——但这个端点不用它]
`config.json` 里有 `glm5_next_vision` 视觉塔（24 层、448 像素、patch 14）以及图像/视频
token id，也就是说这个发布版本是多模态的。但本部署只提供文本。
发图会得到什么，见[图像输入](#图像输入)。
:::

## 在这个端点上

### 一览

| | |
|---|---|
| 上下文长度 | 262,144 token |
| 输入模态 | 仅文本 |
| 流式 | ✅ |
| 工具调用 | ✅ |
| JSON 输出 | ✅ `json_object` |
| 思考 | ✅ —— **不主动调低就一直开着** |
| 推理引擎 | vLLM |
| 稳定性 | `experimental` |

### `messages`

`system` 消息可以放在任意位置，也可以有多条——这一点和
[Qwen3.8-Flash-Next](/radeon-cloud-docs/zh-cn/models/qwen3-8-flash-next/) 不同，
那个模型只允许一条且必须放在最前面。

:::caution[角色名要写 `system`，不是 `developer`]
接受的角色是 `system`、`user`、`assistant`、`tool`。较新的 OpenAI SDK 会发 `developer`
代替 `system`，如果你用的是这种，请改回 `system`，否则请求全部失败。
:::

### 思考

**不传 `reasoning_effort` 并不会关掉思考。** 普通请求就已经会返回非空的 `reasoning`。
思考多长取决于提问本身而不是档位——一行问句可能只产生几十个思考 token，
一道谜题则可能用掉几千个。

支持的取值：

| 档位 | 说明 |
|---|---|
| 不传 | 照样思考 |
| `low` | |
| `medium` | |
| `high` | 最高档 |

:::caution[`xhigh` 在这里是 422——这个模型是例外]
平台上其他思考模型的最高档都叫 `xhigh`，而
[Qwen3.8-Flash-Next](/radeon-cloud-docs/zh-cn/models/qwen3-8-flash-next/) 和
[Qwen3.8-27B](/radeon-cloud-docs/zh-cn/models/qwen3-8-27b/) 恰恰拒收 `high`。
GLM-5.3-Flash 正好反过来：`high` 能用，`xhigh` 不能。

```
Failed to deserialize the JSON body into the target type: reasoning_effort: unknown variant `xhigh`, expected one of `low`, `medium`, `high` at line 1 column 131
```

状态码是 **422**，不是 Qwen3.8-27B 对同类错误返回的 400——这个值是在请求体
反序列化阶段就被拒掉的，还没轮到校验器。

`none`、`minimal`、`max` 同样被拒。**只有 `low`、`medium`、`high` 三个值可用**，
也就是 OpenAI 那三档，再没有别的。

同一套代码要同时打这个模型和 Qwen 系列时，「多想一会儿」没法共用一个字面量：
这边发 `high`，那边发 `xhigh`，或者两边都干脆不传。
:::

没有任何一个 `reasoning_effort` 值能关掉思考——`none` 不在枚举里。想让回复短一些，
请改用 `max_tokens` 限制，并从 `content` 而不是 `reasoning` 里读答案。

输出位置：

| | |
|---|---|
| 思考内容 | `choices[0].message.reasoning` |
| token 计数 | `usage.completion_tokens_details.reasoning_tokens` |

:::caution[思考会吃掉 `max_tokens` 预算]
思考 token 按输出计费、也占输出配额。`max_tokens` 给小了，可能全被思考用光，
`content` 返回 `null`、`finish_reason` 是 `length`。要么把两部分一起算进预算，要么调低档位。
:::

### 图像输入

这个端点不提供，尽管权重里带着视觉塔。发 `image_url` 会得到一个 400，
而它的报错描述的是服务端路径配置，并不是真正的原因：

```
Invalid `--allowed-local-media-path`: The path <path> does not exist.
```

请只发文本。需要图像时请用
[DeepSeek-V4-Flash-Vision-Exp](/radeon-cloud-docs/zh-cn/models/deepseek-v4-flash-vision-exp/)、
[DeepSeek-V4.1-Flash](/radeon-cloud-docs/zh-cn/models/deepseek-v4-1-flash/) 或两个 Qwen3.8 模型。

### 限制

| | |
|---|---|
| 上下文窗口 | 262,144 token，是**总预算**——输入加输出，不是只给输出的额度 |
| 输入 | 仅文本；需要图像请用 [DeepSeek-V4.1-Flash](/radeon-cloud-docs/zh-cn/models/deepseek-v4-1-flash/) |
| JSON 输出 | `response_format: {"type": "json_object"}` |
| 思考档位 | `reasoning_effort`（或等价的 `reasoning.effort`）——`low`、`medium`、`high` |

`max_tokens` 是对**总预算**封顶的，输入也算在内：

```
This model's maximum context length is 262144 tokens. However, you requested 128000 output tokens and your prompt contains at least 134145 input tokens, for a total of at least 262145 tokens. Please reduce the length of the input prompt or the number of requested output tokens.
```

这一条是 400，和上面那个 422 不同。

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

把 `high` 换成 `xhigh`，同样一条请求在这个模型上就是 422——见[思考](#思考)。
