---
title: 积分
description: Radeon Cloud 积分怎么消耗，以及怎么用 AMD AI 开发者计划的开发者积分兑换。
sidebar:
  order: 8
---

Radeon Cloud 用 **积分** 支付 GPU 实例的费用（英文界面叫 Credits）。免费的共享[模型 API](/radeon-cloud-docs/zh-cn/guides/model-apis/) 不消耗积分。

## Radeon Cloud 积分和开发者积分

这是两笔独立的余额，名字相近，很容易混淆。

**开发者积分** 属于 [AMD AI 开发者计划](https://developer.amd.com.cn/)，余额显示在计划首页。活动发的 `DP-XXXX-XXXX-XXXX` 兑换码加的是开发者积分。

**积分** 属于 Radeon Cloud，运行 GPU 实例时消耗，在 **Profile** 里显示为 **Credits Available**。

在中国站，开发者积分换成 Radeon Cloud 积分分两步：

1. 在[兑取算力](https://developer.amd.com.cn/points/redeem)用开发者积分换一张优惠码。1 个开发者积分换 1 小时，每天最多换 20 个。
2. 在 **Profile** → **Redeem Credits** 里粘贴这张优惠码。

每一步具体怎么操作，见 [AMD AI 开发者计划](/radeon-cloud-docs/zh-cn/guides/developer-program/)。黑客松或工作坊直接发给你的优惠码，跳过第 1 步即可。

## 怎么消耗

实例运行期间持续消耗积分，GPU 越多消耗越快。余额低于所选 GPU 数量时无法启动，例如 4 卡实例至少需要 4 积分。

实例销毁后不再消耗积分。所以用完要及时[销毁实例](/radeon-cloud-docs/zh-cn/guides/destroy/)：忘记关闭的闲置实例同样会持续扣费。

## 查看余额

余额显示在 **Profile** 里。写脚本调用平台接口时，`GET /api/me` 也会返回余额，见[账号](/radeon-cloud-docs/zh-cn/api/account/)。

## 兑换优惠码

打开 **Profile**，点 **Redeem Credits**。把整串优惠码粘贴到 **Coupon Code** 输入框（提示文字是 “Paste your encrypted coupon here”），点 **Redeem**。

开发者计划发的优惠码是一长串加密字符，不是短码。每张只能用一次，自兑换之日起 30 天内有效。优惠码不记名，请像保管现金一样保管它。

积分只属于兑换它的站点，不能转移。中国站和全球站都有账号的话，兑换前先确认登录的是哪个站。仍然兑换失败，见[兑换失败怎么办](/radeon-cloud-docs/zh-cn/guides/developer-program/#兑换失败怎么办)。

## 模型 API 的消耗

共享模型 API 有自己的每日消耗上限，与积分分开统计，每天北京时间 0 点重置。当前用量和剩余配额可以通过 [`GET /api/profile/model-usage`](/radeon-cloud-docs/zh-cn/api/usage/) 查看。
