---
title: "操作演示：启动 Notebook"
description: "启动一个带 GPU 的 Notebook，并选择能保留文件的存储。"
---

**什么时候用：**需要一个带 GPU 的 JupyterLab 来工作。

![操作演示动图：启动 Notebook](/radeon-cloud-docs/walkthroughs/zh/launch.gif)

## 步骤

1. 登录后打开首页，启动面板是页面的主要部分。
2. 打开镜像列表，选择需要的环境。
3. 选择镜像，下方一行说明镜像里有什么。
4. 打开 **Customize（自定义）**，才能看到存储选项。
5. 在 **Workspace storage（工作区存储）** 里，需要保留文件就选 **Persistent /workspace（持久化）**。
6. 看清字段说明：只有 `/workspace` 会保留。
7. 确认自动销毁时间，底部显示每小时消耗的积分。
8. 点 **Launch instance（启动实例）**，GPU 紧张时会自动排队。
9. 实例启动过程中，弹窗和卡片会显示进度。
10. 就绪后点 **Open notebook（打开 Notebook）** 进入 JupyterLab。

## 常见遗漏

- 存储选项在「自定义」里；不打开就只有临时工作区，实例销毁后数据会丢失。
- 只有 `/workspace` 内的文件会保留，启动后不能再修改存储。

更多说明：[启动实例](/radeon-cloud-docs/zh-cn/guides/launch/)
