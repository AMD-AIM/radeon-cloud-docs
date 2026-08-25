---
title: Connect over SSH
description: Reach your instance from your own terminal.
sidebar:
  order: 5
---

SSH gives you your instance in your own terminal, with your own editor, dotfiles, and tooling. It takes two pieces of setup: a public key on your account, and SSH enabled on the template.

## Add your public key

Generate a key pair locally if you don't already have one. This works on macOS, Linux, and Windows PowerShell:

```bash
ssh-keygen -t ed25519 -C "your_email@example.com"
```

That writes `~/.ssh/id_ed25519` (private) and `~/.ssh/id_ed25519.pub` (public).

Copy the public key and paste it into the **SSH Public Key** box on your Profile page, then click **Save Key**.

```bash
cat ~/.ssh/id_ed25519.pub
```

![Adding an SSH public key in Profile](../../../assets/guide/ssh-key.png)

:::danger[Paste the `.pub` file only]
The public key ends in `.pub` and starts with `ssh-ed25519` or `ssh-rsa`. Never paste the private key — anyone holding it can act as you.
:::

## Enable SSH on the template

When [creating a template](/radeon-cloud-docs/guides/templates/), turn on **SSH Access (advanced)** before saving. Only instances launched from SSH-enabled templates are reachable this way, and the setting can't be added to a running instance.

![The SSH Access toggle in the template form](../../../assets/guide/ssh-access.png)

## Connect

After the instance starts, the ready dialog — and **Active Instance** in your Profile — shows the connection details: a copy-ready command, plus host, port, and username.

![SSH connection details for a running instance](../../../assets/guide/ssh-connect.png)

```bash
ssh <user>@<host> -p <port>
```

Substitute the values shown on the page. On first connect, type `yes` to accept the host fingerprint.

## If the connection is refused

Some images don't ship an SSH server. Open a JupyterLab terminal and start one:

```bash
sudo apt update
sudo apt install -y openssh-server
mkdir -p /run/sshd
/usr/sbin/sshd
```

Then retry the connection from your local terminal.
