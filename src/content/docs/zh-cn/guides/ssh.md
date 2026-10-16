---
title: 通过 SSH 连接
description: 在设置里添加 SSH 密钥，等待 SSH 就绪，然后从自己的终端连接。
---

通过 SSH，你可以在自己的终端和编辑器里使用实例。从控制台启动的实例都开启了 SSH，公钥只需要添加一次。

## 添加公钥

1. 如果还没有密钥对，先生成一对。macOS、Linux 和 Windows PowerShell 都可以运行：

   ```bash
   ssh-keygen -t ed25519 -C "laptop"
   ```

   私钥保存在 `~/.ssh/id_ed25519`，公钥保存在 `~/.ssh/id_ed25519.pub`。

2. 打印公钥并复制：

   ```bash
   cat ~/.ssh/id_ed25519.pub
   ```

3. 在控制台打开 **设置**，点 **新建 SSH 密钥**。
4. **名称** 填这台电脑的名字，**密钥** 里粘贴公钥，然后点对话框里的 **新建 SSH 密钥**。

添加后，列表里会显示密钥的指纹、添加日期和最近使用时间。每台电脑可以各添加一把。

:::danger[只粘贴 .pub 文件]
公钥以 `ssh-ed25519` 或 `ssh-rsa` 开头，来自扩展名为 `.pub` 的文件。不要粘贴私钥。
:::

密钥只对添加之后启动的实例生效。已经在运行的实例，仍使用它启动时的那组密钥。

## 等待 SSH 就绪

SSH 会比实例稍晚一点就绪：镜像里没有 SSH 服务端时，平台会在启动后自动安装并配置。配置期间，实例卡片显示 **正在配置 SSH — 请稍后再连接**，此时 JupyterLab 已经可以使用。

SSH 就绪后，卡片上会显示 SSH 命令。

## 连接

点实例卡片上命令旁边的 **复制**，在终端里运行。命令格式如下：

```bash
ssh root@<host> -p <port>
```

登录用户是 `root`。第一次连接时输入 `yes` 接受主机密钥。

如果用的不是默认密钥，加上 `-i` 和私钥路径。

### 提示 “Remote host identification has changed”

新实例可能沿用之前实例的主机和端口，但主机密钥是新的。如果 `ssh` 提示主机密钥已更改，用实例卡片上给出的命令删掉旧记录，再重新连接：

```bash
ssh-keygen -R "[<host>]:<port>"
```

### SSH 配置失败

如果卡片显示 **SSH 配置失败**，说明这个实例无法通过 SSH 连接，但 JupyterLab 不受影响。可以继续用 JupyterLab，或者销毁实例后重新启动。

## 拷贝文件

用 `scp` 或 `rsync`，主机、端口和用户与 SSH 命令相同，例如：

```bash
scp -P <port> results.tar.gz root@<host>:/workspace/
```

## 用 CLI 连接

`rcc instance ssh` 不用复制命令就能直接连接，见[管理 GPU 实例](/radeon-cloud-docs/zh-cn/cli/instances/)。
