---
title: 保存数据
description: 临时工作区与持久化工作区、只读挂载的模型，以及销毁实例前怎么把文件拿出来。
---

文件能否保留，取决于启动时选的 **工作区存储**。请在启动前决定：运行中的实例不能修改这项设置。

## 临时还是持久化

| 选项 | `/workspace` 会怎样 |
|---|---|
| **临时工作区（本地高速存储）** | 使用节点上的本地高速磁盘。实例销毁时，数据全部删除。这是默认选项。 |
| **持久化 /workspace** | `/workspace` 下的全部内容都会保留，供下一次启动实例继续使用。 |

只有 `/workspace` 会保留。用 `pip` 安装的包、主目录里的文件，以及 `/workspace` 之外的其他内容，都会随实例销毁。新实例启动后默认就在 `/workspace` 目录下。

要使用持久化存储，在启动表单里打开 **自定义**，把 **工作区存储** 设为 **持久化 /workspace**。

## 容量

持久化 /workspace 的容量是 25 GB。

## /workspace 里该放什么

- 代码、Notebook、配置文件和结果。
- 定期保存的训练检查点。
- 一份 `requirements.txt`，列出你额外需要的包。安装的包不会带到下一个实例，每次启动后重新安装一遍：

  ```bash
  pip install -r /workspace/requirements.txt
  ```

  文件里不要写 `torch`，以免覆盖镜像自带的 ROCm 版 PyTorch。

大数据集和模型权重很快就能占满 25 GB。用 `du -sh /workspace/*` 和 `df -h /workspace` 查看占用情况。

## 挂载的模型

启动表单里的 **挂载模型** 会把平台准备好的模型以只读方式挂载进实例。直接从挂载目录读取权重，不用另外下载。需要修改时，先复制到 `/workspace`。

表单下拉里目前是这四项（2026-11 中国站，列表会变，以表单为准）：

| 表单选项 | 挂载路径 |
|---|---|
| **ComfyUI** | `/comfyui_workspace/ComfyUI/models`（ComfyUI 读取模型的位置） |
| **Openclaw** | `/models` |
| **Devzone** | `/models` |
| **AMD AI Developer Hub CI** | `/models` |

不需要就保持 **不挂载**。挂载是只读的，输出请写到 `/workspace`。

## 销毁实例之前

销毁确认框会提醒你：临时工作区的数据会被删除，持久化工作区的数据会保留。确认之前，把需要的文件转移出来：

- 实例使用持久化存储时，移到 `/workspace` 里。
- 下载到本地：在 JupyterLab 文件浏览器里右键文件，选 **Download**；或者通过 [SSH](/radeon-cloud-docs/zh-cn/guides/ssh/) 用 `scp` 拷贝。
- 推送到 Git 仓库，或上传到你自己的对象存储。
