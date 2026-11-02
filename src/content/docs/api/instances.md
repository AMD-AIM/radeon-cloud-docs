---
title: Instances
description: The endpoints the console uses to launch, check and destroy instances.
sidebar:
  order: 8
---

These are the endpoints the console calls when you launch, watch and destroy an instance. They accept only a browser session, not an API key. To script instances, use [Radeon Cloud CLI](/radeon-cloud-docs/cli/automation/).

Paths are relative to your site's console address, for example `https://developer.amd.com.cn/radeon`. Each account can have one instance at a time, so none of these endpoints take an instance ID.

| Task | Notebook | Model service |
|---|---|---|
| Launch | `POST /api/notebook/request` | `POST /api/inference` or `POST /api/templates/{id}/launch` |
| Check status | `GET /api/notebook/status` | `GET /api/inference/current` |
| Read logs | `GET /api/notebook/logs` | `GET /api/inference/current/logs` |
| Destroy | `DELETE /api/notebook/current` | `DELETE /api/inference/current` |

## Choose resources

A launch names a resource pool and a size. Both come from `GET /api/me/resource-labels`, which lists what your account may use:

- entries with `"category": "resource-pool"` are pools; send the `id` as `pod_type`
- entries with `"category": "resource-template"` are sizes; send the `id` as `resource_template`

For example, `pod_type: "one-click"` with `resource_template: "resource-16c55g1u"` is 1 GPU, 16 cores and 55 GB of memory. Accounts that have pools and sizes assigned must send both fields and must not send `gpu_count`.

## Launch a notebook

<div class="rc-endpoint">
  <span class="rc-method" data-m="POST">POST</span>
  <span class="rc-path">/api/notebook/request</span>
  <span class="rc-auth">Session</span>
</div>

| Field | Type | | Description |
|---|---|---|---|
| `pod_type` | string | <span class="rc-req">Required</span> | Resource pool ID. |
| `resource_template` | string | <span class="rc-req">Required</span> | Size ID. |
| `image` | string | <span class="rc-opt">Optional</span> | An image from the catalog. Defaults to the platform default, **AMD OneClick Base**. |
| `instance_type` | string | <span class="rc-opt">Optional</span> | Must be `jupyter`, the default. |
| `use_pvc` | boolean | <span class="rc-opt">Optional</span> | `true` mounts your persistent `/workspace`. Default `false`, a temporary workspace. |
| `pvc_size` | string | <span class="rc-opt">Optional</span> | `25GB` or `100GB`, with `use_pvc: true`. 100 GB is offered only to some accounts. |
| `model_mount` | string | <span class="rc-opt">Optional</span> | A model to mount read-only. `GET /api/models/mountable` lists the IDs, each with the `mount_path` it appears at, usually `/models`. |
| `ssh_enabled` | boolean | <span class="rc-opt">Optional</span> | The console always sends `true`. Requires an SSH key in **Settings**. |
| `max_runtime_hours` | number | <span class="rc-opt">Optional</span> | **Auto-delete** lifetime after the instance is ready. The console sends `2`, `8`, `24`, `72`, or `168`; the form default is `72` (3 days). Omit it and the pool maximum applies (`168` / 7 days on one-click). |

```json
{
  "pod_type": "one-click",
  "resource_template": "resource-16c55g1u",
  "instance_type": "jupyter",
  "use_pvc": true,
  "pvc_size": "25GB",
  "ssh_enabled": true
}
```

The call returns as soon as the launch is accepted; it doesn't wait for the instance. Poll [status](#check-status) until `ready` is `true`.

The launch is refused when:

- you already have an instance (`400`, `Each user can only have one active instance`), or the previous one is still being deleted (`409`)
- your credits don't cover one hour on the chosen size (`400`, `Insufficient credits`). Only the Global site checks this up front. On the China site, the instance is deleted once an hour can't be charged.
- `instance_type` isn't `jupyter` (`400`, `unsupported_deploy_type`)
- the pool or size isn't assigned to your account (`403`, `resource_selection_not_assigned`)

## Launch a model service

To serve your own model (**Deploy type: Model API**), send the model name and the vLLM command:

<div class="rc-endpoint">
  <span class="rc-method" data-m="POST">POST</span>
  <span class="rc-path">/api/inference</span>
  <span class="rc-auth">Session</span>
