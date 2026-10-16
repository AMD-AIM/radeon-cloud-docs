---
title: Destroy an instance
description: Delete your instance to stop spending credits, and what happens to your files.
---

A running instance spends credits whether you use it or not. Destroy it when you're done.

## Destroy from Home

1. Open **Home**. The instance card shows your running instance.
2. Click **Destroy instance**.
3. The confirmation names the instance, its GPUs and how long it has been up, and reminds you that temporary workspace data is deleted and persistent workspace data is kept. Check that it's the right instance and click **Destroy**.

The card shows **Destroying instance**. When it's gone, the launch form comes back and credits stop.

If you need anything that isn't under a persistent `/workspace`, save it first. See [Keep your data](/radeon-cloud-docs/guides/storage/).

If the card shows **Destroy is taking longer than expected**, refresh the page. If the instance is still there after a few minutes, email [member-service@mail.developer.amd.com.cn](mailto:member-service@mail.developer.amd.com.cn) with the time and the instance name.

## Instances that stop on their own

Instances are also stopped by the platform when they reach the maximum lifetime, when they have shown no activity for a while, and when your credits run out. Don't rely on these limits to stop an instance for you: credits spent up to that point are still spent, and a job cut off mid-run loses whatever it hadn't saved.

## Signing out doesn't stop an instance

Signing out of the console, closing the browser or signing out of the CLI leaves the instance running.

## From the CLI or API

- CLI: `rcc instance delete --yes`. See [Manage GPU instances](/radeon-cloud-docs/cli/instances/).
- API: see [Instances](/radeon-cloud-docs/api/instances/#destroy-the-instance).
