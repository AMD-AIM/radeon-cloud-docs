---
title: API overview
description: Base URLs, credentials and what each part of the AMD Radeon Cloud API covers.
sidebar:
  order: 1
---

The AMD Radeon Cloud API has three parts:

- **Model APIs** run inference. There are two kinds, **shared model APIs** and **dedicated model APIs**. Both speak the OpenAI API, but they run on different hosts, enforce different limits and return different error bodies. Each page in this reference says which one it describes.
- **CLI endpoints** are what [Radeon Cloud CLI](/radeon-cloud-docs/cli/overview/) calls. Use the CLI to script instances.
- **The Platform API** serves the web console: instances, templates and your account. It accepts only a browser session.

## Base URLs

| API | Base URL |
|---|---|
| Shared model APIs | `https://developer.amd.com.cn/radeon/api/v1` (China site only) |
| Dedicated model APIs | Shown on the instance card, for example `https://jupyter.anruicloud.com/inference/<instance-id>/v1` |
| Platform API | `https://developer.amd.com.cn/radeon` or `https://radeon-global.anruicloud.com` |

The shared model APIs and Token Factory are available on the China site only.

A dedicated model API's base URL and key are shown on the instance card once it's ready. Copy them from there instead of building the URL yourself.

:::note[Prefer what the console shows]
These are the public addresses at the time of writing. If the console or Token Factory shows a different base URL, use that one.
:::

## Credentials

Model APIs take an API key, the CLI uses its own `rcc_` token, and the Platform API takes a browser session. See [Authentication](/radeon-cloud-docs/api/authentication/).

## Conventions

Requests and responses are JSON with `Content-Type: application/json`. Timestamps are ISO 8601. Errors have a non-2xx status and a JSON body. See [Errors](/radeon-cloud-docs/api/errors/).

## Shared model APIs

Always on, nothing to launch, and no credits spent. AMD chooses which models are served. The main operations:

- [`POST /v1/chat/completions`](/radeon-cloud-docs/api/chat-completions/): OpenAI-compatible chat
- [`GET /v1/models`](/radeon-cloud-docs/api/models/): the models you can call
- [`POST /v1/messages`](/radeon-cloud-docs/api/messages/): Anthropic-compatible, for clients such as Claude Code
- [`POST /v1/messages/count_tokens`](/radeon-cloud-docs/api/messages/#counting-tokens): the token count those clients ask for first
- [`GET /v1/usage`](/radeon-cloud-docs/api/usage/): your usage and remaining daily allowance

Some models use other paths under `/v1`, such as `/v1/audio/speech` for speech or `/v1/ocr` for document parsing. Each model's page in the [model catalog](/radeon-cloud-docs/models/overview/) lists the paths it uses. A path that no model serves returns `404`.

Every path works with and without the `/api` prefix: `/api/v1/models` and `/v1/models` are the same endpoint.

Requests go through a gateway that checks them against a fixed set of fields, so a parameter outside that set is dropped rather than passed on. See [Chat completions](/radeon-cloud-docs/api/chat-completions/) for the list. Per-key rate limits, a concurrency allowance and a daily usage cap apply. See [Rate limits](/radeon-cloud-docs/api/rate-limits/).

## Dedicated model APIs

vLLM running on an instance you launch with **Deploy type → Model API**. You choose the model and the serving flags, and the instance spends credits while it runs.

Requests are passed to your server unchanged, apart from the routing prefix. Whatever vLLM serves is available, usually including `/v1/completions` and `/v1/embeddings`. There's no gateway in front, so the shared rate limits, model list and error bodies don't apply.

See [Dedicated endpoints](/radeon-cloud-docs/api/dedicated-endpoints/).

## Platform API

| Area | Reference |
|---|---|
| Launch, check and destroy instances | [Instances](/radeon-cloud-docs/api/instances/) |
| Gallery and Model API templates | [Templates](/radeon-cloud-docs/api/templates/) |
| Profile, resources, SSH keys, coupons | [Account](/radeon-cloud-docs/api/account/) |

## Next steps

Read [Authentication](/radeon-cloud-docs/api/authentication/) next. Sending the wrong credential is the most common cause of errors.
