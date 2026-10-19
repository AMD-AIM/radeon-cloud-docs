---
title: Model APIs
description: Shared and dedicated model APIs, how they differ, and which one to use.
sidebar:
  label: Overview
---

Radeon Cloud serves models behind an OpenAI-compatible HTTP API. Any OpenAI client, such as `curl`, the `openai` SDK, LangChain or Cherry Studio, works once you change the base URL and the API key.

There are two kinds of model API. The difference is whose GPU runs the model.

| | Shared model APIs | Dedicated model APIs |
|---|---|---|
| Who runs the model | The platform, for everyone | Your own instance |
| Which models | The models in [Token Factory](https://developer.amd.com.cn/radeon/tokenfactory), chosen by the platform | Any model vLLM can serve that fits your size |
| Cost | Free; a daily usage cap and rate limits apply | Your instance spends credits every hour it runs |
| Setup | None; copy your API key | Launch an instance with **Deploy type: Model API** |
| Endpoints | Chat completions, Anthropic Messages, model list | Whatever your vLLM server exposes, usually also completions and embeddings |
| Availability | Always on | While your instance runs |

## Which one to use

Start with the shared model APIs. They need no setup and cost nothing.

Move to a dedicated model API when you need a model that isn't in Token Factory, want to control the vLLM settings, or need throughput that isn't shared with other users.

- [Call the shared models](/radeon-cloud-docs/guides/shared-models/)
- [Deploy a dedicated model API](/radeon-cloud-docs/guides/dedicated-models/)
- [Model catalog](/radeon-cloud-docs/models/overview/): what each shared model accepts and returns
