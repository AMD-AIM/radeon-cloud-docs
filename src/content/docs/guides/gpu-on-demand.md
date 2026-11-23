---
title: Use a GPU on demand
description: Run a free CPU workspace that attaches a GPU only while your notebook code runs. How to start one, what happens when the GPU is idle, and how it is billed.
---

With **CPU workspace · GPU on demand**, your instance is a CPU notebook that costs no credits. A GPU attaches when you run a cell and is released when it has been idle for a while. You pay only for the hours a GPU is attached.

## Start an on-demand workspace

1. Open **Home**.
2. Under **Deploy type**, keep **Notebook**.
3. Under **GPU mode**, choose **CPU workspace · GPU on demand**.
4. Under **GPU size for kernels**, pick a size. Your notebook gets a GPU of this size each time it attaches one.
5. Click **Launch instance**.

The line above the button shows what you will get, for example **CPU workspace · 1 GPU on demand · 1 credit / hour while attached**.

The workspace always uses persistent `/workspace` storage. See [Keep your data](/radeon-cloud-docs/guides/storage/).

**Dedicated GPU** is the usual instance. Its GPU stays attached for the whole session and is billed for every hour the instance runs.

## Run code on the GPU

1. Open the instance and create or open a notebook.
2. Select the kernel **Python 3 (GPU, on demand)**.
3. Run a cell.

When a GPU is free, it usually attaches in a few seconds. The first attach on a GPU node can take a few minutes while the node downloads the image. The cell output shows a line such as `[GPU] ... GPU attached in 4s.`, and then the cell runs on the GPU.

When no GPU is free, the cell says you are in the queue, for example `No GPU is free right now - you are #2 in the queue.` Leave the cell as it is. It runs by itself when a GPU frees up.

If the queue is full, the cell says `The GPU queue is full, so this request was not queued. Your files are safe; run again later.`

A workspace has one GPU kernel at a time. If the GPU kernel stops unexpectedly, for example when it runs out of memory, the GPU is released and the cell says so. Your files are kept; run again to attach a new GPU kernel.

The status bar at the bottom of JupyterLab shows the GPU state, for example **GPU ● attached** or **GPU … queued #2**.

## When the GPU is idle

If no cell runs for 30 minutes, the GPU is released.

Two minutes before the release, a notice appears with two buttons:

- **Keep GPU** keeps the GPU attached and restarts the idle timer.
- **Release now** releases the GPU at once.

When the GPU is released:

- Variables in memory are cleared.
- Files in `/workspace` and packages installed there are kept.
- The status bar shows **GPU ○ released · Run re-attaches**.

Run any cell to attach a GPU again. The output then says that variables from before were cleared. Run the earlier cells again to rebuild them.

The JupyterLab command palette also has **GPU: keep attached (reset idle timer)** and **GPU: release now**.

## Billing

- The CPU workspace costs no credits.
- While a GPU is attached, each clock hour (for example 10:00 to 11:00) is charged once, at one credit per GPU.
- Releasing and re-attaching within the same clock hour costs nothing extra.

If you don't have enough credits, the GPU does not attach. The cell says `Not enough credits for a GPU (1 needed). Your files are safe; add credits in Radeon Cloud and Run again.`

If your credits run out for the next hour while a GPU is attached, the GPU is released. Your files are kept. Add credits and run the cell again. See [Credits](/radeon-cloud-docs/guides/credits/).

## Auto-delete

The CPU workspace is deleted automatically like any other instance. It uses the same time limit, and you get the same notice with **Extend** before it is deleted. Files in the persistent `/workspace` are kept for your next instance.
