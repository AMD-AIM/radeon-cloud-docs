---
title: 模型服务接口
description: 自部署模型服务的接口地址、认证、可用路径和生命周期。
---

模型服务是你用 **部署类型：模型 API** 在自己 GPU 实例上运行的 vLLM，平台把一个 URL 路由到它。它不属于 Token Factory。部署方法见[部署模型服务](/radeon-cloud-docs/zh-cn/guides/serve-model/)。

## 接口地址和 API Key

实例就绪后，启动弹窗和 **首页** 上的 **兼容 OpenAI 的接口** 卡片会显示这个端点的 **接口地址**、**模型** 名称和 **API 密钥**。请直接使用卡片上的值，不要自己拼接 URL。

在中国站，接口地址的格式是：

```text
https://jupyter.anruicloud.com/inference/<instance-id>/v1
```

其他部署可能使用不同的格式，以卡片上显示的为准。

API Key 以 `sk-` 开头，每次启动单独生成。它不是你调用 Token Factory 用的 `rc-` Key，请使用卡片上的 Key。

卡片的 **快速开始** 里还有一条已经填好这些值的 curl 命令。

## 调用端点

调用方式和 Token Factory 相同，换成你自己的接口地址、API Key 和模型名称：

```bash
curl <base-url>/chat/completions \
  -H "Authorization: Bearer <api-key>" \
  -H "Content-Type: application/json" \
  -d '{"model":"<model>","messages":[{"role":"user","content":"你好"}]}'
```

```python
from openai import OpenAI

client = OpenAI(base_url="<base-url>", api_key="<api-key>")
```

`model` 要填 vLLM 实际提供的名称（`--served-model-name`），不是 Token Factory 里的模型名称。

## 可用接口

请求去掉路由前缀后原样转发给 vLLM，所以 vLLM 服务提供什么，端点就有什么。通常包括：

| 路径 | 用途 |
|---|---|
| `/v1/models` | 你部署的模型 |
| `/v1/chat/completions` | 聊天 |
| `/v1/completions` | 文本补全 |
| `/v1/embeddings` | 向量（embedding 模型） |

Token Factory 的请求过滤、限流和错误格式在这里都不适用，错误由 vLLM 自己返回。各版本具体支持哪些路径和参数，见 vLLM 的文档。

## 访问控制

只有实例的所有者可以调用端点。API Key 不对，或者实例没有在提供模型服务时，请求返回 `403`；vLLM 开始接受连接之前返回 `502`。

模型服务不能分享给他人使用。要把服务公开出去，请在实例里运行它，并用 [rc-tunnel](/radeon-cloud-docs/zh-cn/guides/tunnel/) 暴露，同时在前面加上你自己的认证。

## 费用和生命周期

端点只在实例运行期间存在。实例每小时都会消耗积分，不管有没有请求；实例一销毁，端点立即失效。

每次启动都会生成新的 API Key；实例 ID 变化时（例如换了资源池），接口地址也会变。请每次启动后从卡片上复制，并放在配置里，不要写死在代码中。
