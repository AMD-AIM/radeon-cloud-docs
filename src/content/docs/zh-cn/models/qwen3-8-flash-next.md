---
title: Qwen3.8-Flash-Next
description: Qwen 对 Qwen4 架构的预览版——官方规格，以及它在本端点上强制的两条规则。
sidebar:
  order: 3
---

<div class="rc-endpoint">
  <span class="rc-method" data-m="POST">POST</span>
  <span class="rc-path">/v1/chat/completions</span>
  <span class="rc-auth">model: <code>Qwen3.8-Flash-Next</code></span>
</div>

## 官方介绍

这里跑的权重是 **Qwen3.8-Flash-Next-FP8**，即 Qwen3.8-Flash-Next 的 FP8 量化版本，采用块大小 128 的
细粒度 FP8。Qwen 称其指标与未量化的原版几乎一致。

Qwen 把这次发布描述为**支撑 Qwen4 的架构的实验性预览**，也是该架构下的首个开源权重模型。相对 Qwen3
系列，模型卡列出三处新东西：

- **QSA 混合注意力** —— 原先的 Gated DeltaNet + Gated Attention 组合，改为 Gated DeltaNet +
  **Qwen Sparse Attention（QSA）**。
- **Gated Residual** —— 在带归一化的残差流上再加一道门控，目标是让又深又宽的模型仍然可训。
- **N-gram Embedding** —— 一条比 MoE 更省算力、也更容易 offload 的参数扩展轴。

