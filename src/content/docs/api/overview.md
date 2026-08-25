---
title: API overview
description: Base URLs, conventions, and what the AMD Radeon Cloud API exposes.
sidebar:
  order: 1
---

The AMD Radeon Cloud API has two halves that are useful to keep separate in your head.

**The Model API** is OpenAI-compatible and authenticated with a bearer token. This is what your application calls to run inference.

**The Platform API** manages templates, instances, and your account. It's what the console calls, and you can drive it yourself to script launches and teardowns.

## Base URLs

| Surface | Base URL |
|---|---|
| Model API — shared | `https://developer.amd.com.cn/radeon/api/v1` |
| Model API — dedicated | `https://<host>/spaces/<instance-id>/<port>/v1` |
| Platform API | `https://radeon-global.anruicloud.com` |

The dedicated base URL is generated when the instance starts and is shown in the launch dialog and under **Active Instance**. Don't construct it by hand — the port depends on the serving stack (8000 for vLLM, 30000 for SGLang).

:::note[Deployments differ]
AMD Radeon Cloud runs behind more than one hostname. The values above are the public ones at the time of writing; always prefer the base URL the console gives you over a hard-coded string.
:::

## Conventions

Requests and responses are JSON, `Content-Type: application/json`. Timestamps are ISO 8601. Errors carry a non-2xx status and a JSON body — see [Errors](/radeon-cloud-docs/api/errors/).

The Model API mirrors OpenAI's schema exactly, including streaming over server-sent events, because requests are proxied to the serving backend without rewriting. If a parameter works against OpenAI, it very likely works here.

## What the Model API exposes

Shared endpoints support two operations:

- [`POST /v1/chat/completions`](/radeon-cloud-docs/api/chat-completions/)
- [`GET /v1/models`](/radeon-cloud-docs/api/models/)

Legacy completions, embeddings, and image endpoints are **not** available on shared endpoints.

[Dedicated endpoints](/radeon-cloud-docs/api/dedicated-endpoints/) pass through to vLLM or SGLang directly, so they expose whatever that server does — usually including `/v1/completions` and `/v1/embeddings`.

## What the Platform API exposes

| Area | Reference |
|---|---|
| Launch, inspect, destroy instances | [Instances](/radeon-cloud-docs/api/instances/) |
| Create and manage templates | [Templates](/radeon-cloud-docs/api/templates/) |
| Profile, API key, SSH key, credits | [Account](/radeon-cloud-docs/api/account/) |
| Model API consumption and quota | [Usage](/radeon-cloud-docs/api/usage/) |

## Getting started

Read [Authentication](/radeon-cloud-docs/api/authentication/) next — the two halves authenticate differently, and that trips people up more than anything else in this API.
