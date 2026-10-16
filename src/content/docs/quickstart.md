---
title: Quickstart
description: Get a Radeon GPU instance running and make your first API call.
sidebar:
  label: Quickstart
  order: 2
---

This page covers two separate tasks: calling a model API and launching a GPU instance. Neither depends on the other, so start with whichever you need.

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

You can launch an instance from the web console or with
[Radeon Cloud CLI](/radeon-cloud-docs/cli/overview/) (`rcc`).

### Use the web console

1. Sign in to the console for your site. See [Sign in](/radeon-cloud-docs/guides/login/).
2. On **Home**, keep **Deploy type** at **Notebook** and **Image** at **AMD OneClick Base**.
3. To keep your files after the instance is gone, turn on **Customize** and set **Workspace storage** to **Persistent /workspace**. See [Keep your data](/radeon-cloud-docs/guides/storage/).
4. Click **Launch instance**.
5. When the dialog reads **Your instance is ready**, click **Open notebook** for [JupyterLab](/radeon-cloud-docs/guides/jupyterlab/), or connect over [SSH](/radeon-cloud-docs/guides/ssh/).

See [Launch an instance](/radeon-cloud-docs/guides/launch/) for every option and for what to do if the launch fails.

### Use Radeon Cloud CLI

Install the CLI, sign in, see which resources your account may use, and launch an instance:

```bash
python3 -m pip install amd-oneclick-sdk
rcc auth login
rcc doctor
rcc catalog list
rcc instance add-key
rcc instance create
rcc instance open
```

In an interactive terminal, `rcc instance create` walks you through choosing an environment and
resources. See [Radeon Cloud CLI](/radeon-cloud-docs/cli/overview/) for SSH, status, logs, scripting
and multiple accounts.

Confirm the GPU is visible from a terminal inside the instance:

```bash
rocm-smi
```

You should see one or more Radeon GPUs listed.

:::caution[Instances spend credits while they run]
When you're finished, click **Destroy instance** on **Home**
or run `rcc instance delete --yes`. See
[Destroy an instance](/radeon-cloud-docs/guides/destroy/).
:::
