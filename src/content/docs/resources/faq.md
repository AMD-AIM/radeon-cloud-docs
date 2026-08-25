---
title: FAQ
description: Short answers to common questions about AMD Radeon Cloud.
sidebar:
  order: 2
---

## Getting started

**Do I need to launch an instance to use a model API?**
No. The shared endpoints are free and always on — get a key from the [Token Factory](https://developer.amd.com.cn/radeon/modelapis) and start calling. Instances are only needed when you want a shell, a notebook, or a model the catalog doesn't offer.

**Can I run more than one instance?**
No. One active instance per account. Destroy the current one to launch another.

**How many GPUs can I get?**
1, 2, or 4.

## Cost

**What spends credits?**
Running instances, scaled by GPU count. The free shared model APIs don't touch credits. A [dedicated endpoint](/radeon-cloud-docs/api/dedicated-endpoints/) does, because it runs on an instance.

**Am I charged while an instance is idle?**
Yes. Credits are consumed for as long as the instance exists, whether or not you're using it. [Destroy it](/radeon-cloud-docs/guides/destroy/) when you're done.

**Is model API spend the same as credits?**
No, they're separate budgets. Shared model APIs have their own daily cap, visible through [`GET /api/profile/model-usage`](/radeon-cloud-docs/api/usage/).

## Storage

**Do my files survive?**
Only if the template used **Persistent (PVC)** storage. Otherwise everything goes with the instance.

**Can I add persistent storage to a running instance?**
No. It's a template setting. Create or edit the template, then relaunch.

**How much disk can I have?**
From 100 GB up to a ceiling that scales with GPU count — 100 GB for 1 GPU, 150 for 2, 200 for 4.

## Models and compatibility

**Does my CUDA code work?**
ROCm implements the same PyTorch API surface, and `torch.cuda.*` calls work on ROCm builds. High-level PyTorch code usually runs unchanged. Hand-written CUDA kernels need porting with HIP, and libraries that ship CUDA-only binaries won't work.

**Which models are available on the shared endpoints?**
It changes. Call [`GET /v1/models`](/radeon-cloud-docs/api/models/) rather than hard-coding names.

**Can I serve any model on a dedicated endpoint?**
Anything vLLM or SGLang supports and that fits in the GPU memory you've allocated. Downloads happen on first start, so large models take a few minutes to become callable.

**Does streaming work?**
Yes, `stream: true` on chat completions. Responses aren't buffered by the platform.

**Are embeddings available?**
Not on shared endpoints — those serve chat completions and model listing only. A dedicated endpoint exposes whatever your serving stack does, which for vLLM typically includes embeddings.

## Access

**Can I share my endpoint with a teammate?**
Not through the platform. A key only works against its own account's instance. To expose a service publicly, run it inside the instance and use [rc-tunnel](/radeon-cloud-docs/guides/tunnel/), with your own authentication in front of it.

**Can I use an API key to open JupyterLab?**
No. The instance proxy requires a browser session. Keys work for the model APIs and the platform management endpoints.

**Why can't I launch an instance?**
Most often the account is still under review — `GET /api/me` shows `verified`. Free model APIs remain available while you wait.

## Operations

**Can I script launches?**
Yes. See [Instances](/radeon-cloud-docs/api/instances/) for a launch-and-poll example. Always destroy in a `finally` block so a crash doesn't leave an instance billing.

**Does the endpoint URL stay the same across relaunches?**
No. Each launch produces a new instance ID and a new base URL. Treat it as configuration to be read, not a constant.
