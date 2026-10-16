---
title: Call the shared models
description: Get your API key from Token Factory and call the free shared models with curl or the OpenAI SDK.
---

The shared models are free and always on. You only need your API key.

## Get your API key

1. Sign in to the console and open **Token Factory**.
2. The **Your API key** card at the top shows the **Base URL** and your **API key**. The key is hidden; click **Show key** to see it or **Copy** to copy it.

The key starts with `rc-`. One key works for every shared model. Keep it secret: anyone who has it can spend your daily allowance. See [Authentication](/radeon-cloud-docs/api/authentication/) for rotating a key.

## Pick a model

**Token Factory** lists the shared models. Filter them by **Use case**, **Provider** or **Publisher**, or search by name. Each card shows whether the model is busy right now.

Click a card to see the model's description, its pricing and how to call it. The value to send in the `model` field is shown there. The [Model catalog](/radeon-cloud-docs/models/overview/) describes what each model accepts.

## Make a request

```bash
export RADEON_API_KEY=rc-...

curl https://developer.amd.com.cn/radeon/api/v1/chat/completions \
  -H "Authorization: Bearer $RADEON_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model":"DeepSeek-V4-Flash","messages":[{"role":"user","content":"Hello"}]}'
```

From Python, point the OpenAI SDK at the same base URL:

```python
from openai import OpenAI

client = OpenAI(base_url="https://developer.amd.com.cn/radeon/api/v1", api_key="rc-...")
response = client.chat.completions.create(
    model="DeepSeek-V4-Flash",
    messages=[{"role": "user", "content": "Hello"}],
)
print(response.choices[0].message.content)
```

To use another model, change `model`. To list the models your key can call:

```bash
curl https://developer.amd.com.cn/radeon/api/v1/models \
  -H "Authorization: Bearer $RADEON_API_KEY"
```

The shared models also accept the Anthropic Messages API, for clients such as Claude Code. See [Messages](/radeon-cloud-docs/api/messages/).

## Limits

The shared models are free, but usage is capped:

- Requests per minute and concurrent requests are limited per account and per key.
- A daily usage cap resets at 00:00 Beijing time (UTC+8).

When you hit a limit, the request returns `429` with a `Retry-After` header. Every response carries your remaining allowance in its headers. See [Rate limits](/radeon-cloud-docs/api/rate-limits/) and [Usage and quota](/radeon-cloud-docs/api/usage/).

If you keep hitting the limits, [deploy a dedicated model API](/radeon-cloud-docs/guides/dedicated-models/) instead.

## Terms

The shared models are a free trial and development service, not for production. Reselling access is not allowed. See [API terms of use](/radeon-cloud-docs/api/terms/).
