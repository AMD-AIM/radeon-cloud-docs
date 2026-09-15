---
title: DeepSeek-V4.1-Flash
description: DeepSeek 百万上下文视觉模型——上下文、思考档位、图片输入与消息规则。
sidebar:
  order: 4
---

<div class="rc-endpoint">
  <span class="rc-method" data-m="POST">POST</span>
  <span class="rc-path">/v1/chat/completions</span>
  <span class="rc-auth">model: <code>DeepSeek-V4.1-Flash</code></span>
</div>

## 规格

| | |
|---|---|
| 架构 | `DeepseekV41ForCausalLM`，`model_type = deepseek_v41` |
| 层数 | 40 |
| 隐藏维度 | 5,120 |
| 注意力 | MLA——64 个 Q 头、1 个 KV 头，头维度 512，RoPE 维度 64 |
| 混合专家 | 384 路由专家 + 1 共享，每 token 激活 6 个，专家中间维度 2,304 |
| 稀疏注意力索引器 | 32 头，头维度 128，取 top-512 token |
| Engram | 1,600 万条 n-gram（压缩到 99,092），8 头，最大 n-gram 4 |
| 多 token 预测 | 3 层 |
| 词表 | 129,280 |
| 视觉塔 | 32 层，宽度 1,024，16 头，patch 14，`max_image_tokens = 1024` |
| 量化 | FP8 权重，块 `[32, 32]`，`ue8m0` 缩放；专家用 FP4 |

## 概览

| | |
|---|---|
| 上下文长度 | 1,048,576 token |
| 输入模态 | 文本 + 图片 |
| 流式 | ✅ |
| 工具调用 | ✅ |
| JSON 输出 | ✅ `json_object` |
| 思考 | ✅——默认关闭 |
| 推理引擎 | SGLang |
| 稳定性 | `experimental` |

## 思考

不传 `reasoning_effort` 时直接作答，不走思考。

所有档位都接受：`none`、`minimal`、`low`、`medium`、`high`、`xhigh`、`max`。

思考文本在 `choices[0].message.reasoning`，token 数在
`usage.completion_tokens_details.reasoning_tokens`。

## `messages`

`system` 消息位置任意，也可以有多条。角色名写 `system` 或 `developer` 都接受。

## 图片输入

在 `content` 里放 `image_url` 内容块：

```json
{
  "model": "DeepSeek-V4.1-Flash",
  "messages": [{
    "role": "user",
    "content": [
      { "type": "image_url", "image_url": { "url": "data:image/png;base64,iVBORw0KGgo..." } },
      { "type": "text", "text": "这张图里写了什么？" }
    ]
  }]
}
```

图片用量报在 `usage.prompt_tokens_details.image_tokens`。单张图上限 1,024 token。

## 限制

| | |
|---|---|
| 上下文窗口 | 1,048,576 token，prompt 与输出合并计算 |
| JSON 输出 | `response_format: {"type": "json_object"}` |
| 思考档位 | `none` `minimal` `low` `medium` `high` `xhigh` `max` |

超出窗口返回：

```
Requested token count exceeds the model's maximum context length of 1048576 tokens.
```

## 示例

```bash
curl https://developer.amd.com.cn/radeon/api/v1/chat/completions \
  -H "Authorization: Bearer $RADEON_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "DeepSeek-V4.1-Flash",
    "reasoning_effort": "medium",
    "messages": [
      { "role": "user", "content": "天为什么是蓝的？" }
    ]
  }'
```
