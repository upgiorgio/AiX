/* ── Content Calendar ── */
const CALENDAR_KEY = 'aix-content-calendar-v1';
const $ = id => document.getElementById(id);

const TYPE_COLORS = {
  '干货': '#2cb5e9', '观点': '#f59e5b', '故事': '#a78bfa',
  '互动': '#34d399', '宣传': '#fb7185', '教程': '#06b6d4',
  '复盘': '#8b5cf6', '热点': '#f43f5e'
};

let calendarData = [];

async function generateCalendar() {
  const niche = $('calNiche')?.value.trim() || 'AI工具博主';
  const vertical = $('calVertical')?.value.trim() || 'AI效率工具';
  const freq = $('calFreq')?.value || '每天2条';
  const statusEl = $('calStatus');
  const gridEl = $('calGrid');
  if (statusEl) statusEl.textContent = '⏳ AI 规划30天内容中（约20秒）…';
  gridEl.innerHTML = '';
  calendarData = [];

  const prompt = `你是内容运营专家，请为以下账号规划30天内容日历。
账号定位：${niche}
内容方向：${vertical}
发布频率：${freq}

请输出30行，每行格式固定为：
第N天 | 内容标题 | 类型 | 平台

规则：
- N从1到30
- 类型只能是：干货/观点/故事/互动/宣传/教程/复盘/热点
- 平台：小红书/X/视频号/B站/公众号/全平台 之一
- 标题要有吸引力，20字以内
- 内容类型要多样，干货和互动穿插
只输出30行内容，不要任何前缀、标题或解释。`;

  let rawLines = [];
  let buffer = '';

  await window.AiGateway.stream(prompt, {
    onChunk(chunk) {
      buffer += chunk;
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';
      lines.forEach(line => {
        if (line.trim()) {
          rawLines.push(line.trim());
          renderCalendarPartial(rawLines);
          if (statusEl) statusEl.textContent = `⏳ 规划中… ${rawLines.length}/30天`;
        }
      });
    },
    onDone() {
      if (buffer.trim()) { rawLines.push(buffer.trim()); }
      calendarData = rawLines;
      renderCalendar(rawLines);
      saveCalendar(rawLines, niche, vertical, freq);
      if (statusEl) { statusEl.textContent = '✅ 30天内容日历已生成！'; setTimeout(() => statusEl.textContent = '', 3000); }
      const actionsEl = $('calActions');
      if (actionsEl) actionsEl.style.display = 'flex';
    },
    onError(e) {
      if (statusEl) statusEl.textContent = '❌ 生成失败: ' + e.message;
    }
  });
}

function parseLine(line, idx) {
  const parts = line.split('|').map(s => s.trim());
  return {
    day: parts[0] || `第${idx+1}天`,
    title: parts[1] || line,
    type: parts[2] || '干货',
    platform: parts[3] || ''
  };
}

function renderCalendarPartial(lines) {
  const gridEl = $('calGrid');
  if (!gridEl) return;
  gridEl.innerHTML = `<div class="cal-grid">${
    lines.map((line, i) => renderCell(parseLine(line, i))).join('')
  }</div>`;
}

function renderCalendar(lines) {
  renderCalendarPartial(lines.slice(0, 30));
}

function renderCell({ day, title, type, platform }) {
  const color = TYPE_COLORS[type] || '#64748b';
  return `<div class="cal-cell" style="border-top:3px solid ${color};">
    <div style="font-size:0.72rem;color:var(--muted);margin-bottom:3px;">${day}</div>
    <div style="font-size:0.82rem;font-weight:600;line-height:1.35;margin-bottom:5px;">${title}</div>
    <div style="font-size:0.72rem;display:flex;flex-wrap:wrap;gap:3px;">
      <span style="background:${color}22;color:${color};padding:1px 6px;border-radius:4px;">${type}</span>
      ${platform ? `<span style="color:var(--muted);">${platform}</span>` : ''}
    </div>
  </div>`;
}

function saveCalendar(lines, niche, vertical, freq) {
  try {
    localStorage.setItem(CALENDAR_KEY, JSON.stringify({ lines, niche, vertical, freq, savedAt: Date.now() }));
  } catch(e) {}
}

function loadCalendar() {
  try {
    const data = JSON.parse(localStorage.getItem(CALENDAR_KEY) || 'null');
    if (!data?.lines?.length) return;
    if ($('calNiche') && data.niche) $('calNiche').value = data.niche;
    if ($('calVertical') && data.vertical) $('calVertical').value = data.vertical;
    if ($('calFreq') && data.freq) $('calFreq').value = data.freq;
    calendarData = data.lines;
    renderCalendar(data.lines);
    const actionsEl = $('calActions');
    if (actionsEl && data.lines.length) actionsEl.style.display = 'flex';
  } catch(e) {}
}

function downloadCalendar() {
  if (!calendarData.length) { showToast('请先生成日历'); return; }
  const niche = $('calNiche')?.value || '';
  const md = [`# 30天内容日历\n\n**账号定位：** ${niche}\n\n| 天数 | 内容标题 | 类型 | 平台 |\n|------|--------|------|------|`]
    .concat(calendarData.slice(0, 30).map(line => {
      const { day, title, type, platform } = parseLine(line, 0);
      return `| ${day} | ${title} | ${type} | ${platform} |`;
    })).join('\n');
  downloadFile(`content-calendar-${nowTag()}.md`, md, 'text/markdown;charset=utf-8');
}

function clearCalendar() {
  const gridEl = $('calGrid');
  if (gridEl) gridEl.innerHTML = '';
  calendarData = [];
  const actionsEl = $('calActions');
  if (actionsEl) actionsEl.style.display = 'none';
  try { localStorage.removeItem(CALENDAR_KEY); } catch(e) {}
}

window.addEventListener('DOMContentLoaded', () => {
  loadCalendar();
  $('genCalBtn')?.addEventListener('click', generateCalendar);
  $('clearCalBtn')?.addEventListener('click', clearCalendar);
  $('downloadCalBtn')?.addEventListener('click', downloadCalendar);
});
