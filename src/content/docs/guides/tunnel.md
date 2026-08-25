---
title: Expose a service
description: Give an HTTP service running inside your notebook a public URL with rc-tunnel.
sidebar:
  order: 7
---

`rc-tunnel` gives an HTTP or WebSocket service running inside your notebook a public URL, so you can share a demo or hit it from outside the platform.

## Before you start

- Only HTTP and WebSocket services bound to `127.0.0.1` inside the notebook are supported.
- The local port must be between `1024` and `65535`, and must not be reserved by the platform.
- One port per notebook pod at a time.
- The domain is assigned by the platform as `rc-<random>.radeon.firstdg.ai`. Custom domains aren't supported.
- Only notebooks created after the feature was enabled can use it. Older pods need to be destroyed and recreated.

:::danger[The URL is public]
Anyone who has the URL can reach the service. The tunnel adds no authentication — your application has to enforce its own. Don't expose an unauthenticated admin page or a notebook server.
:::

## Install

In a notebook terminal:

```bash
/var/run/secrets/frp-self-service/install
```

This installs `rc-tunnel` to `$HOME/.local/bin` and adds it to `PATH` for future terminals. In the terminal you're already in, call it by full path.

If the install script reports that the identity directory or `FRP_BROKER_URL` is missing, the notebook predates the feature. Destroy it and create a new one. Don't try to write platform keys yourself.

New terminals can run `rc-tunnel` directly. If you're not using bash:

```bash
export PATH="$HOME/.local/bin:$PATH"
```

## Start something to expose

A quick test page to confirm the path works end to end:

```bash
mkdir -p "$HOME/tunnel-demo"
printf '%s\n' '<!doctype html><title>RC Tunnel</title><h1>RC Tunnel is working</h1>' \
  > "$HOME/tunnel-demo/index.html"
nohup python3 -m http.server 8081 --bind 127.0.0.1 \
  --directory "$HOME/tunnel-demo" \
  > "$HOME/tunnel-demo/http.log" 2>&1 &
curl --fail http://127.0.0.1:8081/
```

## Expose the port

```bash
"$HOME/.local/bin/rc-tunnel" expose --port 8081
```

The command requests an available domain and returns the assigned URL along with the FRPC process ID. It's usually reachable within a few seconds:

```text
https://rc-0123456789abcdef.radeon.firstdg.ai
```

The `--prefix` flag exists for operations compatibility; regular users don't need it.

## Check and diagnose

```bash
"$HOME/.local/bin/rc-tunnel" status
"$HOME/.local/bin/rc-tunnel" logs --lines 100
curl --fail http://127.0.0.1:8081/
```

Work through it in this order:

1. **Local `curl` fails.** Your application isn't listening on that port. Nothing to do with the tunnel — fix the service first.
2. **`status` shows FRPC not running.** Read `rc-tunnel logs`.
3. **Status is healthy but the public URL fails.** Send operations the full domain, when the notebook was created, and when the failure happened. Don't send config files or keys.

## Stop

```bash
"$HOME/.local/bin/rc-tunnel" stop
```

The public URL stops working immediately, and the domain prefix is frozen for 24 hours. If FRPC or the pod is killed instead, the server usually notices the closed connection right away; tunnels that never connected are revoked after 60 seconds without a heartbeat.

## Not supported

TCP, UDP, SSH, and database ports. Custom full domains.

Don't edit `~/.local/state/rc-tunnel/frpc.toml` by hand, and don't copy that directory to another pod or share it — it holds your tunnel identity. After recreating a notebook, install and expose again.
