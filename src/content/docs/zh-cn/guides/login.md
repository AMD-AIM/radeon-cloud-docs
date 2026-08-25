---
title: 登录
description: 在中国站或全球站登录 AMD Radeon Cloud。
sidebar:
  order: 1
---

两个[区域站点](/radeon-cloud-docs/zh-cn/introduction/#两个站点同一个平台)的登录方式不同。选你所在区域的那个 —— 账号不互通。

## 中国站

打开 [developer.amd.com.cn/radeon](https://developer.amd.com.cn/radeon/)，点右上角的 **Login**。

![中国站，右上角是 Login 按钮](../../../../assets/guide/cn-login.png)

这会跳转到 AMD AI 开发者计划的登录页，这套账号在 AMD 的中国开发者服务里通用 —— 给你[额度](/radeon-cloud-docs/zh-cn/guides/credits/)充值的[积分计划](https://developer.amd.com.cn/points/redeem)用的也是同一个账号。

![AMD AI 开发者计划登录表单](../../../../assets/guide/cn-login-form.png)

有几种登录方式：

- **验证码登录** —— 输入手机号或电子邮箱，点**发送验证码**，再填收到的验证码。
- **密码登录** —— 已经设过密码的话，切到**密码登录**页签。
- **ModelScope、CSDN 或 GitHub** —— 用这几个平台的现有账号登录。

还没有账号？点**注册账号**。

## 全球站

打开 [radeon-global.anruicloud.com](https://radeon-global.anruicloud.com/)，点右上角的 **Login**，选 **Login with Email**。

![全球站登录界面](../../../../assets/guide/login.png)

填邮箱地址和收到的 6 位验证码。验证码几分钟后失效；没收到就等冷却结束再重发一次。

## 登录之后

点右上角的头像，选 **Profile**。这个页面管所有东西：模板、正在运行的实例、SSH key、API key，还有额度余额。

![从头像菜单打开 Profile](../../../../assets/guide/click-profile.png)

## 如果账号需要审核

有些账号在能启动实例之前要先过审核。看到相关提示的话，你仍然可以浏览控制台、使用[免费的共享模型 API](/radeon-cloud-docs/zh-cn/guides/model-apis/) —— 审核通过后就能启动 GPU 实例了。
