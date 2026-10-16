---
title: What is AMD Radeon Cloud
description: An overview of AMD Radeon Cloud — the China and Global sites, GPU instances, model APIs, and how they fit together.
sidebar:
  label: Introduction
  order: 1
---

AMD Radeon Cloud gives you an AMD Radeon GPU on demand. Pick an environment, launch it, and work in it from your browser or over SSH. The GPUs run ROCm, so your PyTorch, vLLM, and SGLang code runs without changes.

## China site and Global site

AMD Radeon Cloud has two sites. They offer the same platform, but each runs separately for its own region.

| Site | Address | Account |
|---|---|---|
| **China** | [developer.amd.com.cn/radeon](https://developer.amd.com.cn/radeon/) | [AMD AI Developer Program](/radeon-cloud-docs/guides/developer-program/) |
| **Global** | [radeon-global.anruicloud.com](https://radeon-global.anruicloud.com/) | Email sign-in |

Pick the site for your region and stick with it. Accounts, credits, API keys, templates, and instances all stay on the site where you created them. An API key from one site won't work on the other, so the base URL in your code must match the site you signed up on.

Examples in these docs use whichever site is more common for that feature. If you're on the other site, swap in its address.

## What you can do

The platform offers two things. Work out which one you need before you start.

### GPU instances

An **instance** is a container on a Radeon GPU node, launched from a **template** you define. A template records the container image, the number of GPUs, the disk size, and what runs at startup. Launch the same template again and you get the same environment.

Instances are interactive. Open them in JupyterLab in your browser or connect over SSH, then use them like any Linux machine with a GPU: install packages, download weights, train, and profile.

Instances spend credits while they run, so destroy them when you're done. To keep your files after that, launch with **Persistent /workspace** storage. See [Keep your data](/radeon-cloud-docs/guides/storage/).

On the China site, you get credits by exchanging AMD AI Developer Program points. See [AMD AI Developer Program](/radeon-cloud-docs/guides/developer-program/) and [Credits](/radeon-cloud-docs/guides/credits/).

You can manage instances in the web console or with [Radeon Cloud CLI](/radeon-cloud-docs/cli/overview/) (`rcc`). From the terminal, the CLI also shows your credits and the resources you can use, opens JupyterLab and SSH, shows status and logs, and is easy to script.

### Model APIs

A **model API** is an HTTP endpoint that speaks the OpenAI API. Any OpenAI client — `curl`, the `openai` Python SDK, LangChain, Cherry Studio — can use AMD Radeon Cloud once you change the base URL and the API key.

There are two kinds:

**Shared endpoints** are free and always available. There's nothing to launch and no credits to spend. Get an API key from the Token Factory and start sending requests. The platform chooses the models and changes them from time to time.

**Dedicated endpoints** are yours alone. Launch a template with a vLLM or SGLang deploy type, and the platform gives you a URL for the server inside your instance. You choose the model, and the instance spends credits while it runs.

## Which one do you need

For training, fine-tuning, notebook exploration, or a shell, use an **instance**.

For an application that calls an LLM, use a **model API**. Start with the free shared endpoints, and move to a dedicated one when you need a particular model or steady throughput.

You can use both together. A common setup is to serve a model with vLLM on an instance and call it from an application running somewhere else.

## Quick links

| What | Where |
|---|---|
| Console: templates, instances, credits | [developer.amd.com.cn/radeon](https://developer.amd.com.cn/radeon/) or [radeon-global.anruicloud.com](https://radeon-global.anruicloud.com/) |
| Radeon Cloud CLI: accounts, credits, resources, instances | [Radeon Cloud CLI](/radeon-cloud-docs/cli/overview/) |
| Token Factory: API keys, model catalog | [developer.amd.com.cn/radeon/tokenfactory](https://developer.amd.com.cn/radeon/tokenfactory) |
| AMD AI Developer Program: points and coupons (China site) | [AMD AI Developer Program](/radeon-cloud-docs/guides/developer-program/) |
| Support | [member-service@mail.developer.amd.com.cn](mailto:member-service@mail.developer.amd.com.cn) |

## Next

Follow the [quickstart](/radeon-cloud-docs/quickstart/) to launch an instance and make your first API call.
