---
title: 在 JupyterLab 里工作
description: 使用实例自带的浏览器版 JupyterLab 环境。
sidebar:
  order: 4
---

实例就绪后，点 **Open Notebook**。

![就绪弹窗里的 Open Notebook 按钮](../../../../assets/guide/open-notebook.png)

JupyterLab 会在新标签页打开。这是进入实例的默认方式，在浏览器里就有一整套开发环境。

![JupyterLab 工作区](../../../../assets/guide/jupyterlab.png)

## 里面有什么

**终端** —— 一个真正的 Linux shell。点顶部的 `+`，再点 **Terminal**，或者用 Launcher 里的 Terminal 卡片。用它装包、下权重、起服务。

**Notebook** —— 代码和输出混排的 `.ipynb` 文档，做交互式探索的常规方式。

**文件浏览器** —— 左侧那个面板。用上传按钮（`↑`）把自己的 notebook 和数据传进来。

## 检查 GPU

在终端里：

```bash
rocm-smi
```

这会列出挂给实例的 Radeon GPU，以及显存占用和温度。确认 PyTorch 能看到它们：

```bash
python -c "import torch; print(torch.cuda.is_available(), torch.cuda.device_count())"
```

在 ROCm 版本的 PyTorch 上，仍然用 CUDA 那套 API 名字 —— `torch.cuda.is_available()` 返回 `True` 就说明 ROCm 正常。

## 让任务活下去

终端一关，长任务就死了。用后台方式启动：

```bash
nohup python train.py > train.log 2>&1 &
```

只有模板用了 **Persistent (PVC)** 存储，文件才能在实例销毁后留下来。否则先把需要的东西下载走。

## 对外暴露服务

想让 notebook 里跑的 HTTP 服务能从公网访问 —— 比如一个 Gradio 应用，或者你正在开发的 API —— 见[暴露服务](/radeon-cloud-docs/zh-cn/guides/tunnel/)。
