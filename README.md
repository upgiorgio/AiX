# X Articles Studio

一个可部署在 GitHub + Vercel 的轻量级 Web 工具，帮助你快速完成：

- X Articles 选题与结构化写作
- 标题与开头钩子生成
- Thread 自动拆分（5-12 条）
- 72 小时时间轴分发计划
- 订阅变现文案与链接
- 内容质量评分（实时，7 维度）
- 发布前 3 分钟自检（v2）
- 草稿本地保存 / 读取 / 历史版本回溯 / Markdown 导出
- 一键填充示例 + 快捷键（`Cmd/Ctrl + S` 保存，`Cmd/Ctrl + Enter` 生成）
- 多平台分类适配（X / 公众号 / 知乎 / 哔哩哔哩 / 小红书）
- 基于 X 草稿共享改写 + 平台审核风险提醒 + 官方规则速查
- 常见高风险表达命中提示（按平台给替换建议）
- 规则速查支持“平台 + 分类”筛选（官方规则 / 填写技巧 / 案例 / 审核敏感词 / X&GitHub 分享）
- 全局项目索引技能命令面板（便于每个新项目自动入库）
- XCreators 近 30 天策略补充信号面板（官方 X + 镜像来源分层标注）
- 热点话题雷达（过去 48 小时 / 最近一周）：X 中文话题、公众号热门话题、小红书热门话题（可接自定义 API）

## 本地预览

```bash
cd "/Users/mac/Documents/New project"
python3 -m http.server 4173
```

打开 `http://localhost:4173`。

## 部署到 GitHub

```bash
git init
git add .
git commit -m "feat: add X Articles Studio"
git branch -M main
git remote add origin https://github.com/<your-name>/<repo>.git
git push -u origin main
```

## 部署到 Vercel

### 方式 A：Vercel 控制台（推荐）

1. 登录 [Vercel](https://vercel.com)
2. 点击 `Add New...` -> `Project`
3. 导入你的 GitHub 仓库
4. Framework 选 `Other`
5. 保持默认设置并点击 `Deploy`

### 方式 B：Vercel CLI

```bash
npm i -g vercel
vercel login
vercel --prod
```

## 使用说明

1. 填写主题、目标人群、核心观点、读后动作等输入（或先点 `填充示例`）。
2. 点击 `生成整套内容`，查看标题、钩子、文章草稿、Thread、时间轴和订阅文案。
3. 观察 `内容质量评分` 面板，根据建议优先优化低分项。
4. 在 `多平台适配工作台` 勾选目标平台，一键生成对应改写版本和审核提示。
5. 使用 `全局项目索引与技能自动化` 区域一键复制命令，维护项目总索引。
6. 在 `官方规则与案例速查` 里按平台和分类筛选资料，并查看敏感表达速览。
7. 在 `XCreators 近 30 天补充信号` 查看近期官方方向，更新你的发布策略。
8. 在 `热点话题雷达` 切换时间窗口并刷新，查看各平台 Top 10。
9. 在文章草稿区微调后复制或导出 Markdown。
10. 使用 `打开 X 发预热帖 / Thread / 订阅引导帖` 快速进入发布流程。
11. 发布前完成自检，发布后保存草稿，必要时从 `草稿历史版本` 回溯。

## 技术说明

- 纯前端静态站点（HTML/CSS/Vanilla JS）
- 含 Vercel Serverless API（`/api/hot-topics`）用于热点聚合
- PWA 支持（manifest + service worker）
- 无后端依赖，适合快速部署与长期维护

## 热点 API 可选环境变量

> 默认可用：X（trends24 解析）、公众号（Sogou 热词快照）  
> 小红书建议接入你自己的合规数据源

- `HOT_X_ENDPOINT` / `HOT_X_TOKEN` / `HOT_X_AUTH_HEADER`
- `HOT_WECHAT_ENDPOINT` / `HOT_WECHAT_TOKEN` / `HOT_WECHAT_AUTH_HEADER`
- `HOT_XHS_ENDPOINT` / `HOT_XHS_TOKEN` / `HOT_XHS_AUTH_HEADER`

## 全局技能（Codex）

- `project-indexer`：把每个项目写入 `~/.codex/project-index`，支持快速检索。
- `x-articles-growth`：按 X 官方创作者方法生成长文、Thread、分发与订阅方案。
- `multiplatform-content-ops`：将同一 X 草稿适配到公众号/知乎/B站/小红书，并输出合规风险提醒。
