---
title: 实例
description: 控制台用来启动、查看和销毁实例的接口。
sidebar:
  order: 8
---

这些是控制台在启动、查看和销毁实例时调用的接口。它们只接受浏览器会话，不接受 API Key。要在脚本里管理实例，请用 [Radeon Cloud CLI](/radeon-cloud-docs/zh-cn/cli/automation/)。

路径相对于你所在站点的控制台地址，例如 `https://developer.amd.com.cn/radeon`。每个账号同一时间只能有一个实例，所以这些接口都不需要实例 ID。

| 操作 | Notebook | 模型服务 |
|---|---|---|
| 启动 | `POST /api/notebook/request` | `POST /api/inference` 或 `POST /api/templates/{id}/launch` |
| 查看状态 | `GET /api/notebook/status` | `GET /api/inference/current` |
| 查看日志 | `GET /api/notebook/logs` | `GET /api/inference/current/logs` |
| 销毁 | `DELETE /api/notebook/current` | `DELETE /api/inference/current` |

## 选择资源

启动时要指定资源池和规格，两者都来自 `GET /api/me/resource-labels`，它列出你的账号可以使用的资源：

- `"category": "resource-pool"` 的条目是资源池，把 `id` 作为 `pod_type` 发送
- `"category": "resource-template"` 的条目是规格，把 `id` 作为 `resource_template` 发送

例如 `pod_type: "one-click"` 加 `resource_template: "resource-16c55g1u"`，就是 1 块 GPU、16 核、55 GB 内存。已分配资源池和规格的账号必须同时发送这两个字段，并且不能发送 `gpu_count`。

## 启动 Notebook

<div class="rc-endpoint">
  <span class="rc-method" data-m="POST">POST</span>
  <span class="rc-path">/api/notebook/request</span>
  <span class="rc-auth">会话</span>
</div>

| 字段 | 类型 | | 说明 |
|---|---|---|---|
| `pod_type` | string | <span class="rc-req">必填</span> | 资源池 ID。 |
| `resource_template` | string | <span class="rc-req">必填</span> | 规格 ID。 |
| `image` | string | <span class="rc-opt">可选</span> | 镜像目录中的镜像。默认是平台默认镜像 **AMD OneClick Base**。 |
| `instance_type` | string | <span class="rc-opt">可选</span> | 只能是 `jupyter`，也是默认值。 |
| `use_pvc` | boolean | <span class="rc-opt">可选</span> | `true` 表示挂载持久化 `/workspace`。默认 `false`，使用临时工作区。 |
| `pvc_size` | string | <span class="rc-opt">可选</span> | `25GB` 或 `100GB`，配合 `use_pvc: true` 使用。100 GB 只对部分账号开放。 |
| `model_mount` | string | <span class="rc-opt">可选</span> | 以只读方式挂载到 `/models` 的模型，ID 来自 `GET /api/models/mountable`。 |
| `ssh_enabled` | boolean | <span class="rc-opt">可选</span> | 控制台总是发送 `true`。需要先在 **设置** 里添加 SSH 密钥。 |

```json
{
  "pod_type": "one-click",
  "resource_template": "resource-16c55g1u",
  "instance_type": "jupyter",
  "use_pvc": true,
  "pvc_size": "25GB",
  "ssh_enabled": true
}
```

