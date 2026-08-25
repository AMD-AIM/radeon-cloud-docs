---
title: 列出模型
description: 查看免费共享端点提供哪些模型。
sidebar:
  order: 3
---

返回 **Public Free Model APIs** 的模型目录，以及每个条目的价格和能力元信息。独占端点只服务你启动它时指定的那个模型，这条路径由 vLLM 或 SGLang 自己应答——见[独占端点](/radeon-cloud-docs/zh-cn/api/dedicated-endpoints/)。

<div class="rc-endpoint">
  <span class="rc-method" data-m="GET">GET</span>
  <span class="rc-path">/v1/models</span>
  <span class="rc-auth">Bearer 密钥或会话</span>
</div>

也可以通过 `/api/v1/models` 访问。

## 请求

无参数。

```bash
curl https://developer.amd.com.cn/radeon/api/v1/models \
  -H "Authorization: Bearer $RADEON_API_KEY"
```

## 响应

外层就是一个裸的 `{ "data": [...] }`，没有 `object` 字段。条目带的元信息比 OpenAI 的 model 对象丰富，但**没有** `owned_by`，也**没有** `created`。

```json
{
  "data": [
    {
      "id": "DeepSeek-V4-Flash",
      "name": "DeepSeek-V4-Flash",
      "aliases": [],
      "description": "Radeon DeepSeek V4 Flash served by the AMD GPU Cloud",
      "family": "deepseek",
      "architecture": {
        "input_modalities": ["text"],
        "output_modalities": ["text"],
        "tokenizer": "GPT"
      },
      "top_provider": { "is_moderated": true },
      "providers": [
        {
          "providerId": "radeon-deepseek",
          "externalId": "DeepSeek-V4-Flash",
          "pricing": {
            "prompt": "0.00000014",
            "completion": "0.00000028",
            "input_cache_read": "0.0000000028"
          },
          "streaming": true,
          "vision": false,
          "tools": true,
          "reasoning": true,
          "stability": "stable"
        }
      ],
      "pricing": {
        "prompt": "0.00000014",
        "completion": "0.00000028",
        "input_cache_read": "0.0000000028"
      },
      "context_length": 1048576,
      "supported_parameters": [
        "temperature", "max_tokens", "top_p",
        "frequency_penalty", "presence_penalty",
        "stream", "response_format", "tools"
      ],
      "json_output": true,
      "structured_outputs": true,
      "free": true,
      "stability": "stable"
    }
  ]
}
```

把这个列表里的任意 `id` 用作[聊天补全](/radeon-cloud-docs/zh-cn/api/chat-completions/)的 `model` 字段。

## 字段

| 字段 | 说明 |
|---|---|
| `id` | 作为 `model` 发送的名字。 |
| `name`、`description`、`family`、`aliases` | 展示用的元信息。 |
| `architecture` | 输入输出模态，以及 tokenizer 家族。 |
| `providers` | 提供这个模型的后端，每个都带自己的价格和能力标志。 |
| `pricing` | 每 token 的美元价，字符串形式的小数——`prompt`、`completion`，支持前缀缓存的还有 `input_cache_read`。 |
| `context_length` | 上下文窗口上限，单位 token。 |
| `supported_parameters` | 这个模型接受的请求参数。完整 schema 见[聊天补全](/radeon-cloud-docs/zh-cn/api/chat-completions/)。 |
| `json_output`、`structured_outputs` | 是否认 `response_format`。 |
| `free` | 调用是否按零成本计入你的每日额度。 |
| `stability` | `stable`、`beta`、`unstable` 或 `experimental`。 |

:::caution[这不是 OpenAI 的 model 对象]
指望 `data[].object == "model"` 或者读 `owned_by` 的客户端会找不到这些字段。
Model API 其他地方都跟着 OpenAI 的 schema 走，唯独这个端点不是。
:::

## 说明

模型目录是会变的。模型会陆续上架和下架，所以运行时去解析列表，别把名字写死，也要处理昨天还能用的模型今天没了的情况。

目录对所有密钥都一样——它不按账户区分。

这个端点不占用你的并发额度，但每分钟限流仍然适用。调它很便宜，不过还是把结果缓存几分钟，别每次补全前都调一遍。

[Token Factory](https://developer.amd.com.cn/radeon/modelapis) 里每个模型卡片上渲染的就是这同一份元信息。
