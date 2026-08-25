---
title: 列出模型
description: 查看你的密钥能调用哪些模型。
sidebar:
  order: 3
---

按 OpenAI 的格式返回你的密钥可用的模型。

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

```json
{
  "object": "list",
  "data": [
    {
      "id": "Qwen3.6-35B-A3B",
      "object": "model",
      "created": 1756108800,
      "owned_by": "radeon-cloud"
    },
    {
      "id": "DeepSeek-V4-Flash",
      "object": "model",
      "created": 1756108800,
      "owned_by": "radeon-cloud"
    }
  ]
}
```

把这个列表里的任意 `id` 用作[聊天补全](/radeon-cloud-docs/zh-cn/api/chat-completions/)的 `model` 字段。

## 说明

模型目录是会变的。模型会陆续上架和下架，所以运行时去解析列表，别把名字写死，也要处理昨天还能用的模型今天没了的情况。

这个端点不占用你的并发额度，但每分钟限流仍然适用。调它很便宜，不过还是把结果缓存几分钟，别每次补全前都调一遍。

更详细的元信息——价格、上下文长度、支持的参数、可用状态——在 [Token Factory](https://developer.amd.com.cn/radeon/modelapis) 里每个模型的卡片上。
