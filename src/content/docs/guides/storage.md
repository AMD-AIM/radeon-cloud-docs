---
title: Keep your data
description: Temporary and persistent workspace storage, read-only models at /models, and getting files out before you destroy an instance.
---

Whether your files survive depends on the **Workspace storage** you pick at launch. Decide before you launch: the setting can't be changed on a running instance.

## Temporary or persistent

| Option | What happens to `/workspace` |
|---|---|
| **Temporary workspace (local storage)** | Fast local disk on the node. Everything is deleted when the instance is destroyed. This is the default. |
| **Persistent /workspace** | Everything under `/workspace` is kept and appears again in your next instance that also uses persistent storage. |

Only `/workspace` is kept. Packages installed into the system Python, files in your home directory and anything else outside `/workspace` are gone when the instance is destroyed.

To pick persistent storage, turn on **Customize** in the launch form and set **Workspace storage** to **Persistent /workspace**.

## Capacity

Persistent storage is 25 GB. Some accounts can choose **100 GB large storage** under **Persistent workspace capacity**.

The 25 GB and 100 GB options are two separate volumes. Files saved with one don't appear when you launch with the other, so stick to one capacity.

## What to put under /workspace

- Code, notebooks, configuration and results.
- Training checkpoints, saved at regular intervals.
- A virtual environment, if you install many packages:

  ```bash
  python -m venv --system-site-packages /workspace/venv
  source /workspace/venv/bin/activate
  ```

  `--system-site-packages` keeps the image's ROCm build of PyTorch visible inside the environment.

Large datasets and model weights fill 25 GB quickly. Check usage with `du -sh /workspace/*` and `df -h /workspace`.

## Models at /models

**Mount a model** in the launch form mounts a prepared model read-only at `/models`. Read the weights from there instead of downloading them. To change them, copy them into `/workspace` first.

## Before you destroy an instance

The destroy confirmation reminds you that temporary workspace data is deleted and persistent workspace data is kept. Before you confirm, move anything you need:

- Into `/workspace`, if the instance uses persistent storage.
- To your computer, from the JupyterLab file browser (right-click a file and choose **Download**) or with `scp` over [SSH](/radeon-cloud-docs/guides/ssh/).
- To a Git repository or your own object storage.
