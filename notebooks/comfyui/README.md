# ComfyUI on Radeon Cloud

`comfyui.ipynb` starts ComfyUI in a Radeon Cloud instance (the **ComfyUI** image) and opens it in your browser. The image and the notebook include no models; you download the ones you want.

- Start: `comfyui-start` (port 8188). Models: `/opt/ComfyUI/models`, plus `/workspace/ComfyUI-data/models` when you use the notebook. Outputs: `/opt/ComfyUI/output`.
- Open it from your browser: `sh /var/run/secrets/frp-self-service/install` once, then `rc-tunnel expose --port 8188`.
- Keep models across instances: choose **Persistent /workspace** at launch.

## What fits a 1-GPU instance

A standard 1-GPU instance has one Radeon PRO W7900D (48 GB GPU memory) and 55 GB of system memory. ComfyUI loads model files into system memory first, so the files a workflow loads must fit in 55 GB.

- LTX-2.3 22B in BF16 (about 70 GB of model files) does not fit: the instance runs out of memory while loading.
- The FP8 files (about 42 GB: `ltx-2.3-22b-dev-fp8` plus `gemma_3_12B_it_fp8_scaled`) are about the largest that may fit. We haven't tested them on Radeon Cloud.
- Smaller image models, such as SD 1.5 or SDXL, fit comfortably.

## Credits

The earlier version of this Gallery template used the [ComfyUI + LTX-2.3 workshop notebook](https://github.com/Vivicai1005/notebook/tree/main/comfyui_ltx_notebook) by Vivicai1005.
