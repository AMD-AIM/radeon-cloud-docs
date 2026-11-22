---
title: "Walkthrough: launch a notebook"
description: "Launch a GPU notebook and choose storage that keeps your files."
---

**When:** You want a GPU JupyterLab to work in.

![Animated walkthrough: launch a notebook](/radeon-cloud-docs/walkthroughs/en/launch.gif)

## Steps

1. Sign in and open the home page. The launch panel is the main section.
2. Open the image list and choose the environment you need.
3. Pick an image. The line under it says what's inside.
4. Turn on **Customize** to see the storage options.
5. Under **Workspace storage**, choose **Persistent /workspace** if you want to keep your files.
6. Check the field help: only `/workspace` is kept.
7. Check the auto-delete time. The footer shows the hourly cost.
8. Click **Launch instance**. If GPUs are busy, you wait in a queue.
9. The window and card show progress while the instance starts.
10. When it's ready, click **Open notebook** to go to JupyterLab.

## Common pitfalls

- Storage options are under **Customize**. Without it you get a temporary workspace, which is deleted with the instance.
- Only files in `/workspace` are kept, and storage can't be changed after launch.

More detail: [Launch an instance](/radeon-cloud-docs/guides/launch/)
