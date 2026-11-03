---
title: Model load
description: See how busy each Token Factory model is right now.
sidebar:
  order: 4
---

Returns the current load of each **Token Factory** model, as reported by the inference engines serving it. Use it alongside [List models](/radeon-cloud-docs/api/models/): pick a model from the list, then check here how busy it is.

:::note[China only]
Only `https://developer.amd.com.cn/radeon` serves this endpoint for now. The Global site has the same route but isn't connected to a load source yet, so it always returns `503` (see [Notes](#notes)). Don't retry it there.
:::

<div class="rc-endpoint">
  <span class="rc-method" data-m="GET">GET</span>
  <span class="rc-path">/v1/models/utilization</span>
  <span class="rc-auth">API key or session</span>
</div>

<div class="rc-endpoint">
  <span class="rc-method" data-m="GET">GET</span>
  <span class="rc-path">/v1/models/utilization/{model}</span>
  <span class="rc-auth">API key or session</span>
</div>

Also available as `/api/v1/models/utilization`.

## All models

No parameters.

```bash
curl https://developer.amd.com.cn/radeon/api/v1/models/utilization \
  -H "Authorization: Bearer $RADEON_API_KEY"
```

```json
{
  "object": "list",
  "data": [
    {
      "id": "DeepSeek-V4-Flash",
      "utilization": 16.3,
      "state": "idle",
      "partial": false,
      "sampled_at": "2026-11-01T00:20:15.458Z"
    },
    {
      "id": "MinerU2.5-Pro",
      "utilization": null,
      "state": "unknown",
      "partial": true,
      "sampled_at": null
    }
  ]
}
```

## One model

Put the model name in the path. Matching is case-insensitive.

```bash
curl https://developer.amd.com.cn/radeon/api/v1/models/utilization/DeepSeek-V4-Flash \
  -H "Authorization: Bearer $RADEON_API_KEY"
```

```json
{
  "id": "DeepSeek-V4-Flash",
  "utilization": 16.3,
  "state": "idle",
  "partial": false,
  "sampled_at": "2026-11-01T00:20:15.458Z"
}
```

A model that isn't served returns `404`:

```json
{
  "error": {
    "message": "Model GPT-5 is not available",
    "code": "model_not_found"
  }
}
```

## Fields

| Field | Description |
|---|---|
| `id` | Model name, the same `id` as in [List models](/radeon-cloud-docs/api/models/). |
| `utilization` | 0 to 100, the share of the model's serving capacity in use. `null` when no data could be collected. |
| `state` | `idle` (below 50), `busy` (50 to 90), `full` (90 or more), or `unknown` when there's no data. |
| `partial` | `true` when fewer instances were sampled than are running. If `utilization` has a value, it is estimated from the sampled ones. |
| `sampled_at` | Time of the oldest sample behind the figure, ISO 8601. |

## Notes

Load is for display only and does **not** tell you whether a request will be rate limited. A model in `full` may still accept your request, and one in `idle` may still return `429` because of your own quota. See [Rate limits](/radeon-cloud-docs/api/rate-limits/).

A `null` `utilization` doesn't mean idle. It means there's no data right now; treat it as unknown. If `utilization` is `null`, `partial: true` means the model has running instances that couldn't be sampled, and `partial: false` means none are running.

The OCR and speech models (MinerU2.5-Pro, OmniVoice) and Clef don't report load, so they currently always show `unknown` with `partial: true`.

Data refreshes about every 10 seconds and is cached for 5, so polling faster gets you nothing new. The endpoint doesn't count against your concurrency allowance, but it does count against the per-minute limit.

Returns `503` when the data is temporarily unavailable:

```json
{
  "error": {
    "message": "Model utilization is temporarily unavailable"
  }
}
```

Unlike the `404`, this body has no `code` field.

The load bar on the model cards in [Token Factory](https://developer.amd.com.cn/radeon/tokenfactory) comes from a different counter, so the two can show different numbers.
