---
title: Usage and quota
description: Check your Token Lab usage and what's left of your usage budget.
sidebar:
  order: 6
---

Reports how much of Token Lab you've used, and what's left of your usage budget for the current access period.

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
  "rpm_limit": 20,
  "budget_limit_usd": 30,
  "budget_used_usd": 12.6311,
  "budget_remaining_usd": 17.3689,
  "budget_period_started_at": "2026-08-10T09:30:00.000Z",
  "valid_until": "2026-09-09T09:30:00.000Z",
  "daily_cost_limit_usd": null,
  "today": {
    "requests": 142,
    "errors": 3,
    "total_tokens": 88214,
    "prompt_tokens": 31002,
    "completion_tokens": 57212,
    "cost": 1.8412,
    "last_request_at": "2026-08-25T06:22:07Z"
  },
  "last_30_days": { "requests": 2840, "total_tokens": 1904221, "cost": 12.6311 },
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
| `budget_limit_usd` | Your usage budget for the current access period. |
| `budget_used_usd` | Used so far in the period. |
| `budget_remaining_usd` | What's left before requests are refused. |
| `budget_period_started_at`, `valid_until` | When the current access period started and when it ends. The budget doesn't reset daily; a renewal starts a new period with a fresh budget. |
| `budget_*_microusd` | The same three amounts in millionths of a dollar. |
| `daily_cost_limit_usd` | `null`: Token Lab keys have no daily cap. |
| `today`, `last_30_days`, `all_time` | Totals for each period. |
| `by_model` | The same totals per model. |
| `recent` | Recent individual requests. Empty unless `include_recent=true`. |

Usage and cost values are in US dollars of usage at each model's listed rates. Token Lab is free: you aren't charged money, and the budget has nothing to do with your credits.

Token counts are split into `prompt_tokens` and `completion_tokens`. Some models also report `reasoning_tokens`.

:::note[Limits differ between accounts]
The numbers above are an example. Read your own limits from this endpoint rather than assuming them, because they differ between accounts and change over time.
:::

## Monitor usage

Check before a large batch job that there's enough left, or watch `budget_remaining_usd` so a job doesn't stop halfway. Once the budget is used up, requests are refused with `429 insufficient_quota` until the key is renewed for a new access period. `valid_until` is when the current period ends.

Every Token Lab response also carries the current counters as headers. See [Rate limits](/radeon-cloud-docs/api/rate-limits/).

## From the console

The **Credits & Usage** page reads the same data from `GET /api/profile/model-usage`, which takes a browser session instead of an API key. It adds a `status` field: `ok`, `not_configured` if the account has no API key yet, or `not_available` if there's no usage data. A `502` from it means the usage service can't be reached; treat that as unknown, not as zero usage.
