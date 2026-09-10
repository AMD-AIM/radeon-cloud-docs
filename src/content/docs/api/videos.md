---
title: Video generation
description: Create a video from a prompt, poll it, then download the MP4 — an asynchronous job API.
sidebar:
  order: 6
---

Video generation is a **job API**, not a request/response one. A single clip occupies a GPU for
minutes, so `POST` returns immediately with an id and you poll for the result.

:::caution[Not generally available yet]
`MiniMax-H3` is not in the model list on the public base URL yet, so calls return
`404 model_not_found`. The behaviour documented below is measured and settled;
only availability is pending.
:::

<div class="rc-endpoint">
  <span class="rc-method" data-m="POST">POST</span>
  <span class="rc-path">/v1/videos</span>
  <span class="rc-auth">creates a job</span>
</div>

<div class="rc-endpoint">
  <span class="rc-method" data-m="GET">GET</span>
  <span class="rc-path">/v1/videos/{id}</span>
  <span class="rc-auth">polls it</span>
</div>

<div class="rc-endpoint">
  <span class="rc-method" data-m="GET">GET</span>
  <span class="rc-path">/v1/videos/{id}/content</span>
  <span class="rc-auth">downloads the MP4</span>
</div>

Models are listed on [Model reference](/radeon-cloud-docs/models/overview/). Video models do **not**
appear in [`GET /v1/models`](/radeon-cloud-docs/api/models/) — that catalog covers the chat endpoint.

## Create a job

```bash
curl https://developer.amd.com.cn/radeon/api/v1/videos \
  -H "Authorization: Bearer $RADEON_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "MiniMax-H3",
    "prompt": "a paper lantern rising over a quiet harbour at dusk",
    "seconds": 4
  }'
```

```json
{
  "id": "07iJ62oyjZurRPccpAMe",
  "object": "video",
  "model": "MiniMax-H3",
  "status": "queued",
  "progress": 0,
  "created_at": 1788956431,
  "completed_at": null,
  "expires_at": null,
  "error": null
}
```

### Request fields

| Field | Type | Notes |
|---|---|---|
| `model` | string | Required in practice. See [Model reference](/radeon-cloud-docs/models/overview/). |
| `prompt` | string | Required, non-empty. |
| `seconds` | integer | **Required.** Accepted range is per model. |
| `size` | string | `widthxheight`. Defaults to `1280x720`. |
| `audio` | boolean | Defaults to **`true`**. Whether the model honours `false` is per model. |
| `image` / `input_reference` | object | First-frame or reference image. HTTPS URL or base64 data URL. |
| `last_frame` | object | Ending frame, for first/last-frame generation. |
| `callback_url` | string | Gateway extension. Signed webhook on terminal state. |
| `callback_secret` | string | Gateway extension. HMAC-SHA256 secret for the webhook. |

Accepted `size` values:

`848x480` `854x480` `480x854` `1280x720` `720x1280` `1366x768` `768x1366` `1696x960`
`1920x1080` `1080x1920` `1792x1024` `1024x1792` `3840x2160` `2160x3840`

A model may support only a subset. When it does not support the combination you asked for, the
request fails at creation with `400` and the message names the constraint that rejected it.

## Poll the job

```bash
curl https://developer.amd.com.cn/radeon/api/v1/videos/07iJ62oyjZurRPccpAMe \
  -H "Authorization: Bearer $RADEON_API_KEY"
```

`status` moves `queued` → `in_progress` → `completed`, or `failed`. `progress` is coarse — measured
runs reported `50` for the whole denoise and `100` on completion, so drive your UI off `status`, not
off `progress` advancing smoothly.

Poll every 20–40 seconds. Generation takes minutes; polling faster buys nothing.

## Download the result

```bash
curl -L https://developer.amd.com.cn/radeon/api/v1/videos/07iJ62oyjZurRPccpAMe/content \
  -H "Authorization: Bearer $RADEON_API_KEY" \
  -o clip.mp4
```

Returns the bytes with `Content-Type: video/mp4`. Only valid once `status` is `completed`.

## Billing

Video is billed **per second of requested output**, not per token and not per request. The charge
uses the `seconds` you asked for, so a job created with `"seconds": 4` is billed for 4 seconds even
when the model rounds the clip up to satisfy its own frame alignment.

Per-second prices are on each model's page. The charge lands on the usage record when the job
reaches a terminal state, not at creation.

## Errors

| Status | Meaning |
|---|---|
| `400` | Unsupported model, or a parameter combination the model rejects — the message names which. |
| `404` | Unknown job id, or the job has expired. |
| `502` | The upstream accepted the request then failed; `error` on the job carries the reason. |

A job that fails after creation still returns `200` from the create call — check `status`.
