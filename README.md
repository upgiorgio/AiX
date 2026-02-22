# X Articles Studio

> **一站式内容创作与发布工具套件** · 纯前端静态站点，可部署在 GitHub + Vercel

Live demo：[x.banana.school](https://x.banana.school) · 仓库：[upgiorgio/AiX](https://github.com/upgiorgio/AiX)

---

## 功能一览

### 🖊 主工作台（`/`）

| 模块 | 功能描述 |
|------|---------|
| 内容生成 | X Articles 选题、结构化写作、标题与开头钩子生成 |
| Thread 拆分 | 自动拆分为 5–12 条 Thread |
| 时间轴分发 | 72 小时多平台分发计划 |
| 订阅变现 | 订阅引导文案与链接模板 |
| 质量评分 | 实时 7 维度内容质量评分 |
| 发布自检 | 发布前 3 分钟 v2 自检清单 |
| 多平台适配 | X / 公众号 / 知乎 / 哔哩哔哩 / 小红书 一键改写 + 合规风险提醒 |
| 平台规则速查 | 官方规则 / 填写技巧 / 案例 / 审核敏感词 · 支持「平台 + 分类」筛选 |
| XCreators 信号 | 近 30 天官方策略补充信号（分层标注来源） |
| 热点话题雷达 | 过去 48 小时 / 最近一周 · X 中文 / 公众号 / 小红书 Top 10 |
| 竞品审计 | Typefully / Tweet Hunter / Hypefury / Buffer / Metricool 5 大对比面板 |
| 草稿管理 | 本地保存 / 读取 / 历史版本回溯 / Markdown 导出 |

### 📝 Markdown 排版工坊（`/md-lab`）

- 参考 doocs/md 思路二次创作
- 支持公众号 / 博客 / 知乎等长文排版
- 导出富文本 / HTML / Markdown
- 一键读取主工作台草稿

### 🃏 文案卡片套件（`/card-suite`）

| 页面 | 路径 | 功能 |
|------|------|------|
| 套件首页 | `/card-suite/` | 套件导航与快速入口 |
| 文案工场 | `/card-suite/copy-studio.html` | AI 文案生成与草稿管理 |
| **卡片设计引擎** | `/card-suite/card-designer.html` | 18 套模板 · 多平台尺寸 · 长文拆分 · PNG 导出 |
| 发布中心 | `/card-suite/publish-hub.html` | 批量卡片管理与发布输出 |

---

## 🎨 卡片设计引擎 · 18 套视觉模板

卡片设计引擎提供 **18 套精心调校的视觉模板**，覆盖深色、浅色、自然与专业四大风格，适配多种内容调性。

### 冷色系（6 套）

| 模板 ID | 名称 | 视觉风格 |
|---------|------|---------|
| `template-a` | **Aurora 极光蓝** | 深蓝渐变 · 冰蓝极光辉光 |
| `template-b` | **Void 深空** | 深邃宇宙黑 · 星点散射效果 |
| `template-h` | **Abyss 深渊** | 近黑深蓝 · 青色线条装饰 |
| `template-m` | **Aqua 海洋** | 深海蓝绿渐变 · 清透海洋感 |
| `template-p` | **Midnight 子夜** | 靛蓝径向渐变 · 深邃夜空 |
| `template-r` | **Storm 风暴** | 蓝灰色调 · 银色装饰线 |

### 暖色系（4 套）

| 模板 ID | 名称 | 视觉风格 |
|---------|------|---------|
| `template-d` | **Ember 琥珀橙** | 深橙渐变 · 琥珀温暖光感 |
| `template-e` | **Blossom 樱花** | 玫红渐变 · 浪漫粉调 |
| `template-i` | **Dusk 暮色** | 暗紫橙渐变 · 黄昏晚霞 |
| `template-o` | **Coral 珊瑚红** | 深红珊瑚渐变 · 热情活力 |

### 自然系（3 套）

| 模板 ID | 名称 | 视觉风格 |
|---------|------|---------|
| `template-c` | **Sage 苍翠** | 深绿渐变 · 森林苍翠感 |
| `template-f` | **Nebula 星云紫** | 紫色径向星云 · 宇宙神秘感 |
| `template-q` | **Matcha 抹茶** | 深绿茶色 · 日式衬线字体 |

### 专业系（3 套）

| 模板 ID | 名称 | 视觉风格 |
|---------|------|---------|
| `template-j` | **Cyber 赛博** | 纯黑格栅底纹 · 霓虹绿标题 |
| `template-l` | **Noir 碳黑** | 极简全黑 · 细腻白色排版 |
| `template-n` | **Gold 烫金** | 深琥珀黑 · 金色渐变装饰 |

### 浅色系（2 套）

| 模板 ID | 名称 | 视觉风格 |
|---------|------|---------|
| `template-g` | **Paper 稿纸** | 浅灰白 · 横格纸纹路 · 深色文字 |
| `template-k` | **Latte 拿铁** | 奶油暖白 · 衬线字体 · 咖啡棕文字 |

### 支持的平台尺寸

| 平台 | 尺寸 | 比例 | 单张最大字数 |
|------|------|------|------------|
| 小红书 | 1080 × 1440 | 3:4 | 120 字 |
| X（推特） | 1200 × 675 | 16:9 | 90 字 |
| 微信公众号封面 | 900 × 383 | 2.35:1 | 68 字 |
| 朋友圈 / 方图 | 1080 × 1080 | 1:1 | 100 字 |

---

## 🚀 快速开始

### 本地预览

```bash
cd "/Users/mac/Documents/New project"
python3 -m http.server 4173
```

打开 `http://localhost:4173`

### 典型工作流

1. **主工作台** → 填写主题与观点 → 生成内容套件（标题 + 文章 + Thread + 时间轴）
2. **质量评分** → 根据建议优化低分项
3. **多平台适配** → 一键生成各平台改写版本，查看合规提示
4. **Markdown 排版工坊** → `/md-lab` → 长文二次排版，导出 HTML / Markdown
5. **文案卡片套件** → `/card-suite` → 文案生成 → 选模板与尺寸 → 长文自动拆分为多张卡片 → PNG 导出 → 发布中心批量输出

---

## 📁 项目结构

```
/
├── index.html              # 主工作台
├── styles.css              # 主站样式
├── app.js                  # 主站逻辑
├── manifest.json           # PWA 配置
├── sw.js                   # Service Worker
│
├── md-lab/
│   ├── index.html          # Markdown 排版工坊
│   ├── md-lab.css
│   └── md-lab.js
│
├── card-suite/
│   ├── index.html          # 套件首页
│   ├── copy-studio.html    # 文案工场
│   ├── card-designer.html  # 卡片设计引擎（18 模板）
│   ├── publish-hub.html    # 发布中心
│   ├── common.css          # 套件共用样式（含 18 模板定义）
│   └── common.js           # 套件共用逻辑
│
└── api/
    └── hot-topics/         # Vercel Serverless 热点聚合 API
```

---

## 📦 部署

### 部署到 GitHub

```bash
git init
git add .
git commit -m "feat: initial commit"
git branch -M main
git remote add origin https://github.com/<your-name>/<repo>.git
git push -u origin main
```

### 部署到 Vercel（推荐）

**方式 A：Vercel 控制台**

1. 登录 [Vercel](https://vercel.com)
2. 点击 `Add New... → Project`
3. 导入 GitHub 仓库
4. Framework 选 `Other`，保持默认设置 → `Deploy`

**方式 B：Vercel CLI**

```bash
npm i -g vercel
vercel login
vercel --prod
```

---

## ⚙️ 热点 API 可选环境变量

热点话题雷达默认可用 X（trends24 解析）和公众号（Sogou 热词快照）。小红书建议接入自有合规数据源。

| 变量 | 说明 |
|------|------|
| `HOT_X_ENDPOINT` / `HOT_X_TOKEN` / `HOT_X_AUTH_HEADER` | X 热点自定义端点 |
| `HOT_WECHAT_ENDPOINT` / `HOT_WECHAT_TOKEN` / `HOT_WECHAT_AUTH_HEADER` | 公众号热点自定义端点 |
| `HOT_XHS_ENDPOINT` / `HOT_XHS_TOKEN` / `HOT_XHS_AUTH_HEADER` | 小红书热点自定义端点 |

---

## 🛠 技术说明

- **纯前端静态站点** — HTML / CSS / Vanilla JS，无框架依赖
- **Vercel Serverless API** — `/api/hot-topics` 用于热点聚合
- **PWA 支持** — manifest + Service Worker，可离线访问
- **html2canvas** — 卡片 PNG 导出（CDN 加载，按需使用）
- **Google Fonts** — Sora + Noto Sans SC 双字体，支持中英文
- **本地持久化** — localStorage 保存草稿、设计参数和卡片批次

---

## 🧩 全局技能（Codex）

| 技能 | 说明 |
|------|------|
| `project-indexer` | 把每个项目写入 `~/.codex/project-index`，支持快速检索 |
| `x-articles-growth` | 按 X 官方创作者方法生成长文、Thread、分发与订阅方案 |
| `multiplatform-content-ops` | 将同一 X 草稿适配到公众号/知乎/B站/小红书，并输出合规风险提醒 |

---

## 📄 License

MIT © 2026 X Articles Studio · Crafted by Giorgio
