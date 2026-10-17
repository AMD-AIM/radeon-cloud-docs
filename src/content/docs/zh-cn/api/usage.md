---
title: 用量和配额
description: 查看共享模型 API 的用量，以及今天还剩多少额度。
sidebar:
  order: 6
---

返回你在共享模型 API 上用了多少，以及今天还剩多少额度。数据和控制台 **积分与用量** 页面上的相同。

<div class="rc-endpoint">
  <span class="rc-method" data-m="GET">GET</span>
  <span class="rc-path">/v1/usage</span>
  <span class="rc-auth">API Key</span>
</div>

## 请求

| 参数 | 类型 | | 说明 |
|---|---|---|---|
| `include_recent` | boolean | <span class="rc-opt">可选</span> | 附带最近的单次请求，默认 `false`。 |

```bash
curl "https://developer.amd.com.cn/radeon/api/v1/usage?include_recent=true" \
  -H "Authorization: Bearer $RADEON_API_KEY"
```

## 响应

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

### 字段

| 字段 | 说明 |
|---|---|
| `rpm_limit` | 这个 API Key 每分钟允许的请求数。 |
| `daily_cost_limit_usd` | 今天的用量上限。 |
| `daily_cost_used_usd` | 今天已经用掉的。 |
| `daily_cost_remaining_usd` | 请求被拒绝之前还剩多少。 |
| `daily_reset_timezone`、`daily_reset_at` | 每日额度的重置时间：北京时间 0 点。 |
| `today`、`last_30_days`、`all_time` | 各时间段的汇总。 |
| `by_model` | 同样的汇总，按模型拆分。 |
| `recent` | 最近的单次请求。只有 `include_recent=true` 时才有内容。 |

用量和费用的单位是模型 API 的 pts，也就是 **积分与用量** 页面上显示的单位。字段名以 `_usd` 结尾，但不会产生任何费用，也和你的积分无关。

token 数分为 `prompt_tokens` 和 `completion_tokens`，有些模型还会返回 `reasoning_tokens`。

:::note[不同账号的限额不同]
上面的数字只是示例。请从这个接口读取你自己的限额，不要假设，因为不同账号不一样，而且会调整。
:::

## 监控用量

跑大批量任务前先确认额度够用，或者持续关注 `daily_cost_remaining_usd`，免得任务跑到一半停下。额度用完后，请求会被拒绝，直到 `daily_reset_at`。

每次调用模型 API 的响应头里也带有当前的计数，见[限流](/radeon-cloud-docs/zh-cn/api/rate-limits/)。

## 在控制台查看

**积分与用量** 页面通过 `GET /api/profile/model-usage` 读取同样的数据，这个接口使用浏览器会话而不是 API Key。它多一个 `status` 字段：`ok`；账号还没有 API Key 时是 `not_configured`；没有用量数据时是 `not_available`。它返回 `502` 表示用量服务连不上，请当作“未知”，而不是“用量为零”。
