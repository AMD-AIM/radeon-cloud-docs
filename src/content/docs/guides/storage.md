---
title: Keep your data
description: Temporary and persistent workspace storage, read-only mounted models, and getting files out before you destroy an instance.
---

Whether your files survive depends on the **Workspace storage** you pick at launch. Decide before you launch: the setting can't be changed on a running instance.

## Temporary or persistent

| Option | What happens to `/workspace` |
|---|---|
| **Temporary workspace (local storage)** | Fast local disk on the node. Everything is deleted when the instance is destroyed. This is the default. |
| **Persistent /workspace** | Everything under `/workspace` is kept so the next launch can continue from there. |

Only `/workspace` is kept. Packages you install with `pip`, files in your home directory and anything else outside `/workspace` are gone when the instance is destroyed. New instances start in `/workspace`.

To pick persistent storage, turn on **Customize** in the launch form and set **Workspace storage** to **Persistent /workspace**.

## Capacity

Persistent /workspace is 25 GB.

## What to put under /workspace

- Code, notebooks, configuration and results.
- Training checkpoints, saved at regular intervals.
- A `requirements.txt` listing the extra packages you need. Packages don't carry over between instances, so reinstall them after each launch:

  ```bash
  pip install -r /workspace/requirements.txt
  ```

  Leave `torch` out of the file, so the image's ROCm build stays in place.

Large datasets and model weights fill 25 GB quickly. Check usage with `du -sh /workspace/*` and `df -h /workspace`.

## Mounted models

**Mount a model** in the launch form mounts a prepared model read-only. Read the weights from there instead of downloading them. To change them, copy them into `/workspace` first.

The form currently lists these three (China site, November 2026; the list can change, so use what the form shows):

| Option on the form | Mount path |
|---|---|
| **ComfyUI** | `/comfyui_workspace/ComfyUI/models` (where ComfyUI looks for models) |
| **Openclaw** | `/models` |
| **Devzone** | `/models` |

Leave it at **None** if you don't need one. The mount is read-only; write outputs to `/workspace`.

## Before you destroy an instance

The destroy confirmation reminds you that temporary workspace data is deleted and persistent workspace data is kept. Before you confirm, move anything you need:

- Into `/workspace`, if the instance uses persistent storage.
- To your computer, from the JupyterLab file browser (right-click a file and choose **Download**) or with `scp` over [SSH](/radeon-cloud-docs/guides/ssh/).
- To a Git repository or your own object storage.
