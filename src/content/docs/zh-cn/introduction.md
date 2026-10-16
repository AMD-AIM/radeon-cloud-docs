---
title: 什么是 AMD Radeon Cloud
description: AMD Radeon Cloud 概览：中国站和全球站、GPU 实例、模型 API，以及它们之间的关系。
sidebar:
  label: 平台介绍
  order: 1
---

AMD Radeon Cloud 按需提供 AMD Radeon GPU。选好环境、启动实例，就能在浏览器里或通过 SSH 使用。GPU 运行 ROCm，你的 PyTorch、vLLM、SGLang 代码无需修改就能运行。

## 中国站和全球站

AMD Radeon Cloud 有两个站点。两个站点功能相同，但各自独立部署，分别服务不同地区。

| 站点 | 地址 | 账号 |
|---|---|---|
| **中国站** | [developer.amd.com.cn/radeon](https://developer.amd.com.cn/radeon/) | [AMD AI 开发者计划](/radeon-cloud-docs/zh-cn/guides/developer-program/) |
| **全球站** | [radeon-global.anruicloud.com](https://radeon-global.anruicloud.com/) | 邮箱登录 |

选好所在地区的站点后就一直用它。账号、额度、API Key、模板和实例都只属于创建它们的站点，两站之间不互通。一个站点签发的 API Key 在另一个站点无法通过认证，所以代码里的 base URL 必须和你注册的站点一致。

文档里的示例会选用该功能更常用的那个站点。如果你用的是另一个站点，把地址换成你自己的即可。

## 能做什么

平台提供两类服务。开始之前，先确定你需要哪一类。

### GPU 实例

**实例** 是在 Radeon GPU 节点上运行的容器，由你定义的 **模板** 启动。模板记录了容器镜像、GPU 数量、磁盘大小，以及启动时要运行的命令。用同一个模板再次启动，得到的是同样的环境。

实例支持交互式使用。可以在浏览器里通过 JupyterLab 打开，也可以通过 SSH 连接，用法和一台带 GPU 的 Linux 机器一样：装软件包、下载权重、训练、做性能分析。

实例运行期间会消耗额度，用完请及时销毁。如果希望销毁后文件还在，把模板的存储设为 **Persistent (PVC)**。

在中国站，额度通过 AMD AI 开发者计划的积分兑换获得。见 [AMD AI 开发者计划](/radeon-cloud-docs/zh-cn/guides/developer-program/) 和[额度](/radeon-cloud-docs/zh-cn/guides/credits/)。

实例可以在网页控制台管理，也可以用 [Radeon Cloud CLI](/radeon-cloud-docs/zh-cn/cli/overview/)（`rcc`）管理。在终端里，CLI 还能查看额度和可用资源、打开 JupyterLab、SSH 登录、查看状态和日志，也方便写进脚本。

### 模型 API

**模型 API** 是兼容 OpenAI API 的 HTTP 端点。任何能调用 OpenAI 的客户端，比如 `curl`、`openai` Python SDK、LangChain、Cherry Studio，只要换掉 base URL 和 API Key，就能调用 AMD Radeon Cloud。

分为两种：

**共享端点** 免费，随时可用。不用启动任何东西，也不消耗额度。在 Token Factory 获取 API Key 后就能发请求。模型由平台选定，会不定期调整。

**专属端点** 只供你自己使用。启动一个部署类型为 vLLM 或 SGLang 的模板，平台会为你实例里的服务分配一个 URL。模型由你选择，实例运行期间消耗额度。

## 该选哪一种

训练、微调、在 notebook 里做探索，或者需要一个 shell，选 **实例**。

开发调用大模型的应用，选 **模型 API**。先用免费的共享端点，需要特定模型或稳定吞吐时，再换成专属端点。

两者也可以搭配使用。常见做法是在实例上用 vLLM 部署模型，再从别处运行的应用里调用它。

## 常用入口

| 用途 | 入口 |
|---|---|
| 控制台：模板、实例、额度 | [developer.amd.com.cn/radeon](https://developer.amd.com.cn/radeon/) 或 [radeon-global.anruicloud.com](https://radeon-global.anruicloud.com/) |
| Radeon Cloud CLI：账号、额度、可用资源、实例 | [Radeon Cloud CLI](/radeon-cloud-docs/zh-cn/cli/overview/) |
| Token Factory：API Key、模型目录 | [developer.amd.com.cn/radeon/modelapis](https://developer.amd.com.cn/radeon/modelapis) |
| AMD AI 开发者计划：积分和优惠码（中国站） | [AMD AI 开发者计划](/radeon-cloud-docs/zh-cn/guides/developer-program/) |
| 联系支持 | [member-service@mail.developer.amd.com.cn](mailto:member-service@mail.developer.amd.com.cn) |

## 下一步

按照[快速上手](/radeon-cloud-docs/zh-cn/quickstart/)启动一个实例，并发出第一个 API 请求。
