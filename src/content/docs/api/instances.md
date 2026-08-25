---
title: Instances
description: Launch, inspect, and destroy GPU instances programmatically.
sidebar:
  order: 7
---

Each account can have one active instance at a time. These endpoints launch it, poll it, and tear it down.

## Launch an instance

<div class="rc-endpoint">
  <span class="rc-method" data-m="POST">POST</span>
  <span class="rc-path">/api/notebook/request</span>
  <span class="rc-auth">Session or API key</span>
</div>

Returns as soon as allocation begins — it does not wait for the instance to be ready. Poll [status](#check-status) until `ready` is `true`.

| Parameter | Type | | Description |
|---|---|---|---|
| `image` | string | <span class="rc-opt">Optional</span> | Container image. Must be enabled in the catalog. Defaults to the platform default image. |
| `instance_type` | string | <span class="rc-opt">Optional</span> | `jupyter`, `gradio`, `streamlit`, `comfyui`, `vllm`, `sglang`, `opencode`, or `custom`. Defaults to `jupyter`. |
| `gpu_count` | integer | <span class="rc-opt">Optional</span> | `1`, `2`, or `4`. Defaults to `1`. |
| `disk_size_gb` | integer | <span class="rc-opt">Optional</span> | From 100 GB up to the ceiling for the GPU count: 100 for 1 GPU, 150 for 2, 200 for 4. |
| `resource_profile` | string | <span class="rc-opt">Optional</span> | Named CPU and memory profile. Defaults to `auto`. |
| `launch_verification_token` | string | <span class="rc-opt">Optional</span> | Required only when the account has launch verification enabled. |

```bash
curl -X POST https://radeon-global.anruicloud.com/api/notebook/request \
  -H "Authorization: Bearer $RADEON_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"instance_type": "jupyter", "gpu_count": 1, "disk_size_gb": 100}'
```

```json
{
  "status": "allocating",
  "message": "Allocating resources for your instance...",
  "email": "you@example.com"
}
```

Rejected with `400` when the GPU count isn't 1, 2, or 4; the disk size is outside the allowed range; the image or instance type is unknown or disabled; you already have an active instance; or your credit balance is below the requested GPU count.

## Check status

<div class="rc-endpoint">
  <span class="rc-method" data-m="GET">GET</span>
  <span class="rc-path">/api/notebook/status</span>
  <span class="rc-auth">Session or API key</span>
</div>

No parameters — it reports on the calling account's instance.

```json
{
  "status": "ready",
  "ready": true,
  "message": "Your workspace is ready",
  "instance_id": "u-1042-9c3f8ab1",
  "instance_type": "jupyter",
  "url": "https://radeon-global.anruicloud.com/instances/u-1042-9c3f8ab1/",
  "app_port": 8888,
  "ssh_host": "ssh.anruicloud.com",
  "ssh_port": 32014,
  "ssh_username": "root",
  "ssh_command": "ssh root@ssh.anruicloud.com -p 32014",
  "api_base_url": null,
  "api_key": null,
  "api_model": null
}
```

### Fields

| Field | Description |
|---|---|
| `status` | `not_found`, `allocating`, `loading`, `initializing`, `pending`, `jupyter_starting`, `running`, `ready`, `failed`, or `unknown`. |
| `ready` | `true` only when the instance is fully usable. Gate on this, not on `status`. |
| `message` | Human-readable progress or failure text. |
| `instance_id` | Identifier, of the form `u-<user>-<hash>`. Appears in URLs. |
| `url` | Where to open the instance in a browser. Requires a session cookie. |
| `phase`, `reason`, `detail` | Lower-level scheduling state. Useful when a launch is stuck. |
| `ssh_host`, `ssh_port`, `ssh_username`, `ssh_command` | Populated once the container is running, if SSH was enabled on the template. |
| `api_base_url`, `api_key`, `api_model` | Populated only for `vllm` and `sglang` instances that are ready. This is where a [dedicated endpoint](/radeon-cloud-docs/api/dedicated-endpoints/) URL comes from. |

Poll every few seconds. A cold start pulling a large image, or a vLLM instance downloading weights, can take several minutes.

## Destroy the instance

<div class="rc-endpoint">
  <span class="rc-method" data-m="DELETE">DELETE</span>
  <span class="rc-path">/api/notebook/current</span>
  <span class="rc-auth">Session or API key</span>
</div>

```json
{
  "success": true,
  "message": "Instance destroyed",
  "destroyed_count": 1
}
```

Returns `success: false` with `"No active instance found"` if there was nothing to destroy — this is not an error, and calling it twice is safe.

Data is deleted with the instance unless the template used persistent storage.

## A launch-and-wait loop

```python
import time, requests

BASE = "https://radeon-global.anruicloud.com"
H = {"Authorization": f"Bearer {KEY}"}

requests.post(f"{BASE}/api/notebook/request", headers=H,
              json={"instance_type": "jupyter", "gpu_count": 1}).raise_for_status()

while True:
    s = requests.get(f"{BASE}/api/notebook/status", headers=H).json()
    if s["ready"]:
        print("ready:", s["url"])
        break
    if s["status"] == "failed":
        raise RuntimeError(s.get("message", "launch failed"))
    print(s["status"], s.get("message", ""))
    time.sleep(5)
```

Always destroy in a `finally` block. An instance left running by a crashed script keeps spending credits.
