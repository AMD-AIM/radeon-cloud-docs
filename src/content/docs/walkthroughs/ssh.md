---
title: "Walkthrough: connect with SSH"
description: "Add your SSH key before launching, then connect from your own terminal."
---

**When:** You prefer your own terminal or editor.

![Animated walkthrough: connect with SSH](/radeon-cloud-docs/walkthroughs/en/ssh.gif)

## Steps

1. Open **Settings** from the account menu.
2. Find **SSH keys**. Add your key before you launch.
3. Click **New SSH key** and paste the contents of your `.pub` file.
4. The key is saved to your account.
5. Now launch the instance.
6. When it's ready, copy the SSH command from the instance card.
7. Every new instance has a new host key. If ssh warns about it, clear the old entry as the card shows.
8. Paste the command into your own terminal. Before using Python, load the instance environment (see below).

## Common pitfalls

- Add the key **before** you launch. An instance started without a key has no SSH, and adding a key later doesn't change that.
- An SSH login doesn't load the instance's environment, so `python` may have no PyTorch and settings such as `LD_LIBRARY_PATH` or the Hugging Face variables are missing. See [Load the instance environment over SSH](#load-the-instance-environment-over-ssh).
- A new instance has a new host key, so ssh may warn about a changed key.

## Load the instance environment over SSH

The simplest way is to work in the **JupyterLab terminal** (**Open notebook** → **Terminal**). It already has the instance's environment.

Over SSH, run this once in each session. It's for bash and copies the image's settings, such as `PATH`, `LD_LIBRARY_PATH` and the Hugging Face variables, from the container into your shell:

```bash
while IFS= read -r l; do export "$l"; done < <(tr '\0' '\n' </proc/1/environ | grep -E '^(PATH|LD_LIBRARY_PATH|LIBRARY_PATH|PYTHONPATH|VIRTUAL_ENV|CONDA_[A-Z0-9_]*|ROCM_[A-Z0-9_]*|HIP_[A-Z0-9_]*|HSA_[A-Z0-9_]*|TORCH_[A-Z0-9_]*|VLLM_[A-Z0-9_]*|HF_ENDPOINT|HF_HOME|HF_HUB_DISABLE_XET)=' | grep -vE '^[A-Z0-9_]*(KEY|TOKEN|SECRET|PASSWORD)[A-Z0-9_]*=')
```

Permanent for this instance: open `~/.bashrc` in an editor and paste the line above as its last line. Every interactive SSH login then gets the environment settings above. `~/.bashrc` is in `/root`, which is not kept when the instance is recreated (only `/workspace` is), so add it again after a new launch. For a one-off command (`ssh host 'cmd'`), `~/.bashrc` does not apply: put the line in front of the command.

More detail: [Connect over SSH](/radeon-cloud-docs/guides/ssh/)
