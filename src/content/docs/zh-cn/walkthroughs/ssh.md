---
title: "操作演示：SSH 连接"
description: "先添加 SSH 公钥再启动实例，然后从自己的终端连接。"
---

**什么时候用：**更习惯用自己电脑的终端或编辑器。

![操作演示动图：SSH 连接](/radeon-cloud-docs/walkthroughs/zh/ssh.gif)

## 步骤

1. 从右上角账户菜单打开 **Settings（设置）**。
2. 找到 **SSH 密钥**，务必在启动实例之前添加公钥。
3. 点 **New SSH key（新建 SSH 密钥）**，粘贴 `.pub` 文件的内容。
4. 公钥已保存到账户。
5. 然后再启动实例。
6. 实例就绪后，在实例卡片上复制 SSH 命令。
7. 每个新实例的主机密钥都不同；ssh 提示主机密钥已变化时，按卡片提示清除旧记录。
8. 在自己电脑的终端里粘贴运行。使用 Python 前，先加载实例环境（见下文）。

## 常见遗漏

- 务必**先**添加公钥再启动。没有公钥时启动的实例不会开启 SSH，之后再加也不会生效。
- SSH 登录不会加载实例的环境，`python` 里可能没有 PyTorch，`LD_LIBRARY_PATH` 和 Hugging Face 相关设置也会缺失。见 [通过 SSH 加载实例环境](#通过-ssh-加载实例环境)。
- 新实例的主机密钥会变，ssh 可能提示主机密钥已更改。

## 通过 SSH 加载实例环境

最简单的做法是在 **JupyterLab 终端**里操作（**Open notebook** → **Terminal**），那里已经带有实例的环境。

通过 SSH 登录后，每次会话先运行一次下面这行（适用于 bash）。它会把镜像的 `PATH`、`LD_LIBRARY_PATH`、Hugging Face 等设置从容器复制到当前 shell：

```bash
while IFS= read -r l; do export "$l"; done < <(tr '\0' '\n' </proc/1/environ | grep -E '^(PATH|LD_LIBRARY_PATH|LIBRARY_PATH|PYTHONPATH|VIRTUAL_ENV|CONDA_[A-Z0-9_]*|ROCM_[A-Z0-9_]*|HIP_[A-Z0-9_]*|HSA_[A-Z0-9_]*|TORCH_[A-Z0-9_]*|VLLM_[A-Z0-9_]*|HF_ENDPOINT|HF_HOME|HF_HUB_DISABLE_XET)=' | grep -vE '^[A-Z0-9_]*(KEY|TOKEN|SECRET|PASSWORD)[A-Z0-9_]*=')
```

对这台实例永久生效：用编辑器打开 `~/.bashrc`，把上面这行粘贴为最后一行，之后每次交互式 SSH 登录都会带上这些环境设置。`~/.bashrc` 位于 `/root`，实例重新创建后不会保留（只有 `/workspace` 会保留），新启动后需要再加一次。单条命令（`ssh host '命令'`）不会读取 `~/.bashrc`，请把这行放在命令前面。

更多说明：[通过 SSH 连接](/radeon-cloud-docs/zh-cn/guides/ssh/)
