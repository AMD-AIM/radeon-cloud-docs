---
title: DeepSeek-V4-Flash-Vision-Exp
description: DeepSeek-V4-Flash 的视觉实验版——多了一座视觉塔，其余行为与文本版一致。
sidebar:
  order: 3
---

<div class="rc-endpoint">
  <span class="rc-method" data-m="POST">POST</span>
  <span class="rc-path">/v1/chat/completions</span>
  <span class="rc-auth">model: <code>DeepSeek-V4-Flash-Vision-Exp</code></span>
</div>

## 这是什么

在 [DeepSeek-V4-Flash](/radeon-cloud-docs/zh-cn/models/deepseek-v4-flash/) 的权重上接了一座视觉塔，
名字里的 `Exp` 就是 experimental。**它是本端点上唯一既有 100 万上下文、又能读图的模型。**

语言侧的架构与文本版同源，逐字段核对过；下面这张表取自本端点实际加载的那份权重的 `config.json`。

| | |
|---|---|
| 架构 | `DeepseekV4ForCausalLM`，`model_type = deepseek_v4` |
| 层数 | 43 |
| 隐藏维度 | 4,096 |
| 注意力 | 64 个 Q 头、**1 个 KV 头**，头维度 512（MLA）|
| 专家混合 | 256 个路由专家 + 1 个共享，每 token 激活 6 个，专家中间维度 2,048 |
| 稀疏索引 | 带 `index_n_heads` / `index_topk` 的 DSA 索引器 |
| 滑动窗口 | 128 |
| 词表 | 129,280 |
| 原生上下文 | 1,048,576 |
| 量化 | FP8 `e4m3`，块大小 `[128, 128]`，激活动态缩放，scale 格式 `ue8m0` |

视觉塔（同一份 `config.json`，是平铺的 `vision_*` 键，不是嵌套的 `vision_config`）：

| | |
|---|---|
| 层数 / 维度 / 头数 | 32 层，1,024 维，16 头 |
| patch 大小 | 14 |
| 中间维度 | 2,816 |
| 下采样比 | 3 |
| **单图 token 上限** | **384** |
| 最小像素数 | 147,456 |
| 最大宽高比 | 8 |

`vision_max_n_token = 384` 是个硬上限：再大的图也会被压到 384 个 token，所以超高分辨率的图不会
线性地更贵，但细节也不会更多。

## 本端点上的行为

### 概览

| | |
|---|---|
| 上下文长度 | 1,048,576 token |
| 输入模态 | 文本 + 图像 |
| 流式 | ✅ |
| 工具调用 | ✅ |
| JSON 输出 | ✅ `json_object` |
| 思考 | ✅ —— **默认不思考**，要显式打开 |
| 稳定性 | `experimental` |

### 图像输入

| | |
|---|---|
| 传法 | `content` 数组里放 `{"type":"image_url","image_url":{"url":"data:image/png;base64,..."}}` |
| 计量 | `usage.prompt_tokens_details.image_tokens` |
| 单图上限 | 384 token（见上）|

```bash
curl https://developer.amd.com.cn/radeon/api/v1/chat/completions \
  -H "Authorization: Bearer $RADEON_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "DeepSeek-V4-Flash-Vision-Exp",
    "messages": [{
      "role": "user",
      "content": [
        { "type": "image_url", "image_url": { "url": "data:image/png;base64,iVBORw0KGgo..." } },
        { "type": "text", "text": "这张图里写了什么？" }
      ]
    }]
  }'
```

### `messages`

和文本版一样宽松：`system` 消息放在哪个位置都行、可以放多条，角色名写 `system` 或 `developer`
都接受。

这一点和 [Qwen3.8-Flash-Next](/radeon-cloud-docs/zh-cn/models/qwen3-8-flash-next/) 不同，
后者只接受“单个且在首位”的 `system`。要写一套代码同时打两个模型，就按后者的规矩写。

### 思考

**默认不思考。** 不传 `reasoning_effort` 时 `reasoning_tokens` 为 0，要思考就得显式传。

`reasoning_effort` 的七个取值**全部接受**（`none`、`minimal`、`low`、`medium`、`high`、`xhigh`、`max`，
外加不传），是本端点上取值最宽容的模型。

| | |
|---|---|
| 思考文本 | `choices[0].message.reasoning` |
| token 数 | `usage.completion_tokens_details.reasoning_tokens` |
| 顶层别名 | `usage.reasoning_tokens` —— 本模型**有**这个字段 |

### 上限

| | |
|---|---|
| 上下文窗口 | 1,048,576 token，**按 prompt + 输出 的总和算** |
| JSON 输出 | 只支持 `response_format: {"type": "json_object"}` |
| 开启思考 | 只能用 `reasoning_effort`（或等价的 `reasoning.effort`）|
