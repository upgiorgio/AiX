/**
 * AiX Copy Studio — AI 文案工场 v2.0
 * 全面接入 AI 生成 + 流式输出 + URL 摘要 + 多版本
 */

const COPY_STATE_KEY   = "aix-card-suite-copy-v1";
const DESIGNER_INPUT_KEY = "aix-card-suite-designer-input";
const VERSIONS_KEY     = "aix-copy-versions-v1";

const scenarioGuides = {
  xhs:       "开场先给场景冲突 + 3条清单 + 结尾互动问题，多用表情符号",
  "x-thread":"首条用强钩子，后续按观点分段，末条回流主文，英中混排",
  wechat:    "标题价值明确，正文小标题分段，结尾给行动建议",
  quote:     "一句核心观点 + 一句解释 + 一句行动，精炼有力",
  ad:        "用户痛点-方案-证据-行动，避免绝对化承诺",
};

const platformTone = {
  xiaohongshu: "口语化、亲切、多用表情符号、像在跟朋友聊天",
  x:           "简短有力、英中混排、带 hashtag、推文风格",
  wechat:      "正式、段落清晰、适合深度阅读",
  zhihu:       "专业权威、结论先行、有数据有案例",
  bilibili:    "活泼轻松、带弹幕梗、适合年轻用户",
};

function $(id) { return document.getElementById(id); }

/* ── State ── */
function getState() {
  return {
    scenario: $("scenario").value, platform: $("platform").value,
    tone: $("tone").value, length: $("length").value,
    topic: $("topic").value.trim(), audience: $("audience").value.trim(),
    thesis: $("thesis").value.trim(), cta: $("cta").value.trim(),
    draftOutput: $("draftOutput").value, promptOutput: $("promptOutput").value,
  };
}
function setState(state) {
  if (!state) return;
  ["scenario","platform","tone","length","topic","audience","thesis","cta","draftOutput","promptOutput"]
    .forEach(k => { if ($(k) && state[k] !== undefined) $(k).value = state[k]; });
}
function saveState() { localStorage.setItem(COPY_STATE_KEY, JSON.stringify(getState())); }
function loadState() { setState(readJsonStorage(COPY_STATE_KEY)); }

/* ── Build AI Prompt ── */
function buildAIPrompt(state) {
  const guide  = scenarioGuides[state.scenario] || "";
  const ptone  = platformTone[state.platform] || state.tone;
  return `你是资深内容主编。请按以下参数直接输出一篇可发布的${state.platform}文案，不要解释，不要前言。

【参数】
场景：${state.scenario}（要求：${guide}）
平台：${state.platform}（语气：${ptone}）
语气风格：${state.tone}
长度目标：${state.length}
主题：${state.topic || "AI工作流提效"}
目标受众：${state.audience || "自媒体创作者"}
核心观点：${state.thesis || "AI工具能大幅提升创作效率"}
行动引导：${state.cta || "收藏并尝试一次"}

【输出格式】
- Markdown格式（标题/正文/结尾）
- 适合移动端扫读，段落2-4行
- 自然融入1-2个相关话题标签
- 不要有多余的说明文字，直接给文案`;
}

function buildPrompt(state) {
  return `你是资深内容主编。请围绕以下参数，产出一版可直接发布的 ${state.platform} 文案。\n\n参数：\n- 场景：${state.scenario}\n- 场景要求：${scenarioGuides[state.scenario]}\n- 平台：${state.platform}\n- 语气：${state.tone}\n- 长度：${state.length}\n- 主题：${state.topic || "（请补充）"}\n- 受众：${state.audience || "（请补充）"}\n- 核心观点：${state.thesis || "（请补充）"}\n- CTA：${state.cta || "（请补充）"}\n\n输出要求：\n1. 标题 + 正文 + 结尾行动引导。\n2. 适合移动端扫读，段落尽量 2-4 行。\n3. 避免绝对化承诺和夸大表达。\n4. 输出 Markdown。`;
}

/* ── AI Generate with streaming ── */
let currentVersion = 0;
const versions = { 0: "", 1: "", 2: "" };

