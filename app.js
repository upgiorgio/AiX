const $ = (id) => document.getElementById(id);

const DRAFT_KEY = "x-articles-studio-draft";
const HISTORY_KEY = "x-articles-studio-history-v2";
const CHECKLIST_KEY = "x-article-checklist";
const MAX_HISTORY = 12;

const state = {
  titles: [],
  hooks: [],
  article: "",
  thread: [],
  plan: [],
  monetize: "",
  quality: null
};

const checklist = [
  {
    title: "A. 选题与定位",
    items: [
      "一个核心人群，一个核心问题",
      "只保留一个核心观点",
      "读后动作明确（评论/转发/收藏/订阅）"
    ]
  },
  {
    title: "B. 标题与开头",
    items: [
      "标题满足：具体 + 好奇 + 价值",
      "首段先给结论/冲突/代价",
      "封面图主题相关且移动端清晰"
    ]
  },
  {
    title: "C. 结构与可读性",
    items: [
      "段落大多 2-4 行",
      "每 3-5 段一个小标题",
      "高密度信息列表化",
      "每段只讲一个观点"
    ]
  },
  {
    title: "D. 证据与可信度",
    items: [
      "关键观点配至少一种证据",
      "事实与推断明确区分",
      "不可验证数据已删或标注假设"
    ]
  },
  {
    title: "E. 合规与风控",
    items: [
      "避免互刷和诱导式互动",
      "素材来源可追溯，原创归属清晰",
      "若参与活动，已核对当期资格和规则"
    ]
  },
  {
    title: "F. 72 小时分发",
    items: [
      "发布前 2-6 小时发预热帖",
      "发布后置顶 24-72 小时",
      "已拆 5-12 条 Thread 回流",
      "预留首波评论回复窗口"
    ]
  },
  {
    title: "G. 订阅变现",
    items: [
      "订阅价值说清楚",
      "免费与付费边界清晰",
      "文末有下一期预告"
    ]
  },
  {
    title: "H. 发布后复盘",
    items: [
      "记录 24h 与 72h 曝光与互动",
      "标记最有效的标题-开头组合",
      "下一篇只保留 1 个动作、删除 1 个动作"
    ]
  }
];

