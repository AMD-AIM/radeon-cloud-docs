---
title: Connect over SSH
description: Add an SSH key in Settings, wait for SSH to come up, connect from your own terminal, and install SSH yourself if the setup fails.
---

SSH lets you use the instance from your own terminal and editor. Add your public key in Settings **before** you launch: an instance launched without a key has no SSH, and adding a key later doesn't change that, so relaunch it. A saved key is used for every later launch.

## Add your public key

1. If you don't have a key pair yet, create one. This works on macOS, Linux and Windows PowerShell:

   ```bash
   ssh-keygen -t ed25519 -C "laptop"
   ```

   It writes the private key to `~/.ssh/id_ed25519` and the public key to `~/.ssh/id_ed25519.pub`.

2. Print the public key and copy it:

   ```bash
   cat ~/.ssh/id_ed25519.pub
   ```

3. In the console, open **Settings** and click **New SSH key**.
4. Enter a **Title** such as the computer's name, paste the key into **Key**, and click **New SSH key** in the dialog.

The key is listed with its title and fingerprint. You can add one key for each computer you use, up to 10 keys.

![The SSH keys section of Settings with one key added](../../../assets/guide/en/settings-ssh-keys.png)

:::danger[Paste only the .pub file]
A public key starts with `ssh-ed25519` or `ssh-rsa` and comes from the file ending in `.pub`. Never paste the private key.
:::

Keys apply to instances launched after you add them. An instance that is already running keeps the keys it started with.

## Wait for SSH

SSH starts a little after the instance, because the platform installs and configures the SSH server when the image doesn't include one. While it is being set up, the instance card shows **Setting up SSH — do not connect yet**. JupyterLab already works at this point.

When SSH is ready, the card shows **SSH is ready** and the SSH command.

## Connect

Click **Copy** next to the command on the instance card and run it in your terminal. It has this form:

```bash
ssh root@<host> -p <port>
```

You log in as `root`. The first time you connect, type `yes` to accept the host key.

If your key isn't the default one, add `-i` and the path to the private key.

### "Remote host identification has changed"

A new instance can reuse a host and port that an earlier instance had, with a new host key. If `ssh` warns that the host key has changed, remove the old entry with the command shown on the instance card, then connect again:

```bash
ssh-keygen -R "[<host>]:<port>"
```

## Copy files

Use `scp` or `rsync` with the same host, port and user as the SSH command, for example:

```bash
scp -P <port> results.tar.gz root@<host>:/workspace/
```

## Connect from the CLI

`rcc instance ssh` connects without copying the command. See [Manage GPU instances](/radeon-cloud-docs/cli/instances/).

## SSH could not be set up

When the image has no SSH server, the platform installs one after the instance starts. If the network is slow, the download can time out, and the card shows **SSH could not be set up**. JupyterLab is unaffected, and the SSH command stays on the card.

Read the message on the card, then:

| What the message means | What to do |
|---|---|
| The download or install failed, the package source can't be reached, or the image has no SSH server | [Install SSH yourself](#install-ssh-yourself); or launch again later; or launch with an image that includes an SSH server (see the tip below) |
| The image's operating system isn't supported, its root file system is read-only, or it doesn't run as `root` | Installing won't help here. Launch with another image |
| SSH configuration failed, or the SSH server failed to start | Destroy the instance and launch again. If it happens again, [email support](/radeon-cloud-docs/resources/troubleshooting/#still-stuck) |

:::tip[Images that include an SSH server]
These catalog images already include one, so nothing is installed at launch: Base, PyTorch · Stable, PyTorch · Latest, vLLM · Stable, vLLM · Latest, SGLang and ComfyUI.
:::

### Install SSH yourself

Open a terminal in JupyterLab and run these as `root`, the default user on these instances:

```bash
apt-get update
apt-get install -y --no-install-recommends openssh-server
mkdir -p /run/sshd /root/.ssh && chmod 700 /root/.ssh
echo '<your public key>' >> /root/.ssh/authorized_keys
chmod 600 /root/.ssh/authorized_keys
ssh-keygen -A
/usr/sbin/sshd -o PasswordAuthentication=no -o AllowTcpForwarding=no
```

Replace `<your public key>` with the whole line from your `.pub` file, the same one you added in **Settings**. On RHEL-family systems and Fedora, use `dnf install -y openssh-server` instead of the first two lines. On Alpine, use `apk add --no-cache openssh`. If the download is slow, wait and run it again.

Then connect with the SSH command on the card, as described in [Connect](#connect).

:::note[What is different from the automatic setup]
- The SSH server you started stays up only as long as the container. If the instance restarts, repeat these steps.
- The card keeps showing **SSH could not be set up**, because it only reports the platform's own setup. Copy the SSH command from the card to connect.
:::

## Limits of SSH

- **No port forwarding or tunnels.** `ssh -L`, `ssh -R`, `ssh -D` and jump hosts don't work. Open JupyterLab from the console instead of forwarding its port.
- **Tools that connect through an SSH tunnel can't connect,** for example the remote development features of VS Code, Cursor and JetBrains. A terminal session, `scp`, `sftp`, `rsync` and `rcc instance ssh` work.
- **Key login only.** Password login isn't available. The login user is `root`.
