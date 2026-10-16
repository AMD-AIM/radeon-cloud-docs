---
title: Troubleshooting
description: Fixes for the problems that come up most often.
sidebar:
  order: 1
---

## Instances

### The instance never becomes ready

Watch `status` and `message` while polling. A large image being pulled for the first time, or a vLLM instance downloading weights, legitimately takes several minutes.

If it sits in `pending` far longer than that, the cluster may not have capacity for the GPU count you asked for. Try 1 GPU. If it reaches `failed`, the `reason` and `detail` fields carry the scheduling error.

### The launch is rejected

`Each user can only have one active instance` — destroy the existing one first. `Insufficient credits` — your balance is below the GPU count requested. `Invalid image selected` — the image was disabled or removed from the catalog since you created the template.

### The instance stopped by itself

Instances have a maximum lifetime and an idle timeout. Reaching either shuts the instance down. Long jobs should checkpoint to persistent storage so a shutdown doesn't cost you the run.

### My files are gone

Unless the template used **Persistent (PVC)** storage, everything is deleted with the instance. Set storage to persistent on the template and relaunch — the setting can't be added to an instance that already exists.

## SSH

### Connection refused

Check three things in order. Was **SSH Access (advanced)** enabled on the template? It can't be added afterwards. Are you using the host and port from the instance details rather than a previous session's values — both change on every launch. Does the image include an SSH server? If not, start one from a JupyterLab terminal:

```bash
sudo apt update && sudo apt install -y openssh-server
mkdir -p /run/sshd && /usr/sbin/sshd
```

### Permission denied (publickey)

The public key on your Profile doesn't match the private key you're offering. Confirm what's registered, then be explicit about which key to use:

```bash
ssh -i ~/.ssh/id_ed25519 <user>@<host> -p <port>
```

Remember that a key added after the instance launched isn't installed in it. Relaunch.

## Model APIs

### 401 on every request

Check the header is exactly `Authorization: Bearer rc-...`. Then check the key is current — rotating a key invalidates the previous one instantly, so a service still holding the old value fails until redeployed.

If your account hasn't cleared verification, no key is issued at all.

### 429

You've hit a rate limit. The `code` field names which one; `Retry-After` says how long to wait. See [Rate limits](/radeon-cloud-docs/api/rate-limits/).

Sustained `429`s mean your workload is bigger than the shared allowance, and the fix is a [dedicated endpoint](/radeon-cloud-docs/api/dedicated-endpoints/) rather than more retries.

### A model that used to work returns 404

The shared catalog changes as models are added and retired. Resolve names at runtime with [`GET /v1/models`](/radeon-cloud-docs/api/models/) instead of hard-coding them.

### A dedicated endpoint doesn't respond

Confirm the serve command binds correctly — `--host 0.0.0.0 --port 8000` is what the platform routes to, and binding to `127.0.0.1` leaves the endpoint unreachable while the instance looks healthy.

Confirm the model finished loading. Check the instance logs from a JupyterLab terminal.

Confirm you're using the current base URL. Every relaunch produces a new instance ID and therefore a new URL.

Confirm the `model` field matches what you passed to `vllm serve`, not a name from the shared catalog.

## GPU

### rocm-smi shows nothing, or PyTorch can't see the GPU

```bash
rocm-smi
python -c "import torch; print(torch.cuda.is_available(), torch.version.hip)"
```

If `torch.version.hip` is `None`, the environment has a CUDA build of PyTorch installed rather than a ROCm one — a common outcome of `pip install torch` overwriting the image's build. Reinstall from the ROCm index, or use a fresh instance from a ROCm image and avoid reinstalling torch.

On some consumer Radeon parts, ROCm needs an explicit architecture override:

```bash
export HSA_OVERRIDE_GFX_VERSION=11.0.0
```

## Tunnels

### The install script fails

If it reports a missing identity directory or `FRP_BROKER_URL`, the notebook was created before the feature was enabled. Destroy it and create a new one. Don't try to write platform keys by hand.

### The public URL doesn't work

Work outward from the service. `curl --fail http://127.0.0.1:<port>/` inside the notebook — if that fails, the problem is your application, not the tunnel. Then `rc-tunnel status`, and `rc-tunnel logs --lines 100` if it isn't running.

If the local service works and status is healthy but the public URL still fails, email [member-service@mail.developer.amd.com.cn](mailto:member-service@mail.developer.amd.com.cn) with the full domain, when the notebook was created, and when the failure happened. Don't send config files or keys.

## Credits and coupons

### A coupon won't redeem

Paste the whole string. A coupon from the developer program is long and encrypted, and a partial copy fails. Coupons expire 30 days after you exchange points for them, and each one works once. Make sure you're on the site you want the credits on, because credits don't move between sites. See [AMD AI Developer Program](/radeon-cloud-docs/guides/developer-program/#if-redemption-fails).

### A `DP-` code didn't add credits

`DP-XXXX-XXXX-XXXX` codes add developer points, not credits. Redeem them on the [point-code page](https://developer.amd.com.cn/points/devpoints), then exchange the points for a coupon on [兑取算力](https://developer.amd.com.cn/points/redeem).

## Still stuck

Email [member-service@mail.developer.amd.com.cn](mailto:member-service@mail.developer.amd.com.cn) and include:

- the site (China or Global) and the account email
- what you ran or clicked, and what you expected to happen
- the exact error text, plus the time it happened
- for an instance, the instance ID and template name

Don't include API keys, `rcc_` tokens, private SSH keys, or one-time JupyterLab links. Send a coupon string only when the email is about that coupon.
