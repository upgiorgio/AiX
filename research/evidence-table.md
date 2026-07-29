# 证据表：自动化写作、选题采集与排版升级

| ID | 证据 / 能力 | 来源 | 日期 / 状态 | 质量 | 对本系统的含义 |
|---|---|---|---|---|---|
| E01 | MCP 当前稳定协议版本为 2025-11-25 | https://modelcontextprotocol.io/docs/learn/versioning | 当前文档 | A | 生产接入只以此版为基线 |
| E02 | MCP 2026-07-28 仍是 Release Candidate，包含 stateless core、Apps、Tasks 等方向 | https://blog.modelcontextprotocol.io/posts/2026-07-28-release-candidate/ | RC，最终版尚未发布 | A | 只做 feature flag 兼容实验，不写死到主流程 |
| E03 | OpenAI Agents SDK 内建 trace，覆盖生成、工具调用、handoff、guardrail 与自定义事件 | https://openai.github.io/openai-agents-python/tracing/ | 持续更新 | A | 借鉴 trace/span 数据模型，不必强制换 SDK |
| E04 | LangGraph persistence 支持 checkpoint、故障恢复、time travel 与 HITL | https://docs.langchain.com/oss/python/langgraph/persistence | 当前文档 | A | 说明每日管线应有可恢复 checkpoint；可先用 SQLite 状态机实现 |
| E05 | Anthropic 多 agent 研究架构对广度型任务有效，但 token 成本远高于普通聊天 | https://www.anthropic.com/engineering/multi-agent-research-system | 2025-06-13 | A | 深度研究用并行 agent；每日流水线维持确定性 DAG |
| E06 | Anthropic Managed Agents 将 session、harness、sandbox 分离 | https://www.anthropic.com/engineering/managed-agents | 2026-04-08 | A | 将不可变事件日志、编排器和抓取执行环境分层 |
| E07 | Google Trends API alpha 提供一致尺度、近 5 年、地域与多时间粒度数据，但访问仍受限 | https://developers.google.com/search/apis/trends | alpha | A | 申请试用；不能成为近期生产硬依赖 |
| E08 | X API 现为按量付费；Post Read 当前为 $0.005/条，搜索、流式与时间线读取计费，并提供日内去重 | https://docs.x.com/x-api/getting-started/pricing | 当前文档 | A | 只用于高价值关键词和账户列表；先设 $25 额度、300 Post/day 硬上限（约 $45/月） |
| E09 | X recent search 与 filtered stream 有明确速率和连接限制 | https://docs.x.com/x-api/fundamentals/rate-limits | 当前文档 | A | 关键词精确化、流式优先于轮询、429 退避 |
| E10 | Bluesky Jetstream 提供公开 JSON WebSocket 事件流 | https://docs.bsky.app/docs/advanced-guides/firehose | 当前文档 | A | 低成本补充开放社交技术信号，弥补 X 单点依赖 |
| E11 | HN 官方 API 提供近实时公开数据，v0 文档声明当前无速率限制 | https://github.com/HackerNews/API | 当前仓库 | A | 保留为技术热度基准源，并抓评论树用于反对意见 |
| E12 | GitHub Activity API 支持 public events 与 feeds | https://docs.github.com/en/rest/activity | 当前文档 | A | 除“新仓库星数”外增加 release、event、issue velocity |
| E13 | OpenAlex API 提供 works、topics、keywords、authors、sources 等研究图谱；新版为每日 $1 免费额度的信用计费 | https://developers.openalex.org/api-reference/authentication | 当前文档 | A | 为 evergreen、研究背景、论文与主题趋势供料；以响应 meta.cost_usd 为准 |
| E14 | GDELT DOC 2 API 可做近 3 个月多语种新闻全文搜索与 JSON 输出 | https://blog.gdeltproject.org/gdelt-doc-2-0-api-debuts/amp/ | 持续服务 | A- | 适合宏观事件和跨地区覆盖，需噪音与来源质量过滤 |
| E15 | feedgrab 主仓支持多平台、统一 Markdown、MCP 与 item_id 去重 | https://github.com/iBigQiang/feedgrab | 2026-07-10 读取 | B+ | 适合作隔离采集前端，不替代选题判断与证据治理；其 X 网页抓取能力不得进入生产核心 |
| E28 | X 开发者政策要求自动化通过官方 API，并限制离线保存与再分发 | https://docs.x.com/developer-terms/policy | 当前政策 | A | 逐步退出 X 网页/浏览器自动抓取；只读、低量、预算化 API 试点 |
| E29 | Google Trends Trending Now 可导出 RSS/CSV，BigQuery 公共集提供趋势数据；alpha API 另行申请 | https://support.google.com/trends/answer/12764470 | 当前帮助 | A | RSS/BigQuery 可立即接入，alpha 只做观察与试用 |
| E16 | feedgrab Desktop 0.1.18 在 2026-07-10 加强中文 X Article、Latest+Top 合并与去重 | https://github.com/iBigQiang/feedgrab/releases | 预览版 | B | 值得 2 周试点；未签名预览客户端不进入主生产机核心链 |
| E17 | Jina Reader 可把 URL 转 Markdown/JSON，支持 browser/curl、frontmatter、selector、token budget 与 self-host | https://github.com/jina-ai/reader | 2026-04 OSS 同步 | A- | 作为公开页面通用抽取层与故障降级；保留原 HTML/哈希抽检 |
| E18 | Trafilatura 2.1 支持 Markdown/JSON/TEI、元数据、链接、图片与去重 | https://trafilatura.readthedocs.io/en/latest/usage-python.html | 当前文档 | A | 适合作本地免费抽取器和 Jina 结果的交叉校验器 |
| E19 | Firecrawl v2 提供 scrape、parse、crawl、map、search 与 agentic browser | https://docs.firecrawl.dev/api-reference/v2-introduction | 当前文档 | A | 只在复杂 JS 站点或站点级研究时按需付费使用 |
| E20 | Promptfoo 支持结构、相似度、自定义函数与模型评分断言，可接 CI | https://www.promptfoo.dev/docs/configuration/expected-outputs/ | 2026-07-07 更新 | A | 把现有质量门转成可比较、可回归的测试集 |
| E21 | Ragas 提供 faithfulness、factual correctness、tool accuracy 等指标 | https://docs.ragas.io/en/stable/concepts/metrics/available_metrics/ | 当前文档 | A | 补足“来源是否真的支持论点”的评测维度 |
| E22 | DTCG Design Tokens 2025.10 是首个稳定社区规范，支持主题、别名和跨平台转换 | https://www.w3.org/community/reports/design-tokens/CG-FINAL-format-20251028/ | 2025-10-28 stable | A | 将 6 色板和全部排版参数迁到单一 token 真相源 |
| E23 | unified 通过 mdast/hast 把 Markdown 解析、转换和 HTML 编译拆成插件链 | https://unifiedjs.com/learn/guide/using-unified/ | 当前文档 | A | 用 AST 替代正则式 Markdown 识别，建立语义组件层 |
| E24 | Juice 可将 style 标签与 CSS 规则内联到 HTML 元素 | https://automattic.github.io/juice/ | 当前工具 | A- | 为微信编译器提供内联步骤，之后仍需白名单净化与往返验证 |
| E25 | @vercel/og 使用 Satori + Resvg 从 HTML/CSS 生成 PNG | https://vercel.com/docs/og-image-generation | 2025-12-19 更新 | A | 同一内容 AST 自动生成 1200×630 社媒卡片，不与微信 HTML 混用 |
| E26 | Playwright 支持截图基线和文本/二进制 snapshot 比较 | https://playwright.dev/docs/next/test-snapshots | 当前文档 | A | 建立 18 个主题组合的视觉回归测试 |
| E27 | axe-core 可自动检查 WCAG 2.0/2.1/2.2 规则，自动化只能覆盖部分问题 | https://github.com/dequelabs/axe-core | 4.11.4, 2026-04-28 | A | Web 报告与站点编译器纳入 a11y 门禁；微信需另行人工抽检 |

## 2026-07-10 本机运行证据

| 证据 | 结果 | 解释 |
|---|---|---|
| `content-pipeline-2026-07-10.log` | RSS 12/17 成功，193 条；趋势 45 条 | RSSHub 未运行跳过 6 源；V2EX、微博、知乎趋势全部失败 |
| 同一日志 | AI 科技 103、非 AI 技术 54、历史哲学 14、创业实操 22 | 当天来源结构明显偏科技，缺少社会/中文商业信号 |
| 同一日志 | 1 个疑似幻觉标题导致整批选题跳过复制 | 需要“单条隔离失败”，不应整批失败 |
| `twitter-scan-2026-07-10.log` | Chrome 抓到 114 条，摘要 5 gems / 3 topics，最终 0 seeds | 固定 likes ≥ 3000 对小账号和新帖不公平，应改成相对速度/账号基线 |
| `hermes-daily-2026-07-10.log` | 技术源 3/7；选题 Opus 失败后 Kimi 产出 7 个；起稿多次 ECONNRESET | 数据、模型与写作阶段要 checkpoint、幂等重试和独立故障域 |
