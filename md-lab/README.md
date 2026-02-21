# AiX Markdown 排版工坊

独立目录：`/md-lab`

这个模块用于对主工具生成的文章进行二次排版与二次创作，参考了 [doocs/md](https://github.com/doocs/md) 的「Markdown -> 图文排版」产品思路，并结合 AiX 的多平台内容运营场景做了轻量化改造。

## 主要能力

- 从主工具草稿（`x-articles-studio-draft`）一键导入
- 公众号 / 博客 / 知乎 / 小红书 / B站专栏排版预设
- 主题风格、主色、字号、行高、内容宽度可调
- 公众号外链转底部引用（可开关）
- 图片卡片化（可开关）
- 导出与复制：Markdown、HTML、富文本
- 自动生成二次创作提示词（结构强化/故事化/平台复用）

## 文件结构

- `md-lab/index.html`: 工坊页面结构
- `md-lab/styles.css`: 工坊视觉与排版样式
- `md-lab/app.js`: 渲染逻辑、导入导出、二创提示词逻辑
