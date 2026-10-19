---
title: What is AMD Radeon Cloud
description: An overview of AMD Radeon Cloud, its China and Global sites, GPU instances and Token Factory.
sidebar:
  label: Introduction
  order: 1
---

AMD Radeon Cloud gives you an AMD Radeon GPU on demand. Pick an image and a size, launch, and work from your browser or over SSH. The GPUs run ROCm, so PyTorch, vLLM and SGLang code runs without changes.

## China site and Global site

AMD Radeon Cloud has two sites, each run separately for its own region. Both offer GPU instances; Token Factory is on the China site only.

| Site | Address | Account |
|---|---|---|
| **China** | [developer.amd.com.cn/radeon](https://developer.amd.com.cn/radeon/) | [AMD AI Developer Program](/radeon-cloud-docs/guides/developer-program/) |
| **Global** | [radeon-global.anruicloud.com](https://radeon-global.anruicloud.com/) | Email sign-in |

Use the site for your region. Accounts, credits, API keys and instances stay on the site where you created them. An API key from one site doesn't work on the other, so the base URL in your code must match your site.

The examples in these docs use the China site. On the Global site, use its address instead.

## What you can do

### GPU instances

An **instance** is a container with one or more Radeon GPUs. You choose the image, which decides the preinstalled software, and the size, which decides the number of GPUs, CPU cores and memory. See [Choose an image](/radeon-cloud-docs/guides/images/).

Open an instance in [JupyterLab](/radeon-cloud-docs/guides/jupyterlab/) or connect over [SSH](/radeon-cloud-docs/guides/ssh/), then use it like any Linux machine with a GPU: install packages, download weights, train and profile.

An instance spends [credits](/radeon-cloud-docs/guides/credits/) every hour it runs, so [destroy it](/radeon-cloud-docs/guides/destroy/) when you're done. To keep your files after that, launch with **Persistent /workspace**. See [Keep your data](/radeon-cloud-docs/guides/storage/). On the China site, you get credits by exchanging [AMD AI Developer Program](/radeon-cloud-docs/guides/developer-program/) points.

An instance can also serve a model of your choice with vLLM, behind an OpenAI-compatible endpoint. See [Serve a model](/radeon-cloud-docs/guides/serve-model/).

Manage instances in the web console or from a terminal with [Radeon Cloud CLI](/radeon-cloud-docs/cli/overview/) (`rcc`), which is also easy to script.

### Token Factory

**Token Factory** hosts a set of models on Radeon GPUs and serves them through an OpenAI-compatible API, on the China site. It's free and always on: get an API key and start sending requests. Any OpenAI client, such as `curl`, the `openai` Python SDK, LangChain or Cherry Studio, works once you change the base URL and the key. The platform chooses the models and changes them from time to time. See [Token Factory](/radeon-cloud-docs/guides/token-factory/).

## Which one do you need

For training, fine-tuning, notebooks or a shell, use an **instance**.

For an application that calls an LLM, start with **Token Factory**. When you need a model it doesn't offer, or throughput you don't share, [serve the model on an instance](/radeon-cloud-docs/guides/serve-model/).

## Quick links

| What | Where |
|---|---|
| Console: instances, credits, settings | [developer.amd.com.cn/radeon](https://developer.amd.com.cn/radeon/) or [radeon-global.anruicloud.com](https://radeon-global.anruicloud.com/) |
| Token Factory: API key, models | [developer.amd.com.cn/radeon/tokenfactory](https://developer.amd.com.cn/radeon/tokenfactory) |
| Radeon Cloud CLI | [Radeon Cloud CLI](/radeon-cloud-docs/cli/overview/) |
| AMD AI Developer Program: points and coupons (China site) | [AMD AI Developer Program](/radeon-cloud-docs/guides/developer-program/) |
| Support | [member-service@mail.developer.amd.com.cn](mailto:member-service@mail.developer.amd.com.cn) |

## Next

Follow the [quickstart](/radeon-cloud-docs/quickstart/) to make your first API call and launch an instance.
