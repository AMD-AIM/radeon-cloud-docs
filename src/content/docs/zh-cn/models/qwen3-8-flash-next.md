---
title: Qwen3.8-Flash-Next
description: Qwen 对 Qwen4 架构的预览版——官方规格，以及它在本端点上强制的两条规则。
sidebar:
  order: 5
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

无论对话多长，对 KV cache 的注意力最多只落在 2,048 个被选中的 token 上；
48 层里有 36 层是线性注意力，其状态大小不随上下文增长。

:::note[模型卡写着「带视觉编码器」，本端点也收图片]
Qwen 把类型标为 *Causal Language Model with Vision Encoder*，仓库也打了 `image-text-to-text` 标签。
见[图像输入](#图像输入)。
:::

## 本端点上的行为

### 概览

| | |
|---|---|
| 上下文长度 | 262,144 token |
| 输入模态 | 文本 + **图像** |
| 流式 | ✅ |
| 工具调用 | ✅ |
| JSON 输出 | ✅ `json_object` |
| 思考 | ✅ —— **不主动调低就一直在思考** |
| 稳定性 | `experimental` |

### `messages` —— 两条硬规矩

:::caution[`system` 只能放一条，且必须在第一位]
模型自带的 Jinja chat template 把这条检查写在 `tokenizer_config.json` 里，不是网关加的规则——
用同一份权重跑[独占端点](/radeon-cloud-docs/zh-cn/api/dedicated-endpoints/)也一样。

```json
"messages": [
  { "role": "system", "content": "用一句话回答。" },
  { "role": "user",   "content": "天空为什么是蓝的？" }
]
```
:::

:::caution[角色名写 `system`，不是 `developer`]
本模型接受的角色是 `system`、`user`、`assistant`、`tool`。较新的 OpenAI SDK 会用 `developer`
代替 `system`，如果你的客户端库默认如此，把它改回 `system`。
:::

### 思考

**不传 `reasoning_effort` 并不会关掉思考。** 普通请求返回的 `reasoning` 已经有内容、
`reasoning_tokens` 也非 0。模型内部默认档位是 `xhigh`，也就是最长的一档。

支持的取值：

| 档位 | 说明 |
|---|---|
| 不传 | 走模型默认的 `xhigh` |
| `none` | |
| `low` | |
| `medium` | |
| `xhigh` | 最长的一档 |

:::caution[本模型的最高档叫 `xhigh`，不是 `high`]
写跨模型代码时注意：`low` 和 `medium` 在所有模型上都能用，而最高档的名字不通用——
本模型用 `xhigh`，[MiniCPM5-2B](/radeon-cloud-docs/zh-cn/models/minicpm5-2b/) 用 `high`。
想要最长的思考，传 `xhigh` 或者干脆不传这个参数。
:::

结果放在哪：

| | |
|---|---|
| 思考文本 | `choices[0].message.reasoning` |
| token 数 | `usage.completion_tokens_details.reasoning_tokens` |
| 顶层别名 | `usage.reasoning_tokens` —— 本模型**有**这个字段（与 DeepSeek-V4-Flash 相同）|

### 图像输入

本模型接受 `image_url` 内容块。

| | |
|---|---|
| 传法 | `content` 数组里放 `{"type":"image_url","image_url":{"url":"data:image/png;base64,..."}}` |
| 计量 | `usage.prompt_tokens_details.image_tokens` |
| 单图上限 | 权重自带 `vision_max_n_token = 384`，再大的图也按 384 封顶 |

### 上限

| | |
|---|---|
| 上下文窗口 | 262,144 token，**按总预算算**——输入加输出的总和，不是单给输出的额度 |
| JSON 输出 | 只支持 `response_format: {"type": "json_object"}` |
| 开启思考 | 只能用 `reasoning_effort`（或等价的 `reasoning.effort`）|

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
