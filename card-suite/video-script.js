/* ── Video Script Studio ── */
const $ = id => document.getElementById(id);

const platformTone = {
  douyin:    { name: '抖音', tone: '活泼轻松、节奏感强、制造共鸣或情绪波动', audience: '大众用户' },
  shipinhao: { name: '视频号', tone: '真实感强、情感共鸣、适合中年用户、接地气', audience: '25-45岁中国用户' },
  bilibili:  { name: 'B站', tone: '专业干货、知识感、适当幽默、弹幕互动引导', audience: '年轻知识型用户' },
  youtube:   { name: 'YouTube', tone: '国际化、清晰易懂、价值驱动、Hook明确', audience: '全球英语用户（请用英文生成内容）' }
};

const hookTypeDesc = {
  pain:      '痛点型 —— 直击用户最大困扰，让用户感到"说的就是我！"',
  curious:   '好奇型 —— 制造信息缺口，让用户迫不及待想看下去',
  authority: '权威型 —— 用数据、资质或结果引发信任，"xx人已用这个方法"',
  story:     '故事型 —— 以个人经历或具体场景开场，情感代入',
  number:    '数字型 —— 精准数字制造冲击感，"3步/7天/90%的人不知道"'
};

const durationGuide = {
  15: '结构：钩子（3秒）+ 核心1个要点（10秒）+ CTA（2秒）。极度精简，每秒都关键。',
  30: '结构：钩子（5秒）+ 核心2个要点（20秒）+ CTA（5秒）。节奏紧凑，信息密度高。',
  60: '结构：钩子（8秒）+ 核心3-4个要点（42秒，每点约10秒）+ CTA（10秒）。完整论述。',
  180: '结构：钩子（15秒）+ 5个核心要点（各20秒，共100秒）+ 总结+CTA（35秒）。可深度展开。'
};

async function generateScript() {
  const platform = $('scriptPlatform')?.value || 'douyin';
  const duration = parseInt($('scriptDuration')?.value || '60');
  const hookType = $('hookType')?.value || 'pain';
  const topic = $('scriptTopic')?.value.trim() || '如何提升内容产能';
  const audience = $('scriptAudience')?.value.trim() || '内容创作者';
  const points = $('scriptPoints')?.value.trim() || '';
  const statusEl = $('scriptStatus');

  if (statusEl) statusEl.textContent = '⏳ AI 生成脚本中，约10-20秒…';

  // Clear outputs
  ['hookText','bodyText','ctaText','subsText'].forEach(id => {
    const el = $(id);
    if (el) el.value = '';
  });

  const p = platformTone[platform] || platformTone.douyin;
  const pointsList = points ? `\n核心卖点：\n${points}` : '';

  const prompt = `你是专业的短视频脚本创作者。请为以下需求生成完整的视频脚本。

平台：${p.name}（${p.audience}）
语气风格：${p.tone}
视频时长：${duration}秒
${durationGuide[duration] || ''}
钩子类型：${hookTypeDesc[hookType]}
主题：${topic}
目标受众：${audience}${pointsList}

请按以下格式输出（每部分用标记行分隔）：

[开场钩子]
（${duration <= 30 ? '3-5秒' : '5-8秒'}，${hookTypeDesc[hookType].split('——')[0]}风格，1-3句话，要让人在第一秒就停下来）

[核心内容]
（主体部分，按时长结构展开，具体可执行，用自然口语，可加上镜头提示）

[结尾CTA]
（引导互动：点赞/评论/关注/转发，1-2句话，真诚不刻意）

[字幕建议]
（3-5句关键帧字幕文字，用于视频封面或高亮字幕卡片）`;

  try {
    const raw = await window.AiGateway.generate(prompt);

    // Parse sections by markers
    const sections = {
      hook: extractSection(raw, '[开场钩子]', '[核心内容]'),
      body: extractSection(raw, '[核心内容]', '[结尾CTA]'),
      cta:  extractSection(raw, '[结尾CTA]', '[字幕建议]'),
      subs: extractSection(raw, '[字幕建议]', null)
    };

    if ($('hookText')) $('hookText').value = sections.hook || '（开场钩子未解析，请查看核心内容）';
    if ($('bodyText')) $('bodyText').value = sections.body || raw;
    if ($('ctaText'))  $('ctaText').value  = sections.cta  || '';
    if ($('subsText')) $('subsText').value  = sections.subs || '';

    if (statusEl) { statusEl.textContent = '✅ 脚本生成完成！'; setTimeout(() => statusEl.textContent = '', 3000); }
  } catch(e) {
    if (statusEl) statusEl.textContent = '❌ 生成失败: ' + e.message;
  }
}

function extractSection(text, startMarker, endMarker) {
  const start = text.indexOf(startMarker);
  if (start === -1) return '';
  const contentStart = start + startMarker.length;
  const end = endMarker ? text.indexOf(endMarker, contentStart) : text.length;
  return text.slice(contentStart, end === -1 ? text.length : end).trim();
}

function copyScript() {
  const parts = [
    $('hookText')?.value, $('bodyText')?.value,
    $('ctaText')?.value, $('subsText')?.value
  ].filter(Boolean);
  if (!parts.length) { showToast('请先生成脚本'); return; }
  const full = [
    '# 视频脚本\n',
    '## 开场钩子\n' + ($('hookText')?.value || ''),
    '## 核心内容\n' + ($('bodyText')?.value || ''),
    '## 结尾CTA\n' + ($('ctaText')?.value || ''),
    '## 字幕建议\n' + ($('subsText')?.value || '')
  ].join('\n\n');
  copyText(full, '全部脚本已复制');
}

function downloadScript() {
  const platform = $('scriptPlatform')?.value || 'video';
  const topic = $('scriptTopic')?.value?.slice(0, 20) || 'script';
  const duration = $('scriptDuration')?.value || '60';
  const md = [
    `# 视频脚本｜${topic}`,
    `平台：${platformTone[platform]?.name || platform} · 时长：${duration}秒`,
    '',
    '## 🎣 开场钩子',
    $('hookText')?.value || '',
    '',
    '## 📝 核心内容',
    $('bodyText')?.value || '',
    '',
    '## 📢 结尾 CTA',
    $('ctaText')?.value || '',
    '',
    '## 📋 字幕建议',
    $('subsText')?.value || ''
  ].join('\n');
  downloadFile(`video-script-${nowTag()}.md`, md, 'text/markdown;charset=utf-8');
}

window.addEventListener('DOMContentLoaded', () => {
  $('generateScriptBtn')?.addEventListener('click', generateScript);
  $('copyScriptBtn')?.addEventListener('click', copyScript);
  $('downloadScriptBtn')?.addEventListener('click', downloadScript);
});
