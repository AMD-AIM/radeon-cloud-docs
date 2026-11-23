---
title: GLM-5.3-Flash
description: 智谱 Z.AI 的稀疏 MoE 视觉语言模型：收文本和图片，默认就思考，只有两档 reasoning_effort 起作用。
sidebar:
  order: 7
---

<div class="rc-endpoint">
  <span class="rc-method" data-m="POST">POST</span>
  <span class="rc-path">/v1/chat/completions</span>
  <span class="rc-auth">model: <code>GLM-5.3-Flash</code></span>
</div>

**GLM-5.3-Flash** 是 Z.AI 的 GLM-5.3 系列里偏速度的一款：稀疏 MoE 模型，能读文本和图片，回答前先思考。

## 规格

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
| 视觉塔 | 24 层，宽 1,024，16 个头，patch 14，空间合并 2 |
| 词表 | 154,880 |
| 原生上下文 | 1,048,576；本平台提供 262,144 |
| 量化 | FP8，`e4m3`，块 `[128, 128]`，动态激活缩放 |
| 许可证 | MIT |

## 一览

| | |
|---|---|
| 上下文长度 | 262,144 token，输入加输出 |
| 输入模态 | 文本 + 图片 |
| 流式 | ✅ |
| 工具调用 | ✅ —— `tool_choice` 可用 `auto`、`required` 或指定函数 |
| JSON 输出 | ✅ `json_object` 和 `json_schema` |
| 思考 | ✅ —— 默认开启 |
| 稳定性 | `experimental` |

## 思考

默认开启思考，没有哪个 `reasoning_effort` 值能关掉。只有 `low` 和 `high` 会改变思考量，
其他取值都和不传一样。

| 取值 | 思考 |
|---|---|
| 不传 | 完整思考（默认） |
| `high` | 较短 |
| `low` | 最短，有时只有几个 token |
| `none` `minimal` `medium` `xhigh` `max` | 可以传，效果同不传 |

`reasoning.effort` 与 `reasoning_effort` 等价。

思考内容在 `choices[0].message.reasoning`（流式时在 `choices[0].delta.reasoning`），
思考 token 数在 `usage.completion_tokens_details.reasoning_tokens`。

思考和回答共用 `max_tokens` 预算，并按输出计费。如果 `content` 为空、`finish_reason` 是
`"length"`，请调大 `max_tokens` 或传 `reasoning_effort: "low"`。

## `messages`

`system` 消息可以放在任意位置，也可以有多条。

角色名请写 `system`。`developer` 消息不会报错，但模型不会遵循它。

## 图像输入

在 `content` 里放一个或多个 `image_url` 内容块。`data:` URL 和公网可访问的 `https://` URL
都可以；支持 PNG、JPEG、WebP。

```json
{
  "model": "GLM-5.3-Flash",
  "messages": [{
    "role": "user",
    "content": [
      { "type": "image_url", "image_url": { "url": "data:image/png;base64,iVBORw0KGgo..." } },
      { "type": "text", "text": "图里写了什么？" }
    ]
  }]
}
```

- 图片按输入 token 计费，用量报在 `usage.prompt_tokens_details.image_tokens`。一张 900×240 的图
  约 300 token；大图会先缩小，每张最多约 8,000 token。
- 取不到或无法解码的图片返回 400。
- 不支持视频输入。

## 限制

| | |
|---|---|
| 上下文窗口 | 262,144 token，输入加输出；输入加 `max_tokens` 超过它的请求返回 400 |
| 图片 | 每张最多约 8,000 token |
| JSON 输出 | `response_format` 类型为 `json_object` 或 `json_schema` |
| 思考档位 | `low` 和 `high`；其他取值同不传 |

## 示例

```bash
curl https://developer.amd.com.cn/radeon/api/v1/chat/completions \
  -H "Authorization: Bearer $RADEON_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "GLM-5.3-Flash",
    "reasoning_effort": "low",
    "max_tokens": 1024,
    "messages": [
      { "role": "system", "content": "用一句话回答。" },
      { "role": "user", "content": "天为什么是蓝的？" }
    ]
  }'
```