细节见 Qwen 的[博客](https://qwen.ai/blog?id=qwen3.8-flash-next)和技术报告。

:::note[它和「Qwen3.8-Flash」不是一个东西]
Qwen 另有一个叫 **Qwen3.8-Flash** 的托管服务模型跑在 Qwen Cloud 上，基于同一批权重、附加了若干生产
特性，其中包括默认 100 万 token 上下文。本端点提供的是开源权重版 **Qwen3.8-Flash-Next**，上下文为其
原生的 262,144。
:::

### 架构

取自模型卡与随权重发布的 `config.json`：

| | |
|---|---|
| 参数量 | 总计 125B，**激活 6B**，另有 51B n-gram embedding 与 4B MTP |
| 层数 | 48 层，排布为 12 ×（3 × Gated DeltaNet→MoE，再 1 × QSA→MoE）|
| 隐藏维度 | 2,560 |
| Gated DeltaNet | 48 个 V 头、16 个 QK 头，头维度 128 |
| Qwen Sparse Attention | 24 个 Q 头、2 个 KV 头，头维度 256，RoPE 分量 64 维 |
| QSA indexer | MQA，4 个 Q 头 + 1 个共享 K 头，头维度 128 |
| **QSA 预算** | **512 个块 / 2,048 个 token** |
| 专家混合 | 512 个专家，**激活 10 个路由 + 1 个共享**，专家中间维度 640 |
| N-gram embedding | 2,000 万个 bigram/trigram，作用在第 2 层 |
| Gated Residual | 4 个分支，瓶颈秩 320 |
| 词表 | 248,320（已 padding）|
| 原生上下文 | 262,144，可外推至 1,000,000 |
| 多 token 预测 | 1 层 |
| 量化 | FP8，块大小 `[128, 128]`，激活动态缩放 |
| 许可证 | Qwen Community License 1.0 |

最值得记住的数字是 **QSA 预算**：无论对话多长，对 KV cache 的注意力最多只落在 2,048 个被选中的 token
上；而 48 层里有 36 层是线性注意力，其状态大小根本不随上下文增长。

:::caution[模型卡写着「带视觉编码器」，但本端点仍然拒绝图像]
Qwen 把类型标为 *Causal Language Model with Vision Encoder*，仓库也打了 `image-text-to-text` 标签。
**但本端点会拒绝图像内容**——见[上限与拒绝](#上限与拒绝)。在这里调用时请当作纯文本模型。
:::

## 本端点上的行为

以下全部是对着线上端点实测的。与模型卡不一致的地方以端点为准。

### 概览

| | |
|---|---|
| 上下文长度 | 262,144 token |
| 输入模态 | 仅文本 |
| 流式 | ✅ |
| 工具调用 | ✅（不支持并行调用）|
| JSON 输出 | ✅ `json_object` · ❌ `json_schema` |
| 思考 | ✅ —— **不主动调低就一直在思考** |
| 稳定性 | `experimental` |

### `messages` —— 会咬人的两条规则

:::danger[有且只能有一个 `system` 消息，而且必须在第一位]
其它写法一律拒绝：

| 形状 | 状态 |
|---|:---:|
| `system` 在首位，后接 `user` | `200` |
| `system` 出现在 user 轮之后 | **`400`** |
| `system` 在末尾 | **`400`** |
| 两个 `system` 消息 | **`400`** |

```json
{
  "error": {
    "message": "System message must be at the beginning.",
    "type": "BadRequestError",
    "code": 400
  }
}
```

这是模型自带的 Jinja chat template 在抛异常，不是网关的规则——Qwen 把这条检查写在
`tokenizer_config.json` 里。用同一份权重跑[独占端点](/radeon-cloud-docs/zh-cn/api/dedicated-endpoints/)，
一样会拒。
:::

:::danger[不接受 `developer` 角色]
较新的 OpenAI SDK 会用 `developer` 代替 `system`。这里接受的角色只有 `system`、`user`、`assistant`、
`tool`，`developer` 不在其中；而且它是在**请求体反序列化阶段**失败的，所以状态码是 **`422` 而不是
`400`**：

```
Failed to deserialize the JSON body into the target type: messages[0]: unknown role: developer
```

如果你的客户端库默认发 `developer`，把它改回 `system`。
:::

### 思考

**不传 `reasoning_effort` 并不会关掉思考。** 普通请求返回的 `reasoning` 已经有内容、
`reasoning_tokens` 也非 0。模型内部默认档位是 `xhigh`，也就是最长的一档。

真正能传进去的只有两档：

| 档位 | 状态 | 原因 |
|---|:---:|---|
| `low` | `200` | |
| `medium` | `200` | |
| `high` | **`400`** | 过得了请求校验，但模型拒绝：`Unexpected reasoning effort high. Supported types are xhigh (default), medium, and low.` |
| `xhigh` | **`422`** | 反序列化阶段就被拒——不在端点的枚举里 |
| `max` | **`422`** | 同上 |
| `minimal` | **`422`** | 同上 |

:::caution[`xhigh` 是默认值，却传不进去]
模型自称默认档位是 `xhigh`，但端点的请求 schema 只接受 `low`、`medium`、`high`——于是 `xhigh` 只有
"不传该参数"这一条路能走到，而 `high` 过得了 schema 却被模型拒绝。**请显式传 `low` 或 `medium`**，
这是仅有的两个端到端都能走通的值。
:::

结果放在哪：

| | |
|---|---|
| 思考文本 | `choices[0].message.reasoning` |
| token 数 | `usage.completion_tokens_details.reasoning_tokens` |
| 不提供 | `usage.reasoning_tokens` —— **没有顶层字段**，和 DeepSeek-V4-Flash 不同 |

### 上限与拒绝

| 你发的 | 返回 |
|---|---|
| `max_tokens` 超出窗口 | `400` `max_tokens=… cannot be greater than max_model_len=max_total_tokens=262144.` |
| `response_format: json_schema` | `400` `Model Qwen3.8-Flash-Next does not support JSON schema output mode` |
| `content` 里带 `image_url` | `400` `Model Qwen3.8-Flash-Next does not support image input.` |
| `thinking: {...}` | `400` —— 请改用 `reasoning_effort` |

`max_tokens` 是按**总预算**算的，包含 prompt：262,144 是输入加输出的总和，不是单给输出的额度。

### 示例

```bash
curl https://developer.amd.com.cn/radeon/api/v1/chat/completions \
  -H "Authorization: Bearer $RADEON_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "Qwen3.8-Flash-Next",
    "reasoning_effort": "low",
    "messages": [
      { "role": "system", "content": "用一句话回答。" },
      { "role": "user", "content": "天空为什么是蓝的？" }
    ]
  }'
```

一个 `system` 消息、放在数组首位、显式传 `low`——这个请求形状原样打
[DeepSeek-V4-Flash](/radeon-cloud-docs/zh-cn/models/deepseek-v4-flash/) 也能通。