function safeParse(raw, fallback) {
  try {
    const parsed = JSON.parse(raw);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

function readInput() {
  return {
    topic: $("topic").value.trim() || "你的主题",
    audience: $("audience").value.trim() || "目标读者",
    thesis: $("thesis").value.trim() || "一个明确的核心观点",
    ctaGoal: $("ctaGoal").value.trim() || "执行你文章中的一个动作",
    tone: $("tone").value,
    username: $("username").value.trim().replace(/^@/, ""),
    evidence: $("evidence")
      .value.split("\n")
      .map((line) => line.replace(/^[-*]\s*/, "").trim())
      .filter(Boolean)
  };
}

function buildTitles(input) {
  const { topic, audience, thesis } = input;
  return [
    `为什么 90% 的人写不好「${topic}」，但你可以用这套方法直接超车`,
    `给 ${audience} 的 ${topic} 实战手册：从 0 到可复制增长`,
    `别再盲目发帖了：用「${thesis}」重构你的 X 内容策略`,
    `我用 72 小时把「${topic}」做成可增长系统，过程全拆开给你`,
    `关于 ${topic}，真正有效的不是努力，而是结构化执行`,
    `${audience} 最容易忽略的 3 个增长杠杆（第 2 个最关键）`,
    `把 ${topic} 做出结果：一篇长文 + 一条 Thread 的组合打法`,
    `你不需要更多技巧，你只需要这份 ${topic} 的发布清单`
  ];
}

function buildHooks(input) {
  return [
    `你以为 ${input.topic} 靠的是灵感，但真正拉开差距的是结构和节奏。`,
    `如果你还在凭感觉发布内容，你正在把本该属于你的增长机会拱手让人。`,
    `我把一套可复用的 ${input.topic} 流程跑了 30 天，结果比我预期更稳也更快。`
  ];
}

function buildArticle(input, titles, hooks) {
  const evidenceLines = input.evidence.length
    ? input.evidence.map((e, i) => `${i + 1}. ${e}`).join("\n")
    : "1. 在这里补充你的数据、案例或亲历证据\n2. 至少保留一个可验证的前后对比";

  return `# ${titles[0]}

**给谁看：** ${input.audience}

**核心观点：** ${input.thesis}

## 开场

${hooks[0]}

你不需要一次做对所有事。你只要把这篇文章读完，并执行后面的动作清单，就能开始看到变化。

## 为什么多数人做不出稳定结果

大部分人把重点放在“发了多少”，却忽略了“是否被推荐到正确人群的主页时间线”。

当你没有结构、没有证据、没有分发节奏时，内容再努力也很难持续放大。

## 一套可复制的执行框架

### 1) 先定义目标，而不是先写字

先写清楚三件事：谁是读者、核心判断是什么、读后动作是什么。

**没有目标的文章，通常只有信息，没有结果。**

### 2) 用标题和首段拿下前 8 秒

标题必须同时满足“具体 + 好奇 + 价值”。首段不要写背景，直接给结论或冲突。

### 3) 结构必须服务扫读

每段 2-4 行；每 3-5 段一个小标题；高密度信息列表化；每段一个观点。

### 4) 每个观点都要有证据

没有证据的观点只能叫观点，不叫说服力。你可以用数据、案例、亲历、前后对比。

## 证据示例（请替换为你的真实素材）

${evidenceLines}

## 发布与放大（72 小时）

- 发布前 2-6 小时：发预热帖，抛出问题或结果预告
- 发布后 0-2 小时：置顶 + 回复首波评论
- 发布后 6-24 小时：拆成 Thread 回流原文
- 发布后 24-72 小时：结合热点二次分发

## 结尾

如果你只做一件事，就先把这篇文章的框架照着跑一遍。

**行动建议：** ${input.ctaGoal}

你下一篇准备写什么主题？可以直接在评论区告诉我。`;
}

function splitPostAtBestPoint(text) {
  if (!text || text.length < 120) return [text, ""];

  const midpoint = Math.floor(text.length / 2);
  const delimiters = ["\n", "。", "！", "？", "；", "，", " "];

  let bestIndex = -1;
  let bestDistance = Infinity;

  for (let i = 0; i < text.length; i += 1) {
    if (!delimiters.includes(text[i])) continue;
    const distance = Math.abs(i - midpoint);
    if (distance < bestDistance) {
      bestDistance = distance;
      bestIndex = i;
    }
  }

  if (bestIndex < 30 || bestIndex > text.length - 30) {
    bestIndex = midpoint;
  }

  const left = text.slice(0, bestIndex + 1).trim();
  const right = text.slice(bestIndex + 1).trim();
  return [left, right];
}

function enforceThreadCount(thread, minPosts = 5, maxPosts = 12) {
  const posts = [...thread];
  let guard = 0;

  while (posts.length < minPosts && guard < 40) {
    let maxIndex = 0;
    for (let i = 1; i < posts.length; i += 1) {
      if (posts[i].length > posts[maxIndex].length) {
        maxIndex = i;
      }
    }

    const [left, right] = splitPostAtBestPoint(posts[maxIndex]);
    if (!right) break;

    posts.splice(maxIndex, 1, left, right);
    guard += 1;
  }

  return posts.slice(0, maxPosts);
}

function splitThread(article) {
  const paragraphs = article
    .replace(/^#\s+/m, "")
    .split("\n\n")
    .map((p) => p.trim())
    .filter(Boolean);

  const thread = [];
  let current = "";

  for (const para of paragraphs) {
    const next = current ? `${current}\n\n${para}` : para;
    if (next.length > 260 && current) {
      thread.push(current);
      current = para;
    } else {
      current = next;
    }
  }

  if (current) thread.push(current);
  return enforceThreadCount(thread, 5, 12);
}

function buildPlan(input) {
  return [
    `T-6h 至 T-2h：发预热帖，聚焦「${input.topic}」的痛点问题，收集首波反馈。`,
    "T+0h：发布文章并置顶，首条评论补充行动清单或资源链接。",
    "T+1h：重点回复首波高质量评论，放大可信互动信号。",
    "T+6h：发布 Thread 摘要并回流到文章原文。",
    "T+24h：复盘标题点击与阅读深度，微调封面和引导文案。",
    "T+48h：结合相关热点做二次分发，保持语义一致。",
    "T+72h：记录曝光与订阅转化，提炼下篇保留动作与删除动作。"
  ];
}

function buildMonetize(input) {
  const link = input.username
    ? `https://x.com/${input.username}/creator-subscriptions/subscribe`
    : "https://x.com/YOURUSERNAME/creator-subscriptions/subscribe";

  return `订阅价值（建议放在文末）：
- 每周一次深度拆解：从选题到分发的完整复盘
- 提前发布：下篇文章草稿提前 24 小时开放
- 专属问答：每周集中回答 3 个订阅者问题

软付费墙设计：
- 免费部分：方法框架 + 一个案例
- 订阅部分：完整模板、素材库、执行复盘表

下一期预告：
- 下周我会公开「标题 AB 测试 + 72 小时分发实录」

订阅引导链接：
${link}`;
}

function renderTitles(titles) {
  $("titlesOutput").innerHTML = titles.map((t) => `<li>${escapeHtml(t)}</li>`).join("");
}

function renderHooks(hooks) {
  $("hooksOutput").innerHTML = hooks.map((h) => `<li>${escapeHtml(h)}</li>`).join("");
}

function renderThread(posts) {
  if (!posts.length) {
    $("threadOutput").innerHTML = '<p class="muted">还没有生成 Thread。</p>';
    return;
  }

  $("threadOutput").innerHTML = posts
    .map(
      (post, i) => `
      <article class="thread-item">
        <div class="thread-head">
          <strong>Post ${i + 1}</strong>
          <span>${post.length}/280</span>
        </div>
        <p class="thread-text">${escapeHtml(post)}</p>
      </article>
    `
    )
    .join("");
}

function renderPlan(plan) {
  $("planOutput").innerHTML = plan
    .map((item, i) => {
      const matched = item.match(/^([^：:]+)[：:]\s*(.+)$/);
      const time = matched ? matched[1] : `Step ${i + 1}`;
      const text = matched ? matched[2] : item;
      return `<li class="timeline-item"><span class="timeline-badge">${escapeHtml(time)}</span><p>${escapeHtml(
        text
      )}</p></li>`;
    })
    .join("");
}

function getChecklistStats() {
  const all = document.querySelectorAll("input[type='checkbox'][data-key]");
  if (!all.length) {
    const total = checklist.reduce((sum, section) => sum + section.items.length, 0);
    return { checked: 0, total, ratio: 0 };
  }
  const checked = document.querySelectorAll("input[type='checkbox'][data-key]:checked").length;
  const total = all.length;
  return { checked, total, ratio: checked / total };
}

function calculateQuality(input) {
  const article = $("articleOutput").value.trim();
  const paragraphs = article
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

  const shortParagraphs = paragraphs.filter((p) => p.split("\n").length <= 4 && p.length <= 220).length;
  const subHeadingCount = (article.match(/^##\s+/gm) || []).length;
  const bulletCount = (article.match(/^\s*[-*]\s+/gm) || []).length;
  const checklistStats = getChecklistStats();

  const positioningScore = Math.round(
    [input.topic, input.audience, input.thesis, input.ctaGoal].filter((v) => Boolean(v && v.trim())).length * 3.75
  ); // /15

  const titleHookScore = Math.min(
    15,
    Math.round(
      (Math.min(state.titles.length, 6) / 6) * 9 +
        (Math.min(state.hooks.length, 3) / 3) * 4 +
        ((state.titles[0] || "").length >= 16 && (state.titles[0] || "").length <= 65 ? 2 : 0)
    )
  );

  const structureScore = Math.min(
    20,
    Math.round(
      Math.min(subHeadingCount, 5) * 2.4 +
        (paragraphs.length ? (shortParagraphs / paragraphs.length) * 8 : 0) +
        (bulletCount >= 3 ? 4 : bulletCount > 0 ? 2 : 0)
    )
  );

  const evidenceCount = input.evidence.length;
  const evidenceScore = evidenceCount >= 3 ? 15 : evidenceCount === 2 ? 11 : evidenceCount === 1 ? 6 : 0;

  let distributionScore = 0;
  if (state.thread.length >= 5 && state.thread.length <= 12) distributionScore += 8;
  else if (state.thread.length >= 3) distributionScore += 5;
  if (state.plan.length >= 6) distributionScore += 5;
  if ((state.thread[0] || "").length > 0 && (state.thread[0] || "").length <= 280) distributionScore += 2;
  distributionScore = Math.min(15, distributionScore);

  let monetizeScore = 0;
  if (input.username && input.username.trim()) monetizeScore += 3;
  if (state.monetize.includes("creator-subscriptions/subscribe")) monetizeScore += 4;
  if (/(下一期|下周)/.test(state.monetize)) monetizeScore += 3;
  monetizeScore = Math.min(10, monetizeScore);

  const executionScore = Math.round(checklistStats.ratio * 10);

  const metrics = [
    { name: "定位", score: positioningScore, max: 15 },
    { name: "标题钩子", score: titleHookScore, max: 15 },
    { name: "结构扫读", score: structureScore, max: 20 },
    { name: "证据力度", score: evidenceScore, max: 15 },
    { name: "分发准备", score: distributionScore, max: 15 },
    { name: "变现准备", score: monetizeScore, max: 10 },
    { name: "执行准备", score: executionScore, max: 10 }
  ];

  const total = metrics.reduce((sum, metric) => sum + metric.score, 0);

  const tips = [];
  if (positioningScore < 12) tips.push("补全“主题-人群-核心观点-读后动作”四要素，减少跑题风险。");
  if (titleHookScore < 11) tips.push("至少保留 5 个标题候选，并把首标题压到 16-65 字。");
  if (structureScore < 15) tips.push("增加小标题与列表，把段落尽量压缩到 2-4 行。");
  if (evidenceScore < 11) tips.push("至少准备 2-3 条可验证证据（数据、案例或前后对比）。");
  if (distributionScore < 12) tips.push("将 Thread 调整到 5-12 条，并确保 72h 节奏完整。");
  if (monetizeScore < 8) tips.push("补齐订阅链接、付费边界和下期预告。");
  if (executionScore < 6) tips.push("发布前先完成自检清单，避免执行断层。");
  if (!tips.length) tips.push("结构和执行已经达标，可以进入发布与复盘阶段。");

  let tag = "待优化";
  let level = "medium";
  if (total >= 85) {
    tag = "可直接发布";
    level = "good";
  } else if (total < 70) {
    tag = "建议先修改";
    level = "low";
  }

  return { total, metrics, tips, tag, level };
}

function renderQuality(quality) {
  if (!quality) {
    $("qualityScore").textContent = "0";
    $("qualityTag").textContent = "待生成";
    $("qualityTag").className = "score-tag";
    $("qualityBar").style.width = "0%";
    $("qualityMetrics").innerHTML = "";
    $("qualityTips").innerHTML = '<li class="muted">生成内容后会给出评分与建议。</li>';
    return;
  }

  $("qualityScore").textContent = String(quality.total);
  $("qualityTag").textContent = quality.tag;
  $("qualityTag").className = `score-tag ${quality.level}`;
  $("qualityBar").style.width = `${quality.total}%`;
  $("qualityMetrics").innerHTML = quality.metrics
    .map(
      (metric) =>
        `<article class="metric-item"><span class="name">${escapeHtml(metric.name)}</span><span class="value">${metric.score}/${metric.max}</span></article>`
    )
    .join("");
  $("qualityTips").innerHTML = quality.tips.map((tip) => `<li>${escapeHtml(tip)}</li>`).join("");
}

function renderChecklist() {
  $("checklistContainer").innerHTML = checklist
    .map(
      (section, sIndex) => `
        <section class="check-section">
          <h4>${escapeHtml(section.title)}</h4>
          ${section.items
            .map(
              (item, iIndex) => `
            <label class="check-item">
              <input type="checkbox" data-key="${sIndex}-${iIndex}" />
              <span>${escapeHtml(item)}</span>
            </label>`
            )
            .join("")}
        </section>
      `
    )
    .join("");

  const saved = safeParse(localStorage.getItem(CHECKLIST_KEY) || "{}", {});
  document.querySelectorAll("input[type='checkbox'][data-key]").forEach((cb) => {
    cb.checked = Boolean(saved[cb.dataset.key]);
    cb.addEventListener("change", () => {
      const latest = safeParse(localStorage.getItem(CHECKLIST_KEY) || "{}", {});
      latest[cb.dataset.key] = cb.checked;
      localStorage.setItem(CHECKLIST_KEY, JSON.stringify(latest));
      updateQuality();
    });
  });
}

function updateQuality() {
  const quality = calculateQuality(readInput());
  state.quality = quality;
  renderQuality(quality);
}

function generateAll() {
  const input = readInput();
  state.titles = buildTitles(input);
  state.hooks = buildHooks(input);
  state.article = buildArticle(input, state.titles, state.hooks);
  state.thread = splitThread(state.article);
  state.plan = buildPlan(input);
  state.monetize = buildMonetize(input);

  renderTitles(state.titles);
  renderHooks(state.hooks);
  $("articleOutput").value = state.article;
  renderThread(state.thread);
  renderPlan(state.plan);
  $("monetizeOutput").value = state.monetize;
  updateQuality();
}

function escapeHtml(text) {
  const value = String(text ?? "");
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function copyText(text, successMessage = "已复制") {
  if (!text.trim()) return;
  navigator.clipboard.writeText(text).then(() => {
    flash(successMessage);
  });
}

function flash(message) {
  const tip = document.createElement("div");
  tip.textContent = message;
  tip.style.position = "fixed";
  tip.style.right = "16px";
  tip.style.bottom = "16px";
  tip.style.background = "#0e2d42";
  tip.style.color = "#eaf6ff";
  tip.style.padding = "10px 14px";
  tip.style.borderRadius = "10px";
  tip.style.border = "1px solid rgba(140,231,255,.35)";
  tip.style.zIndex = "9999";
  tip.style.boxShadow = "0 10px 25px rgba(0,0,0,.35)";
  document.body.appendChild(tip);
  setTimeout(() => tip.remove(), 1300);
}

function buildMarkdownExport() {
  const article = $("articleOutput").value.trim();
  const monetize = $("monetizeOutput").value.trim();
  const thread = state.thread.map((p, i) => `### Post ${i + 1}\n${p}`).join("\n\n");
  const plan = state.plan.map((p) => `- ${p}`).join("\n");
  const qualitySummary = state.quality
    ? `- 总分：${state.quality.total}/100\n- 标签：${state.quality.tag}\n`
    : "- 尚未评分\n";

  return `# X Articles Studio 导出\n\n## 内容质量评分\n\n${qualitySummary}\n## 文章草稿\n\n${article}\n\n## Thread\n\n${thread}\n\n## 72 小时分发\n\n${plan}\n\n## 订阅变现\n\n${monetize}\n`;
}

function downloadMarkdown() {
  const content = buildMarkdownExport();
  const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `x-article-${Date.now()}.md`;
  a.click();
  URL.revokeObjectURL(url);
}

function openIntent(text) {
  const url = `https://x.com/intent/post?text=${encodeURIComponent(text)}`;
  window.open(url, "_blank", "noopener,noreferrer");
}

function snapshotState() {
  return {
    titles: [...state.titles],
    hooks: [...state.hooks],
    article: state.article,
    thread: [...state.thread],
    plan: [...state.plan],
    monetize: state.monetize,
    quality: state.quality ? { ...state.quality, metrics: [...state.quality.metrics], tips: [...state.quality.tips] } : null
  };
}

function createDraftPayload() {
  return {
    topic: $("topic").value,
    audience: $("audience").value,
    thesis: $("thesis").value,
    ctaGoal: $("ctaGoal").value,
    tone: $("tone").value,
    username: $("username").value,
    evidence: $("evidence").value,
    articleOutput: $("articleOutput").value,
    monetizeOutput: $("monetizeOutput").value,
    state: snapshotState(),
    savedAt: new Date().toISOString()
  };
}

function getHistory() {
  return safeParse(localStorage.getItem(HISTORY_KEY) || "[]", []);
}

function setHistory(history) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

function pushHistorySnapshot(payload) {
  const history = getHistory();
  const latest = history[0];

  const isDuplicate =
    latest &&
    latest.payload &&
    latest.payload.topic === payload.topic &&
    latest.payload.articleOutput === payload.articleOutput &&
    latest.payload.monetizeOutput === payload.monetizeOutput;

  if (isDuplicate) return;

  history.unshift({
    id: String(Date.now()),
    createdAt: new Date().toISOString(),
    topic: payload.topic || "未命名主题",
    audience: payload.audience || "",
    payload
  });

  setHistory(history.slice(0, MAX_HISTORY));
}

function formatDateTime(iso) {
  try {
    return new Date(iso).toLocaleString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit"
    });
  } catch {
    return iso;
  }
}

function renderHistoryMeta(historyItem) {
  if (!historyItem) {
    $("historyMeta").textContent = "点击“保存草稿”后，会自动沉淀历史版本（最多 12 条）。";
    return;
  }

  $("historyMeta").textContent = `保存时间：${formatDateTime(historyItem.createdAt)} ｜ 主题：${historyItem.topic || "未命名"} ｜ 受众：${
    historyItem.audience || "未填写"
  }`;
}

function renderHistory() {
  const history = getHistory();
  const select = $("historySelect");

  if (!history.length) {
    select.innerHTML = '<option value="">暂无历史版本</option>';
    renderHistoryMeta(null);
    return;
  }

  select.innerHTML = history
    .map((item) => {
      const label = `${formatDateTime(item.createdAt)} · ${(item.topic || "未命名主题").slice(0, 28)}`;
      return `<option value="${escapeHtml(item.id)}">${escapeHtml(label)}</option>`;
    })
    .join("");

  if (!history.some((item) => item.id === select.value)) {
    select.value = history[0].id;
  }

  const current = history.find((item) => item.id === select.value) || history[0];
  renderHistoryMeta(current);
}

function applyDraft(data) {
  $("topic").value = data.topic || "";
  $("audience").value = data.audience || "";
  $("thesis").value = data.thesis || "";
  $("ctaGoal").value = data.ctaGoal || "";
  $("tone").value = data.tone || "理性拆解";
  $("username").value = data.username || "";
  $("evidence").value = data.evidence || "";
  $("articleOutput").value = data.articleOutput || "";
  $("monetizeOutput").value = data.monetizeOutput || "";

  if (data.state) {
    state.titles = data.state.titles || [];
    state.hooks = data.state.hooks || [];
    state.article = data.state.article || data.articleOutput || "";
    state.thread = data.state.thread || [];
    state.plan = data.state.plan || [];
    state.monetize = data.state.monetize || data.monetizeOutput || "";
  }

  renderTitles(state.titles);
  renderHooks(state.hooks);
  renderThread(state.thread);
  renderPlan(state.plan);
  updateQuality();
}

function saveDraft() {
  const payload = createDraftPayload();
  localStorage.setItem(DRAFT_KEY, JSON.stringify(payload));
  pushHistorySnapshot(payload);
  renderHistory();
  flash("草稿已保存并加入历史版本");
}

function loadDraft() {
  const raw = localStorage.getItem(DRAFT_KEY);
  if (!raw) {
    flash("没有可读取的草稿");
    return;
  }
  const data = safeParse(raw, null);
  if (!data) {
    flash("草稿读取失败");
    return;
  }
  applyDraft(data);
  flash("草稿已读取");
}

function loadHistoryVersion() {
  const selectedId = $("historySelect").value;
  const history = getHistory();
  const item = history.find((entry) => entry.id === selectedId);
  if (!item) {
    flash("请选择一个历史版本");
    return;
  }

  applyDraft(item.payload);
  renderHistoryMeta(item);
  flash("已加载历史版本");
}

function deleteHistoryVersion() {
  const selectedId = $("historySelect").value;
  const history = getHistory();
  const next = history.filter((item) => item.id !== selectedId);

  if (next.length === history.length) {
    flash("没有可删除的版本");
    return;
  }

  setHistory(next);
  renderHistory();
  flash("历史版本已删除");
}

function fillSample() {
  $("topic").value = "用 AI 流程化写作拿下 X 长文增长";
  $("audience").value = "想做 X 自媒体增长的个人创作者";
  $("thesis").value = "把写作拆成模板与复盘闭环，比凭感觉更新更快起量";
  $("ctaGoal").value = "按清单发布你的第一篇 X Article 并拆成 Thread";
  $("tone").value = "理性拆解";
  $("username").value = "demo_creator";
  $("evidence").value =
    "- 连续 4 周每周 2 篇长文，主页点击率提升 2.1 倍\n- 一篇长文拆成 8 条 Thread，回流阅读占比 37%\n- 文末加订阅预告后，订阅转化率从 0.6% 提升到 1.4%";
  generateAll();
  flash("示例内容已填充");
}

function resetAll() {
  ["topic", "audience", "thesis", "ctaGoal", "username", "evidence", "articleOutput", "monetizeOutput"].forEach((id) => {
    $(id).value = "";
  });
  $("tone").value = "理性拆解";

  state.titles = [];
  state.hooks = [];
  state.article = "";
  state.thread = [];
  state.plan = [];
  state.monetize = "";
  state.quality = null;

  renderTitles([]);
  renderHooks([]);
  renderThread([]);
  renderPlan([]);
  renderQuality(null);
}

function bindEvents() {
  $("generateBtn").addEventListener("click", generateAll);
  $("resetBtn").addEventListener("click", resetAll);
  $("fillSampleBtn").addEventListener("click", fillSample);

  $("copyArticleBtn").addEventListener("click", () => copyText($("articleOutput").value, "文章已复制"));
  $("copyThreadBtn").addEventListener("click", () => copyText(state.thread.join("\n\n---\n\n"), "Thread 已复制"));
  $("saveDraftBtn").addEventListener("click", saveDraft);
  $("loadDraftBtn").addEventListener("click", loadDraft);
  $("loadHistoryBtn").addEventListener("click", loadHistoryVersion);
  $("deleteHistoryBtn").addEventListener("click", deleteHistoryVersion);
  $("historySelect").addEventListener("change", () => {
    const history = getHistory();
    const item = history.find((entry) => entry.id === $("historySelect").value);
    renderHistoryMeta(item || null);
  });

  $("exportMarkdownBtn").addEventListener("click", downloadMarkdown);

  $("openTeaserIntentBtn").addEventListener("click", () => {
    const input = readInput();
    openIntent(`我刚写完一篇关于「${input.topic}」的长文，重点拆解了：${input.thesis}。晚点发布，先把你最关心的问题留在评论区。`);
  });

  $("openThreadIntentBtn").addEventListener("click", () => {
    const text = state.thread[0] || "我把这篇文章拆成了 Thread，下面是核心要点。";
    openIntent(text);
  });

  $("openSubIntentBtn").addEventListener("click", () => {
    const input = readInput();
    const link = input.username
      ? `https://x.com/${input.username}/creator-subscriptions/subscribe`
      : "https://x.com/YOURUSERNAME/creator-subscriptions/subscribe";

    openIntent(`如果你想看我每周的深度拆解和下一篇提前版，可以订阅我：${link}`);
  });

  document.addEventListener("keydown", (event) => {
    const key = event.key.toLowerCase();
    const hasMeta = event.metaKey || event.ctrlKey;

    if (hasMeta && key === "s") {
      event.preventDefault();
      saveDraft();
    }

    if (hasMeta && event.key === "Enter") {
      event.preventDefault();
      generateAll();
    }
  });
}

function initPwa() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/sw.js").catch(() => null);
  }
}

function init() {
  renderChecklist();
  renderHistory();
  renderQuality(null);
  bindEvents();
  initPwa();
}

init();
