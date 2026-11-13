---
title: 选择镜像
description: 该从哪个镜像开始、列表里每个镜像是做什么的，以及怎么确认镜像里装了什么。
---

镜像决定实例里有哪些软件：ROCm、Python、PyTorch 以及相关工具。在启动表单的 **镜像** 里选择。

## 选一个稳定镜像

列表里有一组由平台维护、持续更新的稳定镜像。选中后，下拉框下方会显示一句英文说明。

| 镜像 | 表单里的说明 | 适合做什么 |
|---|---|---|
| **Base** | General-purpose ROCm environment with Python, JupyterLab and OpenCode. | 通用 ROCm 环境，日常开发、熟悉 GPU。 |
| **PyTorch · Stable** | PyTorch on ROCm, stable release, for training and running models. | 大多数 PyTorch 代码：训练、微调、运行模型。 |
| **PyTorch · Latest** | PyTorch on ROCm, newest release, for trying the latest features. | 需要比稳定版更新的 PyTorch 或 ROCm 时使用。 |
| **vLLM · Stable** | vLLM for serving LLMs behind an OpenAI-compatible API. | 自己用 `vllm serve` 部署模型。 |
| **SGLang** | SGLang for serving LLMs behind an OpenAI-compatible API. | 用 SGLang 而不是 vLLM 部署模型。 |
| **Unsloth · Fine-tuning** | Unsloth Studio for fine-tuning LLMs, with JupyterLab. | 用 Unsloth 微调大模型。 |
| **llama.cpp** | llama.cpp for running GGUF models, with Unsloth included. | 运行 GGUF 格式的模型。 |
| **ComfyUI** | ComfyUI for node-based image and video generation. | 图像和视频生成工作流。 |

稳定镜像会原地更新：名称不变，新启动的实例拿到的是更新后的版本。镜像里的版本会随之变化，请在实例里确认（方法见下文），不要只看名称。

用 **部署类型：模型 API** 部署模型时不用在这里选镜像，那个表单会自带运行环境，见[部署模型服务](/radeon-cloud-docs/zh-cn/guides/serve-model/)。

## 列表里的其他镜像

列表里还有少数专为某门课程、某场工作坊或某个活动准备的镜像。只有教程里指定时才选它们。

跟着课程或工作坊操作时，请从 [Gallery](/radeon-cloud-docs/zh-cn/guides/gallery/) 启动对应的 notebook，不用自己选镜像，notebook 会用正确的镜像启动。

## 旧镜像

2026 年 11 月，很多旧镜像已从列表中移除。用到这些镜像的 Gallery notebook 仍然会用原来的镜像启动，所以以前能用的课程，从 Gallery 启动照样能用。如果你以前直接选的是某个旧的通用镜像，请换成上面对应的稳定镜像。

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
