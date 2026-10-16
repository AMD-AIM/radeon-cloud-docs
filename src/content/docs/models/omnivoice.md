---
title: OmniVoice
description: Text-to-speech — turns text into an audio file, on the OpenAI-compatible speech endpoint.
sidebar:
  order: 11
---

<div class="rc-endpoint">
  <span class="rc-method" data-m="POST">POST</span>
  <span class="rc-path">/v1/audio/speech</span>
  <span class="rc-auth">model: <code>OmniVoice</code></span>
</div>

:::caution[This model is not on `/v1/chat/completions`]
OmniVoice answers on `POST /v1/audio/speech` and returns audio bytes, not JSON. `messages`,
`tools`, `max_tokens` and `stream` do not apply.
:::

:::danger[Non-commercial use only]
The OmniVoice model weights are licensed CC-BY-NC, so the audio may not be used commercially.
Its audio tokenizer is Boson AI's Higgs Audio 2 (see [License](#license)).
:::

## At a glance

| | |
|---|---|
| Endpoint | `POST /v1/audio/speech` |
| Input | text, 1–4,096 characters |
| Output | one audio file, 24 kHz mono: `wav` (default), `mp3`, `opus`, `flac` or `pcm` |
| Streaming | ❌ — the whole file arrives in one response |
| Voice | a preset, a free-text description, or a cloned reference clip |
| Billing | per input character |
| Stability | `experimental` |

## Request

| Field | | |
|---|---|---|
| `model` | required | `OmniVoice` |
| `input` | required | the text to speak, 1–4,096 characters |
| `voice` | optional | a preset, see below. Default `auto` |
| `instructions` | optional | describe the voice in words, up to 512 characters, e.g. `"male, low pitch, british accent"`. Takes precedence over `voice` |
| `response_format` | optional | `wav` (default), `mp3`, `opus`, `flac`, `pcm` |
| `speed` | optional | 0.25–4.0 |
| `language` | optional | a language code such as `en` or `zh`; omit it to let the model decide from the text |
| `ref_audio` | optional | a voice to clone: base64 or a `data:` URL of a WAV, FLAC, OGG or MP3 clip, at most 30 s (3–10 s works best) |
| `ref_text` | optional | the transcript of `ref_audio` |
| `duration` | optional | target length of the output in seconds, up to 600 |
| `num_step` | optional | diffusion steps, 1–64. Fewer is faster and rougher |
| `seed` | optional | the same seed with the same request returns identical audio |

Presets for `voice`: `auto`, `female`, `male`, `female-low`, `male-low`, `female-british`,
`male-british`, `female-american`, `male-american`. OpenAI voice names such as `alloy` are
rejected with `unsupported_voice`.

:::note[A preset fixes a style, not a speaker]
`voice` and `instructions` describe what the voice should sound like, so two requests with the
same preset can come back as two different-sounding people. For one consistent voice across
requests, send the same `ref_audio`, or pin `seed`.
:::

### Cloning a voice

Send a short clip in `ref_audio` and leave out `voice` and `instructions` — combining them is a
`400` (`invalid_parameters`). Include `ref_text`: without it the clip is transcribed first, which
in our tests took about 17 s instead of 4 s. The whole request body must stay under 5 MB.

Only clone a voice you have the right to use.

## Response

The body is the audio file itself. `Content-Type` follows `response_format`:

| `response_format` | `Content-Type` | |
|---|---|---|
| `wav` | `audio/wav` | 16-bit PCM |
| `mp3` | `audio/mpeg` | |
| `opus` | `audio/ogg` | Opus in an Ogg container |
| `flac` | `audio/flac` | |
| `pcm` | `audio/pcm` | raw 16-bit little-endian samples, 24 kHz mono, no header |

Errors are JSON in the usual shape, with these codes:

| Status | `code` | Cause |
|---|---|---|
| 400 | `invalid_parameters` | `input` empty or over 4,096 characters, `ref_audio` combined with `voice`/`instructions`, or `ref_text` without `ref_audio` |
| 400 | `unsupported_voice` | `voice` is not one of the presets |
| 400 | `unsupported_response_format` | e.g. `aac` |
| 400 | `invalid_ref_audio` | the clip cannot be decoded, is empty, or is longer than 30 s |
| 400 | `unsupported_stream_format` | `stream_format: "sse"` was sent |
| 503 | `server_busy` | too many requests queued; retry after a short wait |

## Example

```bash
curl https://developer.amd.com.cn/radeon/api/v1/audio/speech \
  -H "Authorization: Bearer $RADEON_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "OmniVoice",
    "input": "Hello from Radeon Cloud.",
    "voice": "female",
    "response_format": "mp3"
  }' \
  -o speech.mp3
```

Cloning a voice from `sample.wav`:

```python
import base64, requests

ref = base64.b64encode(open("sample.wav", "rb").read()).decode()
r = requests.post(
    "https://developer.amd.com.cn/radeon/api/v1/audio/speech",
    headers={"Authorization": f"Bearer {API_KEY}"},
    json={
        "model": "OmniVoice",
        "input": "This sentence is spoken in the voice from the clip.",
        "ref_audio": f"data:audio/wav;base64,{ref}",
        "ref_text": "The words spoken in sample.wav.",
        "response_format": "wav",
    },
    timeout=120,
)
r.raise_for_status()
open("cloned.wav", "wb").write(r.content)
```

:::note[One file per request, generated in full first]
Nothing is returned until the whole clip has been generated — about 1–4 s for a sentence. Requests
are served one at a time and queue behind each other, so long texts and bursts wait longer.
:::

## License

The OmniVoice code is Apache-2.0 and the model weights are CC-BY-NC (non-commercial). The audio
tokenizer is licensed under the Boson Higgs Audio 2 Community License, which asks us to show:

> Built with Higgs Materials licensed from Boson AI USA, Inc., Copyright Boson AI USA, Inc., All
> Rights Reserved and Meta Llama 3 licensed under the Meta Llama 3 Community License, Copyright Meta
> Platforms, Inc., All Right Reserved. Based on Meta Llama 3.
