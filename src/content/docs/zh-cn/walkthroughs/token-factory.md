---
title: "操作演示：Token Factory（API）"
description: "获取 API Key 和 Base URL，选择模型，完成第一次调用。"
---

**什么时候用：**想在自己的代码里调用托管模型，不需要启动实例。

![操作演示动图：Token Factory](/radeon-cloud-docs/walkthroughs/zh/token-factory.gif)

## 步骤

1. 打开 **Token Factory**，页面顶部就是你的 API Key 和 Base URL。
2. API Key 要保密：用 **Copy** 复制，泄露后到设置里重新生成。
3. 选一个模型，卡片里有可以直接运行的示例（OpenAI 或 Anthropic 格式）。
4. model 要填完全一致的模型 ID，`GET /v1/models` 可以查到。
5. 在自己的代码里用 Key 和 Base URL 调用。部分模型会先思考，`max_tokens` 要留够。
6. 用 `GET /v1/usage` 查看限额：每分钟请求数、每日额度和重置时间。

## 常见遗漏

- 部分模型会返回 `reasoning` 字段、先思考再回答；`max_tokens` 太小时 `content` 可能为空。
- 有每分钟和每日限额；每日额度用完后会返回 HTTP 429（Daily usage limit exceeded），直到 `/v1/usage` 显示的重置时间。
- API Key 等同于密码；泄露后到设置里重新生成，旧 Key 会在约一分钟内失效。

> 中国站：Base URL 以中国站 Token Factory 页面顶部显示的为准。

更多说明：[Token Factory](/radeon-cloud-docs/zh-cn/guides/token-factory/)
