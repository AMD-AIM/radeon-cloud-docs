---
title: 限流
description: Token Factory 调用和实例启动有哪些限制，以及触发后怎么处理。
sidebar:
  order: 11
---

限流是为了让共享资源保持可用，所以几乎都作用在 Token Factory 上。下面四组限制各自独立生效。

## Token Factory

每个请求要依次通过两层检查：平台先决定是否放行，网关再按账号计量。

### 平台准入

| 限制 | 范围 | 典型值 |
|---|---|---|
| 每分钟请求数 | 每个 API Key | 30 |
| 每分钟请求数 | 每个 IP 地址 | 120，仅在部署的边缘节点能提供可信的客户端地址时生效 |
| 并发请求数 | 每个 API Key | 8 |
| 并发请求数 | 每个模型 | 取决于该模型后端能承受的并发 |
| 并发请求数 | 每个服务进程 | 共享池 |
| 并发请求数 | 全平台 | 共享池 |

### 网关计量

| 限制 | 范围 | 典型值 |
|---|---|---|
| 每分钟请求数 | 每个账号 | 20，60 秒滑动窗口 |
| 每日用量上限 | 每个账号 | 以 Token Factory 的 pts 计量，按北京时间的自然日累计，每天 00:00（UTC+8）重置 |

聊天、语音合成（`/v1/audio/speech`）和决策（`/v1/systemone`）请求共用同一个每分钟窗口和同一个每日用量上限。

:::tip[每次响应都带有当前额度]
每次成功调用都会在响应头里带上当前计数，一般不需要另外查询：

| 响应头 | 含义 |
|---|---|
| `X-RateLimit-Limit-User-RPM` | 账号每分钟允许的请求数。 |
| `X-RateLimit-Remaining-User-RPM` | 当前这一分钟还剩多少次。 |
| `X-RateLimit-Reset` | 每分钟窗口重置的 Unix 时间。 |
| `X-RateLimit-Limit-User-Daily-USD` | 当前周期的每日用量上限。 |
| `X-RateLimit-Used-User-Daily-USD` | 本周期已经用掉的。 |
| `X-RateLimit-Remaining-User-Daily-USD` | 请求被拒绝之前还剩多少。 |
| `X-RateLimit-Reset-User-Daily-USD` | 周期重置的 Unix 时间。 |

带 `-USD` 的响应头里是 Token Factory 的 pts，和 **积分与用量** 页面上的数字相同，不会产生任何费用。
:::

列出模型不占用并发名额，但计入每分钟限制。

### 被限流时的响应

返回 `429` 和 `Retry-After` 响应头。响应体的格式取决于是哪一层拒绝了请求。

**平台准入** 返回 OpenAI 格式的错误，放在 `detail` 里：

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

`code` 表示触发的是哪一项限制：

| 代码 | 含义 |
|---|---|
| `token_rate_limit_exceeded` | 这个 API Key 每分钟的请求太多。 |
| `ip_rate_limit_exceeded` | 这个 IP 每分钟的请求太多。 |
| `token_concurrency_rate_limit_exceeded` | 这个 API Key 同时进行的请求太多。 |
| `model_concurrency_rate_limit_exceeded` | 这个模型达到了自身的并发上限，其他模型可能还有余量。 |
| `process_concurrency_rate_limit_exceeded` | 服务进程已满载。 |
| `global_concurrency_rate_limit_exceeded` | 整个平台已满载。 |

每分钟限制返回 `Retry-After: 60`。并发限制返回 `Retry-After: 1`，你正在进行的请求一结束就会解除。

**网关计量** 在顶层返回 OpenAI 格式的错误，`code` 统一是 `rate_limit_exceeded`，`Retry-After` 按窗口计算：

```json
{
  "error": {
    "message": "Rate limit exceeded: maximum 20 requests per minute for this OneClick user. Please try again later.",
    "type": "rate_limit_error",
    "param": null,
    "code": "rate_limit_exceeded"
  }
}
```

每日用量上限用完时，返回同样格式的错误，信息是 `Daily usage limit exceeded: maximum $N per period for this OneClick user.`，`Retry-After` 是本周期剩余的秒数。

在 `/v1/messages` 上，网关使用 Anthropic 的格式：`{"type": "error", "error": {"type": "rate_limit_error", "message": "..."}}`。

:::caution[不要只根据 `code` 判断]
请根据 `429` 状态码处理，并遵守 `Retry-After`。两个独立的限流器都可能拒绝同一个请求，同一种情况下给出的 `code` 不同，而且平台的错误放在 `detail` 里。
:::

## 实例上的模型服务

以上限制都不适用。实例上的模型服务前面没有网关：代理只核对 API Key 和实例、端口是否匹配，然后转发。请求路径上没有每分钟限制、并发配额或每日用量上限。

上限来自实例本身：vLLM 的请求队列、`--max-num-seqs` 等参数，以及你启动的 GPU。超出后请求会排队，而不是返回 `429`。实例运行期间一直消耗积分，不管有没有请求。

## 实例启动

从模板启动实例时，按 IP 地址在 1 分钟、10 分钟和 1 小时三个滑动窗口内限流。这是为了拦住重试循环，正常使用不会碰到。

超出后返回 `429` 和 `Retry-After`。另外，每个账号同一时间只能有一个实例，销毁前一个之前，再次启动会被拒绝。

## 登录

登录尝试和新账号注册按 IP 限流，只影响在控制台里的操作，不影响 API 调用。

## 如何处理限流

按 `Retry-After` 等待，不要自己设定间隔，并在此基础上加入带随机抖动的指数退避。如果大量客户端都在 60 秒整重试，只会再次造成触发限流的流量高峰。

在客户端把并发控制在每个 API Key 的并发配额以内，而不是一次发出大量请求再处理 `429`。用一个容量为 8 的信号量，比重试循环更简单，也更快。

除了 `429`，不要重试其他 `4xx` 错误。`400` 或 `401` 重试多少次结果都一样。

```python
import time, random, requests

def call_with_retry(payload, attempts=5):
    for i in range(attempts):
        r = requests.post(URL, headers=H, json=payload, timeout=600)
        if r.status_code != 429:
            r.raise_for_status()
            return r.json()
        wait = float(r.headers.get("Retry-After", 60))
        time.sleep(wait + random.uniform(0, 2) * (2 ** i))
    raise RuntimeError("rate limited after retries")
```

如果长期需要比 Token Factory 额度更多的用量，请[在自己的实例上部署模型服务](/radeon-cloud-docs/zh-cn/guides/serve-model/)，那里的唯一限制是你的实例能处理多少请求。
