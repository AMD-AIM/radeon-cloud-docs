---
title: Create a template
description: Define the container image, GPU count, storage, and startup behaviour for your instances.
sidebar:
  order: 2
---

A template is the recipe for an instance. It records which container image to run, how much GPU and disk to allocate, and what should start automatically. You launch instances from templates, so getting the template right once saves you repeating the setup.

In the **My Templates** section of your Profile, click **Add Template**.

![The Add Template button in My Templates](../../../assets/guide/add-template.png)

## Required fields

**Title** — a name for the template, so you can recognise it in the list.

**Container Image** — the base image the instance runs. Choose one from the catalog; ROCm-ready PyTorch images are the usual starting point.

![The template form with title and container image](../../../assets/guide/add-template-form.png)

## Storage

Set **Storage** to **Persistent (PVC)** if you want your files to survive. With persistent storage, data written to your workspace is kept after the instance is destroyed and is there again the next time you launch. Without it, everything is lost when the instance goes away.

Disk size ranges from 100 GB up to a ceiling that scales with GPU count — 100 GB for 1 GPU, 150 GB for 2, and 200 GB for 4.

## SSH access

To reach instances from your own terminal, turn on the **SSH Access (advanced)** toggle before saving. Only instances launched from SSH-enabled templates can be reached over SSH — you can't add it afterwards. See [Connect over SSH](/radeon-cloud-docs/guides/ssh/).

![The SSH Access toggle](../../../assets/guide/ssh-access.png)

## Serving a model instead of a notebook

To deploy a model as an OpenAI-compatible endpoint rather than opening a notebook, set **Deploy Type** to **vLLM Model API** or **SGLang** and supply a serve command. See [Model APIs](/radeon-cloud-docs/guides/model-apis/#dedicated-endpoints).

## Save

Click **Add Template** at the bottom of the form. The template appears in **My Templates**, ready to launch.

Templates you create are private to your account unless you have editor permission on the platform.
