---
title: Choose an image
description: Which image to start from, what each image in the list is for, and how to check what an image contains.
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
| Use the stock ROCm PyTorch environment | **rocm-pytorch** |
| Follow a course, workshop or tutorial | The image its instructions name |
| Serve a model with **Deploy type: Model API** | Nothing here; that form picks its own runtime. See [Serve a model](/radeon-cloud-docs/guides/serve-model/). |

Avoid images with no description unless an instruction tells you to use them.

## Images in the list

The tables below list the images on the China site in October 2026, by the name shown in the **Image** field. Your list may differ, and images are added and retired over time.

To follow a course or workshop, launch its notebook from the [Gallery](/radeon-cloud-docs/guides/gallery/) instead of picking an image yourself. The notebook launches with the right image.

### General purpose

| Image | What's in it | Use it for |
|---|---|---|
| **AMD OneClick Base** | ROCm 7.2, Python 3.12, PyTorch, JupyterLab and OpenCode. Maintained by the platform. See [above](#start-with-amd-oneclick-base). | Most work. The default. |
| **rocm-pytorch** | AMD's official `rocm/pytorch` image: ROCm 7.2.4, Ubuntu 24.04, Python 3.12, PyTorch 2.10.0. | Code that expects the stock ROCm PyTorch environment, or a newer PyTorch than AMD OneClick Base. |
| **rocm10-pytorch** | An official `rocm/pytorch` image built on ROCm 10. | Trying ROCm 10. The Hello GPU notebook uses it. |

### Model serving

| Image | What's in it | Use it for |
|---|---|---|
| **Qwen3.8-27B** | vLLM set up to serve Qwen3.8-27B. Needs a 2-GPU size. | Running Qwen3.8-27B yourself in a notebook. To get an endpoint without setting up vLLM yourself, use [Serve a model](/radeon-cloud-docs/guides/serve-model/) instead. |

### Courses, workshops and events

These images exist for one course or event. Pick one only when its instructions name it.

| Image | Made for |
|---|---|
| **AMD-Stable-GH-Proxy** | A variant of AMD OneClick Base with a proxy for reaching GitHub. Used by the Hello ROCm and AgenticAI推理自优化 notebooks. |
| **Unsloth Studio** | Unsloth fine-tuning. Used by the Modern LLM Notebook. |
| **Muse Glimmer Llamacpp** | A llama.cpp environment prepared for an event. |
| **Oceanbase** | SeekDB and hipVS demo, version 1.0.0, for the OceanBase database contest. Superseded by **seekdb-hipvs-nb-demo_v1.4.0**. |
| **seekdb-hipvs-nb-demo_v1.4.0** | SeekDB and hipVS demo, version 1.4.0, for the OceanBase database contest. Used by the seekdb-hipvs notebook. |
| **Ultralytics Workshop** | An Ultralytics and OpenCV workshop (August 2026). |
| **Ultralytics YOLO26** | Ultralytics YOLO26 notebooks. |
| **ultralytics-yolo26-workshop-20260911-unified** | Used by the Ultralytics Workshop2 notebook. |
| **ultralytics_workshop_1** | Used by the Ultralytics Workshop 1 notebook. |
| **robotwin** | RoboTwin simulation with LingBot-VLA, for embodied AI. |
| **FPGA-CHINA** | FPGA RTL and HLS tools on ROCm 10, for the FPGA China event. |
| **ai-academy_in_radeon-cloud:vllm-openai-rocm-v0.26.0** | Most AI Academy courses: GPU Profiling with rocprof, GPU Debugging with ROCgdb, HIP Programming Basics, HIP Kernel Programming, CUDA-to-HIP Conversion, Triton Kernel Development, Diffusion Models - Image Generation, Agents 101 and HF on AMD. |
| **ai-academy_in_radeon-cloud:vllm-openai-rocm-v0.16.0** | AI Academy: LLM Serving Inference with vLLM, and AI on AMD. |
| **ai-academy_in_radeon-cloud:vllm-openai-rocm-v0.16.0-curl** | The v0.16.0 image plus `curl`, for the API exercise in the vLLM serving course. |
| **ai-academy_in_radeon-cloud:vllm-dev-open-mi300-08052025** | An alternative environment for the AI Academy vLLM serving course on one 48 GB GPU. |
| **ai-academy_in_radeon-cloud:vllm-openai-rocm-v0.26.0-benchmark** | AI Academy: GPU Optimization for LLM Inference, Lab 1. |
| **ai-academy_in_radeon-cloud:llms-benchmark-v1** | AI Academy: GPU Optimization for LLM Inference, Lab 2. |
| **ai-academy_in_radeon-cloud:vllm-openai-rocm-v0.26.0-web** | AI Academy: Diffusion Models - Video Generation. |
| **ai-academy_in_radeon-cloud:gspo-lab-v1.0.0** | AI Academy: Reinforcement Learning with LLMs. |
| **ai-academy_in_radeon-cloud:agentic-ai-adk-tutorial-20260317** | AI Academy: Agents 201. |
| **ai-academy_in_radeon-cloud:unsloth-rocm-20261013** | AI Academy: Finetuning Your Own R1 Reasoning Model on Unsloth. |

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
