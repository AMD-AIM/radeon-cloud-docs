---
title: 额度
description: 额度怎么消耗，以及怎么充值。
sidebar:
  order: 8
---

额度用来付 GPU 实例的钱。免费的共享[模型 API](/radeon-cloud-docs/zh-cn/guides/model-apis/) 不占额度。

## 怎么消耗

实例运行期间持续消耗额度，消耗速度随挂载的 GPU 数量增加。余额低于申请的 GPU 数量时无法启动 —— 一个 4 卡实例至少要有 4 个额度才能起来。

实例停止或销毁后不再消耗。这也是[用完就销毁实例](/radeon-cloud-docs/zh-cn/guides/destroy/)之所以重要的原因：一个你忘了关的闲置 notebook 照样在扣钱。

## 查看余额

余额显示在 **Profile** 里。如果你在写脚本调平台接口，`GET /api/me` 也会返回它 —— 见[账号](/radeon-cloud-docs/zh-cn/api/account/)。

## 兑换优惠码

如果你拿到了优惠码 —— 比如在黑客松或工作坊上 —— 在 **Profile** 里兑换。额度会立即加到余额上。

每个码只能用一次，有些还绑定了特定账号。兑换失败时，检查一下你登录的是不是发码时指定的那个账号。

## 模型 API 的消耗

共享模型端点有自己的每日消耗上限，与额度分开统计，按亚洲/上海时间每天重置。当前用量和剩余额度可以通过 [`GET /api/profile/model-usage`](/radeon-cloud-docs/zh-cn/api/usage/) 查看。
