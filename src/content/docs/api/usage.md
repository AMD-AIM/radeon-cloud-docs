---
title: Usage and quota
description: Check your model API consumption and remaining daily allowance.
sidebar:
  order: 6
---

Reports what your key has spent against the shared model APIs, and what's left today.

<div class="rc-endpoint">
  <span class="rc-method" data-m="GET">GET</span>
  <span class="rc-path">/api/profile/model-usage</span>
  <span class="rc-auth">Session or API key</span>
</div>

## Request

| Parameter | Type | | Description |
|---|---|---|---|
| `include_recent` | boolean | <span class="rc-opt">Optional</span> | Include a list of recent individual calls. Defaults to `false`. |

```bash
curl "https://radeon-global.anruicloud.com/api/profile/model-usage?include_recent=true" \
  -H "Authorization: Bearer $RADEON_API_KEY"
```

## Response

```json
{
  "status": "ok",
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
    { "model": "Qwen3.6-35B-A3B", "requests": 120, "total_tokens": 74001, "cost": 1.55 }
  ],
  "recent": []
}
```

### Fields

| Field | Description |
|---|---|
| `status` | `ok` normally. `not_configured` if the account has no API key yet; `not_available` if the usage service can't be reached. |
| `rpm_limit` | Requests per minute allowed for this key. |
| `daily_cost_limit_usd` | Daily spend ceiling. |
| `daily_cost_used_usd` | Spent so far in the current window. |
| `daily_cost_remaining_usd` | What's left before requests start being rejected. |
| `daily_reset_timezone` | Timezone the daily window is anchored to — `Asia/Shanghai`. |
| `daily_reset_at` | When the current window rolls over. |
| `today`, `last_30_days`, `all_time` | Aggregates over each period. |
| `by_model` | The same aggregates broken down per model. |
| `recent` | Individual recent calls. Empty unless `include_recent=true`. |

Token counts split into `prompt_tokens` and `completion_tokens`; some models also report `reasoning_tokens`. Costs are USD.

:::note[Quota values are per account]
The numbers above are an example. Your actual limits are whatever this endpoint returns for your key — read them rather than assuming, since they differ between accounts and change over time.
:::

## Using it

Poll this before a large batch job to confirm there's headroom, or watch `daily_cost_remaining_usd` in a dashboard so a job doesn't stop halfway through the night. Once the daily allowance is exhausted, requests are rejected until `daily_reset_at`.

Credits for GPU instances are tracked separately and don't appear here — see [Account](/radeon-cloud-docs/api/account/).

## Errors

`502` means the usage service is unreachable; the aggregate fields come back zeroed with a `status` explaining why. Treat a `502` as "unknown", not as "zero usage".
