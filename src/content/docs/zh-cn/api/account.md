---
title: 账户
description: 个人资料、额度、API 密钥和 SSH 密钥。
sidebar:
  order: 9
---

## 获取个人资料

<div class="rc-endpoint">
  <span class="rc-method" data-m="GET">GET</span>
  <span class="rc-path">/api/me</span>
  <span class="rc-auth">会话或 API 密钥</span>
</div>

```json
{
  "id": 1042,
  "email": "you@example.com",
  "credits": 24,
  "verified": true,
  "is_editor": false,
  "provider": "email",
  "api_token": "rc-4f8a19c7e02b6d3a5c81f70e9b2d4a6c38e5b1907f2c4d8a",
  "ssh_public_key": "ssh-ed25519 AAAAC3Nz... you@example.com"
}
```

| 字段 | 说明 |
|---|---|
| `credits` | 可用于启动实例的余额。 |
| `verified` | 账户是否已过审。未通过验证的账户不能启动实例，也拿不到 API 密钥。 |
| `is_editor` | 你是否可以公开发布模板。 |
| `provider` | 账户的登录方式。 |
| `api_token` | 你当前的 API 密钥。 |
| `ssh_public_key` | 安装进实例的公钥，或者 `null`。 |

:::caution[这个响应里带着你的 API 密钥]
别把它写进日志，也别让一个外人能访问的服务把它返回出去。
:::

## 设置 SSH 公钥

<div class="rc-endpoint">
  <span class="rc-method" data-m="POST">POST</span>
  <span class="rc-path">/api/profile/ssh-key</span>
  <span class="rc-auth">会话或 API 密钥</span>
</div>

| 参数 | 类型 | | 说明 |
|---|---|---|---|
| `ssh_public_key` | string | <span class="rc-req">必填</span> | 一行的 OpenSSH 公钥。传空字符串表示删除。 |

```bash
curl -X POST https://radeon-global.anruicloud.com/api/profile/ssh-key \
  -H "Authorization: Bearer $RADEON_API_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"ssh_public_key\": \"$(cat ~/.ssh/id_ed25519.pub)\"}"
```

公钥必须以认得的类型开头——`ssh-ed25519`、`ssh-rsa`、`ecdsa-sha2-`、`ssh-dss`，或者 `sk-` 开头的硬件变体——写在一行里，且不超过 8192 个字符。其他都会被 `400` 拒绝。

新公钥对之后启动的实例生效，对已经在跑的实例无效。

## 轮换 API 密钥

<div class="rc-endpoint">
  <span class="rc-method" data-m="POST">POST</span>
  <span class="rc-path">/api/profile/api-token</span>
  <span class="rc-auth">会话或 API 密钥</span>
</div>

签发新密钥并立刻吊销旧的。见[认证](/radeon-cloud-docs/zh-cn/api/authentication/#轮换密钥)。

## 兑换优惠码

<div class="rc-endpoint">
  <span class="rc-method" data-m="POST">POST</span>
  <span class="rc-path">/api/credits/redeem</span>
  <span class="rc-auth">会话或 API 密钥</span>
</div>

| 参数 | 类型 | | 说明 |
|---|---|---|---|
| `coupon` | string | <span class="rc-req">必填</span> | 发给你的优惠码。 |

```json
{ "credits_added": 50, "credits": 74 }
```

码无效、已兑换过，或者是发给别的账户的，返回 `400`。兑换通道当前关闭时返回 `503`。

## Model API 用量

共享 Model API 的消耗和配额是单独统计的——见[用量和配额](/radeon-cloud-docs/zh-cn/api/usage/)。额度和 Model API 花费是两笔独立的预算。
