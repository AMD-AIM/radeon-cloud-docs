---
title: Account
description: Profile, SSH keys, coupons and the resources your account can use.
sidebar:
  order: 10
---

These endpoints serve the console's account menu, **Settings** and **Credits & Usage**. They accept only a browser session. Paths are relative to your site's console address.

To read your balance from a script, use `rcc credits status`. See [Radeon Cloud CLI](/radeon-cloud-docs/cli/instances/).

## Get your profile

<div class="rc-endpoint">
  <span class="rc-method" data-m="GET">GET</span>
  <span class="rc-path">/api/me</span>
  <span class="rc-auth">Session</span>
</div>

```json
{
  "id": 1042,
  "email": "you@example.com",
  "credits": 24,
  "verified": true,
  "is_editor": false,
  "provider": "email",
  "api_token": "rc-...",
  "ssh_public_key": "ssh-ed25519 AAAAC3Nz... laptop"
}
```

| Field | Description |
|---|---|
| `credits` | Your credit balance. |
| `verified` | Whether the account has been approved. Accounts under review can't launch instances or get an API key. |
| `is_editor` | Whether you can publish templates to everyone. |
| `provider` | How the account signs in. |
| `api_token` | Your API key. |
| `ssh_public_key` | Your SSH public keys, one per line, or empty. |

:::caution[This response contains your API key]
Don't log it, and don't pass it on to anything others can read.
:::

## List the resources you can use

<div class="rc-endpoint">
  <span class="rc-method" data-m="GET">GET</span>
  <span class="rc-path">/api/me/resource-labels</span>
  <span class="rc-auth">Session</span>
</div>

Returns the resource pools (`"category": "resource-pool"`) and sizes (`"category": "resource-template"`) assigned to your account. These are the choices under **Size** and **Resource pool** on **Home**. See [Choose resources](/radeon-cloud-docs/api/instances/#choose-resources).

Being listed means you may launch on it. It doesn't mean a GPU is free right now.

## SSH keys

Each account can hold up to 10 SSH public keys. Every key can connect to instances launched after it was added.

| Method | Path | Does |
|---|---|---|
| `GET` | `/api/profile/ssh-keys` | Lists your keys. |
| `POST` | `/api/profile/ssh-keys` | Adds one key. |
| `DELETE` | `/api/profile/ssh-keys/{id}` | Deletes one key. `id` comes from the list. |

To add a key, send its title and the public key:

```json
{ "title": "Laptop", "key": "ssh-ed25519 AAAAC3Nz..." }
```

The list returns each key's `id`, `title`, `type` and `fingerprint`, not the key itself. The fingerprint is in the same `SHA256:...` form that `ssh-keygen -lf ~/.ssh/id_ed25519.pub` prints.

Adding a key that's already on the account returns `409`. Something that isn't an OpenSSH public key returns `400`.

`POST /api/profile/ssh-key` (singular), used by the classic interface, replaces all your keys with the ones you send, one per line.

## Redeem a coupon

<div class="rc-endpoint">
  <span class="rc-method" data-m="POST">POST</span>
  <span class="rc-path">/api/profile/redeem</span>
  <span class="rc-auth">Session</span>
</div>

| Field | Type | | Description |
|---|---|---|---|
| `code` | string | <span class="rc-req">Required</span> | The whole coupon string. |

```json
{ "credits_added": 50, "credits": 74 }
```

`400` means the code is invalid, already used or issued to another account. `503` means redemption is closed at the moment.

The classic interface calls `POST /api/credits/redeem` with the same coupon in a `coupon` field. Both do the same thing.

## API key

The API key is shown in [Token Factory](https://developer.amd.com.cn/radeon/tokenfactory). Regenerating it still takes the classic interface. See [Rotate a key](/radeon-cloud-docs/api/authentication/#rotate-a-key).

## Token Factory usage

Token Factory usage is counted separately from credits. See [Usage and quota](/radeon-cloud-docs/api/usage/).
