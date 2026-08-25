---
title: What is AMD Radeon Cloud
description: An overview of the AMD Radeon Cloud platform — the two regional sites, GPU instances, model APIs, and how the pieces fit together.
sidebar:
  label: Introduction
  order: 1
---

AMD Radeon Cloud gives you an AMD Radeon GPU on demand. You pick an environment, launch it, and work in it from your browser or over SSH. The GPUs run ROCm, so the PyTorch, vLLM, and SGLang stacks you already use work without modification.

## Two sites, one platform

AMD Radeon Cloud is reachable through two regional entry points. They're the same platform, deployed separately to serve different regions.

| Site | Address |
|---|---|
| **China** | [developer.amd.com.cn/radeon](https://developer.amd.com.cn/radeon/) |
| **Global** | [radeon-global.anruicloud.com](https://radeon-global.anruicloud.com/) |

Pick the one for your region and stay on it. Accounts, credits, API keys, templates, and instances belong to the site you created them on — they don't carry across. An API key issued by one site won't authenticate against the other, so the base URLs in your code have to match the site you signed up on.

Throughout these docs, examples use whichever site's URL is most common for that feature. Substitute your own site's address if you're on the other one.

## What the platform does

Two distinct things, and it's worth knowing which one you need before you start.

## GPU instances

An **instance** is a container running on a Radeon GPU node, launched from a **template** you define. The template records the container image, how much GPU you want, how much disk, and what should run on startup. Launching the same template again gives you the same environment.

Instances are interactive. You reach them through JupyterLab in the browser or through SSH from your terminal, and you use them the way you'd use any Linux box with a GPU attached — install packages, download weights, train, and profile.

Instances consume credits while they run, so you destroy them when you're done. If you want files to survive that, set the template's storage to **Persistent (PVC)**.

Credits come from the [AMD AI Developer Program](https://developer.amd.com.cn/points/redeem) — see [Credits](/radeon-cloud-docs/guides/credits/).

## Model APIs

A **model API** is an HTTP endpoint that speaks the OpenAI protocol. Any client that can talk to OpenAI — `curl`, the `openai` Python SDK, LangChain, Cherry Studio — can talk to AMD Radeon Cloud by changing the base URL and the API key.

There are two kinds:

**Shared endpoints** are free and always on. You don't launch anything and you don't spend credits. Grab an API key from the Token Factory and start making requests. Models are chosen by the platform and rotate over time.

**Dedicated endpoints** are yours. You launch a template with a deploy type of vLLM or SGLang, and the platform routes a URL to the server running inside your instance. You choose the model, and you pay for the instance while it runs.

## Which one do you need

If you're training, fine-tuning, exploring in a notebook, or need a shell, you want an **instance**.

If you're building an application that calls an LLM, you want a **model API** — start with the free shared endpoints, and move to a dedicated one when you need a specific model or predictable throughput.

They compose. A common pattern is to launch an instance, serve a model on it with vLLM, and call it from an application running elsewhere.

## Where things live

| | |
|---|---|
| Console — templates, instances, credits | [developer.amd.com.cn/radeon](https://developer.amd.com.cn/radeon/) or [radeon-global.anruicloud.com](https://radeon-global.anruicloud.com/) |
| Token Factory — API keys, model catalog | [developer.amd.com.cn/radeon/modelapis](https://developer.amd.com.cn/radeon/modelapis) |
| AMD AI Developer Program — earn and redeem points | [developer.amd.com.cn/points/redeem](https://developer.amd.com.cn/points/redeem) |

## Next

Follow the [quickstart](/radeon-cloud-docs/quickstart/) to get an instance running and make your first API call.
