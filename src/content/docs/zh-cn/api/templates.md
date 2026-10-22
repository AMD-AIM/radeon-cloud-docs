---
title: 模板
description: 模板库和模型服务模板背后的接口。
sidebar:
  order: 9
---

模板保存一套启动配置：镜像、实例类型、启动命令，也可以固定资源池和规格。[模板库](/radeon-cloud-docs/zh-cn/guides/gallery/)里的条目和 **首页** 上 **部署类型：模型 API** 下现成的模板都是模板。

除了浏览公开模板，这些接口都只接受浏览器会话。路径相对于你所在站点的控制台地址。

## 浏览公开模板

<div class="rc-endpoint">
  <span class="rc-method" data-m="GET">GET</span>
  <span class="rc-path">/api/templates</span>
  <span class="rc-auth">无需凭证，或 API Key、会话</span>
</div>

返回已发布的模板。带 API Key 或会话时，还会返回你自己的私有模板。

## 列出模型服务模板

<div class="rc-endpoint">
  <span class="rc-method" data-m="GET">GET</span>
  <span class="rc-path">/api/inference/templates</span>
  <span class="rc-auth">会话</span>
</div>

返回 **部署类型 → 模型 API** 下提供的公开 vLLM 模板，每个模板都带有它运行的命令和需要的规格。

```json
{
  "templates": [
    {
      "id": 412,
      "title": "MiniCPM5-2B",
      "description": "...",
      "model_source": "modelscope",
      "start_command": "vllm serve OpenBMB/MiniCPM5-2B --host 0.0.0.0 --port 8000 --served-model-name MiniCPM5-2B",
      "pod_type": "one-click",
      "resource_template": "resource-16c55g1u",
      "gpu_count": 1
    }
  ]
}
```

## 启动模板

<div class="rc-endpoint">
  <span class="rc-method" data-m="POST">POST</span>
  <span class="rc-path">/api/templates/<b>{template_id}</b>/launch</span>
  <span class="rc-auth">会话</span>
</div>

固定了资源池和规格的模板，按它自己的规格启动。控制台会把 **自动销毁** 作为 `max_runtime_hours` 发送。

| 字段 | 类型 | | 说明 |
|---|---|---|---|
| `gpu_count` | integer | <span class="rc-opt">可选</span> | 只对没有固定规格的模板有效，默认 `1`。 |
| `ssh_enabled` | boolean | <span class="rc-opt">可选</span> | 这次启动是否开启 SSH。 |
| `max_runtime_hours` | number | <span class="rc-opt">可选</span> | 实例就绪后的 **自动销毁** 时长。取值与[启动 Notebook](/radeon-cloud-docs/zh-cn/api/instances/#启动-notebook) 相同。不发则使用资源池上限。 |

只有 `jupyter` 和 `vllm` 类型的模板可以启动。返回值和后续调用与其他启动方式相同：轮询 [`GET /api/notebook/status`](/radeon-cloud-docs/zh-cn/api/instances/#查看状态)；`vllm` 模板则轮询 `GET /api/inference/current`。

启动按 IP 地址限流，超出后返回 `429`，并带有 `Retry-After` 响应头。

## 管理自己的模板

| 方法 | 路径 | 作用 |
|---|---|---|
| `GET` | `/api/profile/templates` | 列出你的模板和可选的镜像。 |
| `POST` | `/api/profile/templates` | 创建模板。 |
| `PUT` | `/api/profile/templates/{template_id}` | 替换模板，请求体和创建时相同。 |
| `DELETE` | `/api/profile/templates/{template_id}` | 删除模板。 |

主要字段：

| 字段 | 类型 | | 说明 |
|---|---|---|---|
| `title` | string | <span class="rc-req">必填</span> | 显示名称。 |
| `image` | string | <span class="rc-req">必填</span> | 镜像目录中的镜像。 |
| `instance_type` | string | <span class="rc-opt">可选</span> | `jupyter` 或 `vllm`。其他类型可以保存，但无法启动。 |
| `start_command` | string | <span class="rc-opt">可选</span> | 启动时运行的命令。`vllm` 必填。 |
| `model_source` | string | <span class="rc-opt">可选</span> | `huggingface` 或 `modelscope`，用于 `vllm`。 |
| `pod_type`、`resource_template` | string | <span class="rc-opt">可选</span> | 固定的资源池和规格。两个都发或都不发。 |
| `use_pvc` | boolean | <span class="rc-opt">可选</span> | 启动时挂载持久化 `/workspace`。 |
| `description`、`category`、`tags`、`cover_url` | | <span class="rc-opt">可选</span> | 模板在模板库里的展示方式。 |
| `repo_url`、`branch`、`notebook_path` | string | <span class="rc-opt">可选</span> | 启动时克隆的 Git 仓库和要打开的 notebook。 |
| `enabled` | boolean | <span class="rc-opt">可选</span> | 公开发布。只有编辑者可以发布，其他人的模板会被强制设为 `false`。 |

修改或删除模板，不影响已经用它启动、正在运行的实例。
