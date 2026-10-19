---
title: 快速上手
description: 先调用 Token Factory 里的模型，再启动一个 GPU 实例。
sidebar:
  label: 快速上手
  order: 2
---

本页包括两项互不依赖的操作：调用 Token Factory 里的模型和启动 GPU 实例，可以从任意一项开始。

Token Factory 只在中国站提供。两个站点都可以启动实例，示例使用中国站的地址。

## 调用 Token Factory 里的模型

调用 Token Factory 里的模型不需要实例，也不消耗积分。

1. 打开 [Token Factory](https://developer.amd.com.cn/radeon/tokenfactory) 并登录，见[登录](/radeon-cloud-docs/zh-cn/guides/login/)。
2. 在顶部的 **您的 API 密钥** 卡片上，点 API 密钥旁边的 **复制**。
3. 发送请求：

   ```bash
   export RADEON_API_KEY=rc-...

   curl https://developer.amd.com.cn/radeon/api/v1/chat/completions \
     -H "Authorization: Bearer $RADEON_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{"model":"DeepSeek-V4-Flash","messages":[{"role":"user","content":"用一句话打个招呼。"}]}'
   ```

同一个 API Key 可以调用 Token Factory 里的所有模型，换模型只要改 `model`。列出可用模型：

```bash
curl https://developer.amd.com.cn/radeon/api/v1/models \
  -H "Authorization: Bearer $RADEON_API_KEY"
```

在 Python 里，把 OpenAI SDK 指向同一个 base URL：

```python
from openai import OpenAI

client = OpenAI(base_url="https://developer.amd.com.cn/radeon/api/v1", api_key="rc-...")
response = client.chat.completions.create(
    model="DeepSeek-V4-Flash",
    messages=[{"role": "user", "content": "用一句话打个招呼。"}],
)
print(response.choices[0].message.content)
```

下一步：用量限制和模型列表见 [Token Factory](/radeon-cloud-docs/zh-cn/guides/token-factory/)，完整接口见 [API 参考](/radeon-cloud-docs/zh-cn/api/overview/)。

## 启动 GPU 实例

实例运行期间每小时消耗积分，请先确认余额，见[积分](/radeon-cloud-docs/zh-cn/guides/credits/)。

### 在控制台启动

1. 登录你所在站点的控制台，见[登录](/radeon-cloud-docs/zh-cn/guides/login/)。
2. 在 **首页**，**部署类型** 保持 **Notebook**，**镜像** 保持 **AMD OneClick Base**。
3. 如果希望实例销毁后文件还在，打开 **自定义**，把 **工作区存储** 设为 **持久化 /workspace**，见[保存数据](/radeon-cloud-docs/zh-cn/guides/storage/)。
4. 点 **启动实例**。有空闲节点时，实例通常一分钟内就绪。
5. 弹窗显示 **实例已就绪** 后，点 **打开 Notebook** 进入 [JupyterLab](/radeon-cloud-docs/zh-cn/guides/jupyterlab/)，或者通过 [SSH](/radeon-cloud-docs/zh-cn/guides/ssh/) 连接。

启动失败时，见[启动实例](/radeon-cloud-docs/zh-cn/guides/launch/#启动失败时)。

### 在终端启动

安装 [Radeon Cloud CLI](/radeon-cloud-docs/zh-cn/cli/overview/)，登录，查看账号可用的资源，然后启动：

```bash
python3 -m pip install amd-oneclick-sdk
rcc auth login
rcc catalog list
rcc instance add-key
rcc instance create
rcc instance open
```

在交互式终端里运行 `rcc instance create`，它会让你选择环境和资源。

### 检查 GPU

在实例的终端里运行：

```bash
rocm-smi
```

它会列出实例挂载的 Radeon GPU。

:::caution[用完请销毁实例]
在 **首页** 点 **销毁实例**，或运行 `rcc instance delete --yes`，见[销毁实例](/radeon-cloud-docs/zh-cn/guides/destroy/)。
:::
