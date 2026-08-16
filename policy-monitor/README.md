# qdd.app 政策变化监测

这是“发现层”，不是自动发布器。

```bash
node policy-monitor/check-sources.mjs
```

全量检查 20 国的申请入口、材料、费用和处理时间链接：

```bash
node policy-monitor/check-sources.mjs --all
```

脚本抓取 `source-registry.json` 中的官方来源，规范化正文并计算 SHA-256；页面变化、关键字消失或请求失败会进入人工复核队列。`source-state.json` 是运行快照，不代表政策结论。

发布闸门：

1. 自动扫描发现变化；
2. 编辑回到官方原文，核对适用人群、目的、日期、数字与例外；
3. 第二人复核高风险结论；
4. 更新结构化数据和变更日志；
5. 重新生成卡片、构建、检查并部署。

下一阶段再将同一流程迁移为 Cloudflare Cron + D1：Cron 负责调度，D1 保存快照与审核状态，仍不允许无人审核直接发布。
