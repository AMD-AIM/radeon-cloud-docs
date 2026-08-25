---
title: Errors
description: Status codes returned by the Radeon Cloud API and what to do about each.
sidebar:
  order: 11
---

## Status codes

| Code | Meaning | What to do |
|---|---|---|
| `400` | The request was rejected. Invalid parameter, an instance already running, or too few credits. | Read `detail` and fix the request. Retrying won't help. |
| `401` | Missing, malformed, or unrecognised credential. | Check the `Authorization` header. Rotate the key if it may have been revoked. |
| `403` | Authenticated, but not permitted. | See below — the cause varies. |
| `404` | No such template, instance, or model. | Confirm the identifier. |
| `409` | A conflicting state, such as email verification being required first. | Follow the `code` in the body. |
| `429` | Rate limited. | Wait for `Retry-After`, then back off. See [Rate limits](/radeon-cloud-docs/api/rate-limits/). |
| `502` | The upstream model gateway or serving backend is unreachable. | Transient. Retry with backoff. |
| `503` | Capacity temporarily exhausted, or a feature is disabled. | Retry after the interval in `Retry-After`. |

## Error bodies

Platform API errors use FastAPI's shape:

```json
{ "detail": "Each user can only have one active instance" }
```

Model API errors use OpenAI's shape, so existing OpenAI error handling works unchanged:

```json
{
  "error": {
    "message": "Model API rate limit exceeded; please retry later",
    "type": "rate_limit_error",
    "code": "token_rate_limit_exceeded"
  }
}
```

Errors raised by the model itself — an unknown model name, a prompt over the context limit — are passed through from the serving backend with its own status and message.

## Common cases

**`400 Each user can only have one active instance`** — destroy the current instance first. [`DELETE /api/notebook/current`](/radeon-cloud-docs/api/instances/#destroy-the-instance).

**`400 Insufficient credits`** — your balance is below the requested GPU count. Redeem a coupon or request fewer GPUs.

**`400 GPU count must be 1, 2, or 4`** — no other values are allocatable.

**`400 Invalid image selected`** — the image isn't in the catalog or has been disabled. List available images with [`GET /api/profile/templates`](/radeon-cloud-docs/api/templates/#list-templates).

**`403 {"code": "account_not_verified"}`** — the account is still under review. The body carries a `redirect` to the review page. Free model APIs stay available in the meantime.

**`403 You do not have access to this instance`** — the instance belongs to someone else, or you're using a bearer key against the instance proxy, which requires a browser session. See [Authentication](/radeon-cloud-docs/api/authentication/#what-each-endpoint-accepts).

**`502 Model gateway is unavailable`** — the gateway is down or unreachable. Retry with backoff; if it persists across several minutes, it's an outage rather than something on your side.

**`503 Model gateway connection pool exhausted`** — too many requests in flight platform-wide. `Retry-After` is short, usually 5 seconds.

## Debugging checklist

Confirm you're calling the right base URL — the shared and dedicated endpoints are different hosts and paths, and a dedicated URL changes every time you relaunch.

Confirm the key is being sent, and sent as `Authorization: Bearer rc-...`. A missing header and an invalid key both produce `401`.

For a dedicated endpoint, confirm the instance is `ready` and the model has finished loading. vLLM answers the port before weights are loaded, so early requests can fail with backend errors that look like platform problems.

If a call worked yesterday and fails today with `404` on the model, the shared catalog has probably changed. Re-resolve with [`GET /v1/models`](/radeon-cloud-docs/api/models/).