function setStatus(msg, thinking = false) {
  const el = $("aiStatus");
  if (!el) return;
  if (!msg) { el.innerHTML = ""; el.style.display = "none"; return; }
  el.style.display = "flex";
  el.innerHTML = thinking ? `<span class="ai-thinking">${msg}</span>` : `<small style="color:var(--muted)">${msg}</small>`;
}

async function generateWithAI(versionIdx = 0) {
  if (typeof window.AiGateway === "undefined") {
    showToast("AI 模块加载中，请稍后重试");
    return;
  }
  const state = getState();
  const prompt = buildAIPrompt(state);
  const promptOut = $("promptOutput");
  if (promptOut) promptOut.value = buildPrompt(state);

  const btn = $("aiGenerateBtn");
  if (btn) btn.disabled = true;
  setStatus("AI 生成中…", true);
  $("draftOutput").value = "";

  let full = "";
  await window.AiGateway.stream(prompt, {
    system: "你是专业的中文内容创作者，擅长各大社交平台的文案写作，直接输出内容不加解释。",
    onChunk(chunk) {
      full += chunk;
      $("draftOutput").value = full + "▋";
      $("draftOutput").scrollTop = $("draftOutput").scrollHeight;
    },
    onDone() {
      $("draftOutput").value = full;
      versions[versionIdx] = full;
      saveVersions();
      saveState();
      setStatus(`✓ 版本${versionIdx + 1} 生成完成  字数：${full.length}`);
      if (btn) btn.disabled = false;
    },
    onError(msg) {
      $("draftOutput").value = `[生成失败] ${msg}\n\n请检查 AI 设置或稍后重试。`;
      setStatus("生成失败：" + msg);
      if (btn) btn.disabled = false;
    },
  });
}

/* ── Refine / iterate ── */
async function refineDraft(instruction) {
  const cur = $("draftOutput").value.trim();
  if (!cur) { showToast("请先生成文案"); return; }
  const btn = $("refineBtn");
  if (btn) btn.disabled = true;
  setStatus("优化中…", true);

  const prompt = `请根据以下指令优化这篇文案，直接输出优化后的完整文案，不要解释：\n\n【优化指令】${instruction}\n\n【原文案】\n${cur}`;
  let full = "";
  await window.AiGateway.stream(prompt, {
    system: "你是内容优化专家，直接输出优化后的内容。",
    onChunk(chunk) {
      full += chunk;
      $("draftOutput").value = full + "▋";
      $("draftOutput").scrollTop = $("draftOutput").scrollHeight;
    },
    onDone() {
      $("draftOutput").value = full;
      versions[currentVersion] = full;
      saveVersions();
      saveState();
      setStatus("优化完成");
      if (btn) btn.disabled = false;
    },
    onError(msg) {
      setStatus("优化失败：" + msg);
      if (btn) btn.disabled = false;
    },
  });
}

/* ── URL import ── */
async function importFromUrl() {
  const urlInput = $("urlInput");
  const url = urlInput?.value.trim();
  if (!url || !url.startsWith("http")) { showToast("请输入有效的 URL"); return; }
  const btn = $("urlImportBtn");
  if (btn) btn.disabled = true;
  setStatus("正在读取网页内容…", true);

  try {
    const data = await window.AiGateway.extractUrl(url);
    if (data.title && !$("topic").value.trim()) $("topic").value = data.title;
    const content = [
      data.summary && `摘要：${data.summary}`,
      data.points?.length && `核心要点：\n${data.points.map(p => `- ${p}`).join("\n")}`,
      data.quote && `金句：「${data.quote}」`,
    ].filter(Boolean).join("\n\n");
    $("thesis").value = data.summary || data.points?.[0] || "";
    $("draftOutput").value = content;
    saveState();
    setStatus(`✓ 已提取 "${data.title || url}"，可继续 AI 生成`);
    showToast("URL 内容已提取");
  } catch (e) {
    setStatus("提取失败：" + e.message);
    showToast("提取失败：" + e.message);
  } finally {
    if (btn) btn.disabled = false;
  }
}

