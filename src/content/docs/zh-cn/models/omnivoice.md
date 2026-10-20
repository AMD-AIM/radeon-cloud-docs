---
title: OmniVoice
description: 语音合成：把文本转成音频文件，使用兼容 OpenAI 的语音接口。
sidebar:
  order: 14
---

<div class="rc-endpoint">
  <span class="rc-method" data-m="POST">POST</span>
  <span class="rc-path">/v1/audio/speech</span>
  <span class="rc-auth">model: <code>OmniVoice</code></span>
</div>

:::caution[这个模型不在 `/v1/chat/completions` 上]
OmniVoice 在 `POST /v1/audio/speech` 上应答，返回的是音频字节而不是 JSON。`messages`、
`tools`、`max_tokens`、`stream` 都不适用。
:::

:::danger[仅限非商业用途]
OmniVoice 的模型权重采用 CC-BY-NC 许可，生成的音频不得用于商业用途。
它的音频 tokenizer 是 Boson AI 的 Higgs Audio 2（见[许可证](#许可证)）。
:::

## 概览

| | |
|---|---|
| 端点 | `POST /v1/audio/speech` |
| 输入 | 文本，1–4,096 个字符 |
| 输出 | 一个音频文件，24 kHz 单声道：`wav`（默认）、`mp3`、`opus`、`flac` 或 `pcm` |
| 流式 | ❌ —— 整个文件在一次响应里返回 |
| 音色 | 预设音色、文字描述，或用一段参考音频克隆 |
| 计费 | 按输入字符数；卡片上的输入单价按每百万字符计 |
| 稳定性 | `experimental` |

## 请求

| 字段 | | |
|---|---|---|
| `model` | 必填 | `OmniVoice` |
| `input` | 必填 | 要朗读的文本，1–4,096 个字符 |
| `voice` | 可选 | 预设音色，见下文。默认 `auto` |
| `instructions` | 可选 | 用文字描述音色，最多 512 个字符，例如 `"male, low pitch, british accent"`。优先于 `voice` |
| `response_format` | 可选 | `wav`（默认）、`mp3`、`opus`、`flac`、`pcm` |
| `speed` | 可选 | 0.25–4.0 |
| `language` | 可选 | 语言代码，如 `en`、`zh`；不传则由模型根据文本判断 |
| `ref_audio` | 可选 | 要克隆的音色：WAV、FLAC、OGG 或 MP3 片段的 base64 或 `data:` URL，最长 30 秒（3–10 秒效果最好） |
| `ref_text` | 可选 | `ref_audio` 的文字稿 |
| `duration` | 可选 | 输出音频的目标时长（秒），最多 600 |
| `num_step` | 可选 | 扩散步数，1–64。越少越快、越粗糙 |
| `seed` | 可选 | 同样的请求加同样的 seed，返回完全相同的音频 |

`voice` 的预设：`auto`、`female`、`male`、`female-low`、`male-low`、`female-british`、
`male-british`、`female-american`、`male-american`。`alloy` 这类 OpenAI 音色名会以
`unsupported_voice` 拒绝。

:::note[预设固定的是风格，不是某一个人]
`voice` 和 `instructions` 描述的是"听起来什么样"，所以同一个预设的两次请求可能是两个不同的人声。
要在多次请求间保持同一个声音，请发送同一段 `ref_audio`，或者固定 `seed`。
:::

### 克隆音色

在 `ref_audio` 里放一段短音频，同时不要传 `voice` 和 `instructions`——两者同时出现会返回 `400`
（`invalid_parameters`）。请带上 `ref_text`：不带的话会先对参考音频做一次转写，
我们实测耗时从约 4 秒变成约 17 秒。整个请求体须小于 5 MB。

只克隆你有权使用的声音。

## 响应

响应体就是音频文件本身，`Content-Type` 随 `response_format` 而定：

| `response_format` | `Content-Type` | |
|---|---|---|
| `wav` | `audio/wav` | 16 位 PCM |
| `mp3` | `audio/mpeg` | |
| `opus` | `audio/ogg` | Ogg 封装的 Opus |
| `flac` | `audio/flac` | |
| `pcm` | `audio/pcm` | 裸 16 位小端采样，24 kHz 单声道，无文件头 |

出错时返回常规形状的 JSON，`code` 如下：

| 状态码 | `code` | 原因 |
|---|---|---|
| 400 | `invalid_parameters` | `input` 为空或超过 4,096 个字符；`ref_audio` 与 `voice`/`instructions` 同时出现；或只给了 `ref_text` 没给 `ref_audio` |
| 400 | `unsupported_voice` | `voice` 不是预设之一 |
| 400 | `unsupported_response_format` | 例如 `aac` |
| 400 | `invalid_ref_audio` | 参考音频无法解码、为空或超过 30 秒 |
| 400 | `unsupported_stream_format` | 传了 `stream_format: "sse"` |
| 503 | `server_busy` | 排队的请求太多，稍等后重试 |

## 示例

```bash
curl https://developer.amd.com.cn/radeon/api/v1/audio/speech \
  -H "Authorization: Bearer $RADEON_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "OmniVoice",
    "input": "你好，欢迎使用 Radeon Cloud。",
    "voice": "female",
    "response_format": "mp3"
  }' \
  -o speech.mp3
```

用 `sample.wav` 克隆音色：

```python
import base64, requests

ref = base64.b64encode(open("sample.wav", "rb").read()).decode()
r = requests.post(
    "https://developer.amd.com.cn/radeon/api/v1/audio/speech",
    headers={"Authorization": f"Bearer {API_KEY}"},
    json={
        "model": "OmniVoice",
        "input": "这句话会用参考音频里的声音读出来。",
        "ref_audio": f"data:audio/wav;base64,{ref}",
        "ref_text": "sample.wav 里说的那句话。",
        "response_format": "wav",
    },
    timeout=120,
)
r.raise_for_status()
open("cloned.wav", "wb").write(r.content)
```

:::note[一次一个文件，先完整生成再返回]
整段音频生成完之前不会返回任何内容，一句话大约 1–4 秒。请求逐个处理、依次排队，
所以长文本和突发请求要等得更久。
:::

## 许可证

OmniVoice 代码为 Apache-2.0，模型权重为 CC-BY-NC（非商业）。音频 tokenizer 采用
Boson Higgs Audio 2 Community License，该许可要求我们展示：

> Built with Higgs Materials licensed from Boson AI USA, Inc., Copyright Boson AI USA, Inc., All
> Rights Reserved and Meta Llama 3 licensed under the Meta Llama 3 Community License, Copyright Meta
> Platforms, Inc., All Right Reserved. Based on Meta Llama 3.
