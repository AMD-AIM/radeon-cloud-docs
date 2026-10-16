---
title: How instances work
description: What an instance is made of (deploy type, image, size and storage) and how it is billed.
---

An instance is a container with an AMD Radeon GPU attached. You start it from **Home** in the console, choose what runs in it and how large it is, and it runs until you destroy it or a platform limit stops it.

## What you choose at launch

| Setting | What it decides |
|---|---|
| **Deploy type** | **Notebook** gives you JupyterLab and SSH for development. **Model API** serves a model behind an OpenAI-compatible endpoint. |
| **Size** | The number of GPUs, CPU cores and memory, and the credits it costs per hour. |
| **Image** | The software in the container: ROCm, Python, frameworks. See [Choose an image](/radeon-cloud-docs/guides/images/). |
| **Resource pool** | The group of GPU nodes the instance is scheduled on. |
| **Workspace storage** | Whether `/workspace` is deleted with the instance or kept. See [Keep your data](/radeon-cloud-docs/guides/storage/). |
| **Mount a model** | Model files mounted read-only at `/models`. |

The form shows **Deploy type**, **Size** and **Image** by default. Turn on **Customize** to see the rest.

## What your account can use

The sizes, images and resource pools in the form are the ones assigned to your account, so another account may see different options. Being listed means you may request a resource. It does not reserve a GPU.

To see the same list from a terminal, run `rcc catalog list`. See [Radeon Cloud CLI](/radeon-cloud-docs/cli/instances/).

## One instance per account

Each account runs one instance at a time. While it runs, **Home** shows the instance instead of the launch form. Destroy it before you launch another.

## Billing

A running instance spends credits every hour. The rate is shown on the size you pick, for example **1 GPU · 16 cores · 55GB · 1 credit / hour**. The first hour is charged as soon as the instance starts. The instance card on **Home** shows how long the instance has been up and how many credits it has used.

You need enough credits to launch, and the instance is deleted when your credits run out. See [Credits](/radeon-cloud-docs/guides/credits/).

## Limits that stop an instance

An instance is deleted automatically when your credits run out, and, if the launch form showed **Auto-reclaim**, once that time has passed since it became ready. Save results to a persistent `/workspace` as you go, so a stop doesn't cost you the work.

## SSH is always on

Every instance launched from the console comes up with SSH. Add your public key in **Settings** before you launch. See [Connect over SSH](/radeon-cloud-docs/guides/ssh/).
