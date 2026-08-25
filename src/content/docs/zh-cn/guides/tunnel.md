---
title: 暴露服务
description: 用 rc-tunnel 给 notebook 里运行的 HTTP 服务分配一个公网 URL。
sidebar:
  order: 7
---

`rc-tunnel` 给 notebook 里跑的 HTTP 或 WebSocket 服务分配一个公网 URL，方便你分享 demo，或者从平台外面访问它。

## 开始之前

- 只支持 notebook 内绑定在 `127.0.0.1` 上的 HTTP 和 WebSocket 服务。
- 本地端口必须在 `1024` 到 `65535` 之间，且不能是平台保留的端口。
- 每个 notebook pod 同时只能暴露一个端口。
- 域名由平台分配，格式为 `rc-<random>.radeon.firstdg.ai`。不支持自定义域名。
- 只有该功能上线之后创建的 notebook 才能用。更早的 pod 需要销毁重建。

:::danger[这个 URL 是公开的]
拿到 URL 的人都能访问这个服务。隧道本身不提供任何鉴权 —— 得靠你的应用自己做。别把没有鉴权的管理页面或 notebook 服务暴露出去。
:::

## 安装

在 notebook 终端里：

```bash
/var/run/secrets/frp-self-service/install
```

这会把 `rc-tunnel` 装到 `$HOME/.local/bin`，并加进以后新开终端的 `PATH`。在当前这个终端里，用全路径调用。

如果安装脚本提示身份目录或 `FRP_BROKER_URL` 缺失，说明这个 notebook 比该功能还早。销毁它，重建一个。别自己动手写平台密钥。

新开的终端可以直接跑 `rc-tunnel`。如果你不用 bash：

```bash
export PATH="$HOME/.local/bin:$PATH"
```

## 起一个服务来暴露

用一个测试页面确认整条链路是通的：

```bash
mkdir -p "$HOME/tunnel-demo"
printf '%s\n' '<!doctype html><title>RC Tunnel</title><h1>RC Tunnel is working</h1>' \
  > "$HOME/tunnel-demo/index.html"
nohup python3 -m http.server 8081 --bind 127.0.0.1 \
  --directory "$HOME/tunnel-demo" \
  > "$HOME/tunnel-demo/http.log" 2>&1 &
curl --fail http://127.0.0.1:8081/
```

## 暴露端口

```bash
"$HOME/.local/bin/rc-tunnel" expose --port 8081
```

这条命令会申请一个可用域名，返回分配到的 URL 和 FRPC 进程号。通常几秒钟后就能访问：

```text
https://rc-0123456789abcdef.radeon.firstdg.ai
```

`--prefix` 参数是为运维兼容保留的，普通用户用不上。

## 检查和排查

```bash
"$HOME/.local/bin/rc-tunnel" status
"$HOME/.local/bin/rc-tunnel" logs --lines 100
curl --fail http://127.0.0.1:8081/
```

按这个顺序排查：

1. **本地 `curl` 就失败。** 你的应用根本没在那个端口上监听。和隧道无关，先修服务。
2. **`status` 显示 FRPC 没在跑。** 看 `rc-tunnel logs`。
3. **状态正常但公网 URL 访问不了。** 把完整域名、notebook 的创建时间和故障发生时间发给运维。别发配置文件或密钥。

## 停止

```bash
"$HOME/.local/bin/rc-tunnel" stop
```

公网 URL 立刻失效，域名前缀会被冻结 24 小时。如果是 FRPC 或 pod 被杀掉，服务端一般会立即发现连接断开；从未连上过的隧道在 60 秒没有心跳后被回收。

## 不支持的场景

TCP、UDP、SSH 和数据库端口。自定义完整域名。

别手动改 `~/.local/state/rc-tunnel/frpc.toml`，也别把那个目录复制到别的 pod 或分享出去 —— 它装着你的隧道身份。重建 notebook 之后，重新安装并重新暴露一次。
