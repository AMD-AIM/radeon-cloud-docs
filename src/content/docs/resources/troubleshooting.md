---
title: Troubleshooting
description: Find your problem by what you see, and how to fix it.
sidebar:
  order: 1
---

Find the message or behaviour you're seeing, then follow the steps under it.

## Launching

### "No matching Node has enough free CPU, memory, and GPUs for this launch"

The launch dialog shows **Launch failed** with this message when every node in the selected resource pool is busy. No instance is created and no credits are spent.

1. Turn on **Customize** in the launch form and pick another **Resource pool**, if your account has more than one.
2. Or choose a smaller **Size**.
3. Or try again later.

If your account has only one pool and the launch keeps failing, email [member-service@mail.developer.amd.com.cn](mailto:member-service@mail.developer.amd.com.cn) with the times of your attempts.

### The dialog stays on "Waiting for a free GPU"

The launch is queued until a node has room. Keep waiting, or cancel and choose a smaller size or another pool.

### The instance takes several minutes to become ready

Click **View logs** in the launch dialog. The first launch of an image on a node takes longer, because the node downloads the image first. A model service also downloads the model weights.

If the dialog shows **Image pull failed**, try again, then pick another image.

### The Launch button is disabled

The form says why:

- **You already have an instance running.** Each account can have one instance. [Destroy it](/radeon-cloud-docs/guides/destroy/) first.
- **Resource catalog is unavailable. Try again.** Refresh the page.

On the Global site, a launch refused for credits means your balance doesn't cover one hour on the chosen size. See [Credits](/radeon-cloud-docs/guides/credits/).

## Running instances

### The instance was deleted by itself

An instance is deleted when your credits run out, and when the **Auto-delete** time you chose on the launch form has passed. See [Limits that stop an instance](/radeon-cloud-docs/guides/instances/#limits-that-stop-an-instance).

On the China site, an instance is also deleted a minute or two after it becomes ready if your balance can't cover the first hour. Check your balance on **Credits & Usage** before launching again. See [Credits](/radeon-cloud-docs/guides/credits/).

Save checkpoints to a persistent `/workspace` so a stop doesn't cost you the run.

### My files are gone

Only files under `/workspace` are kept, and only when the instance was launched with **Persistent /workspace**. The 25 GB and 100 GB options are separate volumes, so also check that you launched with the same capacity as before. Storage can't be changed on a running instance. See [Keep your data](/radeon-cloud-docs/guides/storage/).

### JupyterLab still shows the instance after I deleted it

A JupyterLab tab doesn't notice that its instance is gone. Close the tab. **Home** shows the real state.

### A model service doesn't respond

For an instance launched with **Deploy type: Model API**:

1. Make sure the command binds to `--host 0.0.0.0 --port 8000`. With `127.0.0.1`, the instance looks healthy but can't be reached.
2. Click **View logs** on the instance card and wait until the model has finished loading.
3. Use the base URL and API key from the current instance card. They can change when you launch again.
4. Send the name from `--served-model-name` as `model`, not a name from Token Factory.

## SSH

### Connection refused

Check these in order:

1. Does the instance card still say **Setting up SSH — do not connect yet**? Wait until it shows the SSH command.
2. Are you using the command from the current instance card? The host and port can change when you launch again.
3. Does the card say **SSH could not be set up**? SSH isn't available on this instance, but JupyterLab still works. Destroy the instance and launch again. If it happens again, email support.

### Permission denied (publickey)

None of the keys in **Settings → SSH keys** matches the private key you're offering. Check the list, then say which key to use:

```bash
ssh -i ~/.ssh/id_ed25519 root@<host> -p <port>
```

A key added after the instance launched isn't installed in it. Destroy the instance and launch again.

### "Remote host identification has changed"

A new instance can reuse an earlier instance's host and port with a new host key. Remove the old entry with the `ssh-keygen -R` command shown on the instance card, then connect again.

## Token Factory

### 401 on every request

Check that the header is exactly `Authorization: Bearer rc-...`, and that the key is current. Regenerating a key stops the old one immediately, so a service still using it fails until you update it.

Accounts that are still under review don't get a key.

If the `401` says `Login required`, you sent an API key to a console endpoint, which takes a browser session. Use [Radeon Cloud CLI](/radeon-cloud-docs/cli/automation/) to script instances.

### 404 on every request from the Global site

Token Factory is on the China site only. Use `https://developer.amd.com.cn/radeon/api/v1`.

### 429

You've hit a rate limit or the daily usage cap. `Retry-After` says how long to wait. See [Rate limits](/radeon-cloud-docs/api/rate-limits/).

If you hit `429` all the time, your workload is bigger than the Token Factory allowance. [Serve the model on your own instance](/radeon-cloud-docs/guides/serve-model/) instead of retrying more.

### "Requested model ... not supported"

The model name isn't in Token Factory. Models are added and retired over time, so look names up with [`GET /v1/models`](/radeon-cloud-docs/api/models/) instead of hard-coding them.

## GPU

### rocm-smi shows nothing, or PyTorch can't see the GPU

```bash
rocm-smi
python -c "import torch; print(torch.cuda.is_available(), torch.version.hip)"
```

If `torch.version.hip` is `None`, a CUDA build of PyTorch has replaced the ROCm one, usually because `pip install torch` overwrote the image's build. In **AMD OneClick Base**, PyTorch for ROCm is already installed in `/opt/venv`; don't reinstall `torch`. Launch a new instance to get a clean environment.

## Tunnels

### The install script fails

If it reports a missing identity directory or `FRP_BROKER_URL`, the instance was created before tunnels were enabled. Destroy it and launch a new one. Don't write platform keys by hand.

### The public URL doesn't work

Work outward from the service:

1. Inside the instance, run `curl --fail http://127.0.0.1:<port>/`. If that fails, the problem is your application, not the tunnel.
2. Run `rc-tunnel status`, and `rc-tunnel logs --lines 100` if it isn't running.

If the local service works and the status is healthy but the public URL still fails, email [member-service@mail.developer.amd.com.cn](mailto:member-service@mail.developer.amd.com.cn) with the full domain, when the instance was created and when the failure happened. Don't send config files or keys.

## Credits and coupons

### "That code is not valid. Check it and try again."

Paste the whole string. A coupon from the developer program is long, and a partial copy fails. Coupons expire 30 days after you exchange points for them, and each one works once. Make sure you're on the site you want the credits on, because credits don't move between sites. See [If redemption fails](/radeon-cloud-docs/guides/developer-program/#if-redemption-fails).

### A `DP-` code didn't add credits

`DP-XXXX-XXXX-XXXX` codes add developer points, not credits. Redeem them on the [point code page](https://developer.amd.com.cn/points/devpoints), then exchange the points for a coupon on [兑取算力](https://developer.amd.com.cn/points/redeem).

## Still stuck

Email [member-service@mail.developer.amd.com.cn](mailto:member-service@mail.developer.amd.com.cn) and include:

- the site (China or Global) and your account email
- what you ran or clicked, and what you expected to happen
- the exact error text and when it happened
- for an instance, the image and size you launched with

Don't include API keys, `rcc_` tokens, private SSH keys or one-time JupyterLab links. Send a coupon string only when the email is about that coupon.
