---
title: What is AMD Radeon Cloud
description: An overview of AMD Radeon Cloud, its China and Global sites, GPU instances and model APIs.
sidebar:
  label: Introduction
  order: 1
---

AMD Radeon Cloud gives you an AMD Radeon GPU on demand. Pick an image and a size, launch, and work from your browser or over SSH. The GPUs run ROCm, so PyTorch, vLLM and SGLang code runs without changes.

## China site and Global site

AMD Radeon Cloud has two sites, each run separately for its own region. Both offer GPU instances; the shared model APIs and Token Factory are on the China site only.

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

Manage instances in the web console or from a terminal with [Radeon Cloud CLI](/radeon-cloud-docs/cli/overview/) (`rcc`), which is also easy to script.

### Model APIs

A **model API** speaks the OpenAI API, so any OpenAI client, such as `curl`, the `openai` Python SDK, LangChain or Cherry Studio, works once you change the base URL and the API key. There are two kinds:

- **Shared model APIs** are free and always on, on the China site. Get an API key from Token Factory and start sending requests. The platform chooses the models and changes them from time to time. See [Call the shared models](/radeon-cloud-docs/guides/shared-models/).
- **Dedicated model APIs** serve a model of your choice on your own instance. Launch with **Deploy type** set to **Model API**, and the console gives you a base URL and an API key. The instance spends credits while it runs. See [Deploy a dedicated model API](/radeon-cloud-docs/guides/dedicated-models/).

## Which one do you need

For training, fine-tuning, notebooks or a shell, use an **instance**.

For an application that calls an LLM, use a **model API**. Start with the free shared model APIs, and move to a dedicated one when you need a particular model or steady throughput.

## Quick links

| What | Where |
|---|---|
| Console: instances, credits, settings | [developer.amd.com.cn/radeon](https://developer.amd.com.cn/radeon/) or [radeon-global.anruicloud.com](https://radeon-global.anruicloud.com/) |
| Token Factory: API key, shared models | [developer.amd.com.cn/radeon/tokenfactory](https://developer.amd.com.cn/radeon/tokenfactory) |
| Radeon Cloud CLI | [Radeon Cloud CLI](/radeon-cloud-docs/cli/overview/) |
| AMD AI Developer Program: points and coupons (China site) | [AMD AI Developer Program](/radeon-cloud-docs/guides/developer-program/) |
| Support | [member-service@mail.developer.amd.com.cn](mailto:member-service@mail.developer.amd.com.cn) |

## Next

Follow the [quickstart](/radeon-cloud-docs/quickstart/) to make your first API call and launch an instance.
