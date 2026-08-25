---
title: 额度
description: 额度怎么消耗，以及怎么把 AMD AI 开发者计划的积分变成额度。
sidebar:
  order: 8
---

额度用来付 GPU 实例的钱。免费的共享[模型 API](/radeon-cloud-docs/zh-cn/guides/model-apis/) 不占额度。

## 积分和额度

两种不同的「货币」，容易混。

**积分（Points）** 在 [AMD AI 开发者计划](https://developer.amd.com.cn/points/redeem) 里通过参与开发者活动获得。它是整个开发者计划通用的，不专属于 AMD Radeon Cloud。

**额度（Credits）** 是 AMD Radeon Cloud 用来跑 GPU 实例的，只在平台内部存在。

积分变成额度分两步：

1. 在 [developer.amd.com.cn/points/redeem](https://developer.amd.com.cn/points/redeem) 用积分兑换出优惠码。
2. 在 AMD Radeon Cloud 的 **Profile** 里兑换这个优惠码，额度就加到余额上了。

黑客松和工作坊发的优惠码在第 2 步用法一样，只是不用做第 1 步 —— 码是直接发给你的。

## 怎么消耗

实例运行期间持续消耗额度，消耗速度随挂载的 GPU 数量增加。余额低于申请的 GPU 数量时无法启动 —— 一个 4 卡实例至少要有 4 个额度才能起来。

实例停止或销毁后不再消耗。这也是[用完就销毁实例](/radeon-cloud-docs/zh-cn/guides/destroy/)之所以重要的原因：一个你忘了关的闲置 notebook 照样在扣钱。

## 查看余额

余额显示在 **Profile** 里。如果你在写脚本调平台接口，`GET /api/me` 也会返回它 —— 见[账号](/radeon-cloud-docs/zh-cn/api/account/)。

## 兑换优惠码

不管码是来自开发者计划还是活动，兑换方式都一样：打开 **Profile** 输入即可。额度立即加到余额上。

每个码只能用一次，有些还绑定了特定账号。兑换失败时，检查一下你登录的是不是发码时指定的那个账号 —— 如果你在中国站和全球站都有账号，还要确认用的是对的那个。额度归属于单个站点，不能跨站转移。

## 模型 API 的消耗

共享模型端点有自己的每日消耗上限，与额度分开统计，按亚洲/上海时间每天重置。当前用量和剩余额度可以通过 [`GET /api/profile/model-usage`](/radeon-cloud-docs/zh-cn/api/usage/) 查看。
