---
title: 启动实例
description: 从你的模板启动一个 GPU 实例。
sidebar:
  order: 3
---

在 **My Templates** 里，找到想跑的模板那一行，点 **Launch**。

![模板行上的 Launch 按钮](../../../../assets/guide/launch.png)

分配需要一小会儿：平台要找节点、拉镜像、挂存储。弹窗会显示进度，实例起来后显示 **Your workspace is ready (100%)**。

## 你会拿到什么

实例就绪后，弹窗会给出进入它的各种方式。具体有哪些取决于模板：

- **Open Notebook** —— 在新标签页打开 [JupyterLab](/radeon-cloud-docs/zh-cn/guides/jupyterlab/)。
- **SSH access** —— 一条可直接复制的命令，外加主机、端口和用户名；前提是模板[启用了 SSH](/radeon-cloud-docs/zh-cn/guides/ssh/)。
- **Base URL、Model、API Key** —— vLLM 和 SGLang 模板才有，即[专属模型端点](/radeon-cloud-docs/zh-cn/guides/model-apis/#专属端点)。

这些信息在 Profile 的 **Active Instance** 里也一直能看到，所以放心关掉弹窗。

## 几条需要知道的限制

**同时只能有一个实例。** 每个账号只能有一个活跃实例。启动新的之前要先销毁当前那个。

**额度会提前检查。** 你的额度至少要不少于申请的 GPU 数量。见[额度](/radeon-cloud-docs/zh-cn/guides/credits/)。

**GPU 数量只能是 1、2 或 4。** 其他值会被拒绝。

**启动有频率限制。** 短时间内反复启动会被限流 —— 大致是每分钟一次、每十分钟三次、每小时五次。触发限制时控制台会告诉你还要等多久。

## 如果启动失败

实例起不来，可能是镜像太大拉得慢，可能是集群一时凑不出你要的 GPU 数量，也可能是模板的启动命令跑完就退出了。先看弹窗里的状态信息，再看[排查问题](/radeon-cloud-docs/zh-cn/resources/troubleshooting/)。
