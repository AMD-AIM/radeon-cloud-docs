---
title: 错误
description: AMD Radeon Cloud API 返回的状态码，以及各自该怎么处理。
sidebar:
  order: 12
---

## 状态码

| 代码 | 含义 | 怎么办 |
|---|---|---|
| `400` | 请求被拒。参数无效、已有实例在跑，或额度不够。 | 读 `detail` 并修正请求。重试没用。 |
| `401` | 凭据缺失、格式不对，或不认识。 | 检查 `Authorization` 头。如果密钥可能已被吊销，就轮换一个。 |
| `403` | 通过了认证，但没有权限。 | 见下文——原因不止一种。 |
| `404` | 没有这个模板或实例，或者请求了一条不提供的 Model API 路径。 | 确认标识符。目录里没有的模型名是 `400`，不是 `404`。 |
| `409` | 状态冲突，比如需要先完成邮箱验证。 | 按响应体里的 `code` 处理。 |
| `429` | 触发限流。 | 等 `Retry-After`，然后退避。见[限流](/radeon-cloud-docs/zh-cn/api/rate-limits/)。 |
| `502` | 上游模型网关或服务后端不可达。 | 临时性问题。退避后重试。 |
| `503` | 容量暂时耗尽，或功能被禁用。 | 按 `Retry-After` 给的间隔重试。 |

## 错误体

Platform API 的错误用 FastAPI 的形状：

```json
{ "detail": "Each user can only have one active instance" }
```

Public Free Model API 的错误来自两个地方，形状不一样。

**网关**抛的错——密钥无效、模型不存在、网关侧限流——用 OpenAI 的形状，现成的 OpenAI 错误处理代码不用改就能用：

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

在 `/v1/messages` 和 `/v1/messages/count_tokens` 上，同样的错误改用 Anthropic 的信封，Anthropic SDK 可以直接解析：

```json
{
  "type": "error",
  "error": {
    "type": "authentication_error",
    "message": "Unauthorized: No API key provided."
  }
}
```

网关前面的**平台**抛的错——凭据被拒、准入控制、网关不可达——跟其他 Platform API 错误一样包在 `detail` 里：

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

:::caution[读 `error` 之前先拆 `detail`]
OpenAI SDK 去顶层读 `error.type`，平台抛的错它找不到。两种都处理一下：有 `body.error` 就读它，
否则读 `body.detail.error`，再否则把 `body.detail` 当成错误消息。HTTP 状态码和 `Retry-After`
在任何情况下都是可靠的。
:::

目录里没有的模型名由网关直接拒掉，返回 `400` 和 `Requested model <名字> not supported`，请求根本到不了后端。模型自己抛的错，比如 prompt 超过上下文上限，会带着服务后端自己的状态码和消息透传出来。

**Dedicated Model API** 的错误上面一条都不算。那条路上没有网关，代理放行之后你拿到的就是 vLLM 或 SGLang 原样吐出来的东西。代理回 `403` 说明密钥、实例或端口对不上；`503` 说明实例还在启动。其余都是你自己那台服务器在说话。

## 常见情形

**`400 Each user can only have one active instance`**——先销毁当前实例。[`DELETE /api/notebook/current`](/radeon-cloud-docs/zh-cn/api/instances/#销毁实例)。

**`400 Insufficient credits`**——你的余额低于请求的 GPU 数量。兑换优惠码，或者少要几张卡。

**`400 GPU count must be 1, 2, or 4`**——别的值分配不出来。

**`400 Invalid image selected`**——镜像不在目录里，或者已被禁用。用 [`GET /api/profile/templates`](/radeon-cloud-docs/zh-cn/api/templates/#列出模板) 列出可用镜像。

**`403 {"code": "account_not_verified"}`**——账户还在审核中。响应体里带一个指向审核页面的 `redirect`。等待期间免费的 Model API 照常可用。

**`403 You do not have access to this instance`**——实例是别人的，或者你在用 Bearer 密钥访问实例代理，而它要求浏览器会话。见[认证](/radeon-cloud-docs/zh-cn/api/authentication/#每个端点接受什么)。

**`502 Model gateway is unavailable`**——网关挂了或者连不上。退避后重试；如果持续好几分钟，那是一次故障，不是你这边的问题。

**`503 Model gateway connection pool exhausted`**——全平台在飞的请求太多。`Retry-After` 很短，通常 5 秒。

## 排查清单

确认你调的基础 URL 对——共享端点和独占端点是不同的主机和路径，而且独占 URL 每次重新启动都会变。

确认密钥确实发出去了，而且是以 `Authorization: Bearer rc-...` 的形式。漏掉这个头和密钥无效都会得到 `401`。

用独占端点的话，确认实例已经 `ready` 且模型加载完了。vLLM 在权重加载完之前就会响应端口，所以早期的请求会失败，报出来的后端错误看着像平台问题。

如果一个昨天还能用的调用今天报 `400 Requested model ... not supported`，多半是共享目录变了。用 [`GET /v1/models`](/radeon-cloud-docs/zh-cn/api/models/) 重新解析。
