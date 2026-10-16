---
title: d3-flash
description: vLLM Semantic Router 的 9B 决策模型——d3 的更快版本，API 相同。
sidebar:
  order: 16
---

<div class="rc-endpoint">
  <span class="rc-method" data-m="POST">POST</span>
  <span class="rc-path">/v1/systemone</span>
  <span class="rc-auth">model: <code>d3-flash</code></span>
</div>

:::caution[这个模型不在 `/v1/chat/completions` 上]
d3-flash 不写文字：它回答带类型的问题，并给出每个选项的概率。
`messages`、`max_tokens`、`temperature`、`stream` 都不适用。
:::

d3-flash 是 [vLLM Semantic Router](https://huggingface.co/vllm-sr) 的决策模型系列 Decision 3.0
中的 9B 模型，基于 Qwen3.5-9B。它接受的请求、返回的响应都和 [d3](/radeon-cloud-docs/zh-cn/models/d3/)
相同，在本部署上快约七倍，准确率略低。请求字段、问题类型、响应和错误请看 d3 页面，这里只列出差异。

## 概览

| | |
|---|---|
| 端点 | `POST /v1/systemone` |
| 输入 | `state`（文本或任意 JSON），可选图片和视频 |
| 输出 | 每个问题一个答案，附每个选项的概率 |
| 问题类型 | `choice`、`noul`、`score` |
| 输入上限 | 每个问题 32,768 token；超长请求会被拒绝，不会截断 |
| 延迟 | 三个问题的文本请求逐个发送约 0.1 秒 |
| 流式 | ❌ |
| 计费 | 按输入 token，对应 `usage.input_tokens`；`output_tokens` 恒为 `0` |
| 稳定性 | `experimental` |
| 许可证 | Apache-2.0 |

## 示例

```bash
curl https://developer.amd.com.cn/radeon/api/v1/systemone \
  -H "Authorization: Bearer $RADEON_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "d3-flash",
    "state": "Write a Python function that merges two sorted lists.",
    "questions": {
      "kind": {"type": "choice", "instructions": "What kind of work is this?",
               "criteria": {"code": "Writing or fixing code", "math": "Mathematics", "chat": "Anything else"}},
      "reasoning": {"type": "noul", "instructions": "Does answering this need multi-step reasoning?"}
    }
  }'
```

:::tip[d3 和 d3-flash 怎么选]
路由、过滤这类调用量大的判断先用 d3-flash。答案接近五五开的问题再换成
[d3](/radeon-cloud-docs/zh-cn/models/d3/)：两者在这类问题上可能给出不同结论，比如上例的
`reasoning`（d3-flash 的 `noul` 为 0.41，d3 为 0.58）。
:::
