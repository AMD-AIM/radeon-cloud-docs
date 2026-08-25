---
title: 疑难排查
description: 最常遇到的问题和它们的解法。
sidebar:
  order: 1
---

## 实例

### 启动一直到不了 ready

轮询的时候盯着 `status` 和 `message`。第一次拉一个大镜像，或者 vLLM 实例在下载权重，本来就要好几分钟。

如果卡在 `pending` 的时间远超这个量级，可能是集群没有你要的那个 GPU 数量的容量。试试 1 张卡。如果变成 `failed`，`reason` 和 `detail` 字段里有调度错误。

### 启动直接被拒

`Each user can only have one active instance`——先销毁已有的那个。`Insufficient credits`——余额低于请求的 GPU 数量。`Invalid image selected`——自你创建模板以来，这个镜像被禁用或从目录里移除了。

### 实例自己停了

实例有最长生命周期，也有闲置超时。碰到任一条都会被关掉。长任务应该把检查点写到持久化存储，这样一次关停不至于让整轮跑白费。

### 我的文件没了

除非模板用了 **Persistent (PVC)** 存储，否则一切都随实例删掉。在模板上把存储设成持久化再重新启动——这个设置没法加到已经存在的实例上。

## SSH

### 连接被拒

依次检查三件事。模板上开了 **SSH Access (advanced)** 吗？这项事后加不上。你用的主机和端口是不是从当前实例详情里取的，而不是上一次会话的旧值——两者每次启动都会变。镜像里有 SSH 服务端吗？没有的话，从 JupyterLab 终端起一个：

```bash
sudo apt update && sudo apt install -y openssh-server
mkdir -p /run/sshd && /usr/sbin/sshd
```

### Permission denied (publickey)

你 Profile 上的公钥和你提供的私钥对不上。先确认登记的是哪一把，然后明确指定用哪把：

```bash
ssh -i ~/.ssh/id_ed25519 <user>@<host> -p <port>
```

记住，实例启动之后才添加的公钥不会装进这个实例。重新启动。

## Model API

### 每个请求都 401

检查请求头是不是严格的 `Authorization: Bearer rc-...`。然后检查密钥是不是当前的——轮换密钥会立刻作废上一把，所以还揣着旧值的服务在重新部署之前会一直失败。

如果你的账户还没过审，根本不会签发密钥。

### 429

你撞到限流了。`code` 字段说的是哪一道；`Retry-After` 说要等多久。见[限流](/radeon-cloud-docs/zh-cn/api/rate-limits/)。

持续的 `429` 说明你的负载超出了共享额度，解法是[独占端点](/radeon-cloud-docs/zh-cn/api/dedicated-endpoints/)，而不是多重试几次。

### 一个原本能用的模型现在 404 了

共享目录会随模型上下架而变化。用 [`GET /v1/models`](/radeon-cloud-docs/zh-cn/api/models/) 在运行时解析名字，别写死。

### 我的独占端点不响应

确认启动命令绑对了——平台路由的是 `--host 0.0.0.0 --port 8000`，绑到 `127.0.0.1` 会让端点连不上，而实例看起来一切正常。

确认模型加载完了。从 JupyterLab 终端看实例日志。

确认你用的是当前的基础 URL。每次重新启动都会产生新的实例 ID，因而是新的 URL。

确认 `model` 字段和你传给 `vllm serve` 的一致，不是共享目录里的名字。

## GPU

### rocm-smi 什么都不显示，或者 PyTorch 看不到 GPU

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

如果本地服务正常、状态也健康，公网 URL 还是不通，把完整域名、notebook 的创建时间和故障时间发给运维。别发配置文件或密钥。

## 还是搞不定

去 [hackathon 仓库](https://github.com/AMD-DEV-CONTEST/Radeon-hackathon-2026-07)开一个 issue，写清楚你跑了什么、预期是什么，以及完整的错误文本。
