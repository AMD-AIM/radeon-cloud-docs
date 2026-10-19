---
title: 选择镜像
description: 该从哪个镜像开始、列表里每个镜像是做什么的，以及怎么确认镜像里装了什么。
---

镜像决定实例里有哪些软件：ROCm、Python、PyTorch 以及相关工具。在启动表单的 **镜像** 里选择。

## 从 AMD OneClick Base 开始

**AMD OneClick Base** 是默认镜像，表单里的说明是 **Default ROCm Jupyter/OpenCode image**。它由平台维护，适合日常开发。没有特别理由的话，就用它。

2026 年 10 月时它包含：

| 组件 | 版本 |
|---|---|
| 操作系统 | Ubuntu 24.04 |
| Python | 3.12，位于 `/opt/venv` 虚拟环境中 |
| PyTorch | 2.9.1，基于 ROCm 7.2 构建 |
| JupyterLab | 4.5 |
| 其他工具 | OpenCode、`rocm-smi` |

镜像会不定期更新，请以你实例里的实际版本为准（查看方法见下文）。

## 怎么看镜像列表

**镜像** 是一个可搜索的下拉框，输入名称的一部分即可筛选。选中的镜像如果有说明，会显示在下拉框下方。

列表内容因账号而异，其中也有专为某门课程、某场工作坊或某个演示准备的镜像。一般按下表选择：

| 你想做什么 | 选哪个 |
|---|---|
| 日常开发、探索，或运行大多数 PyTorch 代码 | **AMD OneClick Base** |
| 使用原版 ROCm PyTorch 环境 | **rocm-pytorch** |
| 跟着课程、工作坊或教程操作 | 教程里指定的镜像 |
| 用 **部署类型：模型 API** 部署模型 | 不用在这里选，那个表单会自带运行环境，见[部署模型服务](/radeon-cloud-docs/zh-cn/guides/serve-model/)。 |

没有说明的镜像，除非教程要求，否则不要选。

## 镜像列表说明

下表列出 2026 年 10 月中国站的镜像，名称和 **镜像** 下拉框里显示的一致。你看到的列表可能不同，镜像也会陆续增减。

跟着课程或工作坊操作时，建议直接在[模板库](/radeon-cloud-docs/zh-cn/guides/gallery/)里启动对应的 Notebook，不用自己选镜像，启动时会自动使用正确的镜像。

### 通用镜像

