/* ── Prompt Lab ── */
const PROMPTS_KEY = 'aix-prompt-lab-v1';
const $ = id => document.getElementById(id);

const BUILTIN_PROMPTS = [
  {
    id: 'xhs-title', title: '小红书爆款标题生成器', category: 'copy', builtin: true,
    desc: '为任意主题生成10个高点击率小红书标题',
    text: `请为以下主题生成10个小红书爆款标题，要求：
1. 包含数字（如：3个/7天/90%）
2. 制造紧迫感或好奇心
3. 符合小红书用户的语言习惯
4. 每个标题附带一句适合的副标题

主题：[在此填写你的主题]`
  },
  {
    id: 'x-hook', title: 'X Thread 钩子开头', category: 'copy', builtin: true,
    desc: '生成高互动率的X长推文钩子首句',
    text: `请为以下主题生成5个X Thread的开头句（Hook），要求：
1. 第一句话就能让人停下来
2. 制造信息缺口或强烈共鸣
3. 语言简洁有力，英文风格
4. 每个Hook后附中文说明其心理原理

主题：[在此填写你的主题]`
  },
  {
    id: 'wechat-cover', title: '公众号封面文案', category: 'copy', builtin: true,
    desc: '生成高点击率的公众号封面标题和副标题',
    text: `请为以下主题生成5套公众号封面文案组合（标题+副标题），要求：
- 标题：15字以内，明确价值主张
- 副标题：20字以内，补充说明
- 避免标题党，保持可信度
- 适合25-45岁职场读者

主题：[在此填写你的主题]`
  },
  {
    id: 'competitor', title: '竞品分析框架', category: 'strategy', builtin: true,
    desc: '生成系统化的竞品分析报告',
    text: `请对以下产品/品牌进行竞品分析，输出结构化报告：

1. 产品定位（一句话描述）
2. 目标用户画像
3. 核心功能对比（表格）
4. 定价策略分析
5. 增长策略推断
6. 优势 vs 劣势
7. 可借鉴的策略点

分析对象：[在此填写竞品名称]`
  },
  {
    id: 'account-positioning', title: '账号定位梳理', category: 'strategy', builtin: true,
    desc: '帮助梳理个人IP/账号的清晰定位',
    text: `请帮我梳理以下信息的账号定位：

我的背景：[填写你的专业背景/经验]
我的优势：[填写你擅长的领域]
目标受众：[填写你想影响的群体]
变现方向：[知识付费/广告/带货/咨询等]

请输出：
1. 账号定位一句话
2. 内容方向（3-5个核心话题）
3. 差异化竞争点
4. 内容矩阵建议（比例分配）
5. 前30天起号策略`
  },
  {
    id: 'content-review', title: '内容复盘分析', category: 'analysis', builtin: true,
    desc: 'AI辅助进行内容效果复盘',
    text: `请帮我分析以下内容数据并给出优化建议：

内容主题：[填写]
发布平台：[填写]
数据表现：阅读量[X] 点赞[X] 评论[X] 转发[X] 收藏[X]
内容摘要：[填写内容要点]

请分析：
1. 数据表现综合评分（1-10）
2. 爆款/低迷的原因分析
3. 用户互动点分析
4. 具体优化建议（3条）
5. 下次创作的改进方向`
  },
  {
    id: 'audience-analysis', title: '受众画像分析', category: 'analysis', builtin: true,
    desc: '生成详细的目标受众画像',
    text: `请为以下内容/产品生成详细的目标受众画像：

内容/产品描述：[填写你的内容或产品]

请输出：
1. 核心用户画像（年龄、职业、痛点）
2. 次要用户画像
3. 用户使用场景（3个典型场景）
4. 用户决策因素
5. 内容触达渠道建议
6. 触动用户的关键词库（20个）`
  },
  {
    id: 'story-copy', title: '故事感文案创作', category: 'creative', builtin: true,
    desc: '用故事化手法创作有温度的文案',
    text: `请为以下主题创作一篇故事感文案，要求：
- 用第一人称，真实感强
- 开头直接进入场景（不要废话）
- 有情绪弧度（困境→转折→结果）
- 结尾升华主题，引发共鸣
- 400字左右，适合小红书/公众号

主题/产品：[填写]
核心信息：[想传递的关键信息]`
  },
  {
    id: 'quote-extract', title: '金句提炼器', category: 'creative', builtin: true,
    desc: '从长文中提炼高传播性金句',
    text: `请从以下文章/内容中提炼10句金句，要求：
1. 可独立传播（不需要上下文也能理解）
2. 有冲击力，适合做卡片或发X
3. 包含不同风格：犀利型、温暖型、洞察型
4. 每句附上适合的发布平台建议

原文内容：
[在此粘贴你的文章或内容]`
  },
  {
    id: 'viral-rewrite', title: '爆款改写助手', category: 'copy', builtin: true,
    desc: '将普通文案改写成更有传播力的版本',
    text: `请将以下内容改写为更有传播力的版本：

原文：[在此粘贴原文]

改写要求：
- 风格：[选择：小红书种草/X短推/公众号/知乎/B站]
- 目标：提高点击率和互动率
- 保留核心信息，但让它更吸引人
- 输出3个不同角度的改写版本
- 每个版本附一句说明其改写策略`
  }
];

