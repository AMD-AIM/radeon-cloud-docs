---
title: Credits
description: How credits are consumed, and how to turn AMD AI Developer Program points into them.
sidebar:
  order: 8
---

Credits pay for GPU instances. The free shared [model APIs](/radeon-cloud-docs/guides/model-apis/) don't touch them.

## Points and credits

These are two separate balances, and they're easy to mix up.

**Points** (开发者积分) belong to the [AMD AI Developer Program](https://developer.amd.com.cn/), and the program home page shows your balance. Event codes like `DP-XXXX-XXXX-XXXX` add points, not credits.

**Credits** are what the platform spends on GPU instances. **Profile** shows them as **Credits Available**.

On the China site, you turn points into credits like this:

1. Exchange points for a coupon at [兑取算力](https://developer.amd.com.cn/points/redeem). 1 point buys 1 hour, and you can exchange up to 20 points a day.
2. Paste the coupon in **Profile** → **Redeem Credits**.

[AMD AI Developer Program](/radeon-cloud-docs/guides/developer-program/) walks through each screen. If a hackathon or workshop gives you a coupon directly, skip step 1.

## How they're spent

Credits are consumed while an instance is running, scaling with the number of GPUs attached. Launching is blocked if your balance is below the GPU count you're requesting — a 4-GPU instance needs at least 4 credits to start.

Nothing is consumed while an instance is stopped or destroyed. This is why [destroying an instance](/radeon-cloud-docs/guides/destroy/) when you're done matters: an idle notebook you forgot about still bills.

## Check your balance

Your balance is shown in **Profile**. It's also returned by `GET /api/me` if you're scripting against the platform — see [Account](/radeon-cloud-docs/api/account/).

## Redeem a coupon

Open **Profile** and click **Redeem Credits**. Paste the whole coupon into **Coupon Code** (the hint says "Paste your encrypted coupon here"), then click **Redeem**.

A coupon from the developer program is a long encrypted string, not a short code. It works once and expires 30 days after you get it. It isn't tied to your name, so treat it like cash.

Credits belong to the site where you redeem them and can't be moved. If you have accounts on both sites, check which one you're signed in to before you redeem. If redemption still fails, see [If redemption fails](/radeon-cloud-docs/guides/developer-program/#if-redemption-fails).

## Model API spend

Shared model endpoints have their own daily spend cap, tracked separately from credits and reset daily on Asia/Shanghai time. You can see the current usage and the remaining allowance through [`GET /api/profile/model-usage`](/radeon-cloud-docs/api/usage/).
