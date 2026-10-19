---
title: Model service endpoints
description: The base URL, authentication, available paths and lifecycle of a model service on your own instance.
---

A model service is vLLM running on your own GPU instance, launched with **Deploy type: Model API**, with the platform routing a URL to it. It isn't part of Token Factory. To deploy one, see [Serve a model](/radeon-cloud-docs/guides/serve-model/).

## Base URL and key

When the instance is ready, the **OpenAI-compatible endpoint** card in the launch dialog and on **Home** shows the **Base URL**, the **Model** name and the **API key** for the endpoint. Use those values; don't assemble the URL yourself.

On the China site the base URL has this form:

```text
https://jupyter.anruicloud.com/inference/<instance-id>/v1
```

Other deployments can use a different form. The card always shows the right one.

The API key starts with `sk-` and is created for each launch. It isn't your Token Factory `rc-` key, so use the key from the card.

Under **Quickstart**, the card also has a curl command with these values filled in.

## Calling the endpoint

It works like Token Factory, with your own base URL, key and model name:

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

The `model` value must be the name vLLM serves (`--served-model-name`), not a name from Token Factory.

## Available endpoints

Requests are forwarded to vLLM with the routing prefix removed, so the endpoint offers whatever your vLLM server offers. That usually includes:

| Path | Purpose |
|---|---|
| `/v1/models` | The model you served |
| `/v1/chat/completions` | Chat |
| `/v1/completions` | Text completion |
| `/v1/embeddings` | Embeddings, for embedding models |

Token Factory's request filtering, rate limits and error format don't apply here. Errors come from vLLM itself. See vLLM's documentation for the exact set of paths and parameters in your version.

## Access control

Only the owner of the instance can call the endpoint. A request with the wrong key, or one for an instance that isn't serving a model, gets `403`. While the instance is still starting, requests get `503`.

You can't share an endpoint with someone else. To make a service public, run it in the instance and use [rc-tunnel](/radeon-cloud-docs/guides/tunnel/) with your own authentication in front.

## Cost and lifecycle

The endpoint exists only while the instance runs. The instance spends credits every hour, whether or not requests arrive, and the endpoint stops working as soon as the instance is destroyed.

Each launch gets a new API key, and the base URL changes when the instance ID does, for example when you launch in another resource pool. Copy both from the card after each launch, and keep them in configuration rather than in code.
