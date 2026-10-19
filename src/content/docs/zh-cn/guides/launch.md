---
title: 启动实例
description: 在首页启动 GPU 实例，启动表单里每个字段的含义，以及启动失败时怎么办。
---

实例在控制台的 **首页** 启动。本页依次介绍启动表单、启动进度弹窗，以及可能遇到的报错。

## 开始之前

- 先登录，见[登录](/radeon-cloud-docs/zh-cn/guides/login/)。
- 确认积分至少够所选规格运行 1 小时，见[积分](/radeon-cloud-docs/zh-cn/guides/credits/)。
- 要用 SSH，先在 **设置** 里添加公钥，见[通过 SSH 连接](/radeon-cloud-docs/zh-cn/guides/ssh/)。
- 销毁仍在运行的实例。每个账号同时只能运行一个实例。

## 用默认配置启动

1. 打开 **首页**。
2. **部署类型** 保持 **Notebook**。
3. **镜像** 保持 **AMD OneClick Base**，或者换成其他镜像，见[选择镜像](/radeon-cloud-docs/zh-cn/guides/images/)。
4. 点 **启动实例**。

![关闭自定义时的启动表单：Notebook、1 GPU、AMD OneClick Base](../../../../assets/guide/zh/launch-default.png)

**自定义** 关闭时，表单使用你账号可用的最小规格、临时工作区，不挂载模型。按钮上方那一行会显示最终配置，例如 **1 GPU · 16 核 · 55GB · 1 积分 / 小时**。

如果表单上显示 **超时回收**，实例会在就绪后经过这段时间自动删除，例如 **就绪后 7 天**，不论你是否在使用。时长取决于资源池；显示 **不自动回收** 表示没有时间限制。

## 自定义启动配置

打开 **自定义**，可以设置其余选项。

| 字段 | 怎么选 |
|---|---|
| **规格** | 选择 GPU 数量。同一 GPU 数量有多种内存时，会出现 **内存** 一行，每个选项都标有每小时消耗的积分。选能装下你的模型的最小规格。 |
| **镜像** | 默认镜像适合大多数场景。 |
| **资源池** | 大多数账号只有一个资源池。如果你有多个，启动因资源不足失败时可以换一个试试。 |
| **工作区存储** | **临时工作区（本地高速存储）** 速度快，随实例删除；**持久化 /workspace** 会保留 `/workspace` 下的全部内容，供下一个实例使用。部分账号还可以选择 25 GB 或 100 GB。见[保存数据](/radeon-cloud-docs/zh-cn/guides/storage/)。 |
| **挂载模型** | 把平台准备好的模型以只读方式挂载到 `/models`，省去下载。不需要就保持 **不挂载**。 |

![打开自定义后多出的字段：资源池、工作区存储（已选持久化 /workspace）、挂载模型](../../../../assets/guide/zh/launch-customize.png)

运行中的实例不能修改配置。要换存储或规格，先销毁实例再重新启动。

要部署模型服务，把 **部署类型** 设为 **模型 API**，见[部署专属模型 API](/radeon-cloud-docs/zh-cn/guides/dedicated-models/)。

## 查看启动进度

点 **启动实例** 后，会弹出 **正在启动实例**，依次经过 **已请求**、**调度中**、**准备中**、**启动中**、**就绪**。

![启动进行到“调度中”时的弹窗](../../../../assets/guide/zh/launch-progress.png)

- **查看日志** 显示调度事件和容器输出。分配到节点、拉取完镜像之前，容器输出是空的。
- **后台继续** 会关闭弹窗，启动照常进行，就绪后 **首页** 会显示这个实例。
- **取消启动** 会停止这次启动。

![启动过程中的查看日志，平台正在配置 SSH](../../../../assets/guide/zh/instance-logs.png)

有空闲节点时，实例通常一分钟内就能就绪。某个镜像在一个节点上第一次启动时会慢一些，因为节点要先下载镜像。

## 启动完成后

弹窗显示 **实例已就绪**。点 **打开 Notebook**，会在新标签页打开 [JupyterLab](/radeon-cloud-docs/zh-cn/guides/jupyterlab/)。

![实例就绪时的启动弹窗，可以点打开 Notebook](../../../../assets/guide/zh/launch-ready.png)

此时 **首页** 显示实例卡片：

- **打开 Notebook**：打开 JupyterLab。
- **查看日志**：查看启动事件和容器输出。
- **销毁实例**：删除实例，见[销毁实例](/radeon-cloud-docs/zh-cn/guides/destroy/)。
- 卡片上还会显示镜像、已运行时长和已消耗的积分。
- SSH 准备好之后会显示 SSH 命令，见[通过 SSH 连接](/radeon-cloud-docs/zh-cn/guides/ssh/)。

![实例卡片，包括打开 Notebook、查看日志、销毁实例和 SSH 命令](../../../../assets/guide/zh/instance-card.png)

## 启动失败时

![资源池没有空闲节点导致的启动失败](../../../../assets/guide/zh/launch-failed-capacity.png)

| 提示 | 含义 | 处理方法 |
|---|---|---|
| **No matching Node has enough free CPU, memory, and GPUs for this launch** | 所选资源池里的节点都满了。 | 打开 **自定义**，有其他 **资源池** 就换一个；或者选更小的规格；或者稍后再试。如果账号只有一个资源池且反复失败，请发邮件到 [member-service@mail.developer.amd.com.cn](mailto:member-service@mail.developer.amd.com.cn)。 |
| **等待空闲 GPU** | 暂时没有节点有空位，启动仍在排队。 | 继续等待，或者取消后换更小的规格或其他资源池。 |
| **镜像拉取失败** | 节点没能下载镜像。 | 重试一次。仍然失败就换一个镜像，并把镜像名称告诉支持。 |
| **您已有一个正在运行的实例。** | 账号下已经有实例在运行。 | 先销毁它。 |
| **资源目录不可用，请重试。** | 控制台没能加载你账号可用的规格和资源池。 | 刷新页面。 |

启动失败不会创建实例，也不会消耗积分。

更多情况见[疑难排查](/radeon-cloud-docs/zh-cn/resources/troubleshooting/)。

## 在终端里启动

`rcc instance create` 可以在命令行启动同样的实例，见[管理 GPU 实例](/radeon-cloud-docs/zh-cn/cli/instances/)。
