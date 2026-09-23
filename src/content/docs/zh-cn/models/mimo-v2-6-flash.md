---
title: MiMo-V2.6-Flash
description: 小米的全模态稀疏 MoE 模型 —— 这里唯一接受音频输入的端点，也是唯一滑动窗口只有 128 token 的模型。
sidebar:
  order: 8
---

<div class="rc-endpoint">
  <span class="rc-method" data-m="POST">POST</span>
  <span class="rc-path">/v1/chat/completions</span>
  <span class="rc-auth">model: <code>MiMo-V2.6-Flash</code></span>
</div>

## 关于这个模型

这里提供的权重是 **MiMo-V2.6-Flash**，小米 MiMo-V2.6 系列里侧重效率的那一档 ——
一个稀疏 MoE 模型，在同一个端点上接受文本、图像、视频和音频，并且默认先思考再回答。

### 架构

取自随权重发布的 `config.json`：

| | |
|---|---|
| 架构 | `MiMoV2ForCausalLM`，`model_type = mimo_v2` |
| 参数量 | 总计 309B，每 token **激活 15B** |
| 层数 | 48 —— **39 层滑动窗口 + 9 层全局**；第一个 block 是全局注意力配稠密 FFN，其余 47 层是 MoE |
| 隐藏维度 | 4,096 |
| 注意力 | 64 个 query 头；全局层 4 个 KV 头，滑窗层 8 个 |
| 头维度 | **Q/K 为 192，V 为 128** —— 非对称 |
| 滑动窗口 | **128 token** |
| 专家混合 | 256 个路由专家，每 token **激活 8 个**，专家中间维度 2,048，**无共享专家** |
| 多 token 预测 | `config.json` 声明 3 层；随权重发布的 `dflash/` 草稿模型是 5 层 |
| 词表 | 152,576 |
| 原生上下文 | 1,048,576 |
| 量化 | `quant_method: fp8` `e4m3`，块 `[128, 128]`，**以 MXFP4 存储**（`store_dtype: mxfp4`，块 32） |
| 许可证 | MIT |

视觉塔是 681M 参数的 MiMo ViT（28 层，24 层滑窗 + 4 层全局，patch 16，空间合并 2×2）。
音频走 308M 的 AudioTokenizer 加 127M 的 patch 编码器。

:::note[128 token 的滑动窗口是长上下文可行的前提]
只有 **9 层全局层**保留完整 KV 缓存，其余 39 层各自只留 128 个 token。
因此绝大部分层的缓存并不随提示词增长，这才使得这种规模的模型能有这么宽的窗口。
:::

## 这个端点的行为

### 概览

| | |
|---|---|
| 上下文长度 | 1,048,576 token |
| 输入模态 | **文本、图像、音频** |
| 流式 | ✅ |
| 工具调用 | ✅ |
| JSON 输出 | ✅ `json_object` **和** `json_schema` |
| 思考 | ✅ —— **默认开启，需要显式关闭** |
| 推理引擎 | SGLang |
| 稳定性 | `experimental` |

这是本 API 上唯一接受**音频**的模型，也是唯一接受**严格 `json_schema`**（而不只是 `json_object`）的模型。

### `messages`

`system` 消息可以出现在任意位置，也可以有多条。

:::note[这里接受 `developer` 角色]
与 [GLM-5.3-Flash](/radeon-cloud-docs/zh-cn/models/glm-5-3-flash/) 不同（那个会在反序列化阶段直接拒掉），
本端点接受 `role: "developer"` 并正常作答。不需要把较新 OpenAI SDK 的输出改回 `system`。
:::

### 思考

思考**默认开启**。完全不传 `reasoning_effort`，响应里依然带有内容的 `reasoning`：

```json
"message": {
  "role": "assistant",
  "content": "4",
  "reasoning": "2+2 is 4."
}
```

要关掉，传 `reasoning_effort: "none"`，此时 `reasoning` 返回空。

:::caution[这里的 `reasoning_tokens` 恒为 `0`，不要拿它做判断]
字段存在，但从来不填。一道产生了几百字符 `reasoning` 的推理题，`reasoning_tokens` 依然是 `0`，
整个开销都并到了 `usage.completion_tokens` 里。思考是计费的，只是不单列。
要判断模型是否思考过，看 `reasoning` 是否非空，不要读这个计数器。
:::

:::caution[预算要算上思考，不只是答案]
在推荐采样参数下思考长度波动很大。同一个图像问题，一次只用了 62 个字符的 `reasoning`，
下一次把 2,000 token 的预算全部耗尽，导致 `content` 为空、`finish_reason: "length"`。
看到 `content` 为空时，先调大 `max_tokens`，再判断是否真的失败。
:::

### 图像输入

图像通过 `image_url` 部件传入，支持 base64 data URL：

```json
{
  "role": "user",
  "content": [
    { "type": "image_url", "image_url": { "url": "data:image/png;base64,..." } },
    { "type": "text", "text": "图中有几个蓝色圆形？" }
  ]
}
```

`usage.prompt_tokens_details.image_tokens` 会报告图像的消耗 ——
一张 1200×420 的 PNG 计为 494 个 image token。

### 音频输入

音频使用 OpenAI 的 `input_audio` 部件：

```json
{
  "role": "user",
  "content": [
    { "type": "input_audio", "input_audio": { "data": "<base64>", "format": "wav" } },
    { "type": "text", "text": "这是什么声音？" }
  ]
}
```

音频前端会重采样到 24 kHz。本 API 上没有其它模型接受这个部件类型。

### 结构化输出

两种形式都可用：

| `response_format` | 结果 |
|---|---|
| `{"type": "json_object"}` | ✅ `{"北京": 2174, "上海": 2487}` |
| `{"type": "json_schema", "json_schema": {..., "strict": true}}` | ✅ `{"city":"北京","pop":2174}` |

### 限制

| | |
|---|---|
| 上下文窗口 | 1,048,576 token，按**总预算**计 —— 提示词加输出 |
| 输入 | 文本、图像、音频 |
| JSON 输出 | `json_object` 与严格 `json_schema` |
| 思考档位 | `reasoning_effort` —— 传 `none` 关闭；其它档位会被接受，但本模型没有像 DeepSeek 系列那样按档位标定 |

:::caution[1M 的窗口不等于你会想用的 1M]
上下文长度是真实的 —— 524,288 token 的提示词能被接受并正常作答。
但首 token 时间随提示词变长而上升，到这个长度足以触发客户端的默认超时。
超过约 128K 的部分应当视为兜底能力，而非常规工作点；真要用，先把客户端超时调大。
:::

### 示例

```bash
curl https://developer.amd.com.cn/radeon/api/v1/chat/completions \
  -H "Authorization: Bearer $RADEON_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "MiMo-V2.6-Flash",
    "messages": [
      { "role": "user", "content": "天空为什么是蓝色的？" }
    ]
  }'
```

加上 `"reasoning_effort": "none"` 即可只要答案、不要思考过程。
