---
title: 快速上手
description: 跑起一个 Radeon GPU 实例，并发出第一个 API 请求。
sidebar:
  label: 快速上手
  order: 2
---

两件事可以试。它们互相独立，先做哪个都行。

## 调用模型 API

最快的入门路径。不用实例，不花额度。

打开 [Token Factory](https://developer.amd.com.cn/radeon/modelapis) 登录，在 **Public Free Model APIs** 下随便挑一个模型。详情弹窗里就有你的 API key，复制下来。

```bash
curl https://developer.amd.com.cn/radeon/api/v1/chat/completions \
  -H "Authorization: Bearer $RADEON_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "DeepSeek-V4-Flash",
    "messages": [{"role": "user", "content": "Say hello in one sentence."}]
  }'
```

同一个 key 对所有共享模型都有效 —— 改 `model` 字段就能换模型。查看有哪些可用：

```bash
curl https://developer.amd.com.cn/radeon/api/v1/models \
  -H "Authorization: Bearer $RADEON_API_KEY"
```

在 Python 里，把 OpenAI SDK 指向同一个 base URL：

```python
from openai import OpenAI

client = OpenAI(
    base_url="https://developer.amd.com.cn/radeon/api/v1",
    api_key="rc-...",
)

response = client.chat.completions.create(
    model="DeepSeek-V4-Flash",
    messages=[{"role": "user", "content": "Say hello in one sentence."}],
)
print(response.choices[0].message.content)
```

完整细节见 [API 参考](/radeon-cloud-docs/zh-cn/api/overview/)。

## 启动一个 GPU 实例

1. 在 [radeon-global.anruicloud.com](https://radeon-global.anruicloud.com/) 登录 —— 见[登录](/radeon-cloud-docs/zh-cn/guides/login/)。
2. 打开 **Profile**，在 **My Templates** 下创建一个模板。填一个标题和一个容器镜像。想让文件留下来就把存储设成 **Persistent (PVC)**。见[创建模板](/radeon-cloud-docs/zh-cn/guides/templates/)。
3. 在模板那一行点 **Launch**。
4. 当弹窗显示 **Your workspace is ready (100%)** 时，点 **Open Notebook** 进 [JupyterLab](/radeon-cloud-docs/zh-cn/guides/jupyterlab/)，或者用 [SSH](/radeon-cloud-docs/zh-cn/guides/ssh/) 连过去。

在实例里的终端确认 GPU 可见：

```bash
rocm-smi
```

你应该能看到列出了一块或多块 Radeon GPU。

:::caution[实例运行期间会一直扣额度]
用完之后，去 **Profile → Active Instance** 销毁实例。见[销毁实例](/radeon-cloud-docs/zh-cn/guides/destroy/)。
:::
