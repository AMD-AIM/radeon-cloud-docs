---
title: Credits
description: How credits are consumed and how to top up.
sidebar:
  order: 8
---

Credits pay for GPU instances. The free shared [model APIs](/radeon-cloud-docs/guides/model-apis/) don't touch them.

## How they're spent

Credits are consumed while an instance is running, scaling with the number of GPUs attached. Launching is blocked if your balance is below the GPU count you're requesting — a 4-GPU instance needs at least 4 credits to start.

Nothing is consumed while an instance is stopped or destroyed. This is why [destroying an instance](/radeon-cloud-docs/guides/destroy/) when you're done matters: an idle notebook you forgot about still bills.

## Check your balance

Your balance is shown in **Profile**. It's also returned by `GET /api/me` if you're scripting against the platform — see [Account](/radeon-cloud-docs/api/account/).

## Redeem a coupon

If you were issued a coupon code — at a hackathon or workshop, for instance — redeem it in **Profile**. The credits are added to your balance immediately.

Each code can be used once, and some are bound to a specific account. If redemption fails, check that you're signed in as the account the code was issued to.

## Model API spend

Shared model endpoints have their own daily spend cap, tracked separately from credits and reset daily on Asia/Shanghai time. You can see the current usage and the remaining allowance through [`GET /api/profile/model-usage`](/radeon-cloud-docs/api/usage/).
