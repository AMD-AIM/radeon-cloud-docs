---
title: 通过 SSH 连接
description: 在设置里添加 SSH 密钥，等待 SSH 就绪，从自己的终端连接，以及 SSH 配置失败时自己动手安装。
---

通过 SSH，你可以在自己的终端和编辑器里使用实例。请在启动实例**之前**到设置里添加公钥：没有公钥时启动的实例不会开启 SSH，之后再添加公钥也不会生效，需要重新启动实例。保存过的公钥会用于之后每次启动。

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

添加后，列表里会显示密钥的名称和指纹。每台电脑可以各添加一把，最多 10 把。

![设置页的 SSH 密钥区域，已添加一把密钥](../../../../assets/guide/zh/settings-ssh-keys.png)

:::danger[只粘贴 .pub 文件]
公钥以 `ssh-ed25519` 或 `ssh-rsa` 开头，来自扩展名为 `.pub` 的文件。不要粘贴私钥。
:::

密钥只对添加之后启动的实例生效。已经在运行的实例，仍使用它启动时的那组密钥。

## SSH 是怎么配置的

实例启动时，平台会在 Notebook 旁边同时配置 SSH。这期间 JupyterLab 一直可用，所以实例可能已经就绪，而 SSH 还在准备中。平台分四步完成：

1. **检查。** 确认你的公钥，并查看镜像里有没有 SSH 服务端（`sshd`）。
2. **安装，仅在镜像里没有 SSH 服务端时。** Ubuntu 和 Debian 上，平台会运行 `apt-get update` 和 `apt-get install openssh-server`，只使用发行版自己的软件源，镜像里其他的软件源会被忽略。RHEL 系、Fedora 和 Amazon Linux 上用 `dnf` 或 `yum`，Alpine 上用 `apk`。其他操作系统不支持自动安装。每个包管理步骤最长运行 300 秒，超时即停止。
3. **配置。** 写入 SSH 服务端配置，生成主机密钥，并加入你的公钥。只能用密钥登录，密码登录、端口转发、X11 转发和 agent 转发都已关闭。
4. **启动。** 启动 `sshd` 并确认它在运行。之后卡片上会显示 **SSH 已就绪** 和 SSH 命令。

Base 等目录镜像已经自带 SSH 服务端，会跳过第 2 步，就绪得更快。其他镜像，包括部分模板镜像和自定义镜像，可能没有自带。

### 哪些因素会影响配置

- **镜像里有没有 SSH 服务端。** 这是最主要的因素。没有的话，每次启动实例都要现下载、现安装。
- **软件包的下载速度。** 软件包经由平台受控的网络下载。网络慢时（高峰时段可能出现），下载会超过 300 秒的限制，安装随即失败。
- **操作系统。** 只有第 2 步里列出的几类系统能自动安装。
- **镜像的运行方式。** 镜像必须以 `root` 运行、根文件系统可写，并且提供 `timeout` 命令。
- **你的公钥。** 启动前，**设置** 里至少要保存一把有效的公钥。

## 等待 SSH 就绪

SSH 会比实例稍晚一点就绪。配置期间，实例卡片显示 **正在配置 SSH — 请稍后再连接**，此时 JupyterLab 已经可以使用。卡片上还会用小字显示当前进行到哪一步，比如正在安装 SSH 服务端。

SSH 就绪后，卡片上会显示 **SSH 已就绪** 和 SSH 命令。

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

## 拷贝文件

用 `scp` 或 `rsync`，主机、端口和用户与 SSH 命令相同，例如：

```bash
scp -P <port> results.tar.gz root@<host>:/workspace/
```

## 用 CLI 连接

`rcc instance ssh` 不用复制命令就能直接连接，见[管理 GPU 实例](/radeon-cloud-docs/zh-cn/cli/instances/)。

## SSH 配置失败

如果卡片显示 **SSH 配置失败**，说明这个实例无法通过 SSH 连接，但 JupyterLab 不受影响。卡片上会给出原因，并用小字显示当前进行到哪一步，还带有指向本节的链接。SSH 命令仍然显示在提示下方，自己装好 SSH 之后就可以用它连接。

