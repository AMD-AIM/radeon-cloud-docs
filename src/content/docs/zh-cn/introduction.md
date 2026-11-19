---
title: 什么是 AMD Radeon Cloud
description: AMD Radeon Cloud 概览：中国站和全球站、GPU 实例和 Token Factory。
sidebar:
  label: 平台介绍
  order: 1
---

AMD Radeon Cloud 按需提供 AMD Radeon GPU。选好镜像和规格后启动，就能在浏览器里或通过 SSH 使用。GPU 运行 ROCm，PyTorch、vLLM、SGLang 代码无需修改就能运行。

## 中国站和全球站

AMD Radeon Cloud 有两个站点，各自独立部署，分别服务不同地区。两个站点都提供 GPU 实例和 Token Factory。

| 站点 | 地址 | 账号 |
|---|---|---|
| **中国站** | [developer.amd.com.cn/radeon](https://developer.amd.com.cn/radeon/) | [AMD AI 开发者计划](/radeon-cloud-docs/zh-cn/guides/developer-program/) |
| **全球站** | [radeon-global.anruicloud.com](https://radeon-global.anruicloud.com/) | [邮箱](/radeon-cloud-docs/zh-cn/guides/login/#全球站) 或 [AMD Developer Program](/radeon-cloud-docs/zh-cn/guides/login/#全球站) |

请使用所在地区的站点。账号、积分、API Key 和实例都只属于创建它们的站点。一个站点的 API Key 在另一个站点无法使用，所以代码里的 base URL 必须和你的站点一致。

文档示例使用中国站的地址。用全球站时，换成全球站的地址即可。

本文档以**新版控制台**为准。中国站登录后可能先进入[经典版界面](/radeon-cloud-docs/zh-cn/resources/classic-ui/)，页顶横幅可以切到新版。

## 能做什么

### GPU 实例

**实例** 是一个带一块或多块 Radeon GPU 的容器。启动时选择镜像和规格：镜像决定预装的软件，规格决定 GPU 数量、CPU 核数和内存。见[选择镜像](/radeon-cloud-docs/zh-cn/guides/images/)。

实例可以在 [JupyterLab](/radeon-cloud-docs/zh-cn/guides/jupyterlab/) 里打开，也可以通过 [SSH](/radeon-cloud-docs/zh-cn/guides/ssh/) 连接，用法和一台带 GPU 的 Linux 机器一样：装软件包、下载权重、训练、做性能分析。

实例运行期间每小时消耗[积分](/radeon-cloud-docs/zh-cn/guides/credits/)，用完请及时[销毁](/radeon-cloud-docs/zh-cn/guides/destroy/)。启动时需要选择 **自动销毁**：这是实例就绪后最多能跑多久，到点后即使你还在用，实例也会被销毁。临近到期可以 **延长** 一次，延长时间不能超过启动时选的时长。如果希望销毁后文件还在，启动时选择 **持久化 /workspace**，见[保存数据](/radeon-cloud-docs/zh-cn/guides/storage/)。在中国站，积分用 [AMD AI 开发者计划](/radeon-cloud-docs/zh-cn/guides/developer-program/) 的开发者积分兑换。

实例还可以用 vLLM 部署你选的模型，对外提供兼容 OpenAI 的接口，见[部署模型服务](/radeon-cloud-docs/zh-cn/guides/serve-model/)。

实例可以在控制台里管理，也可以用 [Radeon Cloud CLI](/radeon-cloud-docs/zh-cn/cli/overview/)（`rcc`）在终端里管理。

### Token Factory

**Token Factory** 在 Radeon GPU 上托管了一批模型，通过兼容 OpenAI 的接口提供服务。它免费、随时可用：拿到 API Key 就能发请求。`curl`、`openai` Python SDK、LangChain、Cherry Studio 等 OpenAI 客户端，只要换掉 base URL 和 API Key 就能调用。模型由平台选定，会不定期调整。见 [Token Factory](/radeon-cloud-docs/zh-cn/guides/token-factory/)。

## 该选哪一种

训练、微调、用 notebook，或者需要一个 shell，选 **实例**。

开发调用大模型的应用，先用 **Token Factory**。如果需要它尚未部署的模型，再[在实例上部署模型服务](/radeon-cloud-docs/zh-cn/guides/serve-model/)。

## 常用入口

| 用途 | 入口 |
|---|---|
| 控制台：实例、积分、设置 | [developer.amd.com.cn/radeon](https://developer.amd.com.cn/radeon/) 或 [radeon-global.anruicloud.com](https://radeon-global.anruicloud.com/) |
| Token Factory：复制 API Key、查看模型 | [中国站](https://developer.amd.com.cn/radeon/tokenfactory) 或 [全球站](https://radeon-global.anruicloud.com/tokenfactory) |
| Radeon Cloud CLI | [Radeon Cloud CLI](/radeon-cloud-docs/zh-cn/cli/overview/) |
| AMD AI 开发者计划：开发者积分和优惠码（中国站） | [AMD AI 开发者计划](/radeon-cloud-docs/zh-cn/guides/developer-program/) |
| 联系支持 | [member-service@mail.developer.amd.com.cn](mailto:member-service@mail.developer.amd.com.cn) |

## 下一步

按照[快速上手](/radeon-cloud-docs/zh-cn/quickstart/)发出第一个 API 请求，并启动一个实例。
