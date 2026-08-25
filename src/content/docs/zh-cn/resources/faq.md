---
title: 常见问题
description: 关于 AMD Radeon Cloud 的常见问题简答。
sidebar:
  order: 2
---

## 上手

**用 Model API 需要先启动实例吗？**
不需要。共享端点免费且一直在线——去 [Token Factory](https://developer.amd.com.cn/radeon/modelapis) 拿个密钥就能调。只有当你要一个 shell、一个 notebook，或者目录里没有的模型时，才需要实例。

**能同时跑多个实例吗？**
不能。每个账户一个活跃实例。要启动新的，先销毁当前那个。

**能拿到几张 GPU？**
1、2 或 4 张。

## 花费

**什么会消耗额度？**
运行中的实例，按 GPU 数量计。免费的共享 Model API 不动额度。[独占端点](/radeon-cloud-docs/zh-cn/api/dedicated-endpoints/)会，因为它跑在实例上。

**实例闲着也扣费吗？**
扣。只要实例还在，额度就一直在消耗，不管你用没用。用完就[销毁它](/radeon-cloud-docs/zh-cn/guides/destroy/)。

**Model API 的花费和额度是一回事吗？**
不是，是两笔独立预算。共享 Model API 有自己的每日上限，通过 [`GET /api/profile/model-usage`](/radeon-cloud-docs/zh-cn/api/usage/) 查看。

## 存储

**我的文件能留下来吗？**
只有模板用了 **Persistent (PVC)** 存储才行。否则一切都随实例一起没。

**能给正在跑的实例加持久化存储吗？**
不能。这是模板上的设置。创建或编辑模板，然后重新启动。

**磁盘能开多大？**
从 100 GB 起，上限随 GPU 数量而定——1 卡 100 GB，2 卡 150，4 卡 200。

## 模型与兼容性

**我的 CUDA 代码能跑吗？**
ROCm 实现了同一套 PyTorch API 面，`torch.cuda.*` 调用在 ROCm 版本上照样能用。上层的 PyTorch 代码通常不用改就能跑。手写的 CUDA kernel 需要用 HIP 移植，只发布 CUDA 二进制的库则用不了。

**共享端点上有哪些模型？**
会变。调 [`GET /v1/models`](/radeon-cloud-docs/zh-cn/api/models/)，别把名字写死。

**独占端点上什么模型都能跑吗？**
只要是 vLLM 或 SGLang 支持、且装得进你分配的显存的模型都行。权重在首次启动时下载，所以大模型要过几分钟才能调用。

**流式能用吗？**
能，聊天补全加 `stream: true`。平台不会缓冲响应。

**有 embeddings 吗？**
共享端点上没有——那边只提供聊天补全和模型列表。独占端点上有什么取决于你的服务栈，vLLM 通常带 embeddings。

## 访问

**能把我的端点分享给队友吗？**
平台层面不行。一个密钥只能访问它自己账户的实例。要把服务公开出去，就在实例里跑它，用 [rc-tunnel](/radeon-cloud-docs/zh-cn/guides/tunnel/)，并在前面加上你自己的认证。

**能用 API 密钥打开 JupyterLab 吗？**
不能。实例代理要求浏览器会话。密钥用于 Model API 和平台管理端点。

**为什么我启动不了实例？**
多半是账户还在审核中——`GET /api/me` 里看 `verified`。等待期间免费的 Model API 照常可用。

## 运维

**能把启动写成脚本吗？**
可以。[实例](/radeon-cloud-docs/zh-cn/api/instances/)里有一个启动加轮询的例子。一定要在 `finally` 里销毁，免得崩溃之后留一个实例在那儿计费。

**端点 URL 在重新启动之后还一样吗？**
不一样。每次启动都会产生新的实例 ID 和新的基础 URL。把它当成需要读取的配置，别当常量。
