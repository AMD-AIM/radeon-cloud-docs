---
title: MinerU2.5-Pro
description: Document OCR — turns a PDF or an image into Markdown, on its own endpoint.
sidebar:
  order: 10
---

<div class="rc-endpoint">
  <span class="rc-method" data-m="POST">POST</span>
  <span class="rc-path">/v1/ocr</span>
  <span class="rc-auth">model: <code>MinerU2.5-Pro</code></span>
</div>

:::caution[This model is not on `/v1/chat/completions`]
MinerU has its own endpoint and its own request body. `messages`, `tools`, `response_format`,
`reasoning_effort` and `stream` do not apply.
:::

## At a glance

| | |
|---|---|
| Endpoint | `POST /v1/ocr` |
| Input | a PDF or an image, by URL or `data:` URL |
| Output | Markdown, one entry per page |
| Streaming | ❌ |
| Billing | per page, reported as `usage_info.pages_processed` |
| Stability | `experimental` |

## Request

| Field | | |
|---|---|---|
| `model` | required | `MinerU2.5-Pro` |
| `document` | required | the PDF or image |
| `pages` | optional | page indices (`[0, 1, 2]`) or a range string (`"0-5"`) |
| `include_image_base64` | optional | return extracted images inline as base64 |
| `image_limit` | optional | cap on how many images are extracted |
| `image_min_size` | optional | ignore images smaller than this |
| `id` | optional | your own identifier, echoed back |

`document` takes one of two shapes:

```json
{ "type": "document_url", "document_url": "https://arxiv.org/pdf/2201.04234" }
```

```json
{ "type": "image_url", "image_url": "data:image/png;base64,…" }
```

`document_url` also accepts a `data:` URL. For `image_url`, both a bare string and
`{"url": "…"}` are accepted.

## Response

```json
{
  "pages": [
    {
      "index": 0,
      "markdown": "Invoice No. 7412\n\nTotal: 1,286.50 CNY\n\nDate: 2026-09-15",
      "images": [],
      "dimensions": { "width": 230, "height": 79, "dpi": null }
    }
  ],
  "model": "MinerU2.5-Pro",
  "document_annotation": null,
  "usage_info": { "pages_processed": 1, "doc_size_bytes": 4524 }
}
```

| Field | |
|---|---|
| `pages[].index` | zero-based page number |
| `pages[].markdown` | the page as Markdown |
| `pages[].images` | extracted figures; base64 only with `include_image_base64` |
| `usage_info.pages_processed` | pages billed |

## Example

```bash
curl https://developer.amd.com.cn/radeon/api/v1/ocr \
  -H "Authorization: Bearer $RADEON_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "MinerU2.5-Pro",
    "document": {
      "type": "document_url",
      "document_url": "https://arxiv.org/pdf/2201.04234"
    },
    "pages": "0-2"
  }'
```

:::note[Long documents hold the connection open]
Nothing is returned until the whole document has been parsed. Set a generous client timeout.
:::
