---
title: List models
description: Discover which models your key can call.
sidebar:
  order: 3
---

Returns the models available to your key, in OpenAI's format.

<div class="rc-endpoint">
  <span class="rc-method" data-m="GET">GET</span>
  <span class="rc-path">/v1/models</span>
  <span class="rc-auth">Bearer key or session</span>
</div>

Also reachable at `/api/v1/models`.

## Request

No parameters.

```bash
curl https://developer.amd.com.cn/radeon/api/v1/models \
  -H "Authorization: Bearer $RADEON_API_KEY"
```

## Response

```json
{
  "object": "list",
  "data": [
    {
      "id": "Qwen3.6-35B-A3B",
      "object": "model",
      "created": 1756108800,
      "owned_by": "radeon-cloud"
    },
    {
      "id": "DeepSeek-V4-Flash",
      "object": "model",
      "created": 1756108800,
      "owned_by": "radeon-cloud"
    }
  ]
}
```

Use any `id` from this list as the `model` field in [chat completions](/radeon-cloud-docs/api/chat-completions/).

## Notes

The catalog changes. Models are added and retired over time, so resolve the list at runtime rather than hard-coding names, and handle the case where a model you used yesterday has gone.

This endpoint doesn't count against your concurrency allowance, though the per-minute rate limit still applies. It's cheap to call, but cache the result for a few minutes rather than calling it before every completion.

Richer metadata — pricing, context length, supported parameters, availability status — is shown on each model's card in the [Token Factory](https://developer.amd.com.cn/radeon/modelapis).
