---
title: Work in JupyterLab
description: Open JupyterLab on your instance, check the GPU, and work with files.
---

Instances launched with deploy type **Notebook** run JupyterLab. JupyterLab is a development environment in the browser, with notebooks, a terminal and a file browser.

## Open JupyterLab

When the instance is ready, **Open notebook** appears on the launch dialog and on the instance card on **Home**. Click it to enter JupyterLab. The default path is `/workspace`.

Two buttons in the top-right corner come from Radeon Cloud: **Help**, and **Delete instance**, which destroys the instance. See [Destroy an instance](/radeon-cloud-docs/guides/destroy/#destroy-from-jupyterlab).

The bar across the top shows the instance at a glance: **Workspace** storage use, **GPU**, **VRAM**, **RAM** and **CPU** load, **Runtime** and **Consumed Credits**.

![JupyterLab on an instance, with the Radeon Cloud status bar and Delete instance at the top](../../../assets/guide/jupyterlab.png)

## Check the GPU

Open a terminal (**File → New → Terminal**, or the **Terminal** tile in the Launcher) and run:

```shellsession frame="terminal" title="Terminal"
$ rocm-smi
=========================================== ROCm System Management Interface ===========================================
===================================================== Concise Info =====================================================
Device  Node  IDs              Temp    Power   Partitions          SCLK     MCLK     Fan     Perf  PwrCap  VRAM%  GPU%
              (DID,     GUID)  (Edge)  (Avg)   (Mem, Compute, ID)
========================================================================================================================
0       2     0x7551,   52503  50.0°C  22.0W   N/A, N/A, 0         41Mhz    96Mhz    20.0%   auto  300.0W  0%     0%
========================================================================================================================
================================================= End of ROCm SMI Log ==================================================
```

Each `Device` row is a GPU attached to the instance, with temperature, power, memory use (**VRAM%**) and compute use (**GPU%**). The output depends on the size; the example above is a 1-GPU instance.

Confirm that PyTorch can see those GPUs:

```shellsession frame="terminal" title="Terminal"
$ python -c "import torch; print(torch.cuda.is_available(), torch.cuda.device_count())"
True 1
```

ROCm builds of PyTorch keep the `torch.cuda` API. `True` means ROCm is working; the number after it is how many GPUs are visible.

Check GPU memory capacity:

```shellsession frame="terminal" title="Terminal"
$ rocm-smi --showmeminfo vram
============================ ROCm System Management Interface ============================
================================== Memory Usage (Bytes) ==================================
GPU[0]          : VRAM Total Memory (B): 32061259776
GPU[0]          : VRAM Total Used Memory (B): 62087168
==========================================================================================
================================== End of ROCm SMI Log ===================================
```

**VRAM Total Memory** is the GPU memory capacity, in bytes.

## CPU and memory

CPU and memory available to the instance are set by the size chosen at launch. Commands such as `nproc` and `free` report the host node's resources, which are typically larger than that quota. Set thread counts, workers, and other parallelism from the size, not from those commands.

## Work with files

The file browser on the left is the instance file system. To upload, drag files onto the pane or use the upload control. To download, right-click the file and choose **Download**.

Data that must survive instance destruction belongs under `/workspace`, with persistent storage enabled at launch. See [Keep your data](/radeon-cloud-docs/guides/storage/).

## Cell run status

Code cells are marked by the result of their last run:

- Running: yellow background, ❗
- Succeeded: green background, ✅
- Failed: red background, ❌

The marks exist only in the current browser session. They are not stored in the notebook and disappear on reload. They require JupyterLab 4; images with an older JupyterLab do not show them.

## Long-running jobs

A process started in a notebook cell ends when the kernel stops. Start long-running jobs from a terminal and redirect output to a file:

```bash
nohup python train.py > /workspace/train.log 2>&1 &
tail -f /workspace/train.log
```

The instance is destroyed when credits run out or when **Auto-delete** is reached. Write checkpoints under `/workspace` and launch with persistent storage. See [Keep your data](/radeon-cloud-docs/guides/storage/).

## Reach a service from the internet

Web services inside the instance are not reachable from the public internet by default. To assign a public URL to a Gradio app or a local API, see [Expose a service](/radeon-cloud-docs/guides/tunnel/).
