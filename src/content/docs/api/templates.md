---
title: Templates
description: The endpoints behind the Gallery and the model service templates.
sidebar:
  order: 9
---

A template stores a launch configuration: an image, an instance type, a startup command and, optionally, a fixed resource pool and size. The [Gallery](/radeon-cloud-docs/guides/gallery/) and the ready-made templates under **Deploy type: Model API** on **Home** are templates.

Except for browsing public templates, these endpoints accept only a browser session. Paths are relative to your site's console address.

## Browse public templates

<div class="rc-endpoint">
  <span class="rc-method" data-m="GET">GET</span>
  <span class="rc-path">/api/templates</span>
  <span class="rc-auth">None, API key or session</span>
</div>

Returns published templates. With an API key or a session, it also returns your own private templates.

## List model service templates

<div class="rc-endpoint">
  <span class="rc-method" data-m="GET">GET</span>
  <span class="rc-path">/api/inference/templates</span>
  <span class="rc-auth">Session</span>
</div>

Returns the public vLLM templates that **Deploy type → Model API** offers, each with the command it runs and the size it needs.

```json
{
  "templates": [
    {
      "id": 412,
      "title": "MiniCPM5-2B",
      "description": "...",
      "model_source": "modelscope",
      "start_command": "vllm serve OpenBMB/MiniCPM5-2B --host 0.0.0.0 --port 8000 --served-model-name MiniCPM5-2B",
      "pod_type": "one-click",
      "resource_template": "resource-16c55g1u",
      "gpu_count": 1
    }
  ]
}
```

## Launch a template

<div class="rc-endpoint">
  <span class="rc-method" data-m="POST">POST</span>
  <span class="rc-path">/api/templates/<b>{template_id}</b>/launch</span>
  <span class="rc-auth">Session</span>
</div>

The console sends an empty body. A template with a fixed pool and size launches on that size.

| Field | Type | | Description |
|---|---|---|---|
| `gpu_count` | integer | <span class="rc-opt">Optional</span> | Only for templates without a fixed size. Defaults to `1`. |
| `ssh_enabled` | boolean | <span class="rc-opt">Optional</span> | Turn on SSH for this launch. |

Only `jupyter` and `vllm` templates can be launched. The response and the follow-up calls are the same as for any other launch: poll [`GET /api/notebook/status`](/radeon-cloud-docs/api/instances/#check-status), or `GET /api/inference/current` for a `vllm` template.

Launches are rate limited per IP address. Going over returns `429` with a `Retry-After` header.

## Manage your templates

| Method | Path | Does |
|---|---|---|
| `GET` | `/api/profile/templates` | Lists your templates and the images you can pick. |
| `POST` | `/api/profile/templates` | Creates a template. |
| `PUT` | `/api/profile/templates/{template_id}` | Replaces a template. Same body as creating. |
| `DELETE` | `/api/profile/templates/{template_id}` | Deletes a template. |

The main fields:

| Field | Type | | Description |
|---|---|---|---|
| `title` | string | <span class="rc-req">Required</span> | Display name. |
| `image` | string | <span class="rc-req">Required</span> | An image from the catalog. |
| `instance_type` | string | <span class="rc-opt">Optional</span> | `jupyter` or `vllm`. Other types can be saved but can't be launched. |
| `start_command` | string | <span class="rc-opt">Optional</span> | Command run at startup. Required for `vllm`. |
| `model_source` | string | <span class="rc-opt">Optional</span> | `huggingface` or `modelscope`, for `vllm`. |
| `pod_type`, `resource_template` | string | <span class="rc-opt">Optional</span> | A fixed pool and size. Send both or neither. |
| `use_pvc` | boolean | <span class="rc-opt">Optional</span> | Launch with your persistent `/workspace`. |
| `description`, `category`, `tags`, `cover_url` | | <span class="rc-opt">Optional</span> | How the template appears in the Gallery. |
| `repo_url`, `branch`, `notebook_path` | string | <span class="rc-opt">Optional</span> | A Git repository to clone and a notebook to open on start. |
| `enabled` | boolean | <span class="rc-opt">Optional</span> | Publish to everyone. Only editors can publish; for everyone else it's forced to `false`. |

Changing or deleting a template doesn't affect an instance already running from it.
