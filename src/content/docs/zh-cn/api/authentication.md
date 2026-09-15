---
title: 认证
description: API 密钥、会话，以及每个端点各自接受哪一种。
sidebar:
  order: 2
---

AMD Radeon Cloud 接受两种凭据。端点要哪一种，取决于它做什么事。

**API 密钥**是给机器访问用的 Bearer 令牌。它认证 Model API，也能用在大多数 Platform API 端点上。

**会话 cookie** 来自浏览器登录。控制台用的是它，少数端点——尤其是 JupyterLab 的实例代理——只认它。

## API 密钥

密钥长这样：

```text
rc-4f8a19c7e02b6d3a5c81f70e9b2d4a6c38e5b1907f2c4d8a
```

`rc-` 前缀后面跟 48 个十六进制字符，一共 51 个字符。

作为 Bearer 令牌发送：

```bash
curl https://developer.amd.com.cn/radeon/api/v1/models \
  -H "Authorization: Bearer $RADEON_API_KEY"
```

**Public Free Model APIs** 也接受把同一把密钥放在 `x-api-key` 头里——Anthropic SDK 就是这么认证的。调 [`/v1/messages`](/radeon-cloud-docs/zh-cn/api/messages/) 时和 `anthropic-version` 一起用：

```bash
curl https://developer.amd.com.cn/radeon/api/v1/messages \
  -H "x-api-key: $RADEON_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "Content-Type: application/json" \
  -d '{"model":"DeepSeek-V4-Flash","max_tokens":256,"messages":[{"role":"user","content":"Hello"}]}'
```

两个头都在时以 `Authorization` 为准。`x-api-key` 只在免费共享端点上被读取——Platform API 端点和独占端点都不认它。

### 拿到密钥

你第一次打开 [Token Factory](https://developer.amd.com.cn/radeon/modelapis) 或启动实例时，密钥会自动签发。它显示在模型详情对话框和你的 Profile 页面上。

待审核的账户不会签发密钥。如果你找不到自己的密钥，先看看账户是否已经过审。

### 轮换密钥

<div class="rc-endpoint">
  <span class="rc-method" data-m="POST">POST</span>
  <span class="rc-path">/api/profile/api-token</span>
  <span class="rc-auth">会话或 API 密钥</span>
</div>

签发一个新密钥，同时立刻作废旧的。无请求体。

```json
{ "api_token": "rc-4f8a19c7e02b6d3a5c81f70e9b2d4a6c38e5b1907f2c4d8a" }
```

这个请求一返回，任何还在用旧密钥的客户端立刻开始收到 `401`。密钥可能泄露时就轮换，并在同一次变更里推到你的所有服务上。

:::danger[把密钥当成密码]
它能访问你的模型配额和你的账户。放在环境变量或密钥管理服务里，绝不要提交到源码库，也绝不要放进浏览器能读到的客户端代码。
:::

## 会话 cookie

通过控制台登录会种下一个签名的会话 cookie。你没法用程序创建它——没有用户名密码端点可调——所以脚本应该用 API 密钥。

登出、上游身份提供方的令牌过期、或者会话被管理员吊销，都会让会话失效。

## 每个端点接受什么

| 端点分组 | API 密钥 | 会话 |
|---|---|---|
| Public Free Model APIs | 是 | 是 |
| Dedicated Model APIs | 是 | 是 |
| 实例、模板、账户 | 是 | 是 |
| 实例代理（`/instances/...`） | 否 | **仅会话** |

实例代理是唯一的例外。JupyterLab 和其他交互式应用只能用浏览器会话访问，因为它们是交互界面，不是 API。

对于 `/spaces/...` 下的独占模型端点，Bearer 密钥可以用，但只能用你自己的密钥访问你自己的实例，而且端口必须是那个实例实际服务的端口。

## 失败

`401` 表示凭据缺失、格式不对，或者不认识。

`403` 带 `"code": "account_not_verified"` 表示你通过了认证，但账户还在审核中。响应里带一个指向审核页面的 `redirect`。

实例路径上的 `403` 表示这个实例不是你的。

完整列表见[错误](/radeon-cloud-docs/zh-cn/api/errors/)。
