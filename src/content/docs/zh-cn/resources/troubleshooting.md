---
title: 疑难排查
description: 最常遇到的问题和它们的解法。
sidebar:
  order: 1
---

## 实例

### 提示 “No matching Node has enough free CPU, memory, and GPUs for this launch”

所选资源池里的节点都满了，启动弹窗会显示 **启动失败** 和这条提示。此时不会创建实例，也不会消耗积分。

1. 在启动表单里打开 **自定义**，如果账号有多个 **资源池**，换一个。
2. 或者选更小的 **规格**。
3. 或者稍后再试。

如果账号只有一个资源池且反复失败，请把尝试的时间发到 [member-service@mail.developer.amd.com.cn](mailto:member-service@mail.developer.amd.com.cn)。

### 启动后一直没有就绪

在启动弹窗里点 **查看日志**。某个镜像在节点上第一次启动，或者模型 API 实例下载模型权重时，可能需要几分钟。

如果弹窗显示 **等待空闲 GPU**，说明启动正在排队，要等节点空出位置。可以继续等待，也可以取消后换更小的规格或其他资源池。如果显示 **镜像拉取失败**，先重试，仍然失败就换一个镜像。

### 启动请求被拒绝

提示 **您已有一个正在运行的实例。** 说明账号下已有实例，先销毁它。积分低于所选规格每小时的消耗时，启动会被拒绝，见[积分](/radeon-cloud-docs/zh-cn/guides/credits/)。如果控制台加载不到你的规格和资源池，会提示 **资源目录不可用，请重试。**，刷新页面即可。

### 实例自动停止了

实例有最长运行时长，长时间没有活动会被回收，积分用完时也会被删除。请把检查点保存到持久化的 `/workspace`，这样实例停止时不会白跑一场。

### 文件丢失

只有 `/workspace` 下的文件会保留，而且实例启动时要选择 **持久化 /workspace**。25 GB 和 100 GB 是两块独立的存储，也请确认这次启动用的容量和上次一样。运行中的实例不能修改存储设置。见[保存数据](/radeon-cloud-docs/zh-cn/guides/storage/)。

## SSH

### 连接被拒

依次检查：

1. 实例卡片是否还显示 **正在配置 SSH — 请稍后再连接**？等它显示出 SSH 命令再连接。
2. 用的是不是当前实例卡片上的命令？主机和端口每次启动都会变。
3. 卡片是否显示 **SSH 配置失败**？这说明这个实例没有可用的 SSH。确实需要的话，在 JupyterLab 终端里启动 SSH 服务：

```bash
sudo apt update && sudo apt install -y openssh-server
mkdir -p /run/sshd && /usr/sbin/sshd
```

### Permission denied (publickey)

**设置 → SSH 密钥** 里没有和你所用私钥匹配的公钥。先核对列表，再明确指定要用的私钥：

```bash
ssh -i ~/.ssh/id_ed25519 -p <port> <user>@<host>
```

实例启动之后才添加的公钥不会装进这个实例。销毁实例后重新启动。

### 提示 “Remote host identification has changed”

新实例可能沿用之前实例的主机和端口，但主机密钥是新的。用实例卡片上的 `ssh-keygen -R` 命令删掉旧记录，再重新连接。

## 模型 API

### 所有请求都返回 401

检查请求头是不是严格的 `Authorization: Bearer rc-...`。然后检查密钥是不是当前的——轮换密钥会立刻作废上一把，所以还揣着旧值的服务在重新部署之前会一直失败。

如果你的账号还没过审，根本不会签发密钥。

### 429

你撞到限流了。`code` 字段说的是哪一道；`Retry-After` 说要等多久。见[限流](/radeon-cloud-docs/zh-cn/api/rate-limits/)。

持续的 `429` 说明你的负载超出了共享配额，解法是[专属端点](/radeon-cloud-docs/zh-cn/api/dedicated-endpoints/)，而不是多重试几次。

### 原本可用的模型返回 404

共享目录会随模型上下架而变化。用 [`GET /v1/models`](/radeon-cloud-docs/zh-cn/api/models/) 在运行时解析名字，别写死。

### 专属端点没有响应

确认启动命令绑对了——平台路由的是 `--host 0.0.0.0 --port 8000`，绑到 `127.0.0.1` 会让端点连不上，而实例看起来一切正常。

确认模型加载完了。从 JupyterLab 终端看实例日志。

确认你用的是当前的基础 URL。每次重新启动都会产生新的实例 ID，因而是新的 URL。

确认 `model` 字段和你传给 `vllm serve` 的一致，不是共享目录里的名字。

## GPU

### rocm-smi 没有输出，或 PyTorch 检测不到 GPU

```bash
rocm-smi
python -c "import torch; print(torch.cuda.is_available(), torch.version.hip)"
```

如果 `torch.version.hip` 是 `None`，说明环境里装的是 CUDA 版的 PyTorch 而不是 ROCm 版——`pip install torch` 覆盖掉镜像自带的版本，常常就是这个结果。从 ROCm 的索引重装，或者用 ROCm 镜像开个新实例，别再重装 torch。

在某些消费级 Radeon 型号上，ROCm 需要显式覆盖架构版本：

```bash
export HSA_OVERRIDE_GFX_VERSION=11.0.0
```

## 隧道

### 安装脚本失败

如果它报缺少 identity 目录或 `FRP_BROKER_URL`，说明这个 notebook 是在该功能启用之前创建的。销毁它，重新建一个。不要手工去写平台密钥。

### 公网 URL 不通

从服务本身往外一层层查。在 notebook 里 `curl --fail http://127.0.0.1:<port>/`——如果这一步就失败，问题在你的应用，不在隧道。然后 `rc-tunnel status`，没跑起来就 `rc-tunnel logs --lines 100`。

如果本地服务正常、状态也健康，公网 URL 还是不通，把完整域名、notebook 的创建时间和出问题的时间发到 [member-service@mail.developer.amd.com.cn](mailto:member-service@mail.developer.amd.com.cn)。不要发送配置文件或密钥。

## 积分和优惠码

### 优惠码兑换不了

请粘贴完整的优惠码。开发者计划发的优惠码是一长串加密字符，只复制一部分会兑换失败。优惠码自兑换之日起 30 天内有效，每张只能用一次。另外要确认你登录的是想充值的那个站点，积分不能跨站转移。详见 [AMD AI 开发者计划](/radeon-cloud-docs/zh-cn/guides/developer-program/#兑换失败怎么办)。

### `DP-` 开头的码没有加上积分

`DP-XXXX-XXXX-XXXX` 兑换的是开发者积分，不是 Radeon Cloud 积分。先在[积分券码页](https://developer.amd.com.cn/points/devpoints)兑换成开发者积分，再到[兑取算力](https://developer.amd.com.cn/points/redeem)把开发者积分换成优惠码。

## 仍然无法解决

发邮件到 [member-service@mail.developer.amd.com.cn](mailto:member-service@mail.developer.amd.com.cn)，写清楚：

- 站点（中国站或全球站）和账号邮箱
- 你执行了什么命令或点了什么，以及期望的结果
- 完整的报错原文和出错时间
- 如果和实例有关，附上实例 ID 和模板名称

不要附上 API Key、`rcc_` 令牌、SSH 私钥或 JupyterLab 一次性链接。优惠码只在邮件内容和这张码有关时才提供。
