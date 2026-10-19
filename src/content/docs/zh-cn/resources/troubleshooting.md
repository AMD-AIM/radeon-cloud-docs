---
title: 疑难排查
description: 按看到的现象查找问题和解决办法。
sidebar:
  order: 1
---

找到你看到的提示或现象，按下面的步骤处理。

## 启动

### 提示 “No matching Node has enough free CPU, memory, and GPUs for this launch”

所选资源池里的节点都满了，启动弹窗会显示 **启动失败** 和这条提示。此时不会创建实例，也不会消耗积分。

1. 在启动表单里打开 **自定义**，如果账号有多个 **资源池**，换一个。
2. 或者选更小的 **规格**。
3. 或者稍后再试。

如果账号只有一个资源池且反复失败，请把尝试的时间发到 [member-service@mail.developer.amd.com.cn](mailto:member-service@mail.developer.amd.com.cn)。

### 弹窗一直显示“等待空闲 GPU”

启动正在排队，要等节点空出位置。可以继续等待，也可以取消后换更小的规格或其他资源池。

### 实例要好几分钟才就绪

在启动弹窗里点 **查看日志**。某个镜像在节点上第一次启动时会慢一些，因为节点要先下载镜像。模型服务还要下载模型权重。

如果弹窗显示 **镜像拉取失败**，先重试，仍然失败就换一个镜像。

### 启动按钮不能点

表单上会说明原因：

- **您已有一个正在运行的实例。** 每个账号只能有一个实例，请先[销毁](/radeon-cloud-docs/zh-cn/guides/destroy/)它。
- **资源目录不可用，请重试。** 刷新页面。

在全球站，如果因为积分被拒绝，说明余额不够所选规格运行 1 小时，见[积分](/radeon-cloud-docs/zh-cn/guides/credits/)。

## 运行中的实例

### 实例被自动删除了

