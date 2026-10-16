---
title: Choose an image
description: Which image to start from, how to read the image list, and how to check what an image contains.
---

The image decides what software is in your instance: ROCm, Python, PyTorch and the tools around them. Pick it under **Image** in the launch form.

## Start with AMD OneClick Base

**AMD OneClick Base** is the default, described in the form as **Default ROCm Jupyter/OpenCode image**. It is the image the platform maintains for general work. Use it unless you have a reason to pick something else.

In October 2026 it contained:

| Component | Version |
|---|---|
| OS | Ubuntu 24.04 |
| Python | 3.12, in a virtual environment at `/opt/venv` |
| PyTorch | 2.9.1, built for ROCm 7.2 |
| JupyterLab | 4.5 |
| Other tools | OpenCode, `rocm-smi` |

The image is updated from time to time, so check the versions in your own instance (see below).

## Read the image list

The **Image** field is a searchable list. Type part of a name to filter it. When an image has a description, it appears under the field after you select it.

The list depends on your account, and it also contains images made for specific courses, workshops and demos. As a rule:

| You want to | Pick |
|---|---|
| Develop, explore, or run most PyTorch code | **AMD OneClick Base** |
| Use the stock ROCm PyTorch environment | An image with **rocm-pytorch** in its name |
| Follow a course, workshop or tutorial | The image its instructions name |
| Serve a model through Model API | Nothing here; the Model API form picks its own runtime. See [Deploy a dedicated model API](/radeon-cloud-docs/guides/dedicated-models/). |

Avoid images with no description unless an instruction tells you to use them.

## Check what an image contains

Versions change as images are updated, so check them inside the instance rather than relying on the name. From a JupyterLab terminal:

```bash
rocm-smi
python --version
python -c "import torch; print(torch.__version__, torch.version.hip, torch.cuda.is_available())"
pip list
```

`torch.version.hip` shows the ROCm version PyTorch was built for, and `torch.cuda.is_available()` returning `True` means PyTorch can use the GPU.

:::caution[Don't reinstall PyTorch from PyPI]
`pip install torch` replaces the image's ROCm build with a CUDA build, and PyTorch then can't see the GPU. Install other packages normally, and keep the PyTorch that came with the image.
:::

## Custom images

Custom images built in the classic console's **Custom Images** page appear in the list with **(custom)** after their name once the build has finished.
