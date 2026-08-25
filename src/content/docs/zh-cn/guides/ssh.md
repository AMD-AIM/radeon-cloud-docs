---
title: 通过 SSH 连接
description: 从自己的终端连上实例。
sidebar:
  order: 5
---

SSH 让你在自己的终端里操作实例，用惯用的编辑器、dotfiles 和工具链。需要两步准备：把公钥加到账号上，以及在模板上启用 SSH。

## 添加公钥

如果还没有密钥对，先在本地生成一对。macOS、Linux 和 Windows PowerShell 都适用：

```bash
ssh-keygen -t ed25519 -C "your_email@example.com"
```

这会生成 `~/.ssh/id_ed25519`（私钥）和 `~/.ssh/id_ed25519.pub`（公钥）。

复制公钥，粘贴到 Profile 页面的 **SSH Public Key** 输入框，然后点 **Save Key**。

```bash
cat ~/.ssh/id_ed25519.pub
```

![在 Profile 里添加 SSH 公钥](../../../../assets/guide/ssh-key.png)

:::danger[只粘贴 `.pub` 文件]
公钥以 `.pub` 结尾，内容以 `ssh-ed25519` 或 `ssh-rsa` 开头。千万别粘私钥 —— 拿到它的人就能冒充你。
:::

## 在模板上启用 SSH

[创建模板](/radeon-cloud-docs/zh-cn/guides/templates/)时，保存前打开 **SSH Access (advanced)**。只有从启用了 SSH 的模板启动的实例才能这样连，而且这个设置没法加到已经在跑的实例上。

![模板表单里的 SSH Access 开关](../../../../assets/guide/ssh-access.png)

## 连接

实例启动后，就绪弹窗 —— 以及 Profile 里的 **Active Instance** —— 会显示连接信息：一条可直接复制的命令，外加主机、端口和用户名。

![运行中实例的 SSH 连接信息](../../../../assets/guide/ssh-connect.png)

```bash
ssh <user>@<host> -p <port>
```

把页面上显示的值替换进去。第一次连接时输入 `yes` 接受主机指纹。

## 如果连接被拒绝

有些镜像不带 SSH 服务端。打开一个 JupyterLab 终端，装一个起来：

```bash
sudo apt update
sudo apt install -y openssh-server
mkdir -p /run/sshd
/usr/sbin/sshd
```

然后在本地终端重试连接。
