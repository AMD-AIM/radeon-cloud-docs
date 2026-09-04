---
title: DeepSeek-V4-Flash
description: DeepSeek 的百万 token 智能体模型——官方规格，以及它在本端点上的实际行为。
sidebar:
  order: 2
---

<div class="rc-endpoint">
  <span class="rc-method" data-m="POST">POST</span>
  <span class="rc-path">/v1/chat/completions</span>
  <span class="rc-auth">model: <code>DeepSeek-V4-Flash</code></span>
</div>

## 官方介绍

这里跑的权重是 **DeepSeek-V4-Flash-0731**，DeepSeek 对 DeepSeek-V4-Flash 的正式发布版，取代此前的
预览版。官方把它定位为智能体（agentic）模型：在其模型卡公布的基准上，尽管激活参数量小得多，仍胜过
DeepSeek-V4-Pro（预览版）。配套技术报告题为 *DeepSeek-V4: Towards Highly Efficient Million-Token
Context Intelligence*（[arXiv:2606.19348](https://arxiv.org/abs/2606.19348)）。

### 架构

取自随权重发布的 `config.json`：

| | |
|---|---|
| 架构 | `DeepseekV4ForCausalLM`（`deepseek_v4`）|
| 层数 | 43 |
| 隐藏维度 | 4,096 |
| 注意力 | 64 个 Q 头、1 个 KV 头 —— MLA，`q_lora_rank` 1,024，RoPE 分量 64 维 |
| 专家混合 | 256 个路由专家 + 1 个共享，**每 token 激活 6 个路由专家**，专家中间维度 2,048 |
| 词表 | 129,280 |
| 原生上下文 | 1,048,576 |
| 多 token 预测 | 1 层 |
| 量化 | FP8 `e4m3`，块大小 `[128, 128]`，激活动态缩放 |
| 许可证 | MIT |

百万 token 窗口是**原生的**——它就是 config 里的 `max_position_embeddings`，不是服务端加的 RoPE 外推。

### 官方建议

模型卡建议 `temperature = 1.0`；智能体场景 `top_p = 0.95`，其余场景 `top_p = 1.0`。这两个参数本端点
都接受，可以照着用。

:::note[没有 Jinja chat template]
和多数开源权重不同，这份权重**不带 Jinja chat template**——提示词拼装放在 Python 的 `encoding/`
目录里。这正是它对 `system` 消息放在哪毫不在意的原因：没有模板去抛异常。带模板的模型会是什么样，
见 [Qwen3.8-Flash-Next](/radeon-cloud-docs/zh-cn/models/qwen3-8-flash-next/)。
:::

## 本端点上的行为

以下全部是对着线上端点实测的。与模型卡不一致的地方以端点为准——网关会先校验并重建请求，再送到推理
后端。

### 概览

| | |
|---|---|
| 上下文长度 | **1,048,576** token |
| 输入模态 | 仅文本 |
| 流式 | ✅ |
| 工具调用 | ✅ |
| JSON 输出 | ✅ `json_object` |
| 思考 | ✅ —— **不主动要就不思考** |
| 稳定性 | `experimental` |

### 思考

**不传 `reasoning_effort` 就不会思考。** 基线请求返回的 `reasoning` 为空、`reasoning_tokens` 为 0。

模型卡写的是三档：`low`、`high`、`max`。而本端点接受全部七个取值：

| `none` | `minimal` | `low` | `medium` | `high` | `xhigh` | `max` |
|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

但它们并不对应七种行为：`minimal`/`low`/`medium` 的思考量差不多，`high`/`max` 明显更长——实际两档，
和官方文档的三档大体吻合。

结果放在哪：

| | |
|---|---|
| 思考文本 | `choices[0].message.reasoning` |
| token 数 | `usage.completion_tokens_details.reasoning_tokens` |
| 额外提供 | `usage.reasoning_tokens` —— 这个模型有顶层字段 |

:::note[不思考时字段名会变]
传了 `reasoning_effort` 时，`message` 里是 `reasoning`；不思考的普通请求里出现的是
`reasoning_content`，且为空。**读 `reasoning`，把键不存在当成"没思考"**，不要按哪个键存在来分支。
:::

### `messages`

`system` 消息放在哪个位置都行、可以放多条，角色名写 `system` 或 `developer` 都接受。

但 [Qwen3.8-Flash-Next](/radeon-cloud-docs/zh-cn/models/qwen3-8-flash-next/) **不是这样**。要用一套
代码同时打两个模型，请按那个模型更严格的规则写：一条 `system`、放在首位、角色名写 `system`。

### 上限

| | |
|---|---|
| 上下文窗口 | 1,048,576 token，**按 prompt + 输出 的总和算** |
| JSON 输出 | 只支持 `response_format: {"type": "json_object"}` |
| 开启思考 | 只能用 `reasoning_effort`（或等价的 `reasoning.effort`）|
| 输入 | 纯文本；要发图请用 [DeepSeek-V4-Flash-Vision-Exp](/radeon-cloud-docs/zh-cn/models/deepseek-v4-flash-vision-exp/) |

### 示例

```bash
curl https://developer.amd.com.cn/radeon/api/v1/chat/completions \
  -H "Authorization: Bearer $RADEON_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "DeepSeek-V4-Flash",
    "reasoning_effort": "low",
    "temperature": 1.0,
    "top_p": 0.95,
    "messages": [
      { "role": "system", "content": "用一句话回答。" },
      { "role": "user", "content": "天空为什么是蓝的？" }
    ]
  }'
```
