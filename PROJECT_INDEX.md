# AiX Card Suite · 项目全局索引

> **版本**：Beta 1.0 · 平台仿真发帖窗口系统
> **更新**：2026-02-23
> **仓库**：https://github.com/upgiorgio/AiX
> **线上**：https://x.banana.school
> **本文用途**：开发参考、移动端扩展（iOS / Android / 小程序）快速接入

---

## 📋 目录

1. [项目概览](#1-项目概览)
2. [目录结构全图](#2-目录结构全图)
3. [功能模块索引](#3-功能模块索引)
4. [AI 后端接口合约](#4-ai-后端接口合约)
5. [前端 AI Gateway 接口](#5-前端-ai-gateway-接口)
6. [数据层：localStorage Schema](#6-数据层localstorage-schema)
7. [设计系统 Design System](#7-设计系统-design-system)
8. [18 套卡片模板索引](#8-18-套卡片模板索引)
9. [平台仿真系统（Beta 1.0 新增）](#9-平台仿真系统beta-10-新增)
10. [部署与环境配置](#10-部署与环境配置)
11. [移动端扩展路线图](#11-移动端扩展路线图)
12. [快速开发速查表](#12-快速开发速查表)

---

## 1. 项目概览

### 1.1 产品定位

| 维度 | 说明 |
|------|------|
| **产品名** | AiX Card Suite / X Articles Studio |
| **核心价值** | AI 辅助多平台内容创作 → 视觉卡片 → 多平台发布 一体化工作流 |
| **目标用户** | 自媒体创作者、个人 IP、企业内容团队 |
| **技术栈** | 纯前端静态 HTML/CSS/Vanilla JS + KimiClaw/Kimi Worker 后端 |
| **当前阶段** | Beta 1.0（Web PWA，可安装到桌面/手机主屏） |

### 1.2 三层架构

```
┌─────────────────────────────────────────────────────────┐
│               前端静态站 (x.banana.school)                │
│  主工作台  │  MD排版工坊  │  文案卡片套件(7个工具页)        │
│  Vercel 托管 · GitHub 自动部署 · PWA 支持                 │
├─────────────────────────────────────────────────────────┤
│          AI 后端 (Cloudflare Worker)                     │
│  ai.qdd.app                                             │
│  /ai/generate  /ai/stream  /url/extract                  │
│  模型: Kimi/Moonshot 优先 · Cloudflare AI 兜底           │
├─────────────────────────────────────────────────────────┤
│              可选：用户自带 Kimi 或 OpenAI Key             │
│  Kimi K2.6 / GPT-4o / GPT-4o-mini (直连)                 │
└─────────────────────────────────────────────────────────┘
```

---

## 2. 目录结构全图

```
/Users/mac/Documents/New project/           ← 项目根目录
│
├── 📄 index.html                           ← 主工作台（首页）
├── 📄 styles.css                           ← 主站样式
├── 📄 app.js                               ← 主站逻辑（内容生成/Thread/分发/评分）
├── 📄 manifest.webmanifest                 ← PWA 配置
├── 📄 sw.js                                ← Service Worker（离线缓存）
├── 📄 vercel.json                          ← Vercel 路由 & 缓存配置
├── 🖼 icon-192.svg / icon-512.svg          ← 应用图标
├── 🖼 preview-desktop.png / preview-mobile.png  ← 预览截图
│
├── 📁 card-suite/                          ← 文案卡片套件子站
│   ├── 📄 index.html                       ← 套件导航首页（12平台入口）
│   ├── 📄 copy-studio.html/.js             ← 文案工场（AI写稿 + 平台仿真预览）
│   ├── 📄 card-designer.html/.js           ← 卡片设计引擎（18模板 + PNG导出）
│   ├── 📄 publish-hub.html/.js             ← 多平台发布中心
│   ├── 📄 strategy.html/.js                ← 内容策略面板
│   ├── 📄 content-calendar.html/.js        ← 内容日历
│   ├── 📄 prompt-lab.html/.js              ← AI 提示词实验室
│   ├── 📄 video-script.html/.js            ← 视频脚本生成器
│   ├── 📄 common.css                       ← 套件全局样式（2564行 · 含18模板+6平台仿真）
│   ├── 📄 common.js                        ← 套件全局工具函数
│   ├── 📄 ai-gateway.js                    ← AI 统一接入层（所有页面共享）
│   └── 📄 REPORT_NOTES.md                  ← 内部笔记
│
├── 📁 md-lab/                              ← Markdown 排版工坊
│   ├── 📄 index.html
│   ├── 📄 app.js
│   └── 📄 styles.css
│
├── 📁 ai-worker/                           ← KimiClaw/Kimi Worker 后端
│   ├── 📄 src/index.js                     ← Worker 主逻辑
│   └── 📄 wrangler.toml                    ← Worker 配置
│
├── 📁 api/                                 ← Vercel Serverless Functions
│   └── 📄 hot-topics.js                    ← 热点话题聚合 API
│
├── 📁 docs/                                ← 设计文档
│   ├── 📄 design-redesign.md
│   ├── 📄 copy-review.md
│   └── 📄 qa-report.md
│
├── 📄 PROJECT_INDEX.md                     ← 本文件（全局索引）
└── 📄 docs/MOBILE_EXPANSION.md             ← 移动端扩展指南
```

---

## 3. 功能模块索引

### 3.1 主工作台 `/`

| 模块 ID | 功能名 | 输入 | 输出 | 存储 Key |
|---------|--------|------|------|---------|
| `content-gen` | 内容生成 | 主题/观点/平台 | 标题+文章+Thread+分发计划 | `x-articles-studio-draft` |
| `thread-split` | Thread 拆分 | 长文草稿 | 5-12条Thread | 同上 |
| `timeline` | 72h 分发计划 | 平台选择 | 时间轴任务清单 | 同上 |
| `monetize` | 订阅变现引导 | — | 引导文案模板 | 同上 |
| `score` | 质量评分 | 草稿文本 | 7维度评分(0-100) | 同上 |
| `checklist` | 发布自检 v2 | — | 发布前3分钟清单 | — |
| `multiplatform` | 多平台适配 | 草稿 + 目标平台 | 各平台改写版 | 同上 |
| `platform-rules` | 平台规则速查 | 平台+分类筛选 | 规则/技巧/审核词 | — |
| `hot-topics` | 热点话题雷达 | 时间范围/平台 | Top10 热点列表 | — |
| `competitive` | 竞品审计 | — | 5大工具对比面板 | — |
| `draft-mgmt` | 草稿管理 | — | 历史版本/导出MD | `x-articles-studio-draft` |

### 3.2 文案工场 `/card-suite/copy-studio.html`

| 功能 | 说明 | 相关函数 |
|------|------|---------|
| 场景模板 | xhs / x-thread / wechat / quote / ad | `scenarioGuides{}` |
| 平台选项卡 | X / 小红书 / 公众号 / 知乎 / B站 / LinkedIn | `updatePlatformMock()` |
| 平台仿真窗口 | 6套官方UI风格实时预览 | `platformMockConfigs{}` |
| AI 生成草稿 | 流式输出，支持3个版本(A/B/C) | `generateWithAI()` |
| AI 迭代优化 | 精简/口语化/强钩子/优化CTA | `refineDraft()` |
| URL 导入 | 自动提取链接文章核心观点 | `importFromUrl()` |
| 字数计数 | 各平台实时字数限制提醒 | `updateCharCount()` |
| 发送到卡片设计 | 跨页面 localStorage 传递 | `sendToDesigner()` |

### 3.3 卡片设计引擎 `/card-suite/card-designer.html`

| 功能 | 说明 |
|------|------|
| 18套模板 | 详见第8节 |
| 4种平台尺寸 | 小红书3:4 / X 16:9 / 公众号封面 / 方图1:1 |
| 长文拆分 | 自动按字数拆分为多张卡片 |
| PNG 导出 | html2canvas 渲染导出 |
| 字体设置 | Sora(英) + Noto Sans SC(中) |

### 3.4 其他工具页

| 工具 | 路径 | 核心功能 |
|------|------|---------|
| 发布中心 | `/card-suite/publish-hub.html` | 多平台文案批量生成 + AI平台适配分析 + 72h执行清单 |
| 策略面板 | `/card-suite/strategy.html` | 内容策略规划与分析 |
| 内容日历 | `/card-suite/content-calendar.html` | 发布计划日历视图 |
| 提示词实验室 | `/card-suite/prompt-lab.html` | AI提示词测试与管理 |
| 视频脚本 | `/card-suite/video-script.html` | 短视频/B站脚本生成 |
| MD排版工坊 | `/md-lab/` | 长文Markdown排版 → 公众号/知乎/博客 |

---

## 4. AI 后端接口合约

**Worker URL**: `https://ai.qdd.app`
**Account**: Cloudflare 主账号 (07728da33c7e188b00a80f1462376afc)
**部署配置**: `ai-worker/wrangler.toml`

### 4.1 `POST /ai/generate` — 单次生成

```json
// 请求
{
  "prompt": "你好，介绍一下自己",
  "system": "你是专业的中文内容创作者",  // 可选
  "fast": false                            // true=用8B快速模型
}

// 响应 200
{ "content": "我是..." }

// 错误
{ "error": "prompt required" }
```

### 4.2 `POST /ai/stream` — 流式生成 (SSE)

```json
// 请求（同上）
{ "prompt": "...", "system": "...", "fast": false }

// 响应: text/event-stream
data: {"response": "我"}
data: {"response": "是"}
data: [DONE]
```

### 4.3 `POST /url/extract` — URL 内容提取

```json
// 请求
{ "url": "https://example.com/article" }

// 响应 200
{
  "title": "文章标题（10字内）",
  "points": ["核心要点1", "核心要点2", "核心要点3"],
  "quote": "最值得摘录的金句（20字内）",
  "summary": "一句话摘要（30字内）"
}
```

### 4.4 模型配置

| 模式 | 模型 | 适用场景 |
|------|------|---------|
| 默认 | `@cf/meta/llama-3.3-70b-instruct-fp8-fast` | 高质量内容生成 |
| 快速(`fast:true`) | `@cf/meta/llama-3.1-8b-instruct` | 快速响应、测试连接 |

### 4.5 热点 API (Vercel Serverless)

**路径**: `GET /api/hot-topics`
**Query 参数**:

| 参数 | 类型 | 说明 |
|------|------|------|
| `platform` | `x` \| `wechat` \| `xhs` | 平台 |
| `range` | `48h` \| `7d` | 时间范围 |
| `limit` | `1-20` | 返回条数，默认10 |

```json
// 响应
{
  "topics": [
    { "rank": 1, "title": "热点标题", "url": "...", "ts": 1700000000000 }
  ],
  "fetchedAt": 1700000000000
}
```

---

## 5. 前端 AI Gateway 接口

**文件**: `card-suite/ai-gateway.js`
**全局挂载**: `window.AiGateway`
**所有工具页面均引入此文件**，通过统一接口调用 AI。

### 5.1 API 方法

```javascript
// 单次生成（返回 Promise<string>）
const text = await window.AiGateway.generate(prompt, {
  system: "你是...",  // 可选
  fast: false         // 可选，true=快速模型
});

// 流式生成
await window.AiGateway.stream(prompt, {
  system: "你是...",
  onChunk(chunk) { /* 每次收到文本片段 */ },
  onDone()       { /* 生成完成 */ },
  onError(msg)   { /* 出错 */ },
  fast: false
});

// URL 内容提取（返回 Promise<{title, points, quote, summary}>）
const data = await window.AiGateway.extractUrl("https://...");

// 流式写入工具函数（自动处理光标 ▋）
const handler = window.AiGateway.streamIntoEl(textareaEl);
await window.AiGateway.stream(prompt, handler);

// 设置相关
window.AiGateway.openSettings();   // 打开 AI 设置 Modal
window.AiGateway.hasKey();         // 是否配置了 OpenAI Key
window.AiGateway.getSettings();    // 返回当前设置对象
```

### 5.2 AI 设置存储结构

```javascript
// localStorage key: "aix-ai-settings-v1"
{
  provider: "cf" | "kimi" | "openai", // 默认 "cf"（KimiClaw Worker代理）
  openaiKey: "sk-...",                // 仅 provider=openai 时有效
  model: "gpt-4o-mini",               // gpt-4o-mini | gpt-4o | gpt-4-turbo
  kimiKey: "sk-...",                  // 仅 provider=kimi 本地直连时有效
  kimiBaseUrl: "https://api.moonshot.cn/v1",
  kimiModel: "kimi-k2.6"
}
```

---

## 6. 数据层：localStorage Schema

> 移动端开发时，可将这些 key 对应到本地数据库（SQLite/Core Data/MMKV）

| Key | 模块 | 数据结构 | 说明 |
|-----|------|---------|------|
| `x-articles-studio-draft` | 主工作台 | `{ state:{topic,article,...}, articleOutput, threadItems[], ... }` | 主草稿（含所有生成内容） |
| `aix-md-lab-state-v1` | MD排版工坊 | `{ markdown, platform, ... }` | 排版工坊草稿 |
| `aix-card-suite-copy-v1` | 文案工场 | `{ scenario, platform, tone, length, topic, audience, thesis, cta, draftOutput, promptOutput }` | 文案工场状态 |
| `aix-copy-versions-v1` | 文案工场 | `{ versions:{0:"",1:"",2:""}, current:0 }` | A/B/C 三版本草稿 |
| `aix-card-suite-designer-input` | 卡片设计器 | `{ text, topic, platform, updatedAt }` | 从文案工场跨页传递的内容 |
| `aix-ai-settings-v1` | 全局 AI 设置 | `{ provider, openaiKey, model, kimiKey, kimiBaseUrl, kimiModel }` | AI 服务配置 |

### 6.1 主草稿完整结构

```javascript
// key: "x-articles-studio-draft"
{
  state: {
    topic:    "内容主题",
    point:    "核心观点",
    platform: "x" | "wechat" | "zhihu" | "xiaohongshu" | "bilibili",
    tone:     "专业" | "轻松" | "故事感",
    length:   "短" | "中" | "长",
    article:  "生成的文章正文...",
    title:    "生成的标题",
    hook:     "开头钩子",
  },
  articleOutput: "完整文章文本",
  threadItems: ["Thread 1", "Thread 2", ...],
  timelineItems: [{ time:"D0 19:00", action:"发布X主文" }, ...],
  qualityScore: { total:82, hooks:90, structure:80, ... },
  updatedAt: 1700000000000
}
```

---

## 7. 设计系统 Design System

> 文件：`card-suite/common.css` (2564行)

### 7.1 全局 CSS 变量

```css
:root {
  /* 背景层级 */
  --bg-base:         #060b14;           /* 最底层背景 */
  --bg-layer:        #101c2f;           /* 卡片背景层 */
  --surface:         rgba(11,26,43,.84);/* 半透明表面 */
  --surface-strong:  rgba(8,19,33,.94); /* 深色表面 */

  /* 线条与边框 */
  --line:            rgba(152,199,231,.28);
  --line-strong:     rgba(167,214,245,.46);

  /* 文字 */
  --text:   #eaf4ff;     /* 主文字 */
  --muted:  #9fbfda;     /* 次要文字 */

  /* 品牌色 */
  --brand:        #53c0ff;  /* 主品牌蓝 */
  --brand-strong: #2ea7e9;

  /* 功能色 */
  --warm:   #ffb46a;   /* 暖橙（警告/提示） */
  --ok:     #6bd5a4;   /* 成功绿 */
  --danger: #ff8d8d;   /* 错误红 */

  /* 阴影 */
  --shadow-sm: 0 12px 28px rgba(2,10,19,.28);
  --shadow-lg: 0 24px 64px rgba(2,10,19,.42);
}
```

### 7.2 平台品牌色变量

```css
:root {
  --x-blue: #1d9bf0;          /* X/Twitter 蓝 */
  --xhs-red: #ff2442;         /* 小红书红 */
  --wechat-green: #07c160;    /* 微信绿 */
  --zhihu-blue: #0084ff;      /* 知乎蓝 */
  --bili-pink: #fb7299;       /* B站粉 */
  --li-blue: #0a66c2;         /* LinkedIn深蓝 */
}
```

### 7.3 核心组件类名

| 类名 | 说明 |
|------|------|
| `.app-shell` | 主容器，max-width:1320px，grid布局 |
| `.topbar` | 顶部导航栏，含品牌+导航链接 |
| `.main-grid.grid-2` | 双栏主内容区 |
| `.card` | 基础卡片容器 |
| `.card.stack` | 竖向堆叠内容卡片 |
| `.btn` | 基础按钮 |
| `.btn.btn-primary` | 主要操作按钮（蓝色） |
| `.btn.btn-warm` | 次要操作按钮（橙色） |
| `.form-grid` | 表单网格布局 |
| `.output-box` | 输出区域（深色代码框风格） |
| `.ai-panel` | AI 功能区块 |
| `.ai-label-badge` | "AI" 标签徽章 |
| `.ai-thinking` | AI 思考中动画文字 |
| `.platform-card` | 首页平台卡片 |

### 7.4 字体

| 字体 | 用途 | CDN |
|------|------|-----|
| Sora | 英文/数字主字体 | Google Fonts |
| Noto Sans SC | 中文字体 | Google Fonts |
| 备选 | PingFang SC / Microsoft YaHei / sans-serif | 系统字体 |

---

## 8. 18 套卡片模板索引

> CSS class: `.template-{id}` · 文件：`common.css`

| ID | 名称 | 风格 | 主色调 | 适用内容 |
|----|------|------|--------|---------|
| `a` | **Aurora 极光蓝** | 冷色 | 深蓝→冰蓝渐变 | 科技/AI/数据 |
| `b` | **Void 深空** | 冷色 | 宇宙黑+星点 | 深度思考/哲学 |
| `c` | **Sage 苍翠** | 自然 | 深绿渐变 | 生活/成长/健康 |
| `d` | **Ember 琥珀橙** | 暖色 | 深橙渐变 | 激励/商业/能量 |
| `e` | **Blossom 樱花** | 暖色 | 玫红渐变 | 情感/文艺/女性 |
| `f` | **Nebula 星云紫** | 自然 | 紫色径向星云 | 创意/想象/科幻 |
| `g` | **Paper 稿纸** | 浅色 | 浅灰白横格纹 | 知识/笔记/干货 |
| `h` | **Abyss 深渊** | 冷色 | 近黑深蓝 | 夜间/神秘/高端 |
| `i` | **Dusk 暮色** | 暖色 | 暗紫橙渐变 | 情绪/艺术/晚霞 |
| `j` | **Cyber 赛博** | 专业 | 纯黑+霓虹绿 | 编程/极客/科技 |
| `k` | **Latte 拿铁** | 浅色 | 奶油暖白 | 生活方式/咖啡 |
| `l` | **Noir 碳黑** | 专业 | 极简全黑 | 高端/极简/商务 |
| `m` | **Aqua 海洋** | 冷色 | 深海蓝绿渐变 | 海洋/清新/环保 |
| `n` | **Gold 烫金** | 专业 | 深黑+金色装饰 | 奢华/金融/颁奖 |
| `o` | **Coral 珊瑚红** | 暖色 | 深红珊瑚渐变 | 活力/营销/促销 |
| `p` | **Midnight 子夜** | 冷色 | 靛蓝径向渐变 | 夜晚/安静/沉浸 |
| `q` | **Matcha 抹茶** | 自然 | 深绿茶色 | 日式/茶/健康 |
| `r` | **Storm 风暴** | 冷色 | 蓝灰+银色线条 | 严肃/天气/力量 |

### 8.1 平台尺寸对应

| 平台 | CSS Class | 尺寸(px) | 比例 | 字数上限 |
|------|-----------|---------|------|---------|
| 小红书 | `.size-xhs` | 1080×1440 | 3:4 | 120字/张 |
| X (Twitter) | `.size-x` | 1200×675 | 16:9 | 90字/张 |
| 公众号封面 | `.size-wechat` | 900×383 | 2.35:1 | 68字/张 |
| 朋友圈/方图 | `.size-square` | 1080×1080 | 1:1 | 100字/张 |

---

## 9. 平台仿真系统（Beta 1.0 新增）

> 文件：`copy-studio.html` + `copy-studio.js` + `common.css`

### 9.1 支持平台及仿真特性

| 平台 | CSS Class | 仿真元素 | 字数限制 |
|------|-----------|---------|---------|
| X/Twitter | `.pmw-x` | 纯黑背景·圆形头像·字数圆环·Post按钮 | 280 |
| 小红书 | `.pmw-xhs` | 白色·图片九宫格·标题输入·话题标签 | 1000 |
| 微信公众号 | `.pmw-wechat` | 浅灰背景·文章编辑器·格式工具栏 | 2000 |
| 知乎 | `.pmw-zhihu` | 蓝色顶栏·回答/文章/想法Tab | 5000 |
| B站 | `.pmw-bilibili` | 粉色Logo·投稿类型切换·封面预览 | 2000 |
| LinkedIn | `.pmw-linkedin` | 白色·头像·受众可见性·工具栏 | 3000 |

### 9.2 核心 JS 函数

```javascript
// 切换平台仿真窗口（保留已输入文案）
updatePlatformMock("x" | "xiaohongshu" | "wechat" | "zhihu" | "bilibili" | "linkedin")

// 更新字数计数
// X：倒计时(剩余字数)，剩余<60变黄，<20变红
// 其他：已输入/上限
updateCharCount(platform, charLimit)

// 配置对象（可直接移植到移动端）
platformMockConfigs = {
  x: { windowClass, charLimit:280, ... },
  xiaohongshu: { windowClass, charLimit:1000, ... },
  ...
}
```

---

## 10. 部署与环境配置

### 10.1 线上环境

| 服务 | URL | 托管平台 | 账号 |
|------|-----|---------|------|
| 主站 | https://x.banana.school | Vercel | team_calleZxNrMqEshvTET0TK8rU |
| AI Worker | https://ai.qdd.app | CF Workers 主账号 | 07728da33c7e188b00a80f1462376afc |
| 热点 API | https://x.banana.school/api/hot-topics | Vercel Serverless | 同主站 |

### 10.2 本地开发

```bash
# 启动本地预览服务器
cd "/Users/mac/Documents/New project"
python3 -m http.server 4173
# 访问: http://localhost:4173

# 或使用 launch.json 预设
# .claude/launch.json 已配置
```

### 10.3 部署命令

```bash
# 前端（自动触发：git push origin main）
vercel --prod --yes

# AI Worker
cd ai-worker
wrangler deploy

# 查看部署状态
vercel ls --team=team_calleZxNrMqEshvTET0TK8rU
```

### 10.4 Git 仓库

```
仓库：https://github.com/upgiorgio/AiX
分支：main（生产）
最新提交：d2734d7 — feat(card-suite): 平台仿真发帖窗口系统 v1.0
自动部署：push main → Vercel CI/CD → x.banana.school
```

### 10.5 CSS 版本号规范

所有 HTML 文件通过 query string 控制缓存：
```
common.css?v=YYYYMMDD-N
common.js?v=YYYYMMDD-N
ai-gateway.js?v=YYYYMMDD-N
```
**每次修改对应文件后，必须同步更新引用该文件的 HTML 版本号。**

---

## 11. 移动端扩展路线图

> 详见：`docs/MOBILE_EXPANSION.md`

### 11.1 可直接复用的资产

| 资产类型 | 可复用内容 | 移植方式 |
|---------|---------|---------|
| **AI 后端** | Worker API 完整可用（CORS已开放） | 直接用 URLSession/Retrofit/wx.request 调用 |
| **平台配置** | `platformMockConfigs` 对象（6平台参数） | 迁移为 Swift struct / Kotlin data class / JSON |
| **卡片模板** | 18套模板色彩/字体参数 | 迁移为颜色表+渐变配置 |
| **数据 Schema** | localStorage key/value 结构 | 迁移为 SQLite 表结构 |
| **AI Prompt** | 全部 prompt 模板（scenarioGuides等） | 直接复制到移动端常量文件 |
| **品牌色** | 6套平台品牌色变量 | 迁移为颜色常量 |

### 11.2 三端扩展优先级建议

```
Phase 1 (NOW): iOS App
  → SwiftUI 重写UI · 调用 Worker API · Core Data 存草稿
  → 重点功能：文案工场 + 卡片设计器(WKWebView渲染) + 发布中心

Phase 2 (Q2): 微信小程序
  → uni-app 框架 · 共享逻辑代码 · wx.request 调用 Worker API
  → 重点功能：文案工场 + 快速发布

Phase 3 (Q3): Android APK
  → Kotlin + Jetpack Compose · Retrofit 调用 API · Room DB
  → 与 iOS 功能对齐
```

---

## 12. 快速开发速查表

### 新增一个工具页面

```
1. 复制 copy-studio.html 为 new-tool.html
2. 修改 <title> 和 topbar 内容
3. 引入相同脚本：
   <script src="/card-suite/common.js?v=..."></script>
   <script src="/card-suite/ai-gateway.js?v=..."></script>
   <script src="/card-suite/new-tool.js?v=..."></script>
4. 创建 new-tool.js，使用 window.AiGateway.stream() 调用 AI
5. 在 index.html 套件首页添加入口卡片
```

### 调用 AI 生成（标准模式）

```javascript
async function myAIFeature() {
  const prompt = "你的提示词";
  const textarea = document.getElementById("myOutput");
  const handler = window.AiGateway.streamIntoEl(textarea);

  await window.AiGateway.stream(prompt, {
    system: "你是专业的...",
    ...handler
  });
}
```

### 添加新平台支持

```javascript
// 1. 在 platformMockConfigs 添加新平台配置
// 2. 在 common.css 添加 .pmw-新平台 样式
// 3. 在 ptab-bar HTML 添加新标签按钮
// 4. 更新 platformTone 对象（文案风格指南）
```

### 添加新卡片模板

```css
/* 1. 在 common.css 末尾添加 */
.template-s { /* 新模板 */ }

/* 2. 在 card-designer.js 的模板配置数组中追加 */
{ id: "template-s", name: "新模板名", desc: "..." }
```

---

*文档由小C（Claude Agent）自动生成 · 如有代码变更请同步更新本文件*
