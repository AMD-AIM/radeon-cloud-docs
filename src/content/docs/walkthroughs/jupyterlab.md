---
title: "Walkthrough: JupyterLab and terminal"
description: "Run a notebook cell and open a terminal in your instance."
---

**When:** Your instance is ready and you want to start working.

![Animated walkthrough: JupyterLab and terminal](/radeon-cloud-docs/walkthroughs/en/jupyterlab.gif)

## Steps

1. Click **Open notebook** on the instance card.
2. JupyterLab opens. The Launcher has notebooks and a terminal.
3. Create a **Python 3** notebook.
4. Run a cell. PyTorch sees the AMD GPU.
5. The file browser on the left is `/workspace`.
6. To bring files in, use **Upload**.
7. Open a **Terminal** from the Launcher.
8. The terminal opens with a short guide: GitHub mirror, model downloads, which files are kept.
9. Run commands as usual, for example `rocm-smi` to see the GPU.

## Common pitfalls

- The file browser is `/workspace`, the only folder that can be kept, and only with persistent storage.
- If GitHub is slow from your network, download files on your computer and use **Upload**.

More detail: [JupyterLab](/radeon-cloud-docs/guides/jupyterlab/)
