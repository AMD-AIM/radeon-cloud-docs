---
title: Work in JupyterLab
description: Open JupyterLab on your instance, check the GPU, and work with files.
---

Notebook instances run JupyterLab, a development environment in your browser with notebooks, terminals and a file browser.

## Open JupyterLab

Click **Open notebook**, either in the launch dialog when it reads **Your instance is ready** or on the instance card on **Home**. JupyterLab opens in a new tab.

## Check the GPU

Open a terminal (**File → New → Terminal**, or the **Terminal** tile in the Launcher) and run:

```bash
rocm-smi
```

It lists the Radeon GPUs attached to the instance with their memory use and temperature. To check that PyTorch can use them:

```bash
python -c "import torch; print(torch.cuda.is_available(), torch.cuda.device_count())"
```

ROCm builds of PyTorch keep the `torch.cuda` API names, so `True` here means ROCm is working.

## Work with files

- The file browser on the left shows the instance's files. Drag files onto it, or use the upload button, to bring in notebooks and data.
- To download a file, right-click it and choose **Download**.
- Save anything you want to keep under `/workspace`, and launch with persistent storage. See [Keep your data](/radeon-cloud-docs/guides/storage/).

## Run long jobs

A job started in a notebook cell stops when its kernel stops. For long runs, start the job from a terminal and write its output to a file:

```bash
nohup python train.py > /workspace/train.log 2>&1 &
tail -f /workspace/train.log
```

Instances have a maximum lifetime and are reclaimed after a period with no activity, so save checkpoints to `/workspace` as you go.

## Reach a web app

To make a web service running in the instance reachable from the internet, such as a Gradio app or an API you're building, see [Expose a service](/radeon-cloud-docs/guides/tunnel/).
