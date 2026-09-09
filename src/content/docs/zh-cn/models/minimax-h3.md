---
title: MiniMax-H3
description: MiniMax 的开源视频模型，画面和声音一次生成 —— 本端点上唯一的视频模型。
sidebar:
  order: 6
---

<div class="rc-endpoint">
  <span class="rc-method" data-m="POST">POST</span>
  <span class="rc-path">/v1/videos</span>
  <span class="rc-auth">model: <code>MiniMax-H3</code></span>
</div>

这里唯一的视频模型，也是本端点上唯一不走
[`/v1/chat/completions`](/radeon-cloud-docs/zh-cn/api/chat-completions/) 的模型。先读
[视频生成](/radeon-cloud-docs/zh-cn/api/videos/)——它是异步任务接口。

:::caution[尚未对外开放]
本模型还没在公网 base URL 上开放，调用会返回 `404 model_not_found`。下面记录的行为都是实测且已稳定的，只差开放。
:::

## 规格

这里跑的权重是 **`MiniMaxAI/MiniMax-H3`**。

| | |
|---|---|
| 任务 | 文生视频，同时生成音频 |
| 帧率 | 24 fps |
| 时长 | 4–15 秒 |
| 输出 | MP4，H.264 视频 + AAC 音频 |
| 许可 | MiniMax H3 Community License |
| 稳定性 | `experimental` |

H3 是在同一次生成里出画面和声音，不是先出无声片再配音。音轨是真立体声——实测样片的左右声道内容不同。

## 在本端点上

### 概览

| | |
|---|---|
| 价格 | **每秒 $0.08**，按请求秒数计 |
| `seconds` | 4–15 的整数 |
| `size` | 接受全部取值；真正传给模型的是画幅比例 |
| `audio` | 一定会生成 |
| 流式 | ❌ —— 任务接口 |
| 工具调用 / JSON 输出 | ❌ —— 不是聊天模型 |

### `seconds` 是夹取，不是校验

填小于 4 或大于 15，请求照样成功：值会被夹进 `[4, 15]`。这不算错误，响应里也没有任何字段告诉你发生过。
在意确切长度的话，就直接填范围内的值。

不填 `seconds` 会在网关层就被拒——这个字段是必填的。

### 拿到的片子会比你要的长一点

模型按帧工作，帧数会**向上**取整到 `17n + 5`（24 fps）。只有 8 秒是刚好对齐的：

| `seconds` | 帧数 | 实际时长 |
|---:|---:|---:|
| 4 | 107 | 4.458 秒 |
| 6 | 158 | 6.583 秒 |
| 8 | 192 | 8.000 秒 |
| 10 | 243 | 10.125 秒 |
| 15 | 362 | 15.083 秒 |

计费按你请求的 `seconds` 算，所以这个取整是算你便宜的——4 秒的任务收 4 秒的钱，返回 4.458 秒的视频。

### `size` 决定画幅，不决定像素数

网关接受它[列表](/radeon-cloud-docs/zh-cn/api/videos/#请求字段)里的任何一档，但真正传到模型的是
画幅比例，不是那个精确的 `宽x高`。把 `size` 当成"横 16:9"或"竖 9:16"来用，实际分辨率从返回的文件里读。

### 要跑多久

一条 4 秒的片子，连续两次实测端到端是 **307 秒和 326 秒**——从创建到文件下载完成。耗时主要由
模型决定，不是由片长决定，所以把片子做得更短并不会等比变快。

多个任务是排队而不是并行——同时投多条，等待时间是累加的。

### 音频

`audio` 默认 `true`，而且 H3 没有静音模式——声音是生成过程的一部分。传 `"audio": false` 并不会给你
无声片；需要无声就自己把音轨去掉。

## 最小示例

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