/* ── Multi-version tabs ── */
function saveVersions() {
  localStorage.setItem(VERSIONS_KEY, JSON.stringify({ versions, current: currentVersion }));
}
function loadVersions() {
  const v = readJsonStorage(VERSIONS_KEY);
  if (!v) return;
  Object.assign(versions, v.versions || {});
  currentVersion = v.current || 0;
}
function switchVersion(idx) {
  versions[currentVersion] = $("draftOutput").value;
  currentVersion = idx;
  $("draftOutput").value = versions[idx] || "";
  document.querySelectorAll(".ai-ver-tab").forEach((t, i) => t.classList.toggle("active", i === idx));
}

/* ── Static template fallback ── */
function generateStatic() {
  const state = getState();
  const topic = state.topic || "你的主题";
  const audience = state.audience || "目标读者";
  const thesis = state.thesis || "请在这里补充核心观点";
  const cta = state.cta || "收藏并尝试一次";
  $("draftOutput").value = `# ${topic}\n\n你是否也发现：很多 ${audience} 在内容创作上投入很多时间，却很难稳定产出高质量结果。\n\n## 核心观点\n${thesis}\n\n## 三步做法\n1. 先把结论写出来，再补证据。\n2. 每段只讲一件事，确保手机上 2-4 行可读。\n3. 发布后 24h 内做二次分发与评论互动。\n\n## 可直接执行\n今天就把你上一条内容按这个结构重写一次，比较前后表现差异。\n\n**${cta}**`;
  $("promptOutput").value = buildPrompt(state);
  saveState();
  showToast("模板草稿已生成，建议点「AI 生成」获取更好内容");
}

function importSharedDraft() {
  const draft = getSharedDraftText();
  if (!draft) { showToast("未找到可导入草稿"); return; }
  $("draftOutput").value = draft;
  const first = draft.match(/^#\s+(.+)$/m);
  if (first && !$("topic").value.trim()) $("topic").value = first[1].trim();
  saveState();
  showToast("已导入共享草稿");
}

function sendToDesigner() {
  const content = $("draftOutput").value.trim();
  if (!content) { showToast("请先生成或粘贴草稿"); return; }
  localStorage.setItem(DESIGNER_INPUT_KEY, JSON.stringify({
    text: content, topic: $("topic").value.trim(),
    platform: $("platform").value, updatedAt: Date.now(),
  }));
  showToast("已发送到卡片设计器");
  setTimeout(() => { window.location.href = "/card-suite/card-designer.html"; }, 220);
}

/* ── Init ── */
window.addEventListener("DOMContentLoaded", () => {
  loadState();
  loadVersions();
  if (!$("draftOutput").value.trim()) generateStatic();

  // Main AI button
  $("aiGenerateBtn")?.addEventListener("click", () => generateWithAI(currentVersion));
  // Static fallback
  $("generateBtn")?.addEventListener("click", generateStatic);
  // Shared imports
  $("importDraftBtn")?.addEventListener("click", importSharedDraft);
  $("toCardBtn")?.addEventListener("click", sendToDesigner);
  // URL import
  $("urlImportBtn")?.addEventListener("click", importFromUrl);
  $("urlInput")?.addEventListener("keydown", e => { if (e.key === "Enter") importFromUrl(); });
  // Copy / download
  $("copyDraftBtn")?.addEventListener("click",    () => copyText($("draftOutput").value,  "草稿已复制"));
  $("downloadDraftBtn")?.addEventListener("click", () => downloadFile(`card-copy-${nowTag()}.md`, $("draftOutput").value, "text/markdown;charset=utf-8"));
  $("copyPromptBtn")?.addEventListener("click",   () => copyText($("promptOutput").value, "提示词已复制"));
  // Refine quick actions
  document.querySelectorAll("[data-refine]").forEach(btn => {
    btn.addEventListener("click", () => refineDraft(btn.dataset.refine));
  });
  // Version tabs
  document.querySelectorAll(".ai-ver-tab").forEach((tab, i) => {
    tab.addEventListener("click", () => switchVersion(i));
  });
  // Auto-save
  ["scenario","platform","tone","length","topic","audience","thesis","cta","draftOutput"].forEach(id => {
    $(id)?.addEventListener("input", saveState);
  });
});
