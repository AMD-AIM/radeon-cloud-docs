---
title: AMD AI Developer Program
description: Get a China site account, earn developer points, and turn them into Radeon Cloud credits.
sidebar:
  label: AMD AI Developer Program
  order: 2
---

The China site runs on [AMD AI Developer Program](https://developer.amd.com.cn/) accounts. You need one to sign in there, and its developer points are how you get GPU credits. The Global site has its own accounts and doesn't use this program. See [Sign in](/radeon-cloud-docs/guides/login/#global-site).

The program is free, and you don't need any AMD hardware to join. Once you're signed in, the program home page shows your level and your points balance (开发者积分).

## How points become credits

| You have | Go to | You get |
|---|---|---|
| An event point code, like `DP-XXXX-XXXX-XXXX` | [开发者积分补给站](https://developer.amd.com.cn/points/devpoints) | Developer points |
| Developer points | [兑取算力](https://developer.amd.com.cn/points/redeem) | A long coupon string |
| The coupon string | China site **Credits & Usage** → **Redeem credits** | Radeon Cloud credits |

## Create an account and sign in

1. Open [developer.amd.com.cn](https://developer.amd.com.cn/) and click **免费注册** to register, or **登录** if you already have an account.
2. On the login page, pick a tab:
   - **验证码登录 / Verification Code Login**: enter your mobile number or email, click **发送验证码 / Send Code**, and type in the code. You may have to pass a slider captcha first. After a code is sent, the button counts down before you can request another.
   - **密码登录 / Password Login**: for accounts that already have a password.

   You can also sign in with a ModelScope (魔搭), CSDN, or GitHub account from below the form. To create a new account from the login page, click **注册账号 / Create Account**.
3. Open [developer.amd.com.cn/radeon](https://developer.amd.com.cn/radeon/). You're signed in to the China site already, and your name shows in the top-right corner.

The program says new members start with 100 points. Its [introduction page](https://developer.amd.com.cn/developer-program-intro) has the full rules. If anything here disagrees with that page, follow the page.

## Earn more points

The program awards points for courses and activities on the site. To see how many points each activity is worth, open **升级规则** on the home page.

Events have two more ways to award points. Both are explained under **开发者积分补给站** on the home page:

- File your participation record. Once it's approved, the points are added automatically.
- Redeem a point code the event hands out.

To redeem a point code:

1. Open [points/devpoints](https://developer.amd.com.cn/points/devpoints) (**开发者积分券码兑换专区**).
2. If the page lists events, choose your event and session.
3. Enter the code in the `DP-XXXX-XXXX-XXXX` field.
4. Check **我同意遵守《开发者积分兑换条款细则》** and click **兑换**.

Each code works once and can't be undone. Codes expire, and an expired code isn't replaced. Codes are for your own account and can't be transferred or sold.

## Exchange points for a coupon

Open [points/redeem](https://developer.amd.com.cn/points/redeem). These rules are posted on the page:

- 1 point buys 1 hour of compute on the China site.
- Each account can exchange up to 20 points a day, so a single exchange is for 1 to 20 hours.
- Spent points are gone. Points you haven't spent don't expire.
- You get back one long coupon string. It isn't a `DP-` code.
- The coupon expires 30 days after you get it.
- The coupon isn't tied to your name. Anyone who has the string can redeem it, and a lost or leaked coupon won't be replaced.
- The page says the credits reach your Radeon Cloud account within 5 minutes and last 90 days from then.

Steps:

1. Click **立即兑换**.
2. Enter the number of hours and click **去兑换**.
3. Copy the whole coupon string.

## Redeem the coupon on the China site

1. Open [developer.amd.com.cn/radeon](https://developer.amd.com.cn/radeon/), click your account in the top-right corner, and choose **Credits & Usage**.
2. Click **Redeem credits**.
3. Paste the whole string into **Redeem a code** and click **Redeem**. The field's example reads `RDN-XXXX-XXXX-XXXX`, but the coupon from the program is the long string you copied; paste all of it.

The balance updates right away. See [Credits](/radeon-cloud-docs/guides/credits/).

In the classic interface the same redemption is under **Profile → Credits Available → Redeem Credits**.

To check that your Radeon Cloud account is linked to the program, open **Settings**: **AMDAI account** should read **Linked**.

Credits stay on the site where you redeem them. Credits redeemed on the China site don't show up on the Global site.

## If redemption fails

Most failures come down to one of these:

- You copied only part of the coupon string.
- The coupon is more than 30 days old.
- The coupon has already been redeemed.
- You're signed in to the Global site rather than `developer.amd.com.cn`.

If none of these is the problem, email [member-service@mail.developer.amd.com.cn](mailto:member-service@mail.developer.amd.com.cn). Include which site you used, when it happened, and the exact message you saw. The coupon string is like cash: send it only in that email, and never post it in a chat or public issue. You can also use **去提问** at the bottom of the program home page or the China console, which opens the [feedback form](https://developer.amd.com.cn/feedbackform).
