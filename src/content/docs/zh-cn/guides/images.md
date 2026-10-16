---
title: 选择镜像
description: 该从哪个镜像开始、怎么看镜像列表，以及怎么确认镜像里装了什么。
---

镜像决定实例里有哪些软件：ROCm、Python、PyTorch 以及相关工具。在启动表单的 **镜像** 里选择。

## 从 AMD OneClick Base 开始

**AMD OneClick Base** 是默认镜像，表单里的说明是 **Default ROCm Jupyter/OpenCode image**。它包含 ROCm 软件栈、JupyterLab 和 OpenCode，由平台维护，适合日常开发。没有特别理由的话，就用它。

## 怎么看镜像列表

**镜像** 是一个可搜索的下拉框，输入名称的一部分即可筛选。选中的镜像如果有说明，会显示在下拉框下方。

列表内容因账号而异，其中也有专为某门课程、某场工作坊或某个演示准备的镜像。一般按下表选择：

| 你想做什么 | 选哪个 |
|---|---|
| 日常开发、探索，或运行大多数 PyTorch 代码 | **AMD OneClick Base** |
| 使用原版 ROCm PyTorch 环境 | 名称里带 **rocm-pytorch** 的镜像 |
| 跟着课程、工作坊或教程操作 | 教程里指定的镜像 |
| 用模型 API 部署模型 | 不用在这里选，模型 API 表单会自带运行环境。见[模型 API](/radeon-cloud-docs/zh-cn/guides/model-apis/)。 |

没有说明的镜像，除非教程要求，否则不要选。

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