- `OpenSSH installation failed`

  下载或安装没有完成。常见原因是软件源速度慢或连不上，或者超过了 300 秒的限制。**怎么办：**过一会儿再试，或者[自己安装 SSH](#自己安装-ssh)。

- `OpenSSH package source is unavailable`

  连不上软件源。**怎么办：**同上。

- `The image does not ship openssh-server. Install it inside the notebook, then start sshd.`

  镜像里没有 SSH 服务端，也没有自动安装。**怎么办：**[自己安装 SSH](#自己安装-ssh)。

- `Automatic OpenSSH installation supports Ubuntu, Debian, RHEL-family, Fedora, Amazon Linux, and Alpine images`

  镜像的操作系统不在自动安装的支持范围内。**怎么办：**系统有对应软件包的话，[自己安装 SSH](#自己安装-ssh)，或者换一个镜像启动。

- `Image does not provide the timeout command`

  镜像里没有 `timeout` 命令，自动安装需要它。**怎么办：**[自己安装 SSH](#自己安装-ssh)。

- `Image root filesystem does not allow OpenSSH installation`

  镜像的根文件系统是只读的。**怎么办：**换一个镜像启动。

- `SSH setup requires a root runtime`

  镜像不是以 `root` 运行的。**怎么办：**换一个镜像启动。

- `SSH public key is missing` 或 `SSH public key is invalid`

  实例没有拿到可用的公钥。**怎么办：**检查 **设置 → SSH 密钥**，然后销毁实例并重新启动。

- `SSH configuration failed`、`SSH host key generation failed`、`SSH server configuration is invalid` 或 `SSH server failed to start`

  SSH 服务端已经装好，但配置或启动失败。**怎么办：**销毁实例后重新启动。如果再次出现，请[联系支持](/radeon-cloud-docs/zh-cn/resources/troubleshooting/#仍然无法解决)。

如果看到的是上面没有列出的提示，说明配置因为平台没有列出的原因中止了。先看提示下面的小字，再重试或联系支持。

你有三种选择：

- **自己安装 SSH。** 需要几分钟，步骤见下文。
- **重新启动实例，** 最好换个不那么繁忙的时间。新实例会重新配置一次，软件源慢通常只是暂时的。
- **用自带 SSH 服务端的镜像启动。** 这样就没有东西要下载。

### 自己安装 SSH

在 JupyterLab 里打开一个终端。下面的命令默认你是 `root`，这些实例上的默认用户就是 `root`。

1. 安装 SSH 服务端。Ubuntu 和 Debian 上：

   ```bash
   apt-get update
   apt-get install -y --no-install-recommends openssh-server
   ```

   其他系统用各自的包管理器：

   ```bash
   dnf install -y openssh-server    # RHEL 系、Fedora、Amazon Linux（也可以用 yum）
   apk add --no-cache openssh       # Alpine
   ```

   如果下载很慢或卡住，等一会儿再运行，或者换个不繁忙的时间再试。

2. 创建目录并加入公钥。把 `<your public key>` 换成 `.pub` 文件里的整行内容，就是你在 **设置** 里添加的那一行。如果你用多台电脑，每台各加一行。

   ```bash
   mkdir -p /run/sshd /root/.ssh
   chmod 700 /root/.ssh
   echo '<your public key>' >> /root/.ssh/authorized_keys
   chmod 600 /root/.ssh/authorized_keys
   ```

3. 生成主机密钥：

   ```bash
   ssh-keygen -A
   ```

4. 像平台一样，只允许密钥登录、关闭端口转发，启动 SSH 服务端：

   ```bash
   /usr/sbin/sshd -o PasswordAuthentication=no -o AllowTcpForwarding=no
   ```

5. 确认它在运行。镜像里没有 `ps` 命令也能用：

   ```bash
   grep -l '^sshd$' /proc/[0-9]*/comm
   ```

   会输出一行或多行，形如 `/proc/123/comm`。如果没有任何输出，说明 `sshd` 没有在运行：重新运行第 4 步，并查看它给出的报错。

然后按[连接](#连接)里的方法，从自己的终端连接。主机密钥是新的，可能需要用到那一节里的 `ssh-keygen -R` 命令。

:::caution[和自动配置的区别]
- 你启动的 SSH 服务端只在容器运行期间有效。实例重启后，SSH 和你配置的内容可能都没有了，需要重新执行这些步骤。
- 平台会在它启动的 SSH 会话里设置代理变量，而你自己启动的 SSH 服务端没有。如果 `pip`、`git` 或 Hugging Face 的下载需要代理，在 JupyterLab 终端里运行 `env | grep -i proxy` 查看这些值，再在你的 SSH 会话里 `export`。
- 实例卡片会一直显示 **SSH 配置失败**，因为它只反映平台自己的配置结果。SSH 命令仍然显示在提示下方，直接复制它来连接即可。
:::

## SSH 的限制

- **不支持端口转发和隧道。** SSH 服务端关闭了转发，所以 `ssh -L`、`ssh -R`、`ssh -D` 和跳板机（`ProxyJump`）都用不了。你不能通过 SSH 把 JupyterLab、TensorBoard 或其他端口转发到自己的电脑，请直接在控制台打开 JupyterLab。
- **依赖 SSH 隧道的工具无法连接。** 凡是要在实例上启动一个服务、再通过 SSH 与它通信的工具，或者带「SSH 隧道」选项的工具，都属于这一类，例如编辑器和 IDE 的远程开发功能（如 VS Code、Cursor、JetBrains）、远程调试器，以及通过 SSH 访问实例上服务的数据库等客户端。
- **可以正常使用的。** 交互式终端会话、执行单条命令（`ssh ... <命令>`）、`scp`、`sftp`、`rsync`，以及 `rcc instance ssh`。文件可以在 JupyterLab 里编辑。
- **只能用密钥登录。** 不支持密码登录，登录用户是 `root`。
- **密钥在启动时就固定了。** 之后添加的密钥只对添加之后启动的实例生效。