</div>

| Field | Type | | Description |
|---|---|---|---|
| `api_model` | string | <span class="rc-req">Required</span> | The name clients send as `model`. Use the same value as `--served-model-name` in the command. |
| `start_command` | string | <span class="rc-req">Required</span> | A `vllm serve` command listening on port `8000`. |
| `model_source` | string | <span class="rc-opt">Optional</span> | `huggingface` (default) or `modelscope`. |
| `pod_type`, `resource_template` | string | <span class="rc-req">Required</span> | As for a notebook. |
| `max_runtime_hours` | number | <span class="rc-opt">Optional</span> | **Auto-delete** lifetime after the instance is ready. Same values as a notebook launch. |

```json
{
  "api_model": "MiniCPM5-2B",
  "model_source": "modelscope",
  "start_command": "vllm serve OpenBMB/MiniCPM5-2B --host 0.0.0.0 --port 8000 --served-model-name MiniCPM5-2B",
  "pod_type": "one-click",
  "resource_template": "resource-16c55g1u"
}
```

Unknown fields are rejected. To launch one of the ready-made model templates instead, list them with `GET /api/inference/templates` and call `POST /api/templates/{id}/launch`. See [Templates](/radeon-cloud-docs/api/templates/#launch-a-template).

## Check status

<div class="rc-endpoint">
  <span class="rc-method" data-m="GET">GET</span>
  <span class="rc-path">/api/notebook/status</span>
  <span class="rc-auth">Session</span>
</div>

For a model service, call `GET /api/inference/current`. It returns the same fields plus runtime and credit details.

```json
{
  "status": "ready",
  "ready": true,
  "message": "Your workspace is ready",
  "instance_id": "<instance-id>",
  "instance_type": "jupyter",
  "url": "https://developer.amd.com.cn/radeon/instances/<instance-id>/",
  "ssh_host": "<ssh-host>",
  "ssh_port": 32014,
  "ssh_username": "root",
  "ssh_command": "ssh root@<ssh-host> -p 32014",
  "api_base_url": null,
  "api_key": null,
  "api_model": null
}
```

| Field | Description |
|---|---|
| `ready` | `true` only when the instance is usable. Wait on this, not on `status`. |
| `status`, `message` | Progress or failure, for display. `failed` means the launch won't recover. |
| `phase`, `reason`, `detail`, `error_code` | Lower-level scheduling state. Useful when a launch is stuck. |
| `instance_id` | Appears in the instance's URLs. It can stay the same across launches, but read it from here rather than storing it. |
| `url` | Opens JupyterLab in a signed-in browser. |
| `ssh_host`, `ssh_port`, `ssh_username`, `ssh_command` | Filled in once the container is running. |
| `persistent_available`, `storage_notice` | Whether the persistent `/workspace` was mounted, and why not if it wasn't. |
| `api_base_url`, `api_key`, `api_model` | Filled in for a ready model service. See [Model service endpoints](/radeon-cloud-docs/api/model-services/). |
| `auto_reclaim_hours`, `auto_reclaim_at` | The **Auto-delete** lifetime in hours, and when it will be deleted. Present after a launch that has a lifetime. |

Poll every few seconds. A launch is usually ready within a minute, but a large image or a model download can take several minutes.

## Read logs

<div class="rc-endpoint">
  <span class="rc-method" data-m="GET">GET</span>
  <span class="rc-path">/api/notebook/logs</span>
  <span class="rc-auth">Session</span>
</div>

Returns scheduling events and container output for the current instance. This is what **View logs** shows in the console. For a model service, call `GET /api/inference/current/logs`.

## Destroy the instance

<div class="rc-endpoint">
  <span class="rc-method" data-m="DELETE">DELETE</span>
  <span class="rc-path">/api/notebook/current</span>
  <span class="rc-auth">Session</span>
</div>

For a model service, call `DELETE /api/inference/current`.

```json
{
  "success": true,
  "message": "Instance <instance-id> destroyed",
  "destroyed_count": 1
}
```

If there's nothing to destroy, the response has `success: false` and `"No active instance found"`. This isn't an error, so it's safe to call twice.

Files in a temporary workspace are deleted with the instance. A persistent `/workspace` is kept. See [Keep your data](/radeon-cloud-docs/guides/storage/).
