---
title: 模板
description: 通过 API 创建、更新和启动模板。
sidebar:
  order: 8
---

模板保存实例启动所依据的配置。这些字段在实际用起来是什么意思，见[创建模板](/radeon-cloud-docs/zh-cn/guides/templates/)。

## 列出模板

<div class="rc-endpoint">
  <span class="rc-method" data-m="GET">GET</span>
  <span class="rc-path">/api/profile/templates</span>
  <span class="rc-auth">会话或 API 密钥</span>
</div>

返回你的模板，以及你可以选的容器镜像。

```json
{
  "templates": [
    {
      "id": 87,
      "title": "ROCm PyTorch dev",
      "slug": "rocm-pytorch-dev",
      "image": "rocm/pytorch:latest",
      "instance_type": "jupyter",
      "ssh_enabled": true,
      "enabled": false,
      "sort_order": 0
    }
  ],
  "images": [
    { "name": "ROCm PyTorch", "image": "rocm/pytorch:latest", "enabled": true }
  ]
}
```

## 创建模板

<div class="rc-endpoint">
  <span class="rc-method" data-m="POST">POST</span>
  <span class="rc-path">/api/profile/templates</span>
  <span class="rc-auth">会话或 API 密钥</span>
</div>

| 参数 | 类型 | | 说明 |
|---|---|---|---|
| `title` | string | <span class="rc-req">必填</span> | 显示名称。 |
| `image` | string | <span class="rc-req">必填</span> | 容器镜像，从目录里选。 |
| `instance_type` | string | <span class="rc-opt">选填</span> | `jupyter`、`gradio`、`streamlit`、`comfyui`、`vllm`、`sglang`、`custom`。 |
| `description` | string | <span class="rc-opt">选填</span> | 更长的描述。 |
| `slug` | string | <span class="rc-opt">选填</span> | 适合放进 URL 的标识符。 |
| `category` | string | <span class="rc-opt">选填</span> | 分组标签。 |
| `tags` | array | <span class="rc-opt">选填</span> | 自由填写的标签。 |
| `repo_url` | string | <span class="rc-opt">选填</span> | 启动时克隆的 Git 仓库。 |
| `branch` | string | <span class="rc-opt">选填</span> | 要检出的分支。默认 `main`。 |
| `notebook_path` | string | <span class="rc-opt">选填</span> | 启动时打开的 notebook。 |
| `start_command` | string | <span class="rc-opt">选填</span> | 启动时执行的命令。`vllm` 和 `sglang` 必填。 |
| `app_port` | integer | <span class="rc-opt">选填</span> | 应用服务的端口。必须是平台会路由的那几个：Gradio `7860`、Streamlit `8501`、ComfyUI `8188`、vLLM `8000`、SGLang `30000`。 |
| `ssh_enabled` | boolean | <span class="rc-opt">选填</span> | 允许 SSH 进入由此模板启动的实例。默认 `false`。 |
| `cover_url` | string | <span class="rc-opt">选填</span> | 封面图 URL。 |
| `sort_order` | integer | <span class="rc-opt">选填</span> | 在你列表里的位置。 |
| `enabled` | boolean | <span class="rc-opt">选填</span> | 公开发布。需要编辑权限，否则强制为 `false`。 |

```bash
curl -X POST https://radeon-global.anruicloud.com/api/profile/templates \
  -H "Authorization: Bearer $RADEON_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Qwen 7B on vLLM",
    "image": "rocm/vllm:latest",
    "instance_type": "vllm",
    "start_command": "vllm serve Qwen/Qwen2.5-7B-Instruct --host 0.0.0.0 --port 8000",
    "app_port": 8000
  }'
```

`app_port` 不在可路由的集合里会被 `400` 拒绝。

## 更新模板

<div class="rc-endpoint">
  <span class="rc-method" data-m="PUT">PUT</span>
  <span class="rc-path">/api/profile/templates/<b>{template_id}</b></span>
  <span class="rc-auth">会话或 API 密钥</span>
</div>

请求体和创建时一样。模板不存在或者不是你的，返回 `404`。

改动对之后的启动生效。已经在跑的实例仍用它启动时的配置。

## 删除模板

<div class="rc-endpoint">
  <span class="rc-method" data-m="DELETE">DELETE</span>
  <span class="rc-path">/api/profile/templates/<b>{template_id}</b></span>
  <span class="rc-auth">会话或 API 密钥</span>
</div>

```json
{ "success": true }
```

删掉模板不影响已经从它启动的实例。

## 启动模板

<div class="rc-endpoint">
  <span class="rc-method" data-m="POST">POST</span>
  <span class="rc-path">/api/templates/<b>{template_id}</b>/launch</span>
  <span class="rc-auth">会话或 API 密钥</span>
</div>

| 参数 | 类型 | | 说明 |
|---|---|---|---|
| `gpu_count` | integer | <span class="rc-opt">选填</span> | `1`、`2` 或 `4`。默认 `1`。 |
| `launch_verification_token` | string | <span class="rc-opt">选填</span> | 仅在账户开启了启动验证时需要。 |

返回和 [`POST /api/notebook/request`](/radeon-cloud-docs/zh-cn/api/instances/#启动实例) 一样的状态对象。之后轮询 `GET /api/notebook/status`。

启动有限流，大致是每分钟一次、每十分钟三次、每小时五次。超了返回 `429`，并带 `Retry-After` 头。

## 浏览公开模板

<div class="rc-endpoint">
  <span class="rc-method" data-m="GET">GET</span>
  <span class="rc-path">/api/templates</span>
  <span class="rc-auth">无需凭据；带凭据能看到更多</span>
</div>

返回已发布的模板。带认证的调用方还能看到自己的私有模板。想找个起点又不想先建东西时很好用。
