---
title: 用量和配额
description: 查看你的 Model API 消耗和今天剩下的额度。
sidebar:
  order: 6
---

报告你的密钥在共享 Model API 上花了多少，以及今天还剩多少。

<div class="rc-endpoint">
  <span class="rc-method" data-m="GET">GET</span>
  <span class="rc-path">/api/profile/model-usage</span>
  <span class="rc-auth">会话或 API 密钥</span>
</div>

## 请求

| 参数 | 类型 | | 说明 |
|---|---|---|---|
| `include_recent` | boolean | <span class="rc-opt">选填</span> | 附带最近的单次调用列表。默认 `false`。 |

```bash
curl "https://radeon-global.anruicloud.com/api/profile/model-usage?include_recent=true" \
  -H "Authorization: Bearer $RADEON_API_KEY"
```

## 响应

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
    { "model": "DeepSeek-V4-Flash", "requests": 120, "total_tokens": 74001, "cost": 1.55 }
  ],
  "recent": []
}
```

### 字段

| 字段 | 说明 |
|---|---|
| `status` | 正常是 `ok`。账户还没有 API 密钥时是 `not_configured`；用量服务连不上时是 `not_available`。 |
| `rpm_limit` | 这个密钥每分钟允许的请求数。 |
| `daily_cost_limit_usd` | 每日花费上限。 |
| `daily_cost_used_usd` | 当前周期内已花掉的。 |
| `daily_cost_remaining_usd` | 请求开始被拒绝之前还剩多少。 |
| `daily_reset_timezone` | 每日周期对齐的时区——`Asia/Shanghai`。 |
| `daily_reset_at` | 当前周期何时翻篇。 |
| `today`、`last_30_days`、`all_time` | 各时间段的汇总。 |
| `by_model` | 同样的汇总，按模型拆开。 |
| `recent` | 最近的单次调用。除非 `include_recent=true`，否则为空。 |

token 计数拆成 `prompt_tokens` 和 `completion_tokens`；有些模型还会报 `reasoning_tokens`。费用单位是美元。

:::note[配额是按账户算的]
上面的数字只是示例。你实际的限额就是这个端点针对你的密钥返回的值——去读它，别去猜，因为不同账户不一样，而且会随时间变化。
:::

## 怎么用

跑大批量任务前先查一下，确认还有余量；或者在仪表盘上盯着 `daily_cost_remaining_usd`，免得任务跑到半夜断在中途。每日额度一旦用完，请求会被拒绝，直到 `daily_reset_at`。

GPU 实例的额度是单独统计的，不出现在这里——见[账户](/radeon-cloud-docs/zh-cn/api/account/)。

## 错误

`502` 表示用量服务不可达；汇总字段会全部返回 0，并在 `status` 里说明原因。把 `502` 当作「未知」，而不是「用量为零」。
