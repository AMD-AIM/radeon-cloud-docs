---
title: Quickstart
description: Get a Radeon GPU instance running and make your first API call.
sidebar:
  label: Quickstart
  order: 2
---

Two things to try. They're independent — do either one first.

## Call a model API

The fastest way in. No instance, no credits.

Open the [Token Factory](https://developer.amd.com.cn/radeon/modelapis), sign in, and pick any model under **Public Free Model APIs**. The detail dialog shows your API key. Copy it.

```bash
curl https://developer.amd.com.cn/radeon/api/v1/chat/completions \
  -H "Authorization: Bearer $RADEON_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "DeepSeek-V4-Flash",
    "messages": [{"role": "user", "content": "Say hello in one sentence."}]
  }'
```

The same key works for every shared model — change the `model` field to switch. To see what's available:

```bash
curl https://developer.amd.com.cn/radeon/api/v1/models \
  -H "Authorization: Bearer $RADEON_API_KEY"
```

From Python, point the OpenAI SDK at the same base URL:

```python
from openai import OpenAI

client = OpenAI(
    base_url="https://developer.amd.com.cn/radeon/api/v1",
    api_key="rc-...",
)

response = client.chat.completions.create(
    model="DeepSeek-V4-Flash",
    messages=[{"role": "user", "content": "Say hello in one sentence."}],
)
print(response.choices[0].message.content)
```

Full details in the [API reference](/radeon-cloud-docs/api/overview/).

## Launch a GPU instance

1. Sign in at [radeon-global.anruicloud.com](https://radeon-global.anruicloud.com/) — see [Sign in](/radeon-cloud-docs/guides/login/).
2. Open **Profile** and create a template under **My Templates**. Give it a title and a container image. Set storage to **Persistent (PVC)** if you want files to survive. See [Create a template](/radeon-cloud-docs/guides/templates/).
3. Click **Launch** on the template row.
4. When the dialog reads **Your workspace is ready (100%)**, click **Open Notebook** for [JupyterLab](/radeon-cloud-docs/guides/jupyterlab/), or connect over [SSH](/radeon-cloud-docs/guides/ssh/).

Confirm the GPU is visible from a terminal inside the instance:

```bash
rocm-smi
```

You should see one or more Radeon GPUs listed.

:::caution[Instances spend credits while they run]
When you're finished, destroy the instance from **Profile → Active Instance**. See [Destroy an instance](/radeon-cloud-docs/guides/destroy/).
:::
