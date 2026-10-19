---
title: Authentication
description: Which credential each part of the API accepts, and how to get, send and rotate an API key.
sidebar:
  order: 2
---

AMD Radeon Cloud uses three kinds of credential. Which one you need depends on what you call.

| Credential | Looks like | Use it for |
|---|---|---|
| **API key** | `rc-` + 48 hex characters | Token Factory |
| **CLI token** | `rcc_...` | [Radeon Cloud CLI](/radeon-cloud-docs/cli/overview/): instances, credits, resources |
| **Session cookie** | Set when you sign in to the console | The console and the [Platform API](/radeon-cloud-docs/api/instances/) |

To automate instances from a script, use the CLI. The Platform API endpoints serve the console and accept only a browser session.

## API keys

A key looks like this:

```text
rc-4f8a19c7e02b6d3a5c81f70e9b2d4a6c38e5b1907f2c4d8a
```

Send it as a bearer token:

```bash
curl https://developer.amd.com.cn/radeon/api/v1/models \
  -H "Authorization: Bearer $RADEON_API_KEY"
```

Token Factory also accepts the key in the `x-api-key` header, which is how Anthropic SDKs authenticate. Send `anthropic-version` with it when calling [`/v1/messages`](/radeon-cloud-docs/api/messages/):

```bash
curl https://developer.amd.com.cn/radeon/api/v1/messages \
  -H "x-api-key: $RADEON_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "Content-Type: application/json" \
  -d '{"model":"DeepSeek-V4-Flash","max_tokens":256,"messages":[{"role":"user","content":"Hello"}]}'
```

If both headers are present, `Authorization` is used. Only Token Factory reads `x-api-key`.

### Get a key

Open [Token Factory](https://developer.amd.com.cn/radeon/tokenfactory). Your key is on the **Your API key** card at the top; click **Copy**. The key is created the first time you open Token Factory.

Accounts that are still under review don't get a key. If yours is missing, check whether your account has been approved.

A model service on your instance has its own key, starting with `sk-`, shown on its instance card. See [Model service endpoints](/radeon-cloud-docs/api/model-services/).

### Rotate a key

The new console has no button for this yet. Switch to the classic interface (**Settings** → **Interface** → **Use classic**), open **Profile** and click **Regenerate Key**. See [Classic interface](/radeon-cloud-docs/resources/classic-ui/).

The old key stops working immediately, so update every client that uses it at the same time.

Rotate when a key may have leaked.

:::danger[Treat the key like a password]
It grants access to your model quota. Keep it in an environment variable or a secrets manager. Never commit it to source control or put it in client-side code that a browser can read.
:::

## CLI tokens

`rcc auth login` signs the CLI in through your browser and stores a token that starts with `rcc_`. It manages your account and instances, and doesn't work with Token Factory. See [Sign-in and accounts](/radeon-cloud-docs/cli/authentication/).

## Session cookies

Signing in to the console sets a session cookie. There's no endpoint that creates a session from a password, so a script can't get one.

The session ends when you sign out, when the identity provider's sign-in expires, or when it's revoked by an administrator.

## Credentials by endpoint

| Endpoint | API key | CLI token | Session |
|---|---|---|---|
| Token Factory (`/api/v1/...`) | Yes | No | Only to list models |
| Model services on instances (`/inference/...`) | The `sk-` key on its card | No | No |
| CLI endpoints (`/api/cli/...`) | No | Yes | No |
| Platform API: instances, templates, account | No | No | Yes |
| Browse public templates (`GET /api/templates`) | Optional | No | Optional |
| JupyterLab and other apps (`/instances/...`) | No | No | Yes |

A model service accepts only the key shown on its own card.

## Authentication errors

`401` means the credential is missing, malformed or not recognised. Sending an API key to a Platform API endpoint also returns `401`, with `Login required`.

`403` with `"code": "account_not_verified"` means you're signed in but your account is still under review. The response includes a `redirect` to the review page.

`403` on an instance path means the instance isn't yours.

See [Errors](/radeon-cloud-docs/api/errors/) for the full list.
