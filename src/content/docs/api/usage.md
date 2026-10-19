---
title: Usage and quota
description: Check your Token Factory usage and what's left of today's allowance.
sidebar:
  order: 6
---

Reports how much of Token Factory you've used, and what's left of today's allowance. This is the same data as **Credits & Usage** in the console.

<div class="rc-endpoint">
  <span class="rc-method" data-m="GET">GET</span>
  <span class="rc-path">/v1/usage</span>
  <span class="rc-auth">API key</span>
</div>

## Request

| Parameter | Type | | Description |
|---|---|---|---|
| `include_recent` | boolean | <span class="rc-opt">Optional</span> | Include recent individual requests. Defaults to `false`. |

```bash
curl "https://developer.amd.com.cn/radeon/api/v1/usage?include_recent=true" \
  -H "Authorization: Bearer $RADEON_API_KEY"
```

## Response

```json
{
  "rpm_limit": 30,
  "daily_cost_limit_usd": 10,
  "daily_cost_used_usd": 1.8412,
  "daily_cost_remaining_usd": 8.1588,
  "daily_reset_timezone": "Asia/Shanghai",
  "daily_reset_at": "2026-08-26T00:00:00+08:00",
  "today": {
    "requests": 142,
    "errors": 3,
    "total_tokens": 88214,
    "prompt_tokens": 31002,
    "completion_tokens": 57212,
    "cost": 1.8412,
    "last_request_at": "2026-08-25T14:22:07+08:00"
  },
  "last_30_days": { "requests": 2840, "total_tokens": 1904221, "cost": 39.77 },
  "all_time":     { "requests": 9120, "total_tokens": 6210443, "cost": 128.44 },
  "by_model": [
    { "model": "DeepSeek-V4-Flash", "requests": 120, "total_tokens": 74001, "cost": 1.55 }
  ],
  "recent": []
}
```

### Fields

| Field | Description |
|---|---|
| `rpm_limit` | Requests per minute allowed for your key. |
| `daily_cost_limit_usd` | Today's usage cap. |
| `daily_cost_used_usd` | Used so far today. |
| `daily_cost_remaining_usd` | What's left before requests are refused. |
| `daily_reset_timezone`, `daily_reset_at` | When the daily allowance resets: 00:00 Beijing time. |
| `today`, `last_30_days`, `all_time` | Totals for each period. |
| `by_model` | The same totals per model. |
| `recent` | Recent individual requests. Empty unless `include_recent=true`. |

Usage and cost values are in Token Factory points (pts), the unit shown on **Credits & Usage**. The field names end in `_usd`, but you aren't charged money, and these points have nothing to do with your credits.

Token counts are split into `prompt_tokens` and `completion_tokens`. Some models also report `reasoning_tokens`.

:::note[Limits differ between accounts]
The numbers above are an example. Read your own limits from this endpoint rather than assuming them, because they differ between accounts and change over time.
:::

## Monitor usage

Check before a large batch job that there's enough left, or watch `daily_cost_remaining_usd` so a job doesn't stop halfway. Once the allowance is used up, requests are refused until `daily_reset_at`.

Every Token Factory response also carries the current counters as headers. See [Rate limits](/radeon-cloud-docs/api/rate-limits/).

## From the console

The **Credits & Usage** page reads the same data from `GET /api/profile/model-usage`, which takes a browser session instead of an API key. It adds a `status` field: `ok`, `not_configured` if the account has no API key yet, or `not_available` if there's no usage data. A `502` from it means the usage service can't be reached; treat that as unknown, not as zero usage.
