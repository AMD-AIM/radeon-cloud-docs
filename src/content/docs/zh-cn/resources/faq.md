---
title: 常见问题
description: 关于 AMD Radeon Cloud 的常见问题和简短回答。
sidebar:
  order: 2
---

## 入门

**调用模型需要先启动实例吗？**
不需要。Token Factory 免费，随时可用。在 [Token Factory](https://developer.amd.com.cn/radeon/tokenfactory) 获取 API Key 就能调用。Token Factory 只在中国站提供，见 [Token Factory](/radeon-cloud-docs/zh-cn/guides/token-factory/)。

**可以同时运行多个实例吗？**
不可以。每个账号同一时间只能有一个实例，销毁后才能启动新的。

**最多能用几块 GPU？**
取决于分配给你账号的规格。启动表单里的 **规格** 会列出来，`rcc catalog list` 显示的也是同一份列表。

**在中国站怎么获取积分？**
在[兑取算力](https://developer.amd.com.cn/points/redeem)用 AMD AI 开发者计划的开发者积分换优惠码，再到 **积分与用量 → 兑换积分** 兑换。1 个开发者积分换 1 小时，每天最多换 20 个。见 [AMD AI 开发者计划](/radeon-cloud-docs/zh-cn/guides/developer-program/)。

**在全球站怎么获取积分？**
和中国站一样是两步。用 **使用 AMD Developer Program 登录**，或之后在 **设置** 里连接该账号，再到[兑取算力](https://developer.amd.com.cn/points/redeem)用开发者积分换优惠码，最后在 **积分与用量 → 兑换积分** 粘贴。活动和工作坊也可能直接发优惠码。全球站控制台有 **兑换积分**，没有把开发者积分换成券的页面——那个页面在开发者计划网站上。见[积分](/radeon-cloud-docs/zh-cn/guides/credits/)。

**遇到问题找谁？**
发邮件到 [member-service@mail.developer.amd.com.cn](mailto:member-service@mail.developer.amd.com.cn)。邮件里要写哪些内容，见[疑难排查](/radeon-cloud-docs/zh-cn/resources/troubleshooting/#仍然无法解决)。

## 费用

**什么会消耗积分？**
运行中的实例：每块 GPU 每小时 1 积分。Token Factory 不消耗积分。自己部署的模型服务运行在实例上，所以会消耗。

**实例闲置时也扣积分吗？**
扣。实例只要存在就会消耗积分，不管你是否在用。用完请及时[销毁](/radeon-cloud-docs/zh-cn/guides/destroy/)。

**平台会自动停止我的实例吗？**
只在积分用完，或者超过启动表单上显示的 **超时回收** 时长时才会。不要指望靠它们节省积分。

**Token Factory 用量和积分是一回事吗？**
不是。Token Factory 有自己的每日用量上限，以 pts 计量。可以在 **积分与用量** 页面查看，也可以调用 [`GET /v1/usage`](/radeon-cloud-docs/zh-cn/api/usage/)。

## 存储

**文件会保留吗？**
只有 `/workspace` 下的文件会保留，而且启动时要选择 **持久化 /workspace**。否则所有文件都会随实例一起删除，见[保存数据](/radeon-cloud-docs/zh-cn/guides/storage/)。

**能给运行中的实例加上持久化存储吗？**
不能。存储在启动时选择。请销毁实例，再选 **持久化 /workspace** 重新启动。

**持久化存储有多大？**
25 GB，部分账号可以选 100 GB。两者是独立的存储，在一个里保存的文件，另一个里看不到。

## 模型和兼容性

**我的 CUDA 代码能用吗？**
在 PyTorch 层面通常可以。ROCm 版 PyTorch 支持 `torch.cuda.*` 接口，上层 PyTorch 代码一般无需修改。手写的 CUDA kernel 需要用 HIP 移植，只提供 CUDA 二进制的库无法使用。

**Token Factory 有哪些模型？**
模型会调整。请查看[模型目录](/radeon-cloud-docs/zh-cn/models/overview/)，或调用 [`GET /v1/models`](/radeon-cloud-docs/zh-cn/api/models/)，不要把模型名写死。

**能在自己的实例上部署任意模型吗？**
vLLM 支持、并且装得进所选规格显存的模型都可以。权重在首次启动时下载，所以大模型要过几分钟才能响应。见[部署模型服务](/radeon-cloud-docs/zh-cn/guides/serve-model/)。

**支持流式输出吗？**
支持。聊天补全请求里设置 `stream: true`。

**有 embedding 接口吗？**
Token Factory 只有在模型目录里有 embedding 模型时才提供。实例上的模型服务提供 vLLM 支持的接口，通常包括 `/v1/embeddings`。

## 访问

**能把我的端点分享给同事吗？**
平台本身不支持。要把服务公开出去，请在实例里运行它，再用 [rc-tunnel](/radeon-cloud-docs/zh-cn/guides/tunnel/) 暴露，并自己加上认证。

**能用 API Key 打开 JupyterLab 或启动实例吗？**
不能。API Key 只能调用 Token Factory。JupyterLab 和控制台需要浏览器会话，脚本里管理实例请用 [Radeon Cloud CLI](/radeon-cloud-docs/zh-cn/cli/overview/)。

**为什么启动不了实例？**
通常是以下原因之一：资源池里没有空闲节点、积分不够、已经有一个实例，或者账号还在审核中。见[疑难排查](/radeon-cloud-docs/zh-cn/resources/troubleshooting/#启动)。

## 运维

**能用脚本启动实例吗？**
可以，用 Radeon Cloud CLI，见[脚本与自动化](/radeon-cloud-docs/zh-cn/cli/automation/)。脚本结束时无论成功与否都要删除实例，免得脚本出错后实例一直运行。

**重新启动后端点 URL 会变吗？**
不要假设它不变。base URL 和 API Key 都可能变，请每次启动后从实例卡片复制，并放在配置里，不要写死在代码里。
