---
title: 模型负载
description: 查看 Token Factory 每个模型当前有多忙。
sidebar:
  order: 4
---

返回 **Token Factory** 每个模型当前的负载，由各推理实例的引擎直接报告，和[列出模型](/radeon-cloud-docs/zh-cn/api/models/)配合使用：先用列表挑模型，再用这里看它现在忙不忙。

:::note[仅中国站]
目前只有 `https://developer.amd.com.cn/radeon` 提供这个接口。Global 站有同样的路由，但还没接入负载数据，会一直返回 `503`（见[说明](#说明)），不要在 Global 站重试。
:::

<div class="rc-endpoint">
  <span class="rc-method" data-m="GET">GET</span>
  <span class="rc-path">/v1/models/utilization</span>
  <span class="rc-auth">API Key 或会话</span>
</div>

<div class="rc-endpoint">
  <span class="rc-method" data-m="GET">GET</span>
  <span class="rc-path">/v1/models/utilization/{model}</span>
  <span class="rc-auth">API Key 或会话</span>
</div>

也可以通过 `/api/v1/models/utilization` 访问。

## 所有模型

无参数。

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

## 单个模型

把模型名放在路径里，不区分大小写。

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

模型不在线时返回 `404`：

```json
{
  "error": {
    "message": "Model GPT-5 is not available",
    "code": "model_not_found"
  }
}
```

## 字段

| 字段 | 说明 |
|---|---|
| `id` | 模型名，和[列出模型](/radeon-cloud-docs/zh-cn/api/models/)里的 `id` 相同。 |
| `utilization` | 0 到 100，这个模型在线容量中正在使用的比例。暂时采不到数据时为 `null`。 |
| `state` | `idle`（低于 50）、`busy`（50 到 90）、`full`（90 及以上），没有数据时为 `unknown`。 |
| `partial` | `true` 表示采到的实例数少于正在运行的实例数。`utilization` 有数值时，是按采到的实例估算的。 |
| `sampled_at` | 参与计算的最旧一份样本的时间，ISO 8601。 |

## 说明

负载只用于展示，**不能**用来预测会不会被限流。`state` 为 `full` 时请求仍可能成功，`idle` 时也可能因为你自己的配额返回 `429`，见[限流](/radeon-cloud-docs/zh-cn/api/rate-limits/)。

`utilization` 为 `null` 不表示空闲，只是这一刻没有数据，请按未知处理。此时 `partial: true` 表示模型有运行中的实例但采不到数据，`partial: false` 表示没有运行中的实例。

OCR 和语音模型（MinerU2.5-Pro、OmniVoice）以及 Clef 不上报负载，目前总是显示 `unknown`，且 `partial` 为 `true`。

数据大约每 10 秒更新一次，并缓存 5 秒，轮询得再快也不会更新。这个接口不占用并发名额，但计入每分钟请求限制。

暂时取不到数据时返回 `503`：

```json
{
  "error": {
    "message": "Model utilization is temporarily unavailable"
  }
}
```

和 `404` 不同，这个响应体没有 `code` 字段。

[Token Factory](https://developer.amd.com.cn/radeon/tokenfactory) 模型卡片上的负载条来自另一套计数，两边数值可能不同。
