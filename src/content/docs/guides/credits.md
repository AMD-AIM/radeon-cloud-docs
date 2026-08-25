---
title: Credits
description: How credits are consumed, and how to turn AMD AI Developer Program points into them.
sidebar:
  order: 8
---

Credits pay for GPU instances. The free shared [model APIs](/radeon-cloud-docs/guides/model-apis/) don't touch them.

## Points and credits

Two different currencies, and they're easy to confuse.

**Points** are earned in the [AMD AI Developer Program](https://developer.amd.com.cn/points/redeem) by taking part in developer activities. They're a program-wide currency and aren't tied to AMD Radeon Cloud.

**Credits** are what AMD Radeon Cloud spends to run GPU instances. They only exist inside the platform.

Points become credits in two steps:

1. Redeem points for a coupon code at [developer.amd.com.cn/points/redeem](https://developer.amd.com.cn/points/redeem).
2. Redeem that coupon in your AMD Radeon Cloud **Profile**, which adds credits to your balance.

Coupons from hackathons and workshops work the same way at step 2 — you just skip step 1, because the code was issued to you directly.

## How they're spent

Credits are consumed while an instance is running, scaling with the number of GPUs attached. Launching is blocked if your balance is below the GPU count you're requesting — a 4-GPU instance needs at least 4 credits to start.

Nothing is consumed while an instance is stopped or destroyed. This is why [destroying an instance](/radeon-cloud-docs/guides/destroy/) when you're done matters: an idle notebook you forgot about still bills.

## Check your balance

Your balance is shown in **Profile**. It's also returned by `GET /api/me` if you're scripting against the platform — see [Account](/radeon-cloud-docs/api/account/).

## Redeem a coupon

Whether the code came from the Developer Program or from an event, redeem it the same way: open **Profile** and enter it. Credits are added to your balance immediately.

Each code can be used once, and some are bound to a specific account. If redemption fails, check that you're signed in as the account the code was issued to — and, if you have accounts on both the China and Global sites, that you're on the right one. Credits belong to a single site and don't transfer.

## Model API spend

Shared model endpoints have their own daily spend cap, tracked separately from credits and reset daily on Asia/Shanghai time. You can see the current usage and the remaining allowance through [`GET /api/profile/model-usage`](/radeon-cloud-docs/api/usage/).
