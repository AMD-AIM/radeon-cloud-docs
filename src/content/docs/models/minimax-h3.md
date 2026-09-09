---
title: MiniMax-H3
description: MiniMax's open video model, generating picture and sound in one pass — the only video model on this endpoint.
sidebar:
  order: 6
---

<div class="rc-endpoint">
  <span class="rc-method" data-m="POST">POST</span>
  <span class="rc-path">/v1/videos</span>
  <span class="rc-auth">model: <code>MiniMax-H3</code></span>
</div>

The only video model here, and the only model on this endpoint that is not called through
[`/v1/chat/completions`](/radeon-cloud-docs/api/chat-completions/). Read
[Video generation](/radeon-cloud-docs/api/videos/) first — it is an asynchronous job API.

:::caution[Not generally available yet]
This model is not open on the public base URL yet — calls return `404 model_not_found`. The
behaviour documented below is measured and settled; only availability is pending.
:::

## Specification

The weights served here are **`MiniMaxAI/MiniMax-H3`**.

| | |
|---|---|
| Task | text-to-video with joint audio |
| Frame rate | 24 fps |
| Duration | 4–15 s |
| Output | MP4, H.264 video + AAC audio |
| Licence | MiniMax H3 Community License |
| Stability | `experimental` |

H3 generates picture and sound in the same pass rather than dubbing a silent clip afterwards. The
audio track is real stereo — measured on a sample clip, the left and right channels differ.

## On this endpoint

### At a glance

| | |
|---|---|
| Price | **$0.08 per second** of requested output |
| `seconds` | 4–15, integer |
| `size` | any accepted value; aspect ratio is what reaches the model |
| `audio` | always produced |
| Streaming | ❌ — job API |
| Tool calling / JSON output | ❌ — not a chat model |

### `seconds` is clamped, not validated

Ask for less than 4 or more than 15 and the request still succeeds: the value is clamped into
`[4, 15]`. It is not an error and nothing in the response tells you it happened. If you care about
the exact length, send a value already inside the range.

Omitting `seconds` is rejected by the gateway before the model sees it — the field is required.

### You get slightly more video than you asked for

The model works in frames, and the frame count is rounded **up** to the next value of the form
`17n + 5` at 24 fps. Only 8 seconds lands exactly:

| `seconds` | Frames | Actual clip |
|---:|---:|---:|
| 4 | 107 | 4.458 s |
| 6 | 158 | 6.583 s |
| 8 | 192 | 8.000 s |
| 10 | 243 | 10.125 s |
| 15 | 362 | 15.083 s |

Billing uses the `seconds` you requested, so the rounding is in your favour — a 4-second job is
charged 4 seconds and returns 4.458 seconds of video.

### `size` sets the shape, not the pixel count

The gateway accepts any size from its
[list](/radeon-cloud-docs/api/videos/#request-fields), but what reaches the model is the aspect
ratio, not the exact `widthxheight`. Treat `size` as "landscape 16:9" or "portrait 9:16" rather than
as an exact output geometry, and read the real dimensions from the returned file.

### How long it takes

A 4-second clip took **307 s and 326 s** on two consecutive runs, measured end to end from create to
downloaded file. Generation time is dominated by the model rather than by clip length, so asking for
a shorter clip does not make it proportionally faster.

Concurrent jobs queue rather than run side by side — submitting several at once adds their
wall-clock times together.

### Audio

`audio` defaults to `true` and H3 has no silent mode — the model produces a soundtrack as part of
generation. Sending `"audio": false` does not give you a silent clip; strip the track yourself if
you need one.

## Minimal example

```bash
ID=$(curl -s https://developer.amd.com.cn/radeon/api/v1/videos \
  -H "Authorization: Bearer $RADEON_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model":"MiniMax-H3","prompt":"a paper lantern rising over a quiet harbour at dusk","seconds":4}' \
  | python3 -c 'import json,sys; print(json.load(sys.stdin)["id"])')

until [ "$(curl -s "https://developer.amd.com.cn/radeon/api/v1/videos/$ID" \
  -H "Authorization: Bearer $RADEON_API_KEY" \
  | python3 -c 'import json,sys; print(json.load(sys.stdin)["status"])')" = completed ]; do
  sleep 30
done

curl -sL "https://developer.amd.com.cn/radeon/api/v1/videos/$ID/content" \
  -H "Authorization: Bearer $RADEON_API_KEY" -o clip.mp4
```
