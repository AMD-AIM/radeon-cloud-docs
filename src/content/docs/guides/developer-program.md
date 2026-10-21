---
title: AMD AI Developer Program
description: Get an AMD AI Developer Program account, earn developer points, and turn them into Radeon Cloud credits.
sidebar:
  label: AMD AI Developer Program
  order: 2
---

[AMD AI Developer Program](https://developer.amd.com.cn/) holds the developer points (开发者积分) that become GPU credits. The China site signs you in with that account. The Global site can sign in with it too (**Login with AMD Developer Program**), or you can connect it later in **Settings**. Either way, you exchange points for a coupon on the program site, then paste that coupon under **Redeem credits** on the Radeon Cloud site where you want the credits. See [Sign in](/radeon-cloud-docs/guides/login/).

The program is free, and you don't need any AMD hardware to join. Once you're signed in, the program home page shows your level and your points balance.

## How points become credits

| You have | Go to | You get |
|---|---|---|
| An event point code, like `DP-XXXX-XXXX-XXXX` | [开发者积分补给站](https://developer.amd.com.cn/points/devpoints) | Developer points |
| Developer points | [兑取算力](https://developer.amd.com.cn/points/redeem) | A long coupon string |
| The coupon string | China or Global **Credits & Usage** → **Redeem credits** | Radeon Cloud credits |

## Create an account and sign in

1. Open [developer.amd.com.cn](https://developer.amd.com.cn/) and click **免费注册** to register, or **登录** if you already have an account.
2. On the login page, pick a tab:
   - **验证码登录 / Verification Code Login**: enter your mobile number or email, click **发送验证码 / Send Code**, and type in the code. You may have to pass a slider captcha first. After a code is sent, the button counts down before you can request another.
   - **密码登录 / Password Login**: for accounts that already have a password.

   You can also sign in with a ModelScope (魔搭), CSDN, or GitHub account from below the form. To create a new account from the login page, click **注册账号 / Create Account**.
3. Open [developer.amd.com.cn/radeon](https://developer.amd.com.cn/radeon/). You're signed in to the China site already, and your name shows in the top-right corner.

On the [Global site](https://radeon-global.anruicloud.com/), choose **Login with AMD Developer Program**, or after an email login open **Settings** and **Connect AMD Developer Program**. That connection uses the same program and asks you to verify a recovery email.

The program says new members start with 100 points. Its [introduction page](https://developer.amd.com.cn/developer-program-intro) has the full rules. If anything here disagrees with that page, follow the page.

## Earn more points

The program awards points for courses and activities on the site. To see how many points each activity is worth, open **升级规则** on the home page.

Events have two more ways to award points. Both are explained under **开发者积分补给站** on the home page:

- File your participation record. Once it's approved, the points are added automatically.
- Redeem a point code the event hands out.

To redeem a point code:

1. Open [points/devpoints](https://developer.amd.com.cn/points/devpoints) (**开发者积分补给站**).
2. Under **您参与的活动是** and **您参与的环节是**, choose your event and session.
3. Enter the code in the `DP-XXXX-XXXX-XXXX` field.
4. Check **我同意遵守《开发者积分兑换条款细则》** and click **兑换**.

![The developer-points supply page, with 您参与的活动是 and 您参与的环节是](../../../assets/guide/adp-devpoints.png)

Each code works once and can't be undone. Codes expire, and an expired code isn't replaced. Codes are for your own account and can't be transferred or sold.

## Exchange points for a coupon

Open [points/redeem](https://developer.amd.com.cn/points/redeem) (**开发者积分免费兑换**). These rules are posted on the page:

![The 兑取算力 page: 活动细则说明, the six-step 兑换流程, and 立即兑换](../../../assets/guide/adp-redeem.png)

- 1 point buys 1 hour of compute (1 credit). The page says this is for AMD 开发者云中国区. After you have the coupon, redeem it on the China or Global console where you want the credits.
- Each account can exchange up to 20 points a day, so a single exchange is for 1 to 20 hours.
- Spent points are gone. Points you haven't spent don't expire.
- You get back one long coupon string. It isn't a `DP-` code.
- The coupon expires 30 days after you get it.
- A lost or leaked coupon won't be replaced. The console only accepts a coupon that belongs to the signed-in account.
- The page says the credits reach your Radeon Cloud account within 5 minutes and last 90 days from then.

The six pictures under **兑换流程** show the China site classic **Profile**. The steps below cover both sites and the new console.

Steps:

1. Click **立即兑换**.
2. Enter the number of hours and click **去兑换**.
3. Copy the whole coupon string.

If a dialog says **请您先完善个人信息才能领取**, finish the program profile first, then come back. Do not skip that and paste an empty coupon.

## Redeem the coupon on Radeon Cloud

兑取算力 is on the program site. It is not a button in the China or Global console. Both consoles only have **Redeem credits**, which pastes the coupon you already have.

### China site

1. Open [developer.amd.com.cn/radeon](https://developer.amd.com.cn/radeon/), click your account in the top-right corner, and choose **Credits & Usage**.
2. Click **Redeem credits**.
3. Paste the whole string into **Redeem a code** and click **Redeem**. The field's example reads `RDN-XXXX-XXXX-XXXX`, but the coupon from the program is the long string you copied; paste all of it.

To check that the China site account is linked to the program, open **Settings**: **AMDAI account** should read **Linked**.

### Global site

1. Open [radeon-global.anruicloud.com](https://radeon-global.anruicloud.com/). Sign in with **Login with AMD Developer Program**, or connect it in **Settings** if you signed in with email.
2. Click your account in the top-right corner and choose **Credits & Usage**.
3. Click **Redeem credits**, paste the whole string, and click **Redeem**.

**Settings** should show **AMD Developer Program** as **Connected** after you link it.

The balance updates right away. See [Credits](/radeon-cloud-docs/guides/credits/).

In the classic interface the same redemption is under **Profile → Credits Available → Redeem Credits**.

Credits stay on the site where you redeem them. Credits redeemed on the China site don't show up on the Global site, and the other way around.

## If redemption fails

Most failures come down to one of these:

- You copied only part of the coupon string.
- The coupon is more than 30 days old.
- The coupon has already been redeemed.
- You redeemed on the site you didn't mean to. Credits don't move afterwards.
- On the Global site, the account isn't connected to the program that issued the coupon, or the verified recovery email doesn't match.
- The program site asked you to complete your profile (**请您先完善个人信息才能领取**) and you don't have a coupon yet.

If none of these is the problem, email [member-service@mail.developer.amd.com.cn](mailto:member-service@mail.developer.amd.com.cn). Include which site you used, when it happened, and the exact message you saw. The coupon string is like cash: send it only in that email, and never post it in a chat or public issue. You can also use **去提问** at the bottom of the program home page or the China console, which opens the [feedback form](https://developer.amd.com.cn/feedbackform).
