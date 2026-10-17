---
title: Dedicated endpoints
description: The base URL, authentication, available paths and lifecycle of a dedicated model API.
---

A dedicated endpoint is vLLM running on your own instance, with the platform routing a URL to it. To deploy one, see [Deploy a dedicated model API](/radeon-cloud-docs/guides/dedicated-models/).

## Base URL and key

When the instance is ready, the **OpenAI-compatible endpoint** card on **Home** shows the **Base URL**, the **Model** name and the **API key** for the endpoint. Use those values; don't assemble the URL yourself.

On the China site the base URL has this form:

```text
https://developer.amd.com.cn/radeon/spaces/<instance-id>/8000/v1
```

Other deployments can use a different form. The card always shows the right one.

The endpoint's API key can differ from your shared `rc-` key. Use the key from the card.

## Calling the endpoint

It works like a shared endpoint, with your own base URL, key and model name:

```bash
curl <base-url>/chat/completions \
  -H "Authorization: Bearer <api-key>" \
  -H "Content-Type: application/json" \
  -d '{"model":"<model>","messages":[{"role":"user","content":"Hello"}]}'
```

```python
from openai import OpenAI

client = OpenAI(base_url="<base-url>", api_key="<api-key>")
```

The `model` value must be the name vLLM serves (`--served-model-name`), not a name from the shared catalog.

## Available endpoints

Requests are forwarded to vLLM with the routing prefix removed, so the endpoint offers whatever your vLLM server offers. That usually includes:

| Path | Purpose |
|---|---|
| `/v1/models` | The model you served |
| `/v1/chat/completions` | Chat |
| `/v1/completions` | Text completion |
| `/v1/embeddings` | Embeddings, for embedding models |

The shared endpoints' request filtering, rate limits and error format don't apply here. Errors come from vLLM itself. See vLLM's documentation for the exact set of paths and parameters in your version.

## Access control

Only the owner of the instance can call the endpoint. A request with the wrong key, or one for an instance that isn't serving a model, gets `403`. While the instance is still starting, requests get `503`.

You can't share an endpoint with someone else. To make a service public, run it in the instance and use [rc-tunnel](/radeon-cloud-docs/guides/tunnel/) with your own authentication in front.

## Cost and lifecycle

The endpoint exists only while the instance runs. The instance spends credits every hour, whether or not requests arrive, and the endpoint stops working as soon as the instance is destroyed.

The base URL and key can change when you launch again. Read them from the card after each launch, or keep them in configuration rather than in code.
