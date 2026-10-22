---
title: FAQ
description: Short answers to common questions about AMD Radeon Cloud.
sidebar:
  order: 2
---

## Getting started

**Do I need to launch an instance to call a model?**
No. Token Factory is free and always on. Get an API key from [Token Factory](https://developer.amd.com.cn/radeon/tokenfactory) and start calling. It's on the China site only. See [Token Factory](/radeon-cloud-docs/guides/token-factory/).

**Can I run more than one instance?**
No. Each account can have one instance at a time. Destroy it to launch another.

**How many GPUs can I get?**
It depends on the sizes assigned to your account. **Size** in the launch form lists them, and `rcc catalog list` shows the same list.

**How do I get credits on the China site?**
Exchange AMD AI Developer Program points for a coupon on [兑取算力](https://developer.amd.com.cn/points/redeem), then redeem it under **Credits & Usage → Redeem credits**. 1 point buys 1 hour, up to 20 points a day. See [AMD AI Developer Program](/radeon-cloud-docs/guides/developer-program/).

**How do I get credits on the Global site?**
Same two steps as the China site. Sign in with **Login with AMD Developer Program**, or connect that account in **Settings**, then exchange developer points for a coupon on [兑取算力](https://developer.amd.com.cn/points/redeem). Paste it under **Credits & Usage → Redeem credits**. Events and workshops may also hand you a coupon. The Global console has **Redeem credits**; it does not have a developer-points page of its own — that page lives on the program site. See [Credits](/radeon-cloud-docs/guides/credits/).

**Who do I contact?**
Email [member-service@mail.developer.amd.com.cn](mailto:member-service@mail.developer.amd.com.cn). [Troubleshooting](/radeon-cloud-docs/resources/troubleshooting/#still-stuck) lists what to include.

## Cost

**What spends credits?**
Running instances: 1 credit per GPU per hour. Token Factory doesn't use credits. A model service you run yourself does, because it runs on an instance.

**Am I charged while an instance is idle?**
Yes. An instance spends credits for as long as it exists, whether or not you're using it. [Destroy it](/radeon-cloud-docs/guides/destroy/) when you're done.

**Will my instance be stopped for me?**
Only when your credits run out, or when the **Auto-delete** time you chose on the launch form has passed. Don't rely on either to save credits.

**Are Token Factory usage and credits the same thing?**
No. Token Factory has its own daily usage cap, counted in points (pts). See it on **Credits & Usage**, or with [`GET /v1/usage`](/radeon-cloud-docs/api/usage/).

## Storage

**Do my files survive?**
Only files under `/workspace`, and only if you launched with **Persistent /workspace**. Otherwise everything is deleted with the instance. See [Keep your data](/radeon-cloud-docs/guides/storage/).

**Can I add persistent storage to a running instance?**
No. Storage is chosen at launch. Destroy the instance and launch again with **Persistent /workspace**.

**How much persistent storage do I get?**
25 GB. Some accounts can choose 100 GB. The two are separate volumes, so files saved on one don't show up on the other.

## Models and compatibility

**Does my CUDA code work?**
Usually, at the PyTorch level. ROCm builds of PyTorch support the `torch.cuda.*` API, so high-level PyTorch code usually runs unchanged. Hand-written CUDA kernels need porting with HIP, and libraries that ship only CUDA binaries won't work.

**Which models are in Token Factory?**
The list changes. See the [model catalog](/radeon-cloud-docs/models/overview/), or call [`GET /v1/models`](/radeon-cloud-docs/api/models/) instead of hard-coding names.

**Can I serve any model on my own instance?**
Any model vLLM supports that fits in the GPU memory of the size you chose. Weights are downloaded on first start, so large models take a few minutes before they answer. See [Serve a model](/radeon-cloud-docs/guides/serve-model/).

**Does streaming work?**
Yes. Set `stream: true` on chat completions.

**Are embeddings available?**
In Token Factory, only if the model catalog lists an embedding model. A model service on your instance serves whatever vLLM supports, which usually includes `/v1/embeddings`.

## Access

**Can I share my endpoint with a teammate?**
Not through the platform. To expose a service publicly, run it in the instance and use [rc-tunnel](/radeon-cloud-docs/guides/tunnel/), with your own authentication in front of it.

**Can I use an API key to open JupyterLab or launch instances?**
No. API keys work for Token Factory only. JupyterLab and the console need a browser session, and scripts manage instances with [Radeon Cloud CLI](/radeon-cloud-docs/cli/overview/).

**Why can't I launch an instance?**
Usually one of these: no free node in the resource pool, not enough credits, an instance already running, or an account still under review. See [Troubleshooting](/radeon-cloud-docs/resources/troubleshooting/#launching).

## Operations

**Can I script launches?**
Yes, with Radeon Cloud CLI. See [Scripting and automation](/radeon-cloud-docs/cli/automation/). Always delete the instance at the end of the script, even when it fails, so a crash doesn't leave it running.

**Does the endpoint URL stay the same when I launch again?**
Don't rely on it. The base URL and key can change, so copy them from the instance card after each launch and keep them in configuration, not in code.
