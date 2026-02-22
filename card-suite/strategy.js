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

/* ── AI Content Matrix ── */
async function aiGenerateContentMatrix() {
  const niche = document.getElementById('aiNiche')?.value.trim() || 'AI工具创作者';
  const weekTopic = document.getElementById('aiWeekTopic')?.value.trim() || 'AI内容创作';
  const freq = document.getElementById('aiFreq')?.value || '每天2条';
  const statusEl = document.getElementById('aiMatrixStatus');
  const outputEl = document.getElementById('aiMatrixOutput');
  if (!outputEl) return;
  if (statusEl) statusEl.textContent = '⏳ AI 生成内容矩阵中（约15秒）…';
  outputEl.innerHTML = '';
  const prompt = `你是内容运营专家。请为以下账号生成30天内容矩阵计划。
账号定位：${niche}
本周核心话题：${weekTopic}
发布频率：${freq}
请以每天为单位列出30天计划，每天一行，格式固定为：
第N天 | 内容标题 | 类型 | 平台
类型只能是：干货/观点/故事/互动/宣传
平台建议如：小红书/X/视频号/B站/公众号
共30行，只输出内容，不要任何前缀或解释。`;
  let full = '';
  await window.AiGateway.stream(prompt, {
    onChunk(chunk) {
      full += chunk;
      const count = full.split('\n').filter(l => l.trim()).length;
      if (statusEl) statusEl.textContent = `⏳ 生成中… ${count}/30天`;
    },
    onDone() {
      if (statusEl) { statusEl.textContent = '✅ 30天矩阵已生成'; setTimeout(() => statusEl.textContent = '', 2500); }
      renderMatrixCalendar(full, outputEl);
    },
    onError(e) {
      if (statusEl) statusEl.textContent = '❌ 生成失败: ' + e.message;
    }
  });
}

function renderMatrixCalendar(rawText, container) {
  const lines = rawText.split('\n').filter(l => l.trim());
  const typeColors = {
    '干货': '#2cb5e9', '观点': '#f59e5b', '故事': '#a78bfa',
    '互动': '#34d399', '宣传': '#fb7185'
  };
  container.innerHTML = `<div class="cal-grid">${
    lines.slice(0, 30).map((line, i) => {
      const parts = line.split('|').map(s => s.trim());
      const day = parts[0] || `第${i+1}天`;
      const title = parts[1] || line;
      const type = parts[2] || '干货';
      const platform = parts[3] || '';
      const color = typeColors[type] || '#64748b';
      return `<div class="cal-cell" style="border-top:3px solid ${color};">
        <div style="font-size:0.72rem;color:var(--muted);margin-bottom:3px;">${day}</div>
        <div style="font-size:0.82rem;font-weight:600;line-height:1.35;margin-bottom:4px;">${title}</div>
        <div style="font-size:0.72rem;">
          <span style="background:${color}22;color:${color};padding:1px 5px;border-radius:4px;">${type}</span>
          ${platform ? `<span style="margin-left:4px;color:var(--muted);">${platform}</span>` : ''}
        </div>
      </div>`;
    }).join('')
  }</div>`;
  const exportBtn = document.createElement('button');
  exportBtn.className = 'btn';
  exportBtn.style.marginTop = '10px';
  exportBtn.textContent = '📥 下载内容矩阵 Markdown';
  exportBtn.onclick = () => {
    const niche = document.getElementById('aiNiche')?.value || '';
    const md = `# 30天内容矩阵\n\n**账号定位：** ${niche}\n\n${rawText}`;
    downloadFile(`content-matrix-${nowTag()}.md`, md, 'text/markdown;charset=utf-8');
  };
  container.appendChild(exportBtn);
}

window.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('aiMatrixBtn');
  if (btn) btn.addEventListener('click', aiGenerateContentMatrix);
});
