---
title: Rate limits
description: The limits that apply to model API calls and instance launches, and how to handle them.
sidebar:
  order: 10
---

Limits exist so shared capacity stays usable. There are three groups, applied independently.

## Model API

Four gates. A request has to pass all of them.

| Limit | Scope | Typical value |
|---|---|---|
| Requests per minute | Per API key | 30 |
| Requests per minute | Per IP address | 120 |
| Concurrent requests | Per API key | 8 |
| Concurrent requests | Platform-wide | Shared pool |

On top of these, a daily spend cap applies per account, reset at midnight Asia/Shanghai time.

:::note[Read your own limits]
The values above are the platform defaults and can differ per account. [`GET /api/profile/model-usage`](/radeon-cloud-docs/api/usage/) returns the ones actually applied to your key, along with what you've used today.
:::

Listing models doesn't consume a concurrency slot, though it does count toward the per-minute limits.

### When you're limited

`429`, with an OpenAI-shaped error body and a `Retry-After` header:

```json
{
  "error": {
    "message": "Model API rate limit exceeded; please retry later",
    "type": "rate_limit_error",
    "code": "token_rate_limit_exceeded"
  }
}
```

The `code` tells you which gate you hit:

| Code | Meaning |
|---|---|
| `token_rate_limit_exceeded` | Too many requests per minute on this key. |
| `ip_rate_limit_exceeded` | Too many requests per minute from this IP. |
| `token_concurrency_rate_limit_exceeded` | Too many requests in flight on this key. |
| `process_concurrency_rate_limit_exceeded` | The serving process is saturated. |
| `global_concurrency_rate_limit_exceeded` | The platform is at capacity. |

Per-minute limits return `Retry-After: 60`. Concurrency limits return `Retry-After: 1` — those clear as soon as your in-flight requests finish.

## Instance launches

Launching is throttled on a sliding window: roughly one per minute, three per ten minutes, five per hour. This catches retry loops rather than normal use — a person launching an instance to work in will never notice it.

Exceeding it returns `429` with `Retry-After`.

## Sign-in

Sign-in attempts and new account creation are rate limited per IP. Relevant only if you're driving the console, not the API.

## Handling limits well

Honour `Retry-After` rather than picking your own interval, and back off exponentially with jitter on top — a fleet of clients that all retry after exactly 60 seconds recreates the spike that caused the limit.

Cap concurrency on your side to match the per-key allowance instead of firing requests and catching `429`s. A semaphore of 8 is simpler and faster than a retry loop.

Don't retry `4xx` other than `429`. A `400` or `401` will fail identically every time.

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

If you consistently need more headroom than the shared endpoints allow, that's the signal to move to a [dedicated endpoint](/radeon-cloud-docs/api/dedicated-endpoints/), where the only limit is what your instance can serve.
