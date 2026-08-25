---
title: Dedicated endpoints
description: Serve your own model on your own instance behind an OpenAI-compatible URL.
sidebar:
  order: 7
---

A dedicated endpoint runs vLLM or SGLang inside an instance you own, and the platform routes a public URL to it. You choose the model and the serving flags; requests reach your server directly.

## Base URL

```text
https://<host>/spaces/<instance-id>/<port>/v1
```

`<port>` is `8000` for vLLM and `30000` for SGLang. The complete URL appears in the launch dialog and under **Active Instance** — take it from there rather than assembling it.

## Deploying

Create a template with **Deploy Type** set to **vLLM Model API**, and a serve command:

```bash
vllm serve Qwen/Qwen2.5-7B-Instruct --host 0.0.0.0 --port 8000
```

:::caution[The host and port are not optional]
`--host 0.0.0.0 --port 8000` is what the platform routes to. Binding to `127.0.0.1`, or to another port, leaves the endpoint unreachable even though the instance is healthy.
:::

Launch the template. Model weights are downloaded on first start, so a large model can take several minutes before the endpoint answers. Until then requests fail — watch the instance logs in JupyterLab if you want to see progress.

Step-by-step instructions with screenshots are in [Model APIs](/radeon-cloud-docs/guides/model-apis/#dedicated-endpoints).

## Calling it

Identical to a shared endpoint, with your own base URL and the model name you served:

```bash
curl https://<host>/spaces/<instance-id>/8000/v1/chat/completions \
  -H "Authorization: Bearer $RADEON_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "Qwen/Qwen2.5-7B-Instruct",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

```python
from openai import OpenAI

client = OpenAI(
    base_url="https://<host>/spaces/<instance-id>/8000/v1",
    api_key="rc-...",
)
```

The `model` value must match what you passed to `vllm serve`, not a name from the shared catalog.

## What's available

Requests are forwarded to vLLM or SGLang with the routing prefix stripped, so the endpoint surface is whatever your server implements. For vLLM that typically includes:

| Path | Purpose |
|---|---|
| `/v1/models` | The model you served |
| `/v1/chat/completions` | Chat |
| `/v1/completions` | Legacy text completion |
| `/v1/embeddings` | Embeddings, for embedding models |

This is wider than the shared endpoints, which are limited to chat completions and model listing. Consult your serving stack's own documentation for the exact set and for version-specific parameters.

## Access control

Your key, your instance. The platform checks three things: the key resolves to the instance's owner, the instance is an API-serving type, and the port matches the one the instance actually serves. A request that fails any of these gets `403`.

Your browser session also works, which is how you can open the endpoint in a browser tab while signed in.

There's no way to hand a dedicated endpoint to someone else — issuing a key that a third party can use isn't supported. If you need to expose a service publicly, build it into the instance and use [rc-tunnel](/radeon-cloud-docs/guides/tunnel/) instead, with your own authentication in front.

## Cost and lifecycle

The endpoint lives exactly as long as the instance. Credits are consumed the whole time, whether or not requests arrive, and the URL stops working the moment the instance is destroyed. A new launch produces a new instance ID and therefore a new base URL — treat it as configuration, not a constant.
