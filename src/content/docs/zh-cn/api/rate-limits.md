---
title: 限流
description: Model API 调用和实例启动会撞到哪些限制，以及怎么应对。
sidebar:
  order: 10
---

有限制才能让共享的资源保持可用。一共三组，各自独立生效。

## Model API

四道关卡。一个请求得全部通过。

| 限制 | 范围 | 典型值 |
|---|---|---|
| 每分钟请求数 | 每个 API 密钥 | 30 |
| 每分钟请求数 | 每个 IP 地址 | 120 |
| 并发请求数 | 每个 API 密钥 | 8 |
| 并发请求数 | 全平台 | 共享池 |

除此之外，还有按账户的每日花费上限，在 Asia/Shanghai 时区的午夜重置。

:::note[去读你自己的限额]
上面的值是平台默认值，各账户可能不同。[`GET /api/profile/model-usage`](/radeon-cloud-docs/zh-cn/api/usage/) 返回实际作用在你密钥上的那些，还有你今天用掉了多少。
:::

列出模型不占并发槽位，但确实计入每分钟限制。

## 被限流时

`429`，带一个 OpenAI 形状的错误体和 `Retry-After` 头：

```json
{
  "error": {
    "message": "Model API rate limit exceeded; please retry later",
    "type": "rate_limit_error",
    "code": "token_rate_limit_exceeded"
  }
}
```

`code` 告诉你撞的是哪道关：

| 代码 | 含义 |
|---|---|
| `token_rate_limit_exceeded` | 这个密钥每分钟请求太多。 |
| `ip_rate_limit_exceeded` | 这个 IP 每分钟请求太多。 |
| `token_concurrency_rate_limit_exceeded` | 这个密钥同时在飞的请求太多。 |
| `process_concurrency_rate_limit_exceeded` | 服务进程已饱和。 |
| `global_concurrency_rate_limit_exceeded` | 平台已满载。 |

每分钟限制返回 `Retry-After: 60`。并发限制返回 `Retry-After: 1`——你手上的请求一跑完就解除了。

## 实例启动

启动按滑动窗口节流：大致每分钟一次、每十分钟三次、每小时五次。这是冲着重试循环去的，正常使用碰不到——一个人启动实例干活，永远不会注意到它。

超了返回 `429` 和 `Retry-After`。

## 登录

登录尝试和新账户注册按 IP 限流。只有你在驱动控制台时才相关，调 API 不涉及。

## 怎么应对才对

按 `Retry-After` 来，别自己拍一个间隔，并在此基础上做带抖动的指数退避——一群客户端全都在正好 60 秒后重试，只会把造成限流的那个尖峰再造一遍。

在你这边把并发压到每个密钥的额度以内，而不是猛发请求然后接 `429`。一个容量 8 的信号量比重试循环更简单也更快。

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

如果你长期需要的余量超过共享端点能给的，那就是该转向[独占端点](/radeon-cloud-docs/zh-cn/api/dedicated-endpoints/)的信号了——在那儿唯一的限制是你的实例能扛多少。