请求被接受后立即返回，不会等实例就绪。请轮询[状态](#查看状态)，直到 `ready` 为 `true`。

以下情况会拒绝启动：

- 你已经有一个实例（`400`，`Each user can only have one active instance`），或者上一个实例还在删除中（`409`）
- 积分不够所选规格运行 1 小时（`400`，`Insufficient credits`）
- `instance_type` 不是 `jupyter`（`400`，`unsupported_deploy_type`）
- 资源池或规格没有分配给你的账号（`403`，`resource_selection_not_assigned`）

## 启动模型服务

要部署自己的模型（**部署类型：模型 API**），发送模型名称和 vLLM 命令：

<div class="rc-endpoint">
  <span class="rc-method" data-m="POST">POST</span>
  <span class="rc-path">/api/inference</span>
  <span class="rc-auth">会话</span>
</div>

| 字段 | 类型 | | 说明 |
|---|---|---|---|
| `api_model` | string | <span class="rc-req">必填</span> | 客户端在 `model` 里发送的名称。请和命令里的 `--served-model-name` 保持一致。 |
| `start_command` | string | <span class="rc-req">必填</span> | 监听 `8000` 端口的 `vllm serve` 命令。 |
| `model_source` | string | <span class="rc-opt">可选</span> | `huggingface`（默认）或 `modelscope`。 |
| `pod_type`、`resource_template` | string | <span class="rc-req">必填</span> | 和 Notebook 相同。 |

```json
{
  "api_model": "MiniCPM5-1B",
  "model_source": "modelscope",
  "start_command": "vllm serve OpenBMB/MiniCPM5-1B --host 0.0.0.0 --port 8000 --served-model-name MiniCPM5-1B",
  "pod_type": "one-click",
  "resource_template": "resource-16c55g1u"
}
```

不认识的字段会被拒绝。要启动现成的模型模板，先用 `GET /api/inference/templates` 列出模板，再用空请求体调用 `POST /api/templates/{id}/launch`，见[模板](/radeon-cloud-docs/zh-cn/api/templates/#启动模板)。

## 查看状态

<div class="rc-endpoint">
  <span class="rc-method" data-m="GET">GET</span>
  <span class="rc-path">/api/notebook/status</span>
  <span class="rc-auth">会话</span>
</div>

模型服务请调用 `GET /api/inference/current`，它返回相同的字段，另外还有运行时长和积分消耗。

```json
{
  "status": "ready",
  "ready": true,
  "message": "Your workspace is ready",
  "instance_id": "<instance-id>",
  "instance_type": "jupyter",
  "url": "https://developer.amd.com.cn/radeon/instances/<instance-id>/",
  "ssh_host": "<ssh-host>",
  "ssh_port": 32014,
  "ssh_username": "root",
  "ssh_command": "ssh root@<ssh-host> -p 32014",
  "api_base_url": null,
  "api_key": null,
  "api_model": null
}
```

| 字段 | 说明 |
|---|---|
| `ready` | 只有实例可以使用时才是 `true`。请以它为准，而不是 `status`。 |
| `status`、`message` | 用于显示的进度或失败信息。`failed` 表示这次启动不会再恢复。 |
| `phase`、`reason`、`detail`、`error_code` | 更底层的调度状态，启动卡住时有用。 |
| `instance_id` | 出现在实例的 URL 里。多次启动可能相同，但请每次从这里读取，不要保存下来复用。 |
| `url` | 在已登录的浏览器里打开 JupyterLab。 |
| `ssh_host`、`ssh_port`、`ssh_username`、`ssh_command` | 容器运行后填入。 |
| `persistent_available`、`storage_notice` | 持久化 `/workspace` 是否挂载成功；没有成功时说明原因。 |
| `api_base_url`、`api_key`、`api_model` | 模型服务就绪后填入，见[模型服务接口](/radeon-cloud-docs/zh-cn/api/model-services/)。 |

每隔几秒轮询一次。实例通常一分钟内就绪，但镜像很大或需要下载模型时，可能要几分钟。

## 查看日志

<div class="rc-endpoint">
  <span class="rc-method" data-m="GET">GET</span>
  <span class="rc-path">/api/notebook/logs</span>
  <span class="rc-auth">会话</span>
</div>

返回当前实例的调度事件和容器输出，也就是控制台里 **查看日志** 显示的内容。模型服务请调用 `GET /api/inference/current/logs`。

## 销毁实例

<div class="rc-endpoint">
  <span class="rc-method" data-m="DELETE">DELETE</span>
  <span class="rc-path">/api/notebook/current</span>
  <span class="rc-auth">会话</span>
</div>

模型服务请调用 `DELETE /api/inference/current`。

```json
{
  "success": true,
  "message": "Instance <instance-id> destroyed",
  "destroyed_count": 1
}
```

如果没有可以销毁的实例，响应是 `success: false` 和 `"No active instance found"`。这不是错误，重复调用也没有问题。

临时工作区里的文件会随实例一起删除，持久化 `/workspace` 会保留，见[保存数据](/radeon-cloud-docs/zh-cn/guides/storage/)。
