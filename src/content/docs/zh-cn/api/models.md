---
title: 列出模型
description: 查看 Token Factory 提供哪些模型。
sidebar:
  order: 3
---

返回 **Token Factory** 的模型列表，以及每个条目的价格和能力元信息。实例上的模型服务只提供你启动时指定的那个模型，这个路径由 vLLM 自己响应，见[模型服务接口](/radeon-cloud-docs/zh-cn/api/model-services/)。

<div class="rc-endpoint">
  <span class="rc-method" data-m="GET">GET</span>
  <span class="rc-path">/v1/models</span>
  <span class="rc-auth">API Key 或会话</span>
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
| `pricing` | 每 token 的价格，字符串形式的小数：`prompt`、`completion`，支持前缀缓存的模型还有 `input_cache_read`。按 Token Factory 的 pts 计入每日额度，不会产生费用，见[用量和配额](/radeon-cloud-docs/zh-cn/api/usage/)。 |
| `context_length` | 上下文窗口上限，单位 token。 |
| `supported_parameters` | 这个模型接受的请求参数。完整 schema 见[聊天补全](/radeon-cloud-docs/zh-cn/api/chat-completions/)。 |
| `json_output`、`structured_outputs` | 是否认 `response_format`。 |
| `free` | 调用是否按零成本计入你的每日配额。 |
| `stability` | `stable`、`beta`、`unstable` 或 `experimental`。 |

:::caution[这不是 OpenAI 的 model 对象]
指望 `data[].object == "model"` 或者读 `owned_by` 的客户端会找不到这些字段。
Token Factory 的其他接口都遵循 OpenAI 的 schema，唯独这个接口不是。
:::

## 说明

模型目录是会变的。模型会陆续上架和下架，所以运行时去解析列表，别把名字写死，也要处理昨天还能用的模型今天没了的情况。

模型列表对所有 API Key 都一样，不按账号区分。

这个端点不占用你的并发配额，但每分钟限流仍然适用。调它很便宜，不过还是把结果缓存几分钟，别每次补全前都调一遍。

[Token Factory](https://developer.amd.com.cn/radeon/tokenfactory) 里每个模型卡片上渲染的就是这同一份元信息。
