---
title: Troubleshooting
description: Fixes for the problems that come up most often.
sidebar:
  order: 1
---

## Instances

### "No matching Node has enough free CPU, memory, and GPUs for this launch"

The launch dialog shows **Launch failed** with this message when every node in the selected resource pool is busy. No instance is created and no credits are spent.

1. Turn on **Customize** in the launch form and pick another **Resource pool**, if your account has more than one.
2. Or choose a smaller **Size**.
3. Or try again later.

If your account has only one pool and the launch keeps failing, email [member-service@mail.developer.amd.com.cn](mailto:member-service@mail.developer.amd.com.cn) with the time of the attempts.

### The instance never becomes ready

Open **View logs** in the launch dialog. The first launch of an image on a node, or a Model API instance downloading model weights, can take several minutes.

If the dialog shows **Waiting for a free GPU**, the launch is queued until a node has room. Keep waiting, or cancel and choose a smaller size or another pool. If it shows **Image pull failed**, try again, then pick another image.

### The launch is rejected

**You already have an instance running.** means your account has an instance; destroy it first. If your credits are below the hourly rate of the size you picked, the launch is refused; see [Credits](/radeon-cloud-docs/guides/credits/). If the console can't load your sizes and pools, it shows **Resource catalog is unavailable. Try again.**; refresh the page.

### The instance stopped by itself

Instances have a maximum lifetime, are reclaimed after a period with no activity, and are deleted when your credits run out. Save checkpoints to a persistent `/workspace` so a stop doesn't cost you the run.

### My files are gone

Only files under `/workspace` are kept, and only when the instance was launched with **Persistent /workspace** storage. The 25 GB and 100 GB options are separate volumes, so also check that you launched with the same capacity as before. Storage can't be changed on a running instance. See [Keep your data](/radeon-cloud-docs/guides/storage/).

## SSH

### Connection refused

Check these in order:

1. Does the instance card still say **Setting up SSH — do not connect yet**? Wait until it shows the SSH command.
2. Are you using the command from the current instance card? The host and port change with every launch.
3. Does the card say **SSH could not be set up**? Then SSH isn't available on this instance. If you need it, start an SSH server from a JupyterLab terminal:

```bash
sudo apt update && sudo apt install -y openssh-server
mkdir -p /run/sshd && /usr/sbin/sshd
```

### Permission denied (publickey)

None of the keys in **Settings → SSH keys** matches the private key you're offering. Check the list, then say which key to use:

```bash
ssh -i ~/.ssh/id_ed25519 -p <port> <user>@<host>
```

A key added after the instance launched isn't installed in it. Destroy the instance and launch again.

### "Remote host identification has changed"

A new instance can reuse an earlier instance's host and port with a new host key. Remove the old entry with the `ssh-keygen -R` command shown on the instance card, then connect again.

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
