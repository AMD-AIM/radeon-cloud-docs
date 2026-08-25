---
title: 实例
description: 用程序启动、查看和销毁 GPU 实例。
sidebar:
  order: 7
---

每个账户同时只能有一个活跃实例。下面这些端点负责启动它、轮询它、拆掉它。

## 启动实例

<div class="rc-endpoint">
  <span class="rc-method" data-m="POST">POST</span>
  <span class="rc-path">/api/notebook/request</span>
  <span class="rc-auth">会话或 API 密钥</span>
</div>

分配一开始就返回——它不等实例就绪。轮询[状态](#查看状态)直到 `ready` 为 `true`。

| 参数 | 类型 | | 说明 |
|---|---|---|---|
| `image` | string | <span class="rc-opt">选填</span> | 容器镜像。必须是目录里启用的。默认用平台默认镜像。 |
| `instance_type` | string | <span class="rc-opt">选填</span> | `jupyter`、`gradio`、`streamlit`、`comfyui`、`vllm`、`sglang`、`opencode` 或 `custom`。默认 `jupyter`。 |
| `gpu_count` | integer | <span class="rc-opt">选填</span> | `1`、`2` 或 `4`。默认 `1`。 |
| `disk_size_gb` | integer | <span class="rc-opt">选填</span> | 从 100 GB 起，上限随 GPU 数量而定：1 卡 100，2 卡 150，4 卡 200。 |
| `resource_profile` | string | <span class="rc-opt">选填</span> | 具名的 CPU 与内存配置。默认 `auto`。 |
| `launch_verification_token` | string | <span class="rc-opt">选填</span> | 仅在账户开启了启动验证时需要。 |

```bash
curl -X POST https://radeon-global.anruicloud.com/api/notebook/request \
  -H "Authorization: Bearer $RADEON_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"instance_type": "jupyter", "gpu_count": 1, "disk_size_gb": 100}'
```

```json
{
  "status": "allocating",
  "message": "Allocating resources for your instance...",
  "email": "you@example.com"
}
```

以下情况返回 `400` 拒绝：GPU 数量不是 1、2 或 4；磁盘大小超出允许范围；镜像或实例类型未知或已禁用；你已经有一个活跃实例；或者你的额度余额低于请求的 GPU 数量。

## 查看状态

<div class="rc-endpoint">
  <span class="rc-method" data-m="GET">GET</span>
  <span class="rc-path">/api/notebook/status</span>
  <span class="rc-auth">会话或 API 密钥</span>
</div>

无参数——它报告调用方账户的实例。

```json
{
  "status": "ready",
  "ready": true,
  "message": "Your workspace is ready",
  "instance_id": "u-1042-9c3f8ab1",
  "instance_type": "jupyter",
  "url": "https://radeon-global.anruicloud.com/instances/u-1042-9c3f8ab1/",
  "app_port": 8888,
  "ssh_host": "ssh.anruicloud.com",
  "ssh_port": 32014,
  "ssh_username": "root",
  "ssh_command": "ssh root@ssh.anruicloud.com -p 32014",
  "api_base_url": null,
  "api_key": null,
  "api_model": null
}
```

### 字段

| 字段 | 说明 |
|---|---|
| `status` | `not_found`、`allocating`、`loading`、`initializing`、`pending`、`jupyter_starting`、`running`、`ready`、`failed` 或 `unknown`。 |
| `ready` | 只有实例完全可用时才是 `true`。判断就看它，别看 `status`。 |
| `message` | 给人看的进度或失败说明。 |
| `instance_id` | 标识符，形如 `u-<user>-<hash>`。会出现在 URL 里。 |
| `url` | 在浏览器里打开实例的地址。需要会话 cookie。 |
| `phase`、`reason`、`detail` | 更底层的调度状态。启动卡住时有用。 |
| `ssh_host`、`ssh_port`、`ssh_username`、`ssh_command` | 容器跑起来之后填充，前提是模板开了 SSH。 |
| `api_base_url`、`api_key`、`api_model` | 只有已就绪的 `vllm` 和 `sglang` 实例才填充。[独占端点](/radeon-cloud-docs/zh-cn/api/dedicated-endpoints/)的 URL 就是从这儿来的。 |

每隔几秒轮询一次。冷启动拉大镜像，或者 vLLM 实例下载权重，都可能要好几分钟。

## 销毁实例

<div class="rc-endpoint">
  <span class="rc-method" data-m="DELETE">DELETE</span>
  <span class="rc-path">/api/notebook/current</span>
  <span class="rc-auth">会话或 API 密钥</span>
</div>

```json
{
  "success": true,
  "message": "Instance destroyed",
  "destroyed_count": 1
}
```

如果本来就没东西可销毁，返回 `success: false` 和 `"No active instance found"`——这不是错误，调两次也没问题。

除非模板用了持久化存储，否则数据会随实例一起删掉。

## 一个启动并等待的循环

```python
import time, requests

BASE = "https://radeon-global.anruicloud.com"
H = {"Authorization": f"Bearer {KEY}"}

requests.post(f"{BASE}/api/notebook/request", headers=H,
              json={"instance_type": "jupyter", "gpu_count": 1}).raise_for_status()

while True:
    s = requests.get(f"{BASE}/api/notebook/status", headers=H).json()
    if s["ready"]:
        print("ready:", s["url"])
        break
    if s["status"] == "failed":
        raise RuntimeError(s.get("message", "launch failed"))
    print(s["status"], s.get("message", ""))
    time.sleep(5)
```

一定要在 `finally` 里销毁。脚本崩了却留着实例在跑，额度就一直在烧。
