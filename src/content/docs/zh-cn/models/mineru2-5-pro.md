---
title: MinerU2.5-Pro
description: 文档 OCR——把 PDF 或图片转成 Markdown，走独立端点。
sidebar:
  order: 10
---

<div class="rc-endpoint">
  <span class="rc-method" data-m="POST">POST</span>
  <span class="rc-path">/v1/ocr</span>
  <span class="rc-auth">model: <code>MinerU2.5-Pro</code></span>
</div>

:::caution[这个模型不在 `/v1/chat/completions` 上]
MinerU 有自己的端点和请求体。`messages`、`tools`、`response_format`、
`reasoning_effort`、`stream` 都不适用。
:::

## 概览

| | |
|---|---|
| 端点 | `POST /v1/ocr` |
| 输入 | PDF 或图片，URL 或 `data:` URL |
| 输出 | Markdown，一页一条 |
| 流式 | ❌ |
| 计费 | 按页，对应 `usage_info.pages_processed` |
| 稳定性 | `experimental` |

## 请求

| 字段 | | |
|---|---|---|
| `model` | 必填 | `MinerU2.5-Pro` |
| `document` | 必填 | 要解析的 PDF 或图片 |
| `pages` | 可选 | 页码数组（`[0, 1, 2]`）或区间字符串（`"0-5"`）|
| `include_image_base64` | 可选 | 把抽出的图片以 base64 内联返回 |
| `image_limit` | 可选 | 最多抽多少张图 |
| `image_min_size` | 可选 | 小于该尺寸的图片忽略 |
| `id` | 可选 | 自定义标识，原样回传 |

`document` 有两种写法：

```json
{ "type": "document_url", "document_url": "https://arxiv.org/pdf/2201.04234" }
```

```json
{ "type": "image_url", "image_url": "data:image/png;base64,…" }
```

`document_url` 也接受 `data:` URL。`image_url` 既可以是裸字符串，也可以是 `{"url": "…"}`。

## 响应

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

| 字段 | |
|---|---|
| `pages[].index` | 从 0 开始的页码 |
| `pages[].markdown` | 该页的 Markdown |
| `pages[].images` | 抽出的插图；带 `include_image_base64` 时才是 base64 |
| `usage_info.pages_processed` | 计费页数 |

## 示例

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

:::note[长文档会一直占着连接]
整份文档解析完之前不会返回任何内容。客户端超时要设宽松些。
:::
