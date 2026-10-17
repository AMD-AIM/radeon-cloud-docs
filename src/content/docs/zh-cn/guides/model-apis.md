---
title: 模型 API
description: 共享模型 API 和专属模型 API 有什么区别，该用哪一种。
sidebar:
  label: 概览
---

Radeon Cloud 通过兼容 OpenAI 的 HTTP API 提供模型服务。任何 OpenAI 客户端，比如 `curl`、`openai` SDK、LangChain、Cherry Studio，只要换掉 base URL 和 API Key 就能使用。

模型 API 分两种，区别在于模型跑在谁的 GPU 上。

| | 共享模型 API | 专属模型 API |
|---|---|---|
| 谁来运行模型 | 平台统一运行，所有人共用 | 你自己的实例 |
| 能用哪些模型 | [Token Factory](https://developer.amd.com.cn/radeon/tokenfactory) 里的模型，由平台选定 | vLLM 支持、且所选规格装得下的任何模型 |
| 费用 | 免费；有每日用量上限和限流 | 实例运行期间每小时消耗积分 |
| 准备工作 | 无，复制 API Key 即可 | 启动一个 **部署类型：模型 API** 的实例 |
| 可用接口 | 聊天补全、Anthropic Messages、模型列表 | vLLM 服务提供的全部接口，通常还包括 completions 和 embeddings |
| 可用时间 | 随时可用 | 实例运行期间 |

## 该用哪一种

先用共享模型 API，不需要任何准备，也不花钱。

需要 Token Factory 里没有的模型、想自己控制 vLLM 参数，或者需要不与他人共享的吞吐时，再换成专属模型 API。

- [调用共享模型](/radeon-cloud-docs/zh-cn/guides/shared-models/)
- [部署专属模型 API](/radeon-cloud-docs/zh-cn/guides/dedicated-models/)
- [模型目录](/radeon-cloud-docs/zh-cn/models/overview/)：每个共享模型支持的输入和输出
