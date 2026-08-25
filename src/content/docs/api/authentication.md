---
title: Authentication
description: API keys, sessions, and which one each endpoint expects.
sidebar:
  order: 2
---

AMD Radeon Cloud accepts two kinds of credential. Which one an endpoint wants depends on what it does.

**API keys** are bearer tokens for machine access. They authenticate the Model API and can also be used against most Platform API endpoints.

**Session cookies** come from signing in through the browser. The console uses them, and a few endpoints — notably the instance proxy for JupyterLab — accept nothing else.

## API keys

A key looks like this:

```text
rc-4f8a19c7e02b6d3a5c81f70e9b2d4a6c38e5b1907f2c4d8a
```

The `rc-` prefix is followed by 48 hexadecimal characters, 51 characters in total.

Send it as a bearer token:

```bash
curl https://developer.amd.com.cn/radeon/api/v1/models \
  -H "Authorization: Bearer $RADEON_API_KEY"
```

### Getting a key

Your key is issued automatically the first time you open the [Token Factory](https://developer.amd.com.cn/radeon/modelapis) or launch an instance. It's shown in the model detail dialog and on your Profile page.

Accounts pending verification aren't issued a key. If yours is missing, check whether your account has completed review.

### Rotating a key

<div class="rc-endpoint">
  <span class="rc-method" data-m="POST">POST</span>
  <span class="rc-path">/api/profile/api-token</span>
  <span class="rc-auth">Session or API key</span>
</div>

Issues a new key and invalidates the old one immediately. No request body.

```json
{ "api_token": "rc-4f8a19c7e02b6d3a5c81f70e9b2d4a6c38e5b1907f2c4d8a" }
```

Any client still using the previous key starts getting `401` as soon as this returns. Rotate when a key may have leaked, and roll it out to your services in the same change.

:::danger[Treat the key like a password]
It grants access to your model quota and your account. Keep it in an environment variable or a secrets manager, never in source control, and never in client-side code where a browser can read it.
:::

## Session cookies

Signing in through the console sets a signed session cookie. You can't create one programmatically — there's no username-and-password endpoint to call — so scripts should use an API key.

Sessions are invalidated when you sign out, when the upstream identity provider's token expires, or when sessions are revoked administratively.

## What each endpoint accepts

| Endpoint group | API key | Session |
|---|---|---|
| Model API — shared | Yes | Yes |
| Model API — dedicated | Yes | Yes |
| Instances, templates, account | Yes | Yes |
| Instance proxy (`/instances/...`) | No | **Session only** |

The instance proxy is the one exception worth remembering. JupyterLab and other interactive apps are reached only with a browser session, because they're interactive surfaces rather than APIs.

For a dedicated model endpoint under `/spaces/...`, a bearer key works, but only your own key against your own instance, and only on the port that instance actually serves.

## Failures

`401` means the credential is missing, malformed, or unrecognised.

`403` with `"code": "account_not_verified"` means you're authenticated but your account is still under review. The response includes a `redirect` to the review page.

`403` on an instance path means the instance isn't yours.

See [Errors](/radeon-cloud-docs/api/errors/) for the full list.
