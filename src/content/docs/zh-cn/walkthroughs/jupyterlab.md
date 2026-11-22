---
title: "操作演示：JupyterLab 与终端"
description: "在实例里运行 Notebook 单元格、打开终端。"
---

**什么时候用：**实例已就绪，准备开始工作。

![操作演示动图：JupyterLab 与终端](/radeon-cloud-docs/walkthroughs/zh/jupyterlab.gif)

## 步骤

1. 在实例卡片上点 **Open notebook**。
2. JupyterLab 打开后，启动器里有 Notebook 和终端。
3. 新建一个 **Python 3** Notebook。
4. 运行代码：PyTorch 能看到 AMD GPU。
5. 左侧文件浏览器就是 `/workspace`。
6. 需要传入文件时，用 **Upload（上传）**。
7. 在启动器里打开 **Terminal（终端）**。
8. 终端会先显示使用说明：GitHub 镜像、模型下载、哪些文件会保留。
9. 像平常一样运行命令，例如用 `rocm-smi` 查看 GPU。

## 常见遗漏

- 左侧文件浏览器就是 `/workspace`，只有这里能保留，且需启动时选择持久化存储。
- GitHub 访问不稳定时，先在自己电脑上下载，再用「Upload」传进来。

更多说明：[JupyterLab](/radeon-cloud-docs/zh-cn/guides/jupyterlab/)