积分用完时，或者超过启动表单上显示的 **超时回收** 时长时，实例会被删除，见[实例会被自动停止的情况](/radeon-cloud-docs/zh-cn/guides/instances/#实例会被自动停止的情况)。

在中国站，如果余额不够第一个小时，实例就绪后一两分钟也会被删除。重新启动前，先在 **积分与用量** 页面确认余额，见[积分](/radeon-cloud-docs/zh-cn/guides/credits/)。

请把检查点保存到持久化的 `/workspace`，这样实例停止时不会前功尽弃。

### 文件丢失

只有 `/workspace` 下的文件会保留，而且实例启动时要选择 **持久化 /workspace**。25 GB 和 100 GB 是两块独立的存储，也请确认这次启动用的容量和上次一样。运行中的实例不能修改存储设置，见[保存数据](/radeon-cloud-docs/zh-cn/guides/storage/)。

### 实例删除后 JupyterLab 页面还在

JupyterLab 标签页不会发现实例已经删除。关掉这个标签页即可，实例的真实状态以 **首页** 为准。

### 模型服务没有响应

对于用 **部署类型：模型 API** 启动的实例：

1. 确认命令绑定的是 `--host 0.0.0.0 --port 8000`。绑定到 `127.0.0.1` 时，实例看起来正常，但外部访问不到。
2. 在实例卡片上点 **查看日志**，等模型加载完成。
3. 使用当前实例卡片上的 base URL 和 API Key，重新启动后它们可能会变。
4. `model` 字段请填 `--served-model-name` 里的名称，不要用 Token Factory 里的模型名称。

## SSH

### 连接被拒

按顺序检查：

1. 实例卡片上是否还显示 **正在配置 SSH — 请稍后再连接**？等它显示 SSH 命令后再连接。
2. 用的是当前实例卡片上的命令吗？重新启动后，主机和端口可能会变。
3. 卡片上是否显示 **SSH 配置失败**？这个实例上 SSH 不可用，但 JupyterLab 不受影响。销毁实例后重新启动；如果再次出现，请联系支持。

### Permission denied (publickey)

**设置 → SSH 密钥** 里没有和你使用的私钥配对的公钥。检查列表，然后指定要用的私钥：

```bash
ssh -i ~/.ssh/id_ed25519 root@<host> -p <port>
```

实例启动后才添加的公钥不会装进这个实例。请销毁实例后重新启动。

### 提示 “Remote host identification has changed”

新实例可能沿用之前实例的主机和端口，但主机密钥变了。用实例卡片上给出的 `ssh-keygen -R` 命令删除旧记录，再重新连接。

## Token Factory

### 每个请求都返回 401

确认请求头是 `Authorization: Bearer rc-...`，并且 API Key 是当前有效的。重新生成 API Key 后旧的立即失效，还在用旧 API Key 的服务要更新后才能恢复。

还在审核中的账号不会生成 API Key。

如果 `401` 的内容是 `Login required`，说明你把 API Key 发给了控制台接口，而这类接口只接受浏览器会话。要在脚本里管理实例，请用 [Radeon Cloud CLI](/radeon-cloud-docs/zh-cn/cli/automation/)。

### 在全球站调用总是返回 404

Token Factory 只在中国站提供，请使用 `https://developer.amd.com.cn/radeon/api/v1`。

### 429

触发了限流或每日用量上限，`Retry-After` 表示要等多久，见[限流](/radeon-cloud-docs/zh-cn/api/rate-limits/)。

如果经常收到 `429`，说明你的用量超出了 Token Factory 的额度。与其加大重试，不如[在自己的实例上部署模型服务](/radeon-cloud-docs/zh-cn/guides/serve-model/)。

### 提示 “Requested model ... not supported”

模型名不在 Token Factory 的模型列表里。模型会不定期上线和下线，请用 [`GET /v1/models`](/radeon-cloud-docs/zh-cn/api/models/) 查询模型名，不要写死在代码里。

## GPU

### rocm-smi 没有输出，或者 PyTorch 找不到 GPU

```bash
rocm-smi
python -c "import torch; print(torch.cuda.is_available(), torch.version.hip)"
```

如果 `torch.version.hip` 是 `None`，说明 ROCm 版 PyTorch 被 CUDA 版替换了，通常是 `pip install torch` 覆盖了镜像自带的版本。**AMD OneClick Base** 已经在 `/opt/venv` 里装好了 ROCm 版 PyTorch，不要重新安装 `torch`。重新启动一个实例即可恢复干净的环境。

## 隧道

### 安装脚本失败

如果提示缺少 identity 目录或 `FRP_BROKER_URL`，说明这个实例是在隧道功能开启之前创建的。销毁后重新启动一个。不要手动写入平台密钥。

### 公网 URL 打不开

从服务本身往外查：

1. 在实例里运行 `curl --fail http://127.0.0.1:<port>/`。如果失败，问题出在你的应用，不在隧道。
2. 运行 `rc-tunnel status`；如果没有在运行，再看 `rc-tunnel logs --lines 100`。

如果本地服务正常、状态也健康，公网 URL 仍然打不开，请发邮件到 [member-service@mail.developer.amd.com.cn](mailto:member-service@mail.developer.amd.com.cn)，写明完整域名、实例创建时间和出错时间。不要发送配置文件或密钥。

## 积分和优惠码

### 提示 “代码无效，请检查后重试。”

请完整粘贴整串优惠码。开发者计划发的优惠码很长，复制不完整就会失败。优惠码在用开发者积分兑换后 30 天内有效，每个只能用一次。另外请确认你登录的是想要充值的站点，积分不能在站点之间转移。见[兑换失败怎么办](/radeon-cloud-docs/zh-cn/guides/developer-program/#兑换失败怎么办)。

### `DP-` 开头的码没有加积分

`DP-XXXX-XXXX-XXXX` 格式的码兑换的是开发者积分，不是积分。请在[积分码兑换页](https://developer.amd.com.cn/points/devpoints)兑换，再到[兑取算力](https://developer.amd.com.cn/points/redeem)用开发者积分换优惠码。

## 仍然无法解决

请发邮件到 [member-service@mail.developer.amd.com.cn](mailto:member-service@mail.developer.amd.com.cn)，写明：

- 站点（中国站或全球站）和账号邮箱
- 你运行或点击了什么，预期会发生什么
- 完整的错误信息和发生时间
- 如果和实例有关，写明启动时选的镜像和规格

不要附上 API Key、`rcc_` 令牌、SSH 私钥或一次性的 JupyterLab 链接。只有在咨询某个优惠码时，才需要附上该优惠码。
