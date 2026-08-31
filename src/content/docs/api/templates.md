---
title: Templates
description: Create, update, and launch templates through the API.
sidebar:
  order: 9
---

Templates hold the configuration an instance launches from. See [Create a template](/radeon-cloud-docs/guides/templates/) for what the fields mean in practice.

## List templates

<div class="rc-endpoint">
  <span class="rc-method" data-m="GET">GET</span>
  <span class="rc-path">/api/profile/templates</span>
  <span class="rc-auth">Session or API key</span>
</div>

Returns your templates and the container images you can choose from.

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

## Create a template

<div class="rc-endpoint">
  <span class="rc-method" data-m="POST">POST</span>
  <span class="rc-path">/api/profile/templates</span>
  <span class="rc-auth">Session or API key</span>
</div>

| Parameter | Type | | Description |
|---|---|---|---|
| `title` | string | <span class="rc-req">Required</span> | Display name. |
| `image` | string | <span class="rc-req">Required</span> | Container image, from the catalog. |
| `instance_type` | string | <span class="rc-opt">Optional</span> | `jupyter`, `gradio`, `streamlit`, `comfyui`, `vllm`, `sglang`, `custom`. |
| `description` | string | <span class="rc-opt">Optional</span> | Longer description. |
| `slug` | string | <span class="rc-opt">Optional</span> | URL-friendly identifier. |
| `category` | string | <span class="rc-opt">Optional</span> | Grouping label. |
| `tags` | array | <span class="rc-opt">Optional</span> | Free-form tags. |
| `repo_url` | string | <span class="rc-opt">Optional</span> | Git repository cloned on start. |
| `branch` | string | <span class="rc-opt">Optional</span> | Branch to check out. Defaults to `main`. |
| `notebook_path` | string | <span class="rc-opt">Optional</span> | Notebook to open on start. |
| `start_command` | string | <span class="rc-opt">Optional</span> | Command run at startup. Required for `vllm` and `sglang`. |
| `app_port` | integer | <span class="rc-opt">Optional</span> | Port the app serves on. Must be one the platform routes: `7860` Gradio, `8501` Streamlit, `8188` ComfyUI, `8000` vLLM, `30000` SGLang. |
| `ssh_enabled` | boolean | <span class="rc-opt">Optional</span> | Allow SSH into instances from this template. Defaults to `false`. |
| `cover_url` | string | <span class="rc-opt">Optional</span> | Cover image URL. |
| `sort_order` | integer | <span class="rc-opt">Optional</span> | Position in your list. |
| `enabled` | boolean | <span class="rc-opt">Optional</span> | Publish publicly. Requires editor permission; forced to `false` otherwise. |

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

An `app_port` outside the routable set is rejected with `400`.

## Update a template

<div class="rc-endpoint">
  <span class="rc-method" data-m="PUT">PUT</span>
  <span class="rc-path">/api/profile/templates/<b>{template_id}</b></span>
  <span class="rc-auth">Session or API key</span>
</div>

Same body as creation. `404` if the template doesn't exist or isn't yours.

Changes apply to future launches. A running instance keeps the configuration it started with.

## Delete a template

<div class="rc-endpoint">
  <span class="rc-method" data-m="DELETE">DELETE</span>
  <span class="rc-path">/api/profile/templates/<b>{template_id}</b></span>
  <span class="rc-auth">Session or API key</span>
</div>

```json
{ "success": true }
```

Deleting a template doesn't affect an instance already running from it.

## Launch a template

<div class="rc-endpoint">
  <span class="rc-method" data-m="POST">POST</span>
  <span class="rc-path">/api/templates/<b>{template_id}</b>/launch</span>
  <span class="rc-auth">Session or API key</span>
</div>

| Parameter | Type | | Description |
|---|---|---|---|
| `gpu_count` | integer | <span class="rc-opt">Optional</span> | `1`, `2`, or `4`. Defaults to `1`. |
| `launch_verification_token` | string | <span class="rc-opt">Optional</span> | Required only when the account has launch verification enabled. |

Returns the same status object as [`POST /api/notebook/request`](/radeon-cloud-docs/api/instances/#launch-an-instance). Poll `GET /api/notebook/status` from there.

Launches are rate limited to roughly one per minute, three per ten minutes, and five per hour. Exceeding that returns `429` with a `Retry-After` header.

## Browse public templates

<div class="rc-endpoint">
  <span class="rc-method" data-m="GET">GET</span>
  <span class="rc-path">/api/templates</span>
  <span class="rc-auth">None; more with a credential</span>
</div>

Returns published templates. Authenticated callers also see their own private ones. Useful for finding a starting point without creating anything.
