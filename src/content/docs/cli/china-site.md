---
title: China site
description: Sign in to the Radeon Cloud China site with the same rcc command.
sidebar:
  label: China site
---

The same `rcc` command, from the PyPI package `amd-oneclick-sdk`, reaches both Radeon Cloud sites. Global remains the default.

| Site | Service URL | Default API mode |
| --- | --- | --- |
| `global` (default) | `https://radeon-global.anruicloud.com`, or `RCC_DEFAULT_URL` | `v1` |
| `china` | `https://developer.amd.com.cn/radeon` | `auto` |

## Sign in

```bash
rcc auth login                 # Global site
rcc auth login --site china    # China site
rcc account register --site china
```

`--site` cannot be combined with `-u` / `--base-url`. Without `--site`, login stays on Global.

`rcc doctor` with no China profile shows `site: global`. That line is the site of the profile in use. It does not mean the China site is down.

The CLI opens a one-time authorization page. Sign in on the China developer portal, check the device name, and approve.

### No browser on this machine

```bash
rcc auth login --site china --no-browser
```

The CLI prints a one-time link. Open it in a browser that can sign in to the China developer portal, then approve. Do not paste the link into chat.

:::note
If the authorization page body is `{"detail":"Site sign-in is temporarily unavailable"}`, the China website login handoff is not available for that request. Sign in at https://developer.amd.com.cn/radeon in the same browser first, then open the link again.
:::

## Profiles

After you sign in, later commands use the saved profile. The same email on Global and China keeps two profiles. A derived China name gets a `-china` suffix, for example `alice@example.com` and `alice@example.com-china`. Switch with `rcc account use` or `-A`:

```bash
rcc account list
rcc account use alice@example.com-china
rcc -A alice@example.com-china status
```

## Where the site appears

`rcc auth status`, `rcc account list`, `rcc account current`, and `rcc doctor` show the site as `global`, `china`, or `custom`. In JSON, only `rcc account list` rows add `site`.

## API mode

China URLs default to API mode `auto`: the CLI probes v2 once, and HTTP 404 selects v1. Global stays on v1. Set `--api-mode` or `RCC_API_MODE` to `v1`, `v2`, or `auto` to override.

Workload commands (`serve`, `comfy`) need API v2. When v2 is not published, `auto` uses v1, and those commands report that v2 is required.

## `RCC_CHINA_URL`

`RCC_CHINA_URL` overrides the China URL and must be `https`. To use the test site (not production) at `https://developer.amd.com.cn/radeon2`:

```bash
export RCC_CHINA_URL=https://developer.amd.com.cn/radeon2
rcc auth login --site china
```

## HTTP 404 and 401

Human output follows an HTTP 404 or 401 with an English hint and a Chinese hint. If this is a China account, run `rcc auth login --site china`:

```text
HTTP 404: Not Found
Hint: this site does not expose the RCC CLI API, or the wrong site is selected. If this is a China account, run 'rcc auth login --site china'.
提示：该站点没有开放 RCC CLI 接口，或者选错了站点。如果你是中国站账号，请执行 'rcc auth login --site china'。
```

A 401 hint uses `--site` only when the failing URL is that site's preset. Otherwise the hint uses `--base-url`.
