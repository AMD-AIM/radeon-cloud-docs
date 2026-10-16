---
title: 保存数据
description: 临时工作区与持久化工作区、只读挂载在 /models 的模型，以及销毁实例前怎么把文件拿出来。
---

文件能否保留，取决于启动时选的 **工作区存储**。请在启动前决定：运行中的实例不能修改这项设置。

## 临时还是持久化

| 选项 | `/workspace` 会怎样 |
|---|---|
| **临时工作区（本地高速存储）** | 使用节点上的本地高速磁盘。实例销毁时，数据全部删除。这是默认选项。 |
| **持久化 /workspace** | `/workspace` 下的全部内容都会保留，下次启动同样使用持久化存储的实例时还能看到。 |

只有 `/workspace` 会保留。装进系统 Python 的包、主目录里的文件，以及 `/workspace` 之外的其他内容，都会随实例删除。

要使用持久化存储，在启动表单里打开 **自定义**，把 **工作区存储** 设为 **持久化 /workspace**。

## 容量

持久化存储默认 25 GB。部分账号可以在 **持久化工作区容量** 里选择 **100 GB 大容量存储**。

25 GB 和 100 GB 是两块独立的存储。用其中一种容量保存的文件，换成另一种容量启动后看不到。请始终使用同一种容量。

## /workspace 里该放什么

- 代码、Notebook、配置文件和结果。
- 定期保存的训练检查点。
- 如果要装很多包，可以在 `/workspace` 里建虚拟环境：

  ```bash
  python -m venv --system-site-packages /workspace/venv
  source /workspace/venv/bin/activate
  ```

  `--system-site-packages` 让虚拟环境里仍然能用镜像自带的 ROCm 版 PyTorch。

大数据集和模型权重很快就能占满 25 GB。用 `du -sh /workspace/*` 和 `df -h /workspace` 查看占用情况。

## /models 里的模型

启动表单里的 **挂载模型** 会把平台准备好的模型以只读方式挂载到 `/models`。直接从这里读取权重，不用另外下载。需要修改时，先复制到 `/workspace`。

## 销毁实例之前

销毁确认框会提醒你：临时工作区的数据会被删除，持久化工作区的数据会保留。确认之前，把需要的文件转移出来：

- 实例使用持久化存储时，移到 `/workspace` 里。
- 下载到本地：在 JupyterLab 文件浏览器里右键文件，选 **Download**；或者通过 [SSH](/radeon-cloud-docs/zh-cn/guides/ssh/) 用 `scp` 拷贝。
- 推送到 Git 仓库，或上传到你自己的对象存储。
