# X Articles Studio

一个可部署在 GitHub + Vercel 的轻量级 Web 工具，帮助你快速完成：

- X Articles 选题与结构化写作
- 标题与开头钩子生成
- Thread 自动拆分（5-12 条）
- 72 小时分发计划
- 订阅变现文案与链接
- 发布前 3 分钟自检（v2）
- 草稿本地保存 / 读取 / Markdown 导出

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

1. 填写主题、目标人群、核心观点、读后动作等输入。
2. 点击 `生成整套内容`。
3. 在文章草稿区微调内容后复制或导出 Markdown。
4. 使用 `打开 X 发预热帖 / Thread / 订阅引导帖` 快速进入发布流程。
5. 发布后在页面底部自检区与复盘区完成迭代。

## 技术说明

- 纯前端静态站点（HTML/CSS/Vanilla JS）
- PWA 支持（manifest + service worker）
- 无后端依赖，适合快速部署与长期维护