| 镜像 | 包含什么 | 适合做什么 |
|---|---|---|
| **AMD OneClick Base** | ROCm 7.2、Python 3.12、PyTorch、JupyterLab 和 OpenCode，由平台维护，见[上文](#从-amd-oneclick-base-开始)。 | 大多数工作，默认镜像。 |
| **rocm-pytorch** | AMD 官方的 `rocm/pytorch` 镜像：ROCm 7.2.4、Ubuntu 24.04、Python 3.12、PyTorch 2.10.0。 | 需要原版 ROCm PyTorch 环境，或者比 AMD OneClick Base 更新的 PyTorch。 |
| **rocm10-pytorch** | 基于 ROCm 10 的官方 `rocm/pytorch` 镜像。 | 试用 ROCm 10。Hello GPU 这个 Notebook 用的就是它。 |

### 模型服务

| 镜像 | 包含什么 | 适合做什么 |
|---|---|---|
| **Qwen3.8-27B** | 配置好用于部署 Qwen3.8-27B 的 vLLM，需要 2 卡规格。 | 在 Notebook 里自己运行 Qwen3.8-27B。如果只需要一个可调用的接口、不想自己配置 vLLM，请改用[部署模型服务](/radeon-cloud-docs/zh-cn/guides/serve-model/)。 |

### 课程、工作坊和活动

这些镜像是为某门课程或某个活动准备的，只在相应教程要求时才选。

| 镜像 | 用途 |
|---|---|
| **AMD-Stable-GH-Proxy** | AMD OneClick Base 的变体，带有访问 GitHub 的代理。Hello ROCm 和 AgenticAI推理自优化 这两个 Notebook 使用它。 |
| **Unsloth Studio** | Unsloth 微调环境。Modern LLM Notebook 使用它。 |
| **Muse Glimmer Llamacpp** | 为某个活动准备的 llama.cpp 环境。 |
| **Oceanbase** | OceanBase 数据库大赛用的 SeekDB 和 hipVS 演示环境，1.0.0 版，已被 **seekdb-hipvs-nb-demo_v1.4.0** 取代。 |
| **seekdb-hipvs-nb-demo_v1.4.0** | OceanBase 数据库大赛用的 SeekDB 和 hipVS 演示环境，1.4.0 版。seekdb-hipvs 这个 Notebook 使用它。 |
| **Ultralytics Workshop** | Ultralytics 和 OpenCV 工作坊（2026 年 8 月）。 |
| **Ultralytics YOLO26** | Ultralytics YOLO26 的 Notebook。 |
| **ultralytics-yolo26-workshop-20260911-unified** | Ultralytics Workshop2 这个 Notebook 使用它。 |
| **ultralytics_workshop_1** | Ultralytics Workshop 1 这个 Notebook 使用它。 |
| **robotwin** | 具身智能用的 RoboTwin 仿真和 LingBot-VLA。 |
| **FPGA-CHINA** | FPGA China 活动用的 FPGA RTL 和 HLS 工具，基于 ROCm 10。 |
| **ai-academy_in_radeon-cloud:vllm-openai-rocm-v0.26.0** | AI Academy 的大部分课程：GPU Profiling with rocprof、GPU Debugging with ROCgdb、HIP Programming Basics、HIP Kernel Programming、CUDA-to-HIP Conversion、Triton Kernel Development、Diffusion Models - Image Generation、Agents 101 和 HF on AMD。 |
| **ai-academy_in_radeon-cloud:vllm-openai-rocm-v0.16.0** | AI Academy：LLM Serving Inference with vLLM、AI on AMD。 |
| **ai-academy_in_radeon-cloud:vllm-openai-rocm-v0.16.0-curl** | 在 v0.16.0 镜像基础上加了 `curl`，用于 vLLM 服务课程里的 API 练习。 |
| **ai-academy_in_radeon-cloud:vllm-dev-open-mi300-08052025** | AI Academy vLLM 服务课程的另一套环境，用一块 48 GB GPU。 |
| **ai-academy_in_radeon-cloud:vllm-openai-rocm-v0.26.0-benchmark** | AI Academy：GPU Optimization for LLM Inference 的 Lab 1。 |
| **ai-academy_in_radeon-cloud:llms-benchmark-v1** | AI Academy：GPU Optimization for LLM Inference 的 Lab 2。 |
| **ai-academy_in_radeon-cloud:vllm-openai-rocm-v0.26.0-web** | AI Academy：Diffusion Models - Video Generation。 |
| **ai-academy_in_radeon-cloud:gspo-lab-v1.0.0** | AI Academy：Reinforcement Learning with LLMs。 |
| **ai-academy_in_radeon-cloud:agentic-ai-adk-tutorial-20260317** | AI Academy：Agents 201。 |
| **ai-academy_in_radeon-cloud:unsloth-rocm-20261013** | AI Academy：Finetuning Your Own R1 Reasoning Model on Unsloth。 |

## 确认镜像里装了什么

镜像会更新，版本也会随之变化，所以请在实例里确认，不要只看名称。在 JupyterLab 终端里运行：

```bash
rocm-smi
python --version
python -c "import torch; print(torch.__version__, torch.version.hip, torch.cuda.is_available())"
pip list
```

`torch.version.hip` 显示 PyTorch 对应的 ROCm 版本；`torch.cuda.is_available()` 返回 `True` 说明 PyTorch 可以使用 GPU。

:::caution[不要从 PyPI 重装 PyTorch]
`pip install torch` 会把镜像自带的 ROCm 版 PyTorch 换成 CUDA 版，之后 PyTorch 就看不到 GPU 了。其他包照常安装，PyTorch 保留镜像自带的版本。
:::

## 自定义镜像

在经典版 **Custom Images** 页面构建的自定义镜像，构建完成后会出现在列表里，名称后面带 **(custom)**。
