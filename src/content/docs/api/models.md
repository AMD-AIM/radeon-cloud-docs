---
title: List models
description: Discover which models the free shared endpoints serve.
sidebar:
  order: 3
---

Returns the **Public Free Model APIs** catalog, with the pricing and capability metadata for
each entry. A dedicated endpoint serves only the model you launched it with, and answers this
path from vLLM or SGLang instead — see
[Dedicated endpoints](/radeon-cloud-docs/api/dedicated-endpoints/).

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

The envelope is a bare `{ "data": [...] }`. There is no `object` field, and entries carry richer
metadata than OpenAI's model object does — no `owned_by`, no `created`.

```json
{
  "data": [
    {
      "id": "DeepSeek-V4-Flash",
      "name": "DeepSeek-V4-Flash",
      "aliases": [],
      "description": "Radeon DeepSeek V4 Flash served by the AMD GPU Cloud",
      "family": "deepseek",
      "architecture": {
        "input_modalities": ["text"],
        "output_modalities": ["text"],
        "tokenizer": "GPT"
      },
      "top_provider": { "is_moderated": true },
      "providers": [
        {
          "providerId": "radeon-deepseek",
          "externalId": "DeepSeek-V4-Flash",
          "pricing": {
            "prompt": "0.00000014",
            "completion": "0.00000028",
            "input_cache_read": "0.0000000028"
          },
          "streaming": true,
          "vision": false,
          "tools": true,
          "reasoning": true,
          "stability": "stable"
        }
      ],
      "pricing": {
        "prompt": "0.00000014",
        "completion": "0.00000028",
        "input_cache_read": "0.0000000028"
      },
      "context_length": 1048576,
      "supported_parameters": [
        "temperature", "max_tokens", "top_p",
        "frequency_penalty", "presence_penalty",
        "stream", "response_format", "tools"
      ],
      "json_output": true,
      "structured_outputs": true,
      "free": true,
      "stability": "stable"
    }
  ]
}
```

Use any `id` from this list as the `model` field in [chat completions](/radeon-cloud-docs/api/chat-completions/).

## Fields

| Field | Description |
|---|---|
| `id` | The name to send as `model`. |
| `name`, `description`, `family`, `aliases` | Display metadata. |
| `architecture` | Input and output modalities, and the tokenizer family. |
| `providers` | The backends serving this model, each with its own pricing and capability flags. |
| `pricing` | USD per token, as decimal strings — `prompt`, `completion`, and `input_cache_read` where prompt caching applies. |
| `context_length` | Maximum context window in tokens. |
| `supported_parameters` | Request parameters this model accepts. The full schema is under [chat completions](/radeon-cloud-docs/api/chat-completions/). |
| `json_output`, `structured_outputs` | Whether `response_format` is honoured. |
| `free` | Whether calls are billed against your daily allowance at zero cost. |
| `stability` | `stable`, `beta`, `unstable`, or `experimental`. |

:::caution[Not OpenAI's model object]
Clients that expect `data[].object == "model"` or read `owned_by` will not find those fields.
Everything else about the Model API follows OpenAI's schema; this endpoint does not.
:::

## Notes

The catalog changes. Models are added and retired over time, so resolve the list at runtime rather than hard-coding names, and handle the case where a model you used yesterday has gone.

The catalog is the same for every key — it is not scoped to your account.

This endpoint doesn't count against your concurrency allowance, though the per-minute rate limit still applies. It's cheap to call, but cache the result for a few minutes rather than calling it before every completion.

The same metadata is rendered on each model's card in the [Token Factory](https://developer.amd.com.cn/radeon/modelapis).
