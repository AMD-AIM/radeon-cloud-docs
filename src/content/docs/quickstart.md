---
title: Quickstart
description: Call a model in Token Factory, then launch a GPU instance.
sidebar:
  label: Quickstart
  order: 2
---

This page covers two separate tasks: calling a model in Token Factory and launching a GPU instance. Neither depends on the other, so start with whichever you need.

Token Factory is on the China site only. Instances are available on both sites; the examples use the China site's address.

## Call a model in Token Factory

Calling a model in Token Factory needs no instance and spends no credits.

1. Open [Token Factory](https://developer.amd.com.cn/radeon/tokenfactory) and sign in. See [Sign in](/radeon-cloud-docs/guides/login/).
2. On the **Your API key** card at the top, click **Copy** next to the API key.
3. Send a request:

   ```bash
   export RADEON_API_KEY=rc-...

   curl https://developer.amd.com.cn/radeon/api/v1/chat/completions \
     -H "Authorization: Bearer $RADEON_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{"model":"DeepSeek-V4-Flash","messages":[{"role":"user","content":"Say hello in one sentence."}]}'
   ```

The same key works for every model in Token Factory. To use another one, change `model`. To list the models:

```bash
curl https://developer.amd.com.cn/radeon/api/v1/models \
  -H "Authorization: Bearer $RADEON_API_KEY"
```

From Python, point the OpenAI SDK at the same base URL:

```python
from openai import OpenAI

client = OpenAI(base_url="https://developer.amd.com.cn/radeon/api/v1", api_key="rc-...")
response = client.chat.completions.create(
    model="DeepSeek-V4-Flash",
    messages=[{"role": "user", "content": "Say hello in one sentence."}],
)
print(response.choices[0].message.content)
```

Next: [Token Factory](/radeon-cloud-docs/guides/token-factory/) for limits and the model list, or the [API reference](/radeon-cloud-docs/api/overview/).

## Launch a GPU instance

An instance spends credits every hour it runs, so check your balance first. See [Credits](/radeon-cloud-docs/guides/credits/).

### From the console

1. Sign in to the console for your site. See [Sign in](/radeon-cloud-docs/guides/login/).
2. On **Home**, keep **Deploy type** at **Notebook** and **Image** at **AMD OneClick Base**.
3. To keep your files after the instance is gone, turn on **Customize** and set **Workspace storage** to **Persistent /workspace**. See [Keep your data](/radeon-cloud-docs/guides/storage/).
4. Click **Launch instance**. When a node is free, the instance is usually ready within a minute.
5. When the dialog reads **Your instance is ready**, click **Open notebook** to open [JupyterLab](/radeon-cloud-docs/guides/jupyterlab/), or connect over [SSH](/radeon-cloud-docs/guides/ssh/).

If the launch fails, see [Launch an instance](/radeon-cloud-docs/guides/launch/#if-the-launch-fails).

### From a terminal

Install [Radeon Cloud CLI](/radeon-cloud-docs/cli/overview/), sign in, check which resources your account can use, and launch:

```bash
python3 -m pip install amd-oneclick-sdk
rcc auth login
rcc catalog list
rcc instance add-key
rcc instance create
rcc instance open
```

In an interactive terminal, `rcc instance create` asks you to choose an environment and resources.

### Check the GPU

In a terminal inside the instance:

```bash
rocm-smi
```

It lists the Radeon GPUs attached to the instance.

:::caution[Destroy the instance when you're done]
On **Home**, click **Destroy instance**, or run `rcc instance delete --yes`. See [Destroy an instance](/radeon-cloud-docs/guides/destroy/).
:::
