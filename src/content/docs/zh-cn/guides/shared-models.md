---
title: 调用共享模型
description: 在 Token Factory 获取 API Key，用 curl 或 OpenAI SDK 调用免费的共享模型。
---

共享模型免费，随时可用，只需要你的 API Key。

## 获取 API Key

1. 登录控制台，打开 **Token Factory**。
2. 顶部的 **您的 API 密钥** 卡片显示 **接口地址** 和 **API 密钥**。密钥默认隐藏，点 **显示密钥** 查看，或点 **复制** 直接复制。

API Key 以 `rc-` 开头，一个 Key 可以调用所有共享模型。请妥善保管：拿到 Key 的人可以用掉你的每日用量。轮换 Key 的方法见[认证](/radeon-cloud-docs/zh-cn/api/authentication/)。

## 选择模型

**Token Factory** 列出了所有共享模型，可以按 **用途**、**推理提供方** 或 **发布方** 筛选，也可以按名称搜索。每张卡片会显示模型当前是否繁忙。

点开卡片，可以看到模型说明、价格和调用方式，`model` 字段要填的值也写在里面。每个模型支持的输入和输出，见[模型目录](/radeon-cloud-docs/zh-cn/models/overview/)。

## 发送请求

```bash
export RADEON_API_KEY=rc-...

curl https://developer.amd.com.cn/radeon/api/v1/chat/completions \
  -H "Authorization: Bearer $RADEON_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model":"DeepSeek-V4-Flash","messages":[{"role":"user","content":"你好"}]}'
```

在 Python 里，把 OpenAI SDK 指向同一个 base URL：

```python
from openai import OpenAI

client = OpenAI(base_url="https://developer.amd.com.cn/radeon/api/v1", api_key="rc-...")
response = client.chat.completions.create(
    model="DeepSeek-V4-Flash",
    messages=[{"role": "user", "content": "你好"}],
)
print(response.choices[0].message.content)
```

换模型只需要改 `model`。列出你的 Key 能调用的模型：

```bash
curl https://developer.amd.com.cn/radeon/api/v1/models \
  -H "Authorization: Bearer $RADEON_API_KEY"
```

共享模型也支持 Anthropic Messages API，可以接入 Claude Code 这类客户端，见 [Messages](/radeon-cloud-docs/zh-cn/api/messages/)。

## 用量限制

共享模型免费，但有用量上限：

- 每分钟请求数和并发请求数按账号和 API Key 限制。
- 每日用量上限在北京时间 0 点（UTC+8）重置。

触发限制时，请求返回 `429`，并带 `Retry-After` 头。每个响应的响应头里都有剩余额度。见[限流](/radeon-cloud-docs/zh-cn/api/rate-limits/)和[用量和配额](/radeon-cloud-docs/zh-cn/api/usage/)。

如果经常触发限制，可以改用[专属模型 API](/radeon-cloud-docs/zh-cn/guides/dedicated-models/)。

## 使用条款

共享模型是免费的试用和开发服务，不适用于生产环境，禁止转售。见 [API 使用条款](/radeon-cloud-docs/zh-cn/api/terms/)。
