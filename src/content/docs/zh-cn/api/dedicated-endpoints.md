---
title: 独占端点
description: 在你自己的实例上跑你自己的模型，对外是一个兼容 OpenAI 的 URL。
sidebar:
  order: 5
---

独占端点是在你自己的实例里跑 vLLM 或 SGLang，平台把一个公网 URL 路由过去。模型和服务参数由你决定，请求直接打到你的服务器。

## 基础 URL

```text
https://<host>/spaces/<instance-id>/<port>/v1
```

`<port>` 在 vLLM 下是 `8000`，SGLang 下是 `30000`。完整 URL 会出现在启动对话框和 **Active Instance** 里——从那儿复制，别自己拼。

## 部署

创建模板时把 **Deploy Type** 设成 **vLLM Model API**，并给一条启动命令：

```bash
vllm serve Qwen/Qwen2.5-7B-Instruct --host 0.0.0.0 --port 8000
```

:::caution[host 和 port 不是可选项]
平台路由的就是 `--host 0.0.0.0 --port 8000`。绑到 `127.0.0.1` 或别的端口，实例看起来一切正常，端点却怎么都连不上。
:::

启动模板。模型权重在首次启动时下载，所以大模型可能要好几分钟端点才会应答。在那之前请求都会失败——想看进度就在 JupyterLab 里翻实例日志。

带截图的分步说明在 [Model APIs](/radeon-cloud-docs/zh-cn/guides/model-apis/#专属端点)。

## 调用

和共享端点完全一样，只是换成你自己的基础 URL 和你部署的模型名：

```bash
curl https://<host>/spaces/<instance-id>/8000/v1/chat/completions \
  -H "Authorization: Bearer $RADEON_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "Qwen/Qwen2.5-7B-Instruct",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

```python
from openai import OpenAI

client = OpenAI(
    base_url="https://<host>/spaces/<instance-id>/8000/v1",
    api_key="rc-...",
)
```

`model` 的值必须和你传给 `vllm serve` 的一致，不是共享目录里的名字。

## 有哪些接口

请求会剥掉路由前缀转发给 vLLM 或 SGLang，所以端点提供什么，取决于你的服务器实现了什么。对 vLLM 来说通常包括：

| 路径 | 用途 |
|---|---|
| `/v1/models` | 你部署的模型 |
| `/v1/chat/completions` | 聊天 |
| `/v1/completions` | 旧版文本补全 |
| `/v1/embeddings` | 向量化，用于 embedding 模型 |

这比共享端点宽——后者只有聊天补全和模型列表。准确的接口集合和版本相关的参数，查你所用服务栈自己的文档。

## 访问控制

你的密钥，你的实例。平台检查三件事：密钥解析出的用户是实例的所有者、实例是 API 服务类型、端口和实例实际服务的端口一致。任何一条不满足，返回 `403`。

浏览器会话也能用，所以你登录之后可以直接在浏览器标签页里打开端点。

没有办法把独占端点交给别人——签发一个第三方能用的密钥是不支持的。如果你要把服务公开出去，把它做进实例里，用 [rc-tunnel](/radeon-cloud-docs/zh-cn/guides/tunnel/)，并在前面加上你自己的认证。

## 成本和生命周期

端点的寿命和实例完全一致。只要实例在，额度就一直在消耗，不管有没有请求进来；实例一销毁，URL 立刻失效。重新启动会产生新的实例 ID，因而是新的基础 URL——把它当配置读，别当常量。
