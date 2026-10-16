---
title: 模型 API
description: 通过兼容 OpenAI 的 HTTP API 调用模型 —— 免费共享端点，或者跑在你自己实例上的专属端点。
sidebar:
  order: 6
---

AMD Radeon Cloud 通过兼容 OpenAI 的 HTTP API 提供模型服务。任何能连 OpenAI 的客户端，改一下 base URL 和 key 就能用：`curl`、`openai` SDK、LangChain、Cherry Studio。

有两种方式可选，区别在于模型跑在谁的 GPU 上。

## 免费共享端点

共享端点常驻在线，不花钱。不用启动实例，也不消耗积分。有哪些模型可用由平台决定。

打开 [Token Factory](https://developer.amd.com.cn/radeon/modelapis) 并登录。

![Token Factory 的模型目录](../../../../assets/guide/modelapi-tokenfactory.png)

在 **Public Free Model APIs** 下挑一个模型。详情弹窗里有 base URL、模型名、你的 API Key，还有一条可以直接跑的 curl 命令。

![免费模型的详情弹窗](../../../../assets/guide/modelapi-free-detail.png)

```bash
curl https://developer.amd.com.cn/radeon/api/v1/chat/completions \
  -H "Authorization: Bearer $RADEON_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model":"DeepSeek-V4-Flash","messages":[{"role":"user","content":"Hello"}]}'
```

一个 key 通用于所有共享模型。想换模型，改 `model` 字段就行。

共享端点支持 **chat completions** 和**列出模型**。请求按 key 和按 IP 限流，另有每日消耗上限 —— 见[频率限制](/radeon-cloud-docs/zh-cn/api/rate-limits/)。

## 专属端点

专属端点把模型跑在你自己的实例上，模型和服务配置都由你定。实例运行期间会一直消耗积分。

1. 在 **首页** 把 **部署类型** 设为 **模型 API**。
2. 在 **模型** 里选一个公共模板，模型、规格和 vLLM 启动命令都已经设好。要部署其他模型，点 **自定义模型**，然后填写：
   - **模型名称**：客户端在 `model` 字段里传的名字。
   - **模型来源**：权重来自哪里，选 **Hugging Face（镜像）** 或 **ModelScope**。
   - **vLLM 启动命令**：启动服务的命令，例如：

     ```bash
     vllm serve Qwen/Qwen2.5-0.5B-Instruct --host 0.0.0.0 --port 8000 --served-model-name Qwen2.5-0.5B-Instruct
     ```

3. 选一个显存够用的 **规格**，点 **启动实例**。
4. 实例就绪后，**兼容 OpenAI 的接口** 卡片会显示 **Base URL**、**模型** 和你的 **API Key**，并附一条可以直接运行的 curl 命令。

:::caution[务必保留 `--host 0.0.0.0 --port 8000`]
平台把端点路由到容器内的 8000 端口，服务绑定到其他地址或端口时，端点无法访问到它。`--served-model-name` 要和 **模型名称** 一致。
:::

调用方式和共享端点相同，把 base URL 换成卡片上的地址：

```bash
curl <base-url>/chat/completions \
  -H "Authorization: Bearer $RADEON_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model":"Qwen2.5-0.5B-Instruct","messages":[{"role":"user","content":"Hello"}]}'
```

因为请求是直接打到 vLLM 或 SGLang 上的，那个服务暴露什么，专属端点就暴露什么 —— 通常除了 chat 之外还有 completions 和 embeddings。

## 怎么选

先用共享端点。等到需要目录里没有的模型、想控制服务参数，或者需要不与他人共享的吞吐时，再换专属端点。

完整的请求和响应细节见 [API 参考](/radeon-cloud-docs/zh-cn/api/overview/)。
