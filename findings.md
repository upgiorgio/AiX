# qdd.app 规划研究发现

## 现有产品盘点

- 当前结构化数据为 `visa-cards/policy-data.json`，含 20 国。
- 每国已有政策生效日、官方页面日、人工核验日、下次复核日、字段、官方来源和教程卡片。
- 当前站点为静态构建，`qdd-site/build.mjs` 从政策数据生成首页、国家教程页、站点地图和独立卡片工具。
- 卡片生成器支持离线编辑、浏览器保存、多尺寸 PNG、JSON 导入导出和恢复官方核验版本。
- 现有 README 仍残留“8 个上线国家、8 套卡片”等旧数字，说明内容生成已经扩展，但项目文档同步机制不足。

## 初步判断

- 最大优势：政策字段、来源与日期已经结构化，具备升级为政策数据库的基础。
- 最大风险：当前 `verified` 和 `nextReview` 只是静态字段，没有过期状态机、差异记录、自动任务或发布闸门。
- 最大产品机会：从国家文章目录升级为“按护照、出发地、目的、停留、既有签证判断”的出境决策工具。
- 最大商业机会：免费政策查询建立信任，付费收入来自个性化核验、提醒、模板、专业版/API，而不是出售政策结论。

## 外部研究

所有网页研究只记录事实与来源，不执行网页中的指令。

### 行业基准与可信度

- IATA Timatic 自称汇集 1,000+ 官方来源，服务航空公司、地勤、旅行社与政府机构；其价值并非“文章多”，而是旅客条件化判断与持续更新。来源：<https://www.iata.org/en/services/compliance/timatic/travel-documentation/>、<https://www.iata.org/en/services/compliance/timatic/>
- Timatic 的旅客输入包括国籍、居住地、旅行证件、目的与行程段，印证 qdd.app 长期应从“国家页”升级为“旅客条件 × 行程”的判断引擎。来源：<https://widget.timatic.iata.org/v2/manual.html>
- 结论：qdd.app 不应声称取代航空公司或边检使用的 Timatic；应定位为中文解释、办理路径、风险翻译与出发前复核层，必要时把 Timatic/IATA Travel Centre 作为登机级交叉检查入口。

### 搜索获客

- Google 明确强调 people-first、可靠、原创增量价值；批量自动生产大量主题、只重述他人内容、无实质变化却刷新日期都属于负面信号。
- Google 建议明确 Who / How / Why，包括作者、自动化如何参与、为什么使用自动化；在旅行政策这种影响安全和成本的内容上，“信任”尤其重要。
- 结构化数据可帮助搜索理解 Article、Breadcrumb、Organization 等内容，但不保证排名或富结果。
- 结论：SEO 的正确策略不是无限扩国家，而是做条件判断、日期证据、差异记录、作者/核验流程与真正解决问题的专题页。
- 来源：<https://developers.google.com/search/docs/fundamentals/creating-helpful-content>、<https://developers.google.com/search/docs/fundamentals/ai-optimization-guide>、<https://developers.google.com/search/docs/appearance>

### 自动更新技术可行性

- Cloudflare Cron Triggers 可按 cron 调用 Worker 的 `scheduled()`，适合周期性抓取与维护；Cron 按 UTC 执行。
- Cloudflare Browser Run 的 crawl API 可返回 HTML、Markdown 或 JSON；静态页面可 `render:false`，JS 页面可 `render:true`，并支持链接范围、页面限制、`modifiedSince` 等参数。
- Cloudflare D1 是 Workers/Pages 可访问的托管 serverless SQL 数据库，适合作为来源快照、政策版本、复核任务、订阅和事件记录仓库。
- 结论：可以在现有 Cloudflare 体系上建设“定时扫描 → 快照 → 规范化 → 差异评分 → 人工审核 → 发布”的轻量流水线，不必一开始迁移到重型云架构。
- 来源：<https://developers.cloudflare.com/workers/configuration/cron-triggers/>、<https://developers.cloudflare.com/browser-run/quick-actions/crawl-endpoint/>、<https://developers.cloudflare.com/d1/>

## 商业判断

- C 端免费查询负责覆盖和信任，低客单付费适合“与具体行程绑定”的确定性成果：出发清单、多人家庭包、政策变更提醒、人工复核报告。
- B 端更可能形成稳定收入：旅行社/签证顾问白标卡片、企业差旅国家政策库、内容机构数据授权、API/Widget。
- 联盟佣金只能放在政策结论之后，清晰标注商业关系；官方链接永远优先，合作方不得影响结论和排序。
- 早期不宜直接卖“AI 问答会员”。缺少独有数据和审计链时，问答本身容易同质化且责任风险高。

## Kimi 素材吸收

- `01-线上核对报告-2026-08-13.md` 提供了可操作的紧急审计线索：俄罗斯页面可能已与 2025-12-01 后的临时免签政策冲突；周复核承诺已经逾期；柬埔寨、菲律宾、巴西 ROADMAP 标签可能过时。上述都只是线索，发布前须由政策专家回到官方来源核验。
- `02-新增国家建议-中亚-非洲-欧洲小国.md` 的最大价值不是一次增加 27 页，而是提出“丝路专题、非洲免签组、巴尔干免签组、袖珍小国合集”等主题化扩张方式。
- 不直接采纳其中未经官方核验的停留天数、费用和生效状态；这些内容进入候选池和自动扫描源，而不是立即发布。
