# qdd.app｜乔大帅中国护照出境说明书

独立的中国普通护照出境政策核验与办理教程网站。

## 当前内容

- 当前 57 国、468 节签证、免签与入境教程，其中新增 20 个以上目的地与 10 个岛屿国家
- 首页保留 9 个后续国家研究队列，已上线国家不再伪装成“筹备中”
- 20 套可编辑、可导出 PNG 的卡片工具
- 政策生效日、官方页面日、本站核验日分开显示
- 核验状态台、更新日志、核验方法与 5 个场景专题（含 `/topics/esim/` 出国上网说明）
- 每个国家都有官方申请/入境入口、官方材料链接、费用/时效入口、结构化资料清单、办理顺序和成功率口径
- 出海热门国家排行榜：签证准备难度、公司注册准备度、银行/银行卡准备度，以及资金规划和公开社区问题线索
- 国家页新增“出海经营与金融”模块；新增国家采用“官方入口索引版”并明确标注行业条件待逐项核验
- 每个国家页的经营模块都按四条线拆开：公司注册与营业/行业许可、工作许可/EP、个人账户与借记卡、企业账户与信用卡；专家组逐国入口矩阵保留“中国公民能否发起、本地董事/地址、工作边界和银行 KYC”原始口径，未完成逐家核验的国家不列具体开户保证
- 排行分数是编辑部准备度与研究优先级，不是获签率、开户率、信用卡通过率或投资建议
- 全站中文自然表达规范与旧直译拦截已接入构建检查；新增国家必须先过中文编辑、双语审校和产品文案检查
- 全站 SEO/GEO 基础已接入：canonical、robots、Open Graph、Twitter Card、FAQ/HowTo/Article/Breadcrumb JSON-LD、`llms.txt` 与 AI 抓取白名单
- 独立银行卡指南 `/personal-banking/`：账户类型对比、材料表、开户思维导图、合规/不合规边界、KYC/AML、税务居民、资金来源与 FAQ
- 国家页在签证/入境信息之后提供“出发前通信”模块；`/topics/esim/` 对比旅行 eSIM、当地实体 SIM、国际漫游与随身 Wi‑Fi，并链接至 eSIM.school 的目的地比价、设备兼容与安装教程。所有关联链接都带 `sponsored` 属性和收入披露，价格与套餐数量不在本站写死。

## 数据源

站点构建时读取：

```text
../visa-cards/policy-data.json
```

更新政策数据并重新生成卡片后，执行：

```bash
node ../visa-cards/generate-visa-cards.mjs
npm run build
npm run check
```

中文文案规范见：

knowledge-base/copywriting/中文自然表达规范.md

出海经营字段研究稿（上线前继续事实复核）：

```text
knowledge-base/research/工作许可-公司注册-银行开户逐国入口矩阵-2026-08-14.md
knowledge-base/research/57国工作许可公司注册与银行开户字段缺口研究-2026-08-14.md
```

政策来源变化扫描（只生成复核队列，不自动发布）：

```bash
node ../policy-monitor/check-sources.mjs
```

全量检查当前已上线国家的申请入口、官方指南、材料、处理时间和费用链接：

```bash
node ../policy-monitor/check-sources.mjs --all
```

美国国务院、韩国 Visa Portal 等站点可能拒绝自动化请求；这类结果进入人工复核队列，不会被脚本误判为政策失效。

## Cloudflare Pages

- Pages 项目：`qdd-passport`
- 生产分支：`main`
- 构建目录：`dist`
- 正式域名：`https://qdd.app`
- 别名：`https://www.qdd.app`

直接部署：

```bash
wrangler pages deploy dist --project-name qdd-passport --branch main
```

站点署名统一为：

```text
qdd.app · 乔大帅
```
