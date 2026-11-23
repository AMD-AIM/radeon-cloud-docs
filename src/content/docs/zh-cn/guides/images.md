---
title: 选择镜像
description: 该从哪个镜像开始、列表里每个镜像是做什么的、怎么确认镜像里装了什么，以及怎么用 hk-dsl 加速 vLLM 和 SGLang。
---

镜像决定实例里有哪些软件：ROCm、Python、PyTorch 以及相关工具。在启动表单的 **镜像** 里选择。

## 选一个稳定镜像

列表里有一组由平台维护、持续更新的稳定镜像。选中后，下拉框下方会显示一句英文说明。

<!-- image-versions:start -->
| 镜像 | 主要版本（当前构建） | 表单里的说明 | 适合做什么 |
|---|---|---|---|
| **Base** | ROCm 7.2.4 · Python 3.12 · PyTorch 2.10.0 | General-purpose ROCm environment with Python and JupyterLab. | 通用开发：PyTorch、Hugging Face 常用库和 JupyterLab。需要 vLLM 请用 vLLM · Stable。 |
| **PyTorch · Stable** | ROCm 7.14.1 · Python 3.12 · PyTorch 2.12.0 | PyTorch on ROCm, stable release, for training and running models. | 大多数 PyTorch 代码：训练、微调、运行模型。 |
| **PyTorch · Latest** | ROCm 10.1.0 · Python 3.12 · PyTorch 2.14.0 | PyTorch on ROCm, newest release, for trying the latest features. | 需要比稳定版更新的 PyTorch 或 ROCm 时使用。 |
| **vLLM · Stable** | ROCm 7.2.3 · Python 3.12 · PyTorch 2.13.0 · vLLM 0.33.0 | vLLM for serving LLMs behind an OpenAI-compatible API. | 自己用 `vllm serve` 部署模型。 |
| **vLLM · Latest** | ROCm 10.0.0 · Python 3.12 · PyTorch 2.13.0 · vLLM 0.33.0 | vLLM on the newest ROCm release, for trying the latest features. | 想在更新的 ROCm 上试用 vLLM 时使用；正式部署服务请用 vLLM · Stable。 |
| **SGLang** | ROCm 7.2.4 · Python 3.12 · PyTorch 2.10.0 · SGLang 0.5.19 | SGLang for serving LLMs behind an OpenAI-compatible API. | 用 SGLang 而不是 vLLM 部署模型。 |
| **Unsloth · Fine-tuning** | ROCm 7.2.4 · Python 3.12 · PyTorch 2.10.0 · Unsloth 2026.7.2 | Unsloth Studio for fine-tuning LLMs, with JupyterLab. | 用 Unsloth 微调大模型。 |
| **llama.cpp** | ROCm 7.2.4 · Python 3.12 · PyTorch 2.10.0 · llama.cpp b9766 · Unsloth 2026.6.9 | llama.cpp for running GGUF models, with Unsloth included. | 运行 GGUF 格式的模型。 |
| **ComfyUI** | ROCm 7.14.1 · Python 3.12 · PyTorch 2.12.0 · ComfyUI 0.45.0 | ComfyUI for node-based image and video generation. | 图像和视频生成工作流。 |
<!-- image-versions:end -->

**Base 于 2026 年 11 月更新。** 不再包含 vLLM：部署模型请选 **vLLM · Stable** 或 **vLLM · Latest**。现在预装 PyTorch 2.10 以及 transformers、datasets、accelerate、scikit-learn。Hugging Face 命令改为 `hf`（例如 `hf download Qwen/Qwen3-0.6B`），原来的 `huggingface-cli` 已没有。更新前启动的实例仍使用原来的镜像。

稳定镜像会原地更新：名称不变，新启动的实例拿到的是更新后的版本。表格里和下拉框下方说明里的主要版本是当前构建的版本，每次发布都会更新。版本取自 Global 的构建，中国站可能短时间内落后一个版本。想看镜像里的全部内容，请在实例里确认（方法见下文）。

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

## 用 hk-dsl 加速 vLLM 和 SGLang

[hk-dsl](https://pypi.org/project/hk-dsl/) 是一个 Python 包，它会把 vLLM 和 SGLang 的部分 GPU kernel 换成专为 Radeon GPU 编写的 kernel。使用方法：

1. 用 **vLLM · Stable** 或 **SGLang** 镜像启动实例。
2. 在终端里安装，然后照常启动服务：

   ```bash
   pip install -U hk-dsl
   vllm serve <模型名>                                  # vLLM · Stable
   python -m sglang.launch_server --model-path <模型名> # SGLang
   ```

3. 查看启动日志。出现 `[hk] vLLM routes on: ...` 或 `[hk] SGLang routes on: ...` 说明 hk-dsl 已生效。想关闭它，启动服务时加上 `HK_DISABLE=1`。

vLLM 需要 hk-dsl 0.9.21 或更新版本，SGLang 需要 0.9.22 或更新版本，可以用 `pip show hk-dsl` 查看。在 vLLM 或 SGLang 版本不受 hk-dsl 支持的镜像上（例如 **Base**），它不会生效，日志里会用一行说明，服务照常运行。

在 **SGLang** 镜像上，新实例第一次启动服务时，日志里可能出现 aiter 编译相关的信息，并多花约 13 秒。这与 hk-dsl 无关，不影响使用。

实测结果见 [hk-dsl scorecard](https://vivienfanghuagood.github.io/hk-dsl/performance/scorecard/)。
