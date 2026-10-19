---
title: 错误
description: AMD Radeon Cloud API 返回的状态码，以及每种情况怎么处理。
sidebar:
  order: 12
---

## 状态码

| 状态码 | 含义 | 处理方法 |
|---|---|---|
| `400` | 请求被拒绝：参数无效、已经有实例，或积分不够。 | 查看 `detail` 并修正请求，重试没有用。 |
| `401` | 凭证缺失、格式错误或无法识别。 | 检查 `Authorization` 请求头。如果 API Key 可能已失效，重新生成一个。 |
| `403` | 已通过认证，但没有权限。 | 原因有多种，见下文。 |
| `404` | 模板或实例不存在，或者请求的模型 API 路径没有模型提供。 | 确认标识符。模型名不在模型列表里时返回的是 `400`，不是 `404`。 |
| `409` | 状态冲突，例如需要先完成邮箱验证。 | 按响应体里的 `code` 处理。 |
| `429` | 触发限流。 | 等待 `Retry-After` 指定的时间，然后退避重试，见[限流](/radeon-cloud-docs/zh-cn/api/rate-limits/)。 |
| `502` | 上游模型网关或服务后端不可达。 | 通常是暂时的，退避后重试。 |
| `503` | 容量暂时不足，或功能已关闭。 | 按 `Retry-After` 给出的间隔重试。 |

## 错误响应格式

平台接口的错误采用 FastAPI 的格式：

```json
{ "detail": "Each user can only have one active instance" }
```

共享模型 API 的错误来自两个地方，格式不同。

**网关** 返回的错误（API Key 无效、模型不存在、网关侧限流）采用 OpenAI 的格式，现有的 OpenAI 错误处理代码可以直接使用：

```json
{
  "error": {
    "message": "Unauthorized: No API key provided.",
    "type": "invalid_request_error",
    "param": null,
    "code": "invalid_api_key"
  }
}
```

在 `/v1/messages` 和 `/v1/messages/count_tokens` 上，同样的错误采用 Anthropic 的格式，Anthropic SDK 可以直接解析：

```json
{
  "type": "error",
  "error": {
    "type": "authentication_error",
    "message": "Unauthorized: No API key provided."
  }
}
```

网关之前的 **平台** 返回的错误（凭证被拒、准入控制、网关不可达）和其他平台接口一样，放在 `detail` 里：

```json
{ "detail": "Invalid bearer token" }
```

```json
{
  "detail": {
    "error": {
      "message": "Model API rate limit exceeded; please retry later",
      "type": "rate_limit_error",
      "code": "token_rate_limit_exceeded"
    }
  }
}
```

:::caution[先解开 `detail`，再读取 `error`]
OpenAI SDK 只在顶层读取 `error.type`，读不到平台返回的错误。请两种都处理：有 `body.error` 就读它；没有就读 `body.detail.error`；都没有时，把 `body.detail` 当作错误信息。HTTP 状态码和 `Retry-After` 在所有情况下都可靠。
:::

模型名不在模型列表里时，网关直接返回 `400` 和 `Requested model <名称> not supported`，请求不会到达后端。模型自身产生的错误，例如 prompt 超出上下文长度，会连同后端的状态码和信息原样返回。

**专属模型 API** 的错误不属于以上任何一种。这条路径上没有网关，代理放行后，你收到的就是 vLLM 原样返回的内容。代理返回 `403` 表示 API Key、实例或端口不匹配；返回 `503` 表示实例还在启动。其他错误都来自你自己的服务。

## 常见情况

**`400 Each user can only have one active instance`**：先销毁当前实例，见 [`DELETE /api/notebook/current`](/radeon-cloud-docs/zh-cn/api/instances/#销毁实例)。

**`400 Insufficient credits`**：积分不够所选规格运行 1 小时。[兑换优惠码](/radeon-cloud-docs/zh-cn/guides/credits/#兑换优惠码)，或者换一个更小的规格。

**`400 Invalid image selected`**：镜像不在镜像目录里，或者已被停用。请从 **首页** 的 **镜像** 列表里选择。

**`401 Login required`**：这个接口需要浏览器会话，但请求里发的是 API Key。要在脚本里管理实例，请用 [Radeon Cloud CLI](/radeon-cloud-docs/zh-cn/cli/automation/)。

**`403 resource_selection_not_assigned`**：资源池或规格没有分配给你的账号。请从 **首页** 的 **规格** 和 **资源池** 里选择。

**`403 {"code": "account_not_verified"}`**：账号还在审核中。响应体里的 `redirect` 指向审核页面。

**`403 You do not have access to this instance`**：实例属于别人，或者你用 API Key 访问了只接受浏览器会话的实例代理，见[认证](/radeon-cloud-docs/zh-cn/api/authentication/#各接口接受的凭证)。

**`502 Model gateway is unavailable`**：网关故障或无法连接。退避后重试；如果持续几分钟都不恢复，说明是平台故障，不是你这边的问题。

**`503 Model gateway connection pool exhausted`**：整个平台同时处理的请求太多。`Retry-After` 很短，通常是 5 秒。

## 排查清单

确认 base URL 正确。共享模型 API 和专属模型 API 的主机和路径不同，而且重新启动后专属端点的 base URL 可能会变，请重新从实例卡片复制。

确认 API Key 确实发出去了，格式是 `Authorization: Bearer rc-...`。缺少这个请求头和 API Key 无效都会返回 `401`。

使用专属模型 API 时，确认实例已经 `ready`，模型也已加载完成。vLLM 在权重加载完之前就会监听端口，所以早期的请求可能失败，返回看起来像平台问题的后端错误。

如果昨天还能用的请求今天返回 `400 Requested model ... not supported`，多半是共享模型列表变了。请用 [`GET /v1/models`](/radeon-cloud-docs/zh-cn/api/models/) 重新查询模型名。
