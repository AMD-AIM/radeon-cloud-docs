---
title: API overview
description: Base URLs, conventions, and what the AMD Radeon Cloud API exposes.
sidebar:
  order: 1
---

The AMD Radeon Cloud API has two halves that are useful to keep separate in your head.

**The Model API** runs inference. It comes in two forms, which the console names
**Public Free Model APIs** and **Dedicated Model APIs**. They share a key and an HTTP shape and
almost nothing else — different hosts, different gates, different error bodies — so the
reference documents them separately and every page says which one it is about.

**The Platform API** manages templates, instances, and your account. It's what the console calls, and you can drive it yourself to script launches and teardowns.

## Base URLs

| Surface | Base URL |
|---|---|
| Public Free Model APIs | `https://developer.amd.com.cn/radeon/api/v1` |
| Dedicated Model APIs | `https://<host>/spaces/<instance-id>/<port>/v1` |
| Platform API | `https://radeon-global.anruicloud.com` |

The dedicated base URL is generated when the instance starts and is shown in the launch dialog and under **Active Instance**. Don't construct it by hand — the port depends on the serving stack (8000 for vLLM, 30000 for SGLang).

:::note[Deployments differ]
AMD Radeon Cloud runs behind more than one hostname. The values above are the public ones at the time of writing; always prefer the base URL the console gives you over a hard-coded string.
:::

## Conventions

Requests and responses are JSON, `Content-Type: application/json`. Timestamps are ISO 8601. Errors carry a non-2xx status and a JSON body — see [Errors](/radeon-cloud-docs/api/errors/).

## Public Free Model APIs

Always on, no instance, no credits. AMD picks which models are served. Four operations:

- [`POST /v1/chat/completions`](/radeon-cloud-docs/api/chat-completions/) — OpenAI-compatible
- [`GET /v1/models`](/radeon-cloud-docs/api/models/)
- [`POST /v1/messages`](/radeon-cloud-docs/api/messages/) — Anthropic-compatible, for clients such as Claude Code
- [`POST /v1/messages/count_tokens`](/radeon-cloud-docs/api/messages/#counting-tokens) — the token-count preflight those clients issue

Every path is also reachable under `/api/v1/...`; the two spellings are the same endpoint.

Legacy completions, embeddings, image, audio, rerank, and `/v1/responses` endpoints are **not**
served here, and return `404`.

These requests pass through a gateway. The body is validated against a fixed set of fields and
rebuilt before it reaches the serving backend, so a parameter outside that set is dropped
rather than forwarded — see [chat completions](/radeon-cloud-docs/api/chat-completions/) for
the accepted list. Per-key rate limits, a concurrency allowance and a spend cap all apply; see
[Rate limits](/radeon-cloud-docs/api/rate-limits/).

## Dedicated Model APIs

vLLM or SGLang running on an instance you launched and pay credits for. You choose the model
and the serving flags.

Requests are proxied to your server with the routing prefix stripped and nothing else changed,
so the surface is whatever your server implements — usually including `/v1/completions` and
`/v1/embeddings`, and none of the shared endpoints' parameter filtering. There is no gateway in
front, so the shared rate limits, the shared catalog and the shared error bodies do not apply
either.

See [Dedicated endpoints](/radeon-cloud-docs/api/dedicated-endpoints/).

## What the Platform API exposes

| Area | Reference |
|---|---|
| Launch, inspect, destroy instances | [Instances](/radeon-cloud-docs/api/instances/) |
| Create and manage templates | [Templates](/radeon-cloud-docs/api/templates/) |
| Profile, API key, SSH key, credits | [Account](/radeon-cloud-docs/api/account/) |
| Model API consumption and quota | [Usage](/radeon-cloud-docs/api/usage/) |

## Getting started

Read [Authentication](/radeon-cloud-docs/api/authentication/) next — the two halves authenticate differently, and that trips people up more than anything else in this API.
