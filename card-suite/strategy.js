function $(id) {
  return document.getElementById(id);
}

function row(cells) {
  return `<tr>${cells.map((cell) => `<td>${cell}</td>`).join("")}</tr>`;
}

const competitors = [
  ["流光卡片", "社媒文字卡片", "左编辑右预览", "Markdown + 批量 + API"],
  ["MD2Card", "Markdown知识卡片", "代码区+实时渲染", "长文自动拆分"],
  ["Memo Card", "书摘/备忘", "极简单页", "上手快"],
  ["Tnote.ai", "AI知识卡片", "AI布局 + 实时渲染", "多尺寸预设"],
  ["Canva", "图文设计", "模板拖拽", "模板生态丰富"],
  ["Jasper AI", "品牌营销文案", "文档式编辑", "品牌Voice训练"],
  ["Copy.ai", "GTM自动化", "聊天式+工具导航", "自动化流程"],
  ["Rytr", "轻量写作", "单页输入", "低学习成本"],
  ["QuillBot", "改写润色", "左右对照", "润色效率高"],
  ["Writesonic", "SEO内容", "分步引导", "落地页与SEO整合"]
];

const modes = [
  ["粘贴即用型", "内容已准备好，3分钟内完成模板切换+下载"],
  ["AI生成+渲染型", "Prompt后自动生成Markdown并渲染卡片"],
  ["批量自动化型", "CSV/JSON驱动，矩阵号规模化生产"],
  ["品牌定制型", "统一VI、团队协作、风格锁定"]
];

const pains = [
  ["模板太少，审美疲劳", 5, "普遍仅 5-20 套模板"],
  ["AI生成和卡片渲染分离", 5, "多数场景需跨工具操作"],
  ["批量生成效率低", 4, "有批量但门槛偏高"],
  ["手机端体验差", 4, "多数工具PC优先"],
  ["品牌定制能力弱", 3, "免费版常限制Logo/水印"],
  ["导出分辨率不足", 3, "多数仅屏幕分辨率"],
  ["发布流程割裂", 3, "需手动下载再上传"],
  ["历史资产管理差", 3, "刷新后内容丢失"]
];

const pricing = [
  ["Free", "¥0/月", "基础模板、每月100次AI、PNG导出、7天历史"],
  ["Pro", "¥29/月", "50+模板、无限AI、50张批量、300DPI、无限历史"],
  ["Team", "¥99/月/5人", "品牌资产库、协作、白标、API 1000次/月"],
  ["Enterprise", "定制", "私有化、无限API、SSO、SLA、专属模板开发"]
];

const tech = [
  ["前端", "Next.js 14 (App Router)", "SSR/SEO友好，Vercel部署顺滑"],
  ["卡片渲染", "React + Vanilla Extract", "可控复杂视觉效果"],
  ["图片生成", "satori + sharp", "比 puppeteer 轻量，更适合Serverless"],
  ["Markdown", "remark + rehype", "可扩展公式/图表插件链"],
  ["AI", "Claude / OpenAI", "长文质量高，风格控制灵活"],
  ["数据库", "Supabase", "上线快，认证和存储一体"],
  ["API网关", "Cloudflare Workers", "低延迟，适合限流与缓存"],
  ["部署", "Vercel + Supabase", "全球CDN + Serverless"]
];

const roadmap = [
  ["Phase 1 / MVP", "4周", "10模板、Markdown渲染、PNG导出、登录", "验证核心体验与冷启动"],
  ["Phase 2 / 增长", "6周", "AI写作、批量导入、20+模板、历史云端、插件", "提升留存与活跃"],
  ["Phase 3 / 商业化", "4周", "付费墙、品牌资产、开放API、Webhook", "MRR增长"],
  ["Phase 4 / 规模化", "持续", "模板市场、社媒直连、私有化、多语言", "扩展海外与企业客户"]
];

const oss = [
  ["streamer-card", "<a href='https://github.com/ygh3279799773/streamer-card' target='_blank' rel='noopener noreferrer'>github.com/ygh3279799773/streamer-card</a>", "Node.js 卡片API核心逻辑"],
  ["firefly_card_google", "<a href='https://github.com/someone1128/firefly_card_google' target='_blank' rel='noopener noreferrer'>github.com/someone1128/firefly_card_google</a>", "Chrome插件完整代码"],
  ["streamerCardAutomate", "<a href='https://github.com/someone1128/streamerCardAutomate' target='_blank' rel='noopener noreferrer'>github.com/someone1128/streamerCardAutomate</a>", "批量自动化脚本"],
  ["content-crafter-kit", "<a href='https://github.com/sunling/content-crafter-kit' target='_blank' rel='noopener noreferrer'>github.com/sunling/content-crafter-kit</a>", "封面图编辑器思路"],
  ["ppt-master", "<a href='https://github.com/hugohe3/ppt-master' target='_blank' rel='noopener noreferrer'>github.com/hugohe3/ppt-master</a>", "SVG多格式输出方案"]
];

function render() {
  $("competitorRows").innerHTML = competitors.map((item) => row(item)).join("");
  $("modeRows").innerHTML = modes.map((item) => row(item)).join("");
  $("painRows").innerHTML = pains
    .map(([pain, score, status]) => {
      const percent = Math.min(100, Math.max(0, score * 20));
      return row([
        pain,
        `<div class='severity'><div class='severity-bar'><div class='severity-fill' style='width:${percent}%'></div></div><small>${"★".repeat(score)}${"☆".repeat(5 - score)}</small></div>`,
        status
      ]);
    })
    .join("");
  $("pricingRows").innerHTML = pricing.map((item) => row(item)).join("");
  $("techRows").innerHTML = tech.map((item) => row(item)).join("");
  $("roadmapRows").innerHTML = roadmap.map((item) => row(item)).join("");
  $("ossRows").innerHTML = oss.map((item) => row(item)).join("");
}

window.addEventListener("DOMContentLoaded", render);
