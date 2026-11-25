---
title: "操作演示：销毁实例并保留成果"
description: "把成果存到 /workspace，销毁实例，下次启动时文件还在。"
---

**什么时候用：**暂时用完，但想保留结果。

![操作演示动图：销毁实例并保留成果](/radeon-cloud-docs/walkthroughs/zh/keep-your-work.gif)

## 步骤

1. 实例卡片上显示自动删除时间，到点用不用都会删除；需要更久请点 **Extend（延长）**。
2. 把成果保存在 `/workspace`，这是唯一能保留的文件夹。
3. 点 **Destroy instance（销毁实例）**。确认框说明：临时数据会删除，持久化 `/workspace` 的数据会保留，且无法撤销。
4. 实例已删除，不再消耗积分。
5. 再次启动时，在「自定义」里同样选择 **Persistent /workspace（持久化）**。
6. 文件在 `/workspace` 里原样保留。

## 常见遗漏

- 只有 `/workspace` 会保留，而且启动时要选 **Persistent /workspace**；保存在其他位置的文件不会保留。
- 销毁无法撤销；到自动删除时间实例也会被删除，需要更久请 **Extend**。

更多说明：[销毁实例](/radeon-cloud-docs/zh-cn/guides/destroy/)
