---
title: 视频生成
description: 用提示词生成视频，轮询状态，再下载 MP4 —— 一套异步任务接口。
sidebar:
  order: 6
---

视频生成是**任务接口**，不是请求/响应式的。一条片子会占住一张 GPU 好几分钟，所以 `POST`
立刻返回一个任务 id，结果靠轮询取。

:::caution[尚未对外开放]
本端点还没在公网 base URL 上开放，调用会返回 `404 model_not_found`。下面记录的行为都是实测且已稳定的，只差开放。
:::

<div class="rc-endpoint">
  <span class="rc-method" data-m="POST">POST</span>
  <span class="rc-path">/v1/videos</span>
  <span class="rc-auth">创建任务</span>
</div>

<div class="rc-endpoint">
  <span class="rc-method" data-m="GET">GET</span>
  <span class="rc-path">/v1/videos/{id}</span>
  <span class="rc-auth">查询状态</span>
</div>

<div class="rc-endpoint">
  <span class="rc-method" data-m="GET">GET</span>
  <span class="rc-path">/v1/videos/{id}/content</span>
  <span class="rc-auth">下载 MP4</span>
</div>

可用模型见[模型参考](/radeon-cloud-docs/zh-cn/models/overview/)。视频模型**不会**出现在
[`GET /v1/models`](/radeon-cloud-docs/zh-cn/api/models/) 里——那份目录只覆盖聊天端点。

## 创建任务

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

### 请求字段

| 字段 | 类型 | 说明 |
|---|---|---|
| `model` | string | 实际必填。见[模型参考](/radeon-cloud-docs/zh-cn/models/overview/)。 |
| `prompt` | string | 必填，不能为空。 |
| `seconds` | integer | **必填**。取值范围随模型而定。 |
| `size` | string | `宽x高`。默认 `1280x720`。 |
| `audio` | boolean | 默认 **`true`**。是否真的支持 `false` 随模型而定。 |
| `image` / `input_reference` | object | 首帧或参考图。HTTPS URL 或 base64 data URL。 |
| `last_frame` | object | 尾帧，用于首尾帧生成。 |
| `callback_url` | string | 网关扩展。任务进终态后回调，带签名。 |
| `callback_secret` | string | 网关扩展。回调签名用的 HMAC-SHA256 密钥。 |

`size` 接受的取值：

`848x480` `854x480` `480x854` `1280x720` `720x1280` `1366x768` `768x1366` `1696x960`
`1920x1080` `1080x1920` `1792x1024` `1024x1792` `3840x2160` `2160x3840`

具体模型可能只支持其中一部分。参数组合不被支持时，创建阶段就会返回 `400`，错误文案会点名是哪条约束拦下的。

## 轮询状态

```bash
curl https://developer.amd.com.cn/radeon/api/v1/videos/07iJ62oyjZurRPccpAMe \
  -H "Authorization: Bearer $RADEON_API_KEY"
```

`status` 走 `queued` → `in_progress` → `completed`，失败则是 `failed`。`progress` 很粗——实测整个
去噪期间一直是 `50`，完成时才跳 `100`，所以进度条要挂在 `status` 上，别指望 `progress` 平滑增长。

每 20–40 秒轮询一次即可。生成本来就要几分钟，问得更勤没有任何收益。

## 下载结果

```bash
curl -L https://developer.amd.com.cn/radeon/api/v1/videos/07iJ62oyjZurRPccpAMe/content \
  -H "Authorization: Bearer $RADEON_API_KEY" \
  -o clip.mp4
```

返回文件字节流，`Content-Type: video/mp4`。只有 `status` 为 `completed` 时才有效。

## 计费

视频**按请求的输出秒数计费**，既不按 token 也不按次。计费用的是你填的 `seconds`，所以即使模型为了
满足自己的帧对齐把片子拉长，`"seconds": 4` 也只按 4 秒收。

每秒单价见各模型页面。费用在任务进入终态时记账，不是创建时。

## 错误

| 状态码 | 含义 |
|---|---|
| `400` | 模型不支持，或参数组合被模型拒绝——文案会点名是哪一条。 |
| `404` | 任务 id 不存在，或任务已过期。 |
| `502` | 上游收下了请求但执行失败，原因在任务的 `error` 字段里。 |

创建之后才失败的任务，创建那一步仍然返回 `200`——要看 `status`。
