---
title: Destroy an instance
description: Shut down your instance and stop spending credits.
sidebar:
  order: 9
---

A running instance keeps consuming credits, whether or not you're using it. Destroy it when you're done.

Go to **Active Instance** in your Profile and click **Destroy Instance**.

![The Destroy Instance button](../../../assets/guide/destroy.png)

:::caution[Check your files first]
Unless the template used **Persistent (PVC)** storage, everything in the instance is deleted along with it. Download anything you need, or push it to a repository, before destroying.
:::

The instance is gone within a few moments, credits stop being consumed, and you're free to launch another one — remember that each account can only have one active instance at a time.

## Instances also stop on their own

Instances have a maximum lifetime and an idle timeout, both configured per instance type. An instance that reaches either is shut down automatically. Treat this as a safety net rather than a plan: an instance that hits its lifetime mid-job loses the work, and the credits spent up to that point are still spent.

## Doing this from a script

```bash
curl -X DELETE https://radeon-global.anruicloud.com/api/notebook/current \
  -H "Cookie: <session>"
```

See [Instances](/radeon-cloud-docs/api/instances/) for the full API.
