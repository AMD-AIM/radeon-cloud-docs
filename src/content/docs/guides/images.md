---
title: Choose an image
description: Which image to start from, what each image in the list is for, and how to check what an image contains.
---

The image decides what software is in your instance: ROCm, Python, PyTorch and the tools around them. Pick it under **Image** in the launch form.

## Pick a stable image

The list has a small set of stable images that the platform maintains and keeps up to date. Each one has a one-line description under the field when you select it.

| Image | Description in the form | Use it for |
|---|---|---|
| **Base** | General-purpose ROCm environment with Python, JupyterLab and OpenCode. | General development and exploring the GPU. |
| **PyTorch · Stable** | PyTorch on ROCm, stable release, for training and running models. | Most PyTorch code: training, fine-tuning, running models. |
| **PyTorch · Latest** | PyTorch on ROCm, newest release, for trying the latest features. | Code that needs a newer PyTorch or ROCm than the stable image. |
| **vLLM · Stable** | vLLM for serving LLMs behind an OpenAI-compatible API. | Serving a model yourself with `vllm serve`. |
| **SGLang** | SGLang for serving LLMs behind an OpenAI-compatible API. | Serving a model with SGLang instead of vLLM. |
| **Unsloth · Fine-tuning** | Unsloth Studio for fine-tuning LLMs, with JupyterLab. | Fine-tuning LLMs with Unsloth. |
| **llama.cpp** | llama.cpp for running GGUF models, with Unsloth included. | Running GGUF models. |
| **ComfyUI** | ComfyUI for node-based image and video generation. | Image and video generation workflows. |

Stable images are updated in place: the name stays the same and new instances get the newer build. The versions inside change over time, so check them in your instance (see below) instead of relying on the name.

To serve a model with **Deploy type: Model API**, you don't pick an image here; that form picks its own runtime. See [Serve a model](/radeon-cloud-docs/guides/serve-model/).

## Other images in the list

The list also has a few images made for a specific course, workshop or event. Pick one of these only when its instructions name it.

To follow a course or workshop, launch its notebook from the [Gallery](/radeon-cloud-docs/guides/gallery/) instead of picking an image yourself. The notebook launches with the right image.

## Older images

Many older images were removed from the list in November 2026. Gallery notebooks that use them still launch with their own image, so a course that worked before still works from the Gallery. If you used one of the older general-purpose images directly, switch to the matching stable image above.

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
