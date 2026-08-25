---
title: Work in JupyterLab
description: Use the browser-based JupyterLab environment attached to your instance.
sidebar:
  order: 4
---

When the instance is ready, click **Open Notebook**.

![The Open Notebook button in the ready dialog](../../../assets/guide/open-notebook.png)

JupyterLab opens in a new tab. This is the default way into an instance and gives you a full development environment in the browser.

![The JupyterLab workspace](../../../assets/guide/jupyterlab.png)

## What's in there

**Terminal** — a real Linux shell. Click `+` at the top, then **Terminal**, or use the Terminal tile in the Launcher. Use it to install packages, download weights, and start services.

**Notebooks** — `.ipynb` documents mixing code and output, the usual way to explore interactively.

**File browser** — the panel on the left. Use the upload button (`↑`) to bring in your own notebooks and data.

## Check the GPU

From a terminal:

```bash
rocm-smi
```

This lists the Radeon GPUs attached to the instance along with memory use and temperature. To confirm PyTorch sees them:

```bash
python -c "import torch; print(torch.cuda.is_available(), torch.cuda.device_count())"
```

On ROCm builds of PyTorch, the CUDA API names are the ones to use — `torch.cuda.is_available()` returning `True` means ROCm is working.

## Keeping work alive

Long jobs die if the terminal closes. Launch them detached:

```bash
nohup python train.py > train.log 2>&1 &
```

Files only survive the instance being destroyed if the template used **Persistent (PVC)** storage. Otherwise, download anything you need first.

## Exposing a service

To make an HTTP service running inside the notebook reachable from the internet — a Gradio app, an API you're developing — see [Expose a service](/radeon-cloud-docs/guides/tunnel/).
