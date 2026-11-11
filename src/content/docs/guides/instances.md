---
title: How instances work
description: What an instance is made of (deploy type, image, size and storage) and how it is billed.
---

An instance is a container with an AMD Radeon GPU attached. You start it from **Home** in the console, choose what runs in it and how large it is, and it runs until you destroy it or a platform limit stops it.

## What you choose at launch

| Setting | What it decides |
|---|---|
| **Deploy type** | **Notebook** gives you JupyterLab and SSH for development. **Model API** serves a model with vLLM behind an OpenAI-compatible endpoint. See [Serve a model](/radeon-cloud-docs/guides/serve-model/). |
| **Size** | The number of GPUs, CPU cores and memory, and the credits it costs per hour. |
| **Image** | The software in the container: ROCm, Python, frameworks. See [Choose an image](/radeon-cloud-docs/guides/images/). |
| **Resource pool** | The group of GPU nodes the instance is scheduled on. The launch form shows whether that pool has free GPUs right now. |
| **Auto-delete** | How long the instance may run after it becomes ready. |
| **Workspace storage** | After you destroy the instance, whether `/workspace` is deleted with it, or still there the next time you launch. See [Keep your data](/radeon-cloud-docs/guides/storage/). |
| **Mount a model** | Model files mounted read-only, at `/models` for most models. See [Keep your data](/radeon-cloud-docs/guides/storage/#mounted-models). |

The form shows **Deploy type**, **Size**, **Image** and **Auto-delete** by default. Turn on **Customize** to see the rest.

## What your account can use

The sizes, images and resource pools in the form are the ones assigned to your account, so another account may see different options. Being listed means you may request a resource. It does not reserve a GPU.

To see the same list from a terminal, run `rcc catalog list`. See [Radeon Cloud CLI](/radeon-cloud-docs/cli/instances/).

## One instance per account

Each account runs one instance at a time. While it runs, **Home** shows the instance instead of the launch form. If you want to launch another, destroy this one first.

## Billing

A running instance spends 1 credit per GPU every hour. The size you pick shows how much that option costs, for example **1 GPU · 16 cores · 55GB · 1 credit / hour**. The first hour is charged within a minute or two of the instance becoming ready. The instance card on **Home** shows how long it has been up and how many credits it has used.

Your balance has to cover the first hour, and the instance is deleted when your credits run out. See [Credits](/radeon-cloud-docs/guides/credits/).

## Limits that stop an instance

- The instance is deleted when your credits run out.
- It is also deleted at the **Auto-delete** time you chose, counted from when it became ready.
- The instance card counts down to that time.
- Near the deadline, **Extend** adds 2 hours, 8 hours or 1 day. You can extend once, and not past the runtime you set at launch.

:::note
Save anything you need to keep to a persistent `/workspace`. Files anywhere else are gone if the instance is stopped.
:::

## SSH is on by default

Instances launched from the console turn SSH **on by default**. That setup can fail, for example if OpenSSH doesn't download, or the SSH service doesn't start. JupyterLab still works, and you can start SSH yourself inside the instance. See [Connect over SSH](/radeon-cloud-docs/guides/ssh/).

:::note
Add your public key in **Settings** before you launch.
:::
