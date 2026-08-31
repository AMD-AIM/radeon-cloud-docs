---
title: Account
description: Profile, credits, API key, and SSH key.
sidebar:
  order: 10
---

## Get your profile

<div class="rc-endpoint">
  <span class="rc-method" data-m="GET">GET</span>
  <span class="rc-path">/api/me</span>
  <span class="rc-auth">Session or API key</span>
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

| Field | Description |
|---|---|
| `credits` | Balance available for launching instances. |
| `verified` | Whether the account has cleared review. Unverified accounts can't launch instances or hold an API key. |
| `is_editor` | Whether you can publish templates publicly. |
| `provider` | How the account signs in. |
| `api_token` | Your current API key. |
| `ssh_public_key` | The key installed into instances, or `null`. |

:::caution[This response contains your API key]
Don't log it, and don't return it from a service that others can reach.
:::

## Set your SSH public key

<div class="rc-endpoint">
  <span class="rc-method" data-m="POST">POST</span>
  <span class="rc-path">/api/profile/ssh-key</span>
  <span class="rc-auth">Session or API key</span>
</div>

| Parameter | Type | | Description |
|---|---|---|---|
| `ssh_public_key` | string | <span class="rc-req">Required</span> | An OpenSSH public key on a single line. Pass an empty string to remove it. |

```bash
curl -X POST https://radeon-global.anruicloud.com/api/profile/ssh-key \
  -H "Authorization: Bearer $RADEON_API_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"ssh_public_key\": \"$(cat ~/.ssh/id_ed25519.pub)\"}"
```

The key must start with a recognised type — `ssh-ed25519`, `ssh-rsa`, `ecdsa-sha2-`, `ssh-dss`, or an `sk-` hardware variant — fit on one line, and stay under 8192 characters. Anything else is rejected with `400`.

The new key applies to instances launched afterwards, not to one already running.

## Rotate your API key

<div class="rc-endpoint">
  <span class="rc-method" data-m="POST">POST</span>
  <span class="rc-path">/api/profile/api-token</span>
  <span class="rc-auth">Session or API key</span>
</div>

Issues a new key and revokes the old one immediately. See [Authentication](/radeon-cloud-docs/api/authentication/#rotating-a-key).

## Redeem a coupon

<div class="rc-endpoint">
  <span class="rc-method" data-m="POST">POST</span>
  <span class="rc-path">/api/credits/redeem</span>
  <span class="rc-auth">Session or API key</span>
</div>

| Parameter | Type | | Description |
|---|---|---|---|
| `coupon` | string | <span class="rc-req">Required</span> | The coupon code you were issued. |

```json
{ "credits_added": 50, "credits": 74 }
```

`400` if the code is invalid, already redeemed, or issued to a different account. `503` if redemption is currently closed.

## Model API usage

Consumption and quota for the shared model APIs are reported separately — see [Usage and quota](/radeon-cloud-docs/api/usage/). Credits and model API spend are distinct budgets.
