---
title: 账号
description: 个人资料、SSH 密钥、优惠码，以及账号可以使用的资源。
sidebar:
  order: 10
---

这些接口服务于控制台的账号菜单、**设置** 和 **积分与用量**，只接受浏览器会话。路径相对于你所在站点的控制台地址。

要在脚本里查看余额，请用 `rcc credits status`，见 [Radeon Cloud CLI](/radeon-cloud-docs/zh-cn/cli/instances/)。

## 获取个人资料

<div class="rc-endpoint">
  <span class="rc-method" data-m="GET">GET</span>
  <span class="rc-path">/api/me</span>
  <span class="rc-auth">会话</span>
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

| 字段 | 说明 |
|---|---|
| `credits` | 积分余额。 |
| `verified` | 账号是否已通过审核。审核中的账号不能启动实例，也拿不到 API Key。 |
| `is_editor` | 是否可以公开发布模板。 |
| `provider` | 账号的登录方式。 |
| `api_token` | 你的 API Key。 |
| `ssh_public_key` | 你的 SSH 公钥，每行一个；没有时为空。 |

:::caution[这个响应包含你的 API Key]
不要写进日志，也不要转给别人能读到的地方。
:::

## 列出可用资源

<div class="rc-endpoint">
  <span class="rc-method" data-m="GET">GET</span>
  <span class="rc-path">/api/me/resource-labels</span>
  <span class="rc-auth">会话</span>
</div>

返回分配给你账号的资源池（`"category": "resource-pool"`）和规格（`"category": "resource-template"`），也就是 **首页** 上 **规格** 和 **资源池** 的选项，见[选择资源](/radeon-cloud-docs/zh-cn/api/instances/#选择资源)。

出现在列表里表示你可以在上面启动，不代表此刻有空闲的 GPU。

## SSH 密钥

每个账号最多保存 10 个 SSH 公钥。每个公钥都可以连接添加之后启动的实例。

| 方法 | 路径 | 作用 |
|---|---|---|
| `GET` | `/api/profile/ssh-keys` | 列出你的公钥。 |
| `POST` | `/api/profile/ssh-keys` | 添加一个公钥。 |
| `DELETE` | `/api/profile/ssh-keys/{id}` | 删除一个公钥，`id` 来自列表。 |

添加时发送标题和公钥：

```json
{ "title": "Laptop", "key": "ssh-ed25519 AAAAC3Nz..." }
```

列表返回每个公钥的 `id`、`title`、`type` 和 `fingerprint`，不返回公钥本身。指纹格式是 `SHA256:...`，和 `ssh-keygen -lf ~/.ssh/id_ed25519.pub` 的输出一致。

添加账号里已有的公钥返回 `409`，不是 OpenSSH 公钥的内容返回 `400`。

经典版界面使用的 `POST /api/profile/ssh-key`（单数）会用你发送的内容替换全部公钥，每行一个。

## 兑换优惠码

<div class="rc-endpoint">
  <span class="rc-method" data-m="POST">POST</span>
  <span class="rc-path">/api/profile/redeem</span>
  <span class="rc-auth">会话</span>
</div>

| 字段 | 类型 | | 说明 |
|---|---|---|---|
| `code` | string | <span class="rc-req">必填</span> | 完整的优惠码。 |

```json
{ "credits_added": 50, "credits": 74 }
```

`400` 表示优惠码无效、已经用过，或者是发给其他账号的。`503` 表示兑换功能暂时关闭。

经典版界面调用的是 `POST /api/credits/redeem`，优惠码放在 `coupon` 字段里，效果相同。

## API Key

API Key 在 [Token Factory](https://developer.amd.com.cn/radeon/tokenfactory) 查看和重新生成，见[认证](/radeon-cloud-docs/zh-cn/api/authentication/#api-key)。

## 模型 API 用量

共享模型 API 的用量和积分分开统计，见[用量和配额](/radeon-cloud-docs/zh-cn/api/usage/)。
