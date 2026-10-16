---
title: 额度
description: 额度怎么消耗，以及怎么把 AMD AI 开发者计划的积分变成额度。
sidebar:
  order: 8
---

额度用来付 GPU 实例的钱。免费的共享[模型 API](/radeon-cloud-docs/zh-cn/guides/model-apis/) 不占额度。

## 积分和额度

积分和额度是两笔独立的余额，很容易搞混。

**开发者积分** 属于 [AMD AI 开发者计划](https://developer.amd.com.cn/)，余额显示在计划首页。活动发的 `DP-XXXX-XXXX-XXXX` 兑换码加的是积分，不是额度。

**额度** 是平台运行 GPU 实例时消耗的，在 **Profile** 里显示为 **Credits Available**。

在中国站，积分换成额度分两步：

1. 在[兑取算力](https://developer.amd.com.cn/points/redeem)用积分换一张优惠码。1 积分换 1 小时，每天最多换 20 积分。
2. 在 **Profile** → **Redeem Credits** 里粘贴这张优惠码。

每一步具体怎么操作，见 [AMD AI 开发者计划](/radeon-cloud-docs/zh-cn/guides/developer-program/)。黑客松或工作坊直接发给你的优惠码，跳过第 1 步即可。

## 怎么消耗

实例运行期间持续消耗额度，消耗速度随挂载的 GPU 数量增加。余额低于申请的 GPU 数量时无法启动 —— 一个 4 卡实例至少要有 4 个额度才能起来。

实例停止或销毁后不再消耗。这也是[用完就销毁实例](/radeon-cloud-docs/zh-cn/guides/destroy/)之所以重要的原因：一个你忘了关的闲置 notebook 照样在扣钱。

## 查看余额

余额显示在 **Profile** 里。如果你在写脚本调平台接口，`GET /api/me` 也会返回它 —— 见[账号](/radeon-cloud-docs/zh-cn/api/account/)。

## 兑换优惠码

打开 **Profile**，点 **Redeem Credits**。把整串优惠码粘贴到 **Coupon Code** 输入框（提示文字是 “Paste your encrypted coupon here”），点 **Redeem**。

开发者计划发的优惠码是一长串加密字符，不是短码。每张只能用一次，自兑换之日起 30 天内有效。优惠码不记名，请像保管现金一样保管它。

额度只属于兑换它的站点，不能转移。中国站和全球站都有账号的话，兑换前先确认登录的是哪个站。还是兑换失败，见[兑换失败怎么办](/radeon-cloud-docs/zh-cn/guides/developer-program/#兑换失败怎么办)。

## 模型 API 的消耗

共享模型端点有自己的每日消耗上限，与额度分开统计，按亚洲/上海时间每天重置。当前用量和剩余额度可以通过 [`GET /api/profile/model-usage`](/radeon-cloud-docs/zh-cn/api/usage/) 查看。