let currentFilter = 'all';
let customPrompts = [];
let currentOutput = '';

function loadCustomPrompts() {
  try {
    customPrompts = JSON.parse(localStorage.getItem(PROMPTS_KEY) || '[]');
  } catch(e) { customPrompts = []; }
}

function saveCustomPrompt() {
  const title = $('customPromptTitle')?.value.trim();
  const text = $('customPromptText')?.value.trim();
  const cat = $('customPromptCat')?.value || 'custom';
  if (!title || !text) { showToast('请填写名称和提示词内容'); return; }
  const prompt = { id: `custom-${Date.now()}`, title, category: cat, text, builtin: false, desc: '' };
  customPrompts.unshift(prompt);
  try { localStorage.setItem(PROMPTS_KEY, JSON.stringify(customPrompts)); } catch(e) {}
  $('customPromptTitle').value = '';
  $('customPromptText').value = '';
  renderLibrary(currentFilter);
  showToast('提示词已保存！');
}

function getAllPrompts() {
  return [...BUILTIN_PROMPTS, ...customPrompts];
}

function renderLibrary(filter = 'all') {
  currentFilter = filter;
  const container = $('promptLibrary');
  if (!container) return;
  const all = getAllPrompts();
  const filtered = filter === 'all' ? all : all.filter(p => p.category === filter);

  const catLabels = { copy:'文案', strategy:'策略', analysis:'分析', creative:'创作', custom:'自定义' };

  container.innerHTML = filtered.map(p => `
    <div class="prompt-card" data-id="${p.id}">
      <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:8px;margin-bottom:4px;">
        <div style="font-weight:600;font-size:0.9rem;">${p.title}</div>
        <span class="prompt-card-tag">${catLabels[p.category] || p.category}</span>
      </div>
      ${p.desc ? `<div style="font-size:0.8rem;color:var(--muted);margin-bottom:6px;">${p.desc}</div>` : ''}
      <div class="actions" style="margin:0;gap:6px;">
        <button class="btn btn-primary" data-use="${p.id}">使用</button>
        ${!p.builtin ? `<button class="btn" data-delete="${p.id}" style="color:#fb7185;">删除</button>` : ''}
      </div>
    </div>
  `).join('') || '<p class="muted">该分类暂无提示词</p>';

  // Wire use buttons
  container.querySelectorAll('[data-use]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.use;
      const p = getAllPrompts().find(x => x.id === id);
      if (p && $('testPromptText')) {
        $('testPromptText').value = p.text;
        $('testPromptText').scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  });
  // Wire delete buttons
  container.querySelectorAll('[data-delete]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.delete;
      customPrompts = customPrompts.filter(p => p.id !== id);
      try { localStorage.setItem(PROMPTS_KEY, JSON.stringify(customPrompts)); } catch(e) {}
      renderLibrary(currentFilter);
    });
  });
}

async function runPrompt() {
  const prompt = $('testPromptText')?.value.trim();
  if (!prompt) { showToast('请先输入提示词'); return; }
  const context = $('testContext')?.value.trim();
  const finalPrompt = context ? `${prompt}\n\n上下文补充：${context}` : prompt;
  const outputEl = $('testOutput');
  const statusEl = $('runStatus');
  if (outputEl) outputEl.textContent = '';
  if (statusEl) statusEl.textContent = '⏳ 运行中…';
  currentOutput = '';
  let full = '';
  await window.AiGateway.stream(finalPrompt, {
    onChunk(chunk) {
      full += chunk;
      if (outputEl) outputEl.textContent = full + '▋';
    },
    onDone() {
      currentOutput = full;
      if (outputEl) outputEl.textContent = full;
      if (statusEl) { statusEl.textContent = '✅ 完成'; setTimeout(() => statusEl.textContent = '', 2000); }
    },
    onError(e) {
      if (statusEl) statusEl.textContent = '❌ 运行失败: ' + e.message;
    }
  });
}

window.addEventListener('DOMContentLoaded', () => {
  loadCustomPrompts();
  renderLibrary('all');

  // Filter tab buttons
  document.querySelectorAll('[data-cat]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-cat]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderLibrary(btn.dataset.cat);
    });
  });

  $('savePromptBtn')?.addEventListener('click', saveCustomPrompt);
  $('runPromptBtn')?.addEventListener('click', runPrompt);
  $('clearTestBtn')?.addEventListener('click', () => {
    if ($('testPromptText')) $('testPromptText').value = '';
    if ($('testOutput')) $('testOutput').textContent = '';
    if ($('testContext')) $('testContext').value = '';
    currentOutput = '';
  });
  $('copyResultBtn')?.addEventListener('click', () => {
    if (!currentOutput) { showToast('暂无结果可复制'); return; }
    copyText(currentOutput, 'AI输出已复制');
  });
});
