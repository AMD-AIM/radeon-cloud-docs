---
title: 快速上手
description: 跑起一个 Radeon GPU 实例，并发出第一个 API 请求。
sidebar:
  label: 快速上手
  order: 2
---

本页包括两项互不依赖的操作：调用模型 API 和启动 GPU 实例。可以从任意一项开始。

## 调用模型 API

最快的入门路径。不用实例，不花积分。

打开 [Token Factory](https://developer.amd.com.cn/radeon/modelapis) 登录，在 **Public Free Model APIs** 下随便挑一个模型。详情弹窗里就有你的 API Key，复制下来。

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

你可以通过网页控制台启动实例，也可以使用命令行工具
[Radeon Cloud CLI](/radeon-cloud-docs/zh-cn/cli/overview/)（`rcc`）。

### 使用网页控制台

1. 登录你所在站点的控制台，见[登录](/radeon-cloud-docs/zh-cn/guides/login/)。
2. 在 **首页**，**部署类型** 保持 **Notebook**，**镜像** 保持 **AMD OneClick Base**。
3. 如果希望实例销毁后文件还在，打开 **自定义**，把 **工作区存储** 设为 **持久化 /workspace**，见[保存数据](/radeon-cloud-docs/zh-cn/guides/storage/)。
4. 点 **启动实例**。
5. 弹窗显示 **实例已就绪** 后，点 **打开 Notebook** 进入 [JupyterLab](/radeon-cloud-docs/zh-cn/guides/jupyterlab/)，或者通过 [SSH](/radeon-cloud-docs/zh-cn/guides/ssh/) 连接。

每个选项的含义，以及启动失败时怎么办，见[启动实例](/radeon-cloud-docs/zh-cn/guides/launch/)。

### 使用 Radeon Cloud CLI

安装 CLI、登录、查看你的账号可以使用哪些资源，然后创建实例：

```bash
python3 -m pip install amd-oneclick-sdk
rcc auth login
rcc doctor
rcc catalog list
rcc instance add-key
rcc instance create
rcc instance open
```

在终端里运行 `rcc instance create`，它会一步步让你选择环境和资源。SSH、状态、日志、脚本和多账号见
[Radeon Cloud CLI](/radeon-cloud-docs/zh-cn/cli/overview/)。

在实例里的终端确认 GPU 可见：

```bash
rocm-smi
```

你应该能看到列出了一块或多块 Radeon GPU。

:::caution[实例运行期间会一直扣积分]
用完之后，在 **首页** 点 **销毁实例**，或运行
`rcc instance delete --yes`。见[销毁实例](/radeon-cloud-docs/zh-cn/guides/destroy/)。
:::
