---
title: 限流
description: 模型 API 调用和实例启动会撞到哪些限制，以及怎么应对。
sidebar:
  order: 11
---

有限制才能让共享的资源保持可用，所以限制几乎全落在免费共享端点上。一共四组，各自独立生效。

## 共享模型 API

链路上有两层，一个请求两层都得过。平台先决定放不放行，网关再按你的账号计量。

### 平台准入

| 限制 | 范围 | 典型值 |
|---|---|---|
| 每分钟请求数 | 每个 API Key | 30 |
| 每分钟请求数 | 每个 IP 地址 | 120，仅在该部署的边缘能提供可信客户端地址时生效 |
| 并发请求数 | 每个 API Key | 8 |
| 并发请求数 | 每个模型 | 按该模型后端集群实际能扛的并发来定 |
| 并发请求数 | 每个服务进程 | 共享池 |
| 并发请求数 | 全平台 | 共享池 |

### 网关计量

| 限制 | 范围 | 典型值 |
|---|---|---|
| 每分钟请求数 | 每个账号 | 20，60 秒滑动窗口 |
| 每日用量上限 | 每个账号 | 以模型 API 的 pts 计量，按北京时间的自然日累计，每天 00:00（UTC+8）重置 |

对话、语音合成（`/v1/audio/speech`）和决策（`/v1/systemone`）请求共用同一个每分钟窗口和同一个每日用量上限。

:::tip[配额就在每次响应里]
每次成功调用都会带上当前计数，做成响应头，基本不需要你去轮询任何东西：

| 响应头 | 含义 |
|---|---|
| `X-RateLimit-Limit-User-RPM` | 你账号每分钟允许的请求数。 |
| `X-RateLimit-Remaining-User-RPM` | 当前这一分钟还剩多少次。 |
| `X-RateLimit-Reset` | 每分钟窗口清零的 Unix 时间。 |
| `X-RateLimit-Limit-User-Daily-USD` | 当前周期的每日用量上限。 |
| `X-RateLimit-Used-User-Daily-USD` | 本周期已经用掉的。 |
| `X-RateLimit-Remaining-User-Daily-USD` | 请求开始被拒绝之前还剩多少。 |
| `X-RateLimit-Reset-User-Daily-USD` | 周期重置的 Unix 时间。 |

带 `-USD` 的响应头里是模型 API 的 pts，和 **积分与用量** 页面上的数字相同，不会产生任何费用。
:::

列出模型不占并发槽位，但确实计入每分钟限制。

### 请求被限流时

`429` 加一个 `Retry-After` 头。响应体取决于是哪一层拒的你。

**平台准入**返回一个包在 `detail` 里的 OpenAI 形状错误：

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

`code` 告诉你撞的是哪道关：

| 代码 | 含义 |
|---|---|
| `token_rate_limit_exceeded` | 这个密钥每分钟请求太多。 |
| `ip_rate_limit_exceeded` | 这个 IP 每分钟请求太多。 |
| `token_concurrency_rate_limit_exceeded` | 这个密钥同时在飞的请求太多。 |
| `model_concurrency_rate_limit_exceeded` | 这个模型撞到了它自己的并发上限，换个模型可能还有余量。 |
| `process_concurrency_rate_limit_exceeded` | 服务进程已饱和。 |
| `global_concurrency_rate_limit_exceeded` | 平台已满载。 |

每分钟限制返回 `Retry-After: 60`。并发限制返回 `Retry-After: 1`——你手上的请求一跑完就解除了。

**网关计量**返回顶层的 OpenAI 形状错误，`code` 是通用的 `rate_limit_exceeded` 而不是分门别类的那几个，`Retry-After` 按窗口算出来：

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

每日用量上限用完时，返回同样结构的错误，消息变成 `Daily usage limit exceeded: maximum $N per period for this OneClick user.`，`Retry-After` 是本周期剩余的秒数。

在 `/v1/messages` 上，网关改用 Anthropic 的信封：`{"type": "error", "error": {"type": "rate_limit_error", "message": "..."}}`。

:::caution[别只盯着 `code` 分支]
按 `429` 这个状态码分支，并遵守 `Retry-After`。两个互相独立的限流器都可能拒掉同一个请求，同一种情况它们给的 `code` 还不一样，而且平台那份是嵌在 `detail` 里的。
:::

## 专属模型 API

上面那些一条都不适用。专属端点前面没有网关：代理核对密钥跟实例、端口对得上，就转发。请求路径上没有每分钟限制、没有并发配额，也没有每日用量上限。

真正的上限来自实例本身：vLLM 自己的队列、`--max-num-seqs` 等参数，以及你启动的 GPU。超过之后请求是排队，而不是回 `429`。只要实例在运行就会持续消耗积分，有没有请求都一样。

## 实例启动

从模板启动实例时，按 IP 地址在 1 分钟、10 分钟和 1 小时三个滑动窗口内限流。这是为了拦住重试循环，正常使用不会碰到。

超出后返回 `429` 和 `Retry-After`。另外，每个账号同一时间只能有一个实例，销毁前一个之前，再次启动会被拒绝。

## 登录

登录尝试和新账号注册按 IP 限流。只有你在驱动控制台时才相关，调 API 不涉及。

## 如何应对限流

按 `Retry-After` 来，别自己拍一个间隔，并在此基础上做带抖动的指数退避——一群客户端全都在正好 60 秒后重试，只会把造成限流的那个尖峰再造一遍。

在你这边把并发控制在每个 API Key 的并发配额以内，而不是猛发请求然后接 `429`。一个容量 8 的信号量比重试循环更简单也更快。

除了 `429`，别重试其他 `4xx`。`400` 或 `401` 重试多少次都是一样的失败。

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

如果你长期需要的余量超过共享端点能给的，那就是该转向[专属端点](/radeon-cloud-docs/zh-cn/api/dedicated-endpoints/)的信号了——在那儿唯一的限制是你的实例能扛多少。
