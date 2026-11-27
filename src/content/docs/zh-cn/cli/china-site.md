---
title: 中国站
description: 用同一个 rcc 命令登录 Radeon Cloud 中国站。
sidebar:
  label: 中国站
---

同一个 `rcc` 命令、同一个 PyPI 包 `amd-oneclick-sdk`，可以连接 Radeon Cloud 的 Global 站和中国站。默认仍是 Global 站。

| 站点 | 服务地址 | 默认 API 模式 |
| --- | --- | --- |
| `global`（默认） | `https://radeon-global.anruicloud.com`，或 `RCC_DEFAULT_URL` | `v1` |
| `china` | `https://developer.amd.com.cn/radeon` | `auto` |

## 登录

```bash
rcc auth login                 # Global 站
rcc auth login --site china    # 中国站
rcc account register --site china
```

`--site` 不能和 `-u` / `--base-url` 一起用。不写 `--site` 时，登录留在 Global 站。

还没有中国站账号时，`rcc doctor` 会显示 `site: global`。这一行是当前账号所在的站点，并不表示中国站不可用。

CLI 会打开一次性授权页面。在中国站开发者门户登录，核对设备名称，然后批准。

### 这台机器没有浏览器

```bash
rcc auth login --site china --no-browser
```

CLI 会打印一个一次性链接。在能够登录中国站开发者门户的浏览器里打开它，然后批准。不要把链接贴到聊天里。

:::note
如果授权页面的正文是 `{"detail":"Site sign-in is temporarily unavailable"}`，说明这次请求没有拿到中国站网站的登录交接。请先在同一浏览器中打开 https://developer.amd.com.cn/radeon 并登录，然后再打开该链接。
:::

## 已保存的账号

登录之后，后面的命令使用已保存的账号，不必再写 `--site`。同一个邮箱在两个站点会各保存一个账号，互不覆盖。自动生成的中国站账号名会加上 `-china` 后缀，例如 `alice@example.com` 和 `alice@example.com-china`。用 `rcc account use` 或 `-A` 切换：

```bash
rcc account list
rcc account use alice@example.com-china
rcc -A alice@example.com-china status
```

## 哪里能看到站点

`rcc auth status`、`rcc account list`、`rcc account current` 和 `rcc doctor` 会把站点显示为 `global`、`china` 或 `custom`。JSON 输出里，只有 `rcc account list` 的每一行会多一个 `site` 字段。

## API 模式

中国站地址默认使用 API 模式 `auto`：CLI 会探测一次 v2，如果返回 HTTP 404 就使用 v1。Global 站仍默认 v1。用 `--api-mode` 或环境变量 `RCC_API_MODE` 指定 `v1`、`v2` 或 `auto` 可以覆盖默认值。

工作负载命令（`serve`、`comfy`）需要 API v2。v2 尚未发布时，`auto` 使用 v1，这些命令会提示需要 v2。

## `RCC_CHINA_URL`

`RCC_CHINA_URL` 用来覆盖中国站地址，并且必须是 https。下面是测试站（不是正式环境）`https://developer.amd.com.cn/radeon2` 的例子：

```bash
export RCC_CHINA_URL=https://developer.amd.com.cn/radeon2
rcc auth login --site china
```

## HTTP 404 和 401

遇到 HTTP 404 或 401 时，给人看的输出会在错误后面附上英文和中文两行提示。如果这是中国站账号，请执行 `rcc auth login --site china`：

```text
HTTP 404: Not Found
Hint: this site does not expose the RCC CLI API, or the wrong site is selected. If this is a China account, run 'rcc auth login --site china'.
提示：该站点没有开放 RCC CLI 接口，或者选错了站点。如果你是中国站账号，请执行 'rcc auth login --site china'。
```

401 的提示只有在失败地址就是该站点的预设地址时才使用 `--site`，否则使用 `--base-url`。
