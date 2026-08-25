---
title: 什么是 Radeon Cloud
description: Radeon Cloud 平台概览 —— GPU 实例、模型 API，以及它们之间的关系。
sidebar:
  label: 平台介绍
  order: 1
---

Radeon Cloud 让你随时拿到一块 AMD Radeon GPU。选一个环境启动它，然后在浏览器里或通过 SSH 使用。GPU 跑的是 ROCm，你熟悉的 PyTorch、vLLM、SGLang 都不用改就能用。

平台提供两类不同的东西，动手之前先想清楚你要哪一种。

## GPU 实例

**实例**是跑在 Radeon GPU 节点上的一个容器，由你定义的**模板**启动。模板记录了容器镜像、要多少 GPU、多大磁盘，以及启动时该跑什么。用同一个模板再启动一次，你会得到完全一样的环境。

实例是交互式的。你可以在浏览器里通过 JupyterLab 进去，也可以从终端 SSH 过去，用法和任何一台带 GPU 的 Linux 机器没区别 —— 装包、下权重、训练、做性能分析。

实例运行期间会消耗额度，用完就销毁。如果想让文件留下来，把模板的存储设成 **Persistent (PVC)**。

## 模型 API

**模型 API** 是一个讲 OpenAI 协议的 HTTP 端点。任何能连 OpenAI 的客户端 —— `curl`、`openai` Python SDK、LangChain、Cherry Studio —— 只要改一下 base URL 和 API key 就能连上 Radeon Cloud。

有两种：

**共享端点**免费，常驻在线。不用启动任何东西，也不花额度。去 Token Factory 拿一个 API key 就能发请求。模型由平台挑选，会不定期更换。

**专属端点**归你自己。你启动一个 deploy type 为 vLLM 或 SGLang 的模板，平台会把一个 URL 路由到你实例里跑的那个服务。模型由你选，实例运行期间的费用由你付。

## 你需要哪一种

如果你要训练、微调、在 notebook 里做探索，或者需要一个 shell，那你要的是**实例**。

如果你在做一个调用大模型的应用，那你要的是**模型 API** —— 先从免费的共享端点开始，等到需要特定模型或者稳定吞吐时再换成专属端点。

两者可以组合。一个常见的做法是：启动一个实例，用 vLLM 在上面起一个模型，然后从别处运行的应用去调它。

## 各功能入口

| | |
|---|---|
| 控制台 —— 模板、实例、额度 | [radeon-global.anruicloud.com](https://radeon-global.anruicloud.com/) |
| Token Factory —— API key、模型目录 | [developer.amd.com.cn/radeon/modelapis](https://developer.amd.com.cn/radeon/modelapis) |

## 下一步

跟着[快速上手](/radeon-cloud-docs/zh-cn/quickstart/)跑起一个实例，并发出第一个 API 请求。
