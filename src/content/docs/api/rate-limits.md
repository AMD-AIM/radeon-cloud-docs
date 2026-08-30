---
title: Rate limits
description: The limits that apply to model API calls and instance launches, and how to handle them.
sidebar:
  order: 11
---

Limits exist so shared capacity stays usable, so they land almost entirely on the free shared
endpoints. There are four groups, applied independently.

## Public Free Model APIs

Two tiers sit in the path, and a request has to pass both. The platform admits the request, then the gateway meters it against your account.

### Platform admission

| Limit | Scope | Typical value |
|---|---|---|
| Requests per minute | Per API key | 30 |
| Requests per minute | Per IP address | 120, where the deployment's edge supplies a trusted client address |
| Concurrent requests | Per API key | 8 |
| Concurrent requests | Per model | Sized to what that model's backend fleet can serve |
| Concurrent requests | Per serving process | Shared pool |
| Concurrent requests | Platform-wide | Shared pool |

### Gateway metering

| Limit | Scope | Typical value |
|---|---|---|
| Requests per minute | Per account | 20, on a 60-second sliding window |
| Spend cap | Per account | A rolling period that starts at your first billed request and resets when it expires — not a fixed midnight boundary |

:::tip[Your quota is on every response]
Every successful call carries the current counters as headers, so you rarely need to poll
anything:

| Header | Meaning |
|---|---|
| `X-RateLimit-Limit-User-RPM` | Requests per minute allowed for your account. |
| `X-RateLimit-Remaining-User-RPM` | Requests left in the current minute. |
| `X-RateLimit-Reset` | Unix time when the per-minute window clears. |
| `X-RateLimit-Limit-User-Daily-USD` | Spend ceiling for the current period. |
| `X-RateLimit-Used-User-Daily-USD` | Spent so far in the period. |
| `X-RateLimit-Remaining-User-Daily-USD` | What's left before requests start being rejected. |
| `X-RateLimit-Reset-User-Daily-USD` | Unix time when the period rolls over. |
:::

Listing models doesn't consume a concurrency slot, though it does count toward the per-minute limits.

### When you're limited

`429` with a `Retry-After` header. The body depends on which tier refused you.

Platform admission returns an OpenAI-shaped error wrapped in `detail`:

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

The `code` tells you which gate you hit:

| Code | Meaning |
|---|---|
| `token_rate_limit_exceeded` | Too many requests per minute on this key. |
| `ip_rate_limit_exceeded` | Too many requests per minute from this IP. |
| `token_concurrency_rate_limit_exceeded` | Too many requests in flight on this key. |
| `model_concurrency_rate_limit_exceeded` | That model is at its own concurrency limit. Another model may still have room. |
| `process_concurrency_rate_limit_exceeded` | The serving process is saturated. |
| `global_concurrency_rate_limit_exceeded` | The platform is at capacity. |

Per-minute limits return `Retry-After: 60`. Concurrency limits return `Retry-After: 1` — those clear as soon as your in-flight requests finish.

Gateway metering returns an OpenAI-shaped error at the top level, with the generic `rate_limit_exceeded` code rather than a per-gate one, and a `Retry-After` computed from the window:

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

Exhausting the spend cap produces the same shape with `Daily usage limit exceeded: maximum $N per period for this OneClick user.`, and `Retry-After` set to the seconds remaining in the period.

On `/v1/messages` the gateway uses Anthropic's envelope instead: `{"type": "error", "error": {"type": "rate_limit_error", "message": "..."}}`.

:::caution[Don't branch on `code` alone]
Branch on the `429` status and honour `Retry-After`. Two independent limiters can refuse the
same request, they use different `code` values for the same condition, and the platform's body
is nested under `detail`.
:::

## Dedicated Model APIs

None of the above applies. A dedicated endpoint has no gateway in front of it: the proxy checks
that the key matches the instance and the port, then forwards. There is no per-minute limit, no
concurrency allowance and no spend cap on the request path.

What bounds you instead is the instance itself — vLLM's or SGLang's own queue and
`--max-running-requests`, and the GPU you launched. Past that, requests queue rather than
return `429`. Credits are consumed for as long as the instance runs, whether or not requests
arrive.

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

If you consistently need more headroom than the free shared endpoints allow, that's the signal
to move to a [dedicated endpoint](/radeon-cloud-docs/api/dedicated-endpoints/), where the only
limit is what your instance can serve.
