const $ = (id) => document.getElementById(id);

const MAIN_DRAFT_KEY = "x-articles-studio-draft";
const LAB_STATE_KEY = "aix-md-lab-state-v1";
const LEGACY_BLOG_ACCENT = "#8f4af4";

const THEME_PRESETS = {
  wechat_clean: {
    label: "清雅蓝（公众号）",
    className: "theme-wechat",
    accent: "#1464cb",
    fontSize: 16,
    lineHeight: 1.8,
    contentWidth: 720
  },
  blog_pro: {
    label: "深海蓝（博客）",
    className: "theme-blog",
    accent: "#1f74c9",
    fontSize: 17,
    lineHeight: 1.82,
    contentWidth: 860
  },
  knowledge_green: {
    label: "知识绿（教程）",
    className: "theme-knowledge",
    accent: "#0c9b7c",
    fontSize: 16,
    lineHeight: 1.78,
    contentWidth: 820
  },
  sunrise_orange: {
    label: "朝阳橙（观点文）",
    className: "theme-sunrise",
    accent: "#e76f51",
    fontSize: 16,
    lineHeight: 1.74,
    contentWidth: 780
  }
};

const PLATFORM_PROFILES = {
  wechat: {
    label: "公众号图文",
    defaultTheme: "wechat_clean",
    hint: "建议短段落 + 小标题 + 图片留白，发布前走平台敏感词复检。"
  },
  blog: {
    label: "博客长文",
    defaultTheme: "blog_pro",
    hint: "建议强化目录结构、代码块可读性与参考链接完整性。"
  },
  zhihu: {
    label: "知乎文章",
    defaultTheme: "knowledge_green",
    hint: "建议问题导向写法：结论先行，随后补证据和反例边界。"
  },
  xiaohongshu: {
    label: "小红书长文",
    defaultTheme: "sunrise_orange",
    hint: "建议场景化开场 + 清单化正文 + 可执行动作收尾。"
  },
  bilibili: {
    label: "B站专栏",
    defaultTheme: "knowledge_green",
    hint: "建议章节化表达并预留图示说明位，提升扫读体验。"
  }
};

const REMIX_MODES = {
  structure: "结构强化（逻辑更清楚）",
  story: "故事化叙事（更有代入感）",
  insight: "观点深挖（更适合博客）",
  wechat: "公众号深度版（信息密度更高）",
  multi: "多平台复用版（跨平台发布）"
};

const SAMPLE_MARKDOWN = `# 如何把一篇长文变成可持续增长资产

你不缺内容灵感，你缺的是一套可复用的“创作-发布-复盘”系统。

## 先讲结论

如果你想让一篇文章持续产生价值，就必须把写作当成产品迭代，而不是一次性表达。

## 为什么很多人发了就没后续

- 发布前没有验证需求，选题容易偏离用户关注
- 正文结构不适合移动端扫读，读者停留短
- 发布后没有做二次分发和复盘，内容寿命很短

## 一套可执行的流程

### 1) 发布前：先做小范围验证

你可以先发一个简短预告，收集评论中的真实问题，再确定正文结构。

### 2) 发布中：正文按“结论-证据-动作”组织

每个章节只讲一个观点，并给出对应证据，避免空泛表达。

### 3) 发布后：72 小时内完成二次分发

- 0-2 小时：置顶并集中回复首波评论
- 6-24 小时：拆成 Thread / 摘要帖回流正文
- 24-72 小时：结合热点场景再分发

## 证据模板

| 维度 | 指标 | 观察周期 |
| --- | --- | --- |
| 曝光 | 点击率 / 阅读量 | 24h |
| 互动 | 评论率 / 收藏率 | 24h |
| 转化 | 订阅 / 留资 | 72h |

## 结尾动作

如果你今天只做一件事，就把你最近一篇旧文按上面流程重做一遍，再比较 72h 数据。`;

const state = {
  markdown: "",
  platform: "blog",
  themeKey: "blog_pro",
  accent: "#1f74c9",
  fontSize: 16,
  lineHeight: 1.75,
  contentWidth: 760,
  wechatFootnotes: true,
  imageCard: true
};

function safeParse(raw, fallback) {
  try {
    return JSON.parse(raw) ?? fallback;
  } catch {
    return fallback;
  }
}

function flash(message) {
  const node = document.createElement("div");
  node.className = "lab-toast";
  node.textContent = message;
  Object.assign(node.style, {
    position: "fixed",
    right: "14px",
    bottom: "14px",
    padding: "10px 14px",
    borderRadius: "10px",
    border: "1px solid rgba(145,201,239,.4)",
    background: "#0f2a40",
    color: "#eaf5ff",
    zIndex: "9999",
    boxShadow: "0 10px 30px rgba(0,0,0,.35)"
  });
  document.body.appendChild(node);
  setTimeout(() => node.remove(), 1450);
}

function populateThemes() {
  const select = $("themeSelect");
  select.innerHTML = Object.entries(THEME_PRESETS)
    .map(([key, value]) => `<option value="${key}">${value.label}</option>`)
    .join("");
}

function readControls() {
  state.platform = $("platformSelect").value;
  state.themeKey = $("themeSelect").value;
  state.accent = $("accentColorInput").value;
  state.fontSize = Number($("fontSizeRange").value);
  state.lineHeight = Number($("lineHeightRange").value);
  state.contentWidth = Number($("contentWidthRange").value);
  state.wechatFootnotes = $("wechatFootnoteToggle").checked;
  state.imageCard = $("imageCardToggle").checked;
}

function applyPreset(themeKey) {
  const preset = THEME_PRESETS[themeKey] || THEME_PRESETS.blog_pro;
  state.themeKey = themeKey;
  state.accent = preset.accent;
  state.fontSize = preset.fontSize;
  state.lineHeight = preset.lineHeight;
  state.contentWidth = preset.contentWidth;

  $("themeSelect").value = themeKey;
  $("accentColorInput").value = preset.accent;
  $("fontSizeRange").value = String(preset.fontSize);
  $("lineHeightRange").value = String(preset.lineHeight);
  $("contentWidthRange").value = String(preset.contentWidth);
}

function getPlatformProfile() {
  return PLATFORM_PROFILES[state.platform] || PLATFORM_PROFILES.blog;
}

function refreshPlatformHint() {
  const profile = getPlatformProfile();
  $("platformHint").textContent = `${profile.label}：${profile.hint}`;
}

function normalizeMarkdown(mdText) {
  return String(mdText || "").replace(/\r\n?/g, "\n");
}

function highlightCodeBlocks(container) {
  if (!window.hljs) return;
  container.querySelectorAll("pre code").forEach((block) => {
    try {
      window.hljs.highlightElement(block);
    } catch {
      // ignore
    }
  });
}

function injectWechatFootnotes(container) {
  if (!(state.platform === "wechat" && state.wechatFootnotes)) return;

  const links = Array.from(container.querySelectorAll("a[href]")).filter((a) => {
    const href = (a.getAttribute("href") || "").trim();
    return href && /^https?:\/\//i.test(href);
  });

  if (!links.length) return;

  const indexByHref = new Map();
  const refs = [];

  links.forEach((link) => {
    const href = link.getAttribute("href");
    if (!indexByHref.has(href)) {
      indexByHref.set(href, refs.length + 1);
      refs.push(href);
    }

    const idx = indexByHref.get(href);
    const text = link.textContent?.trim() || href;
    const wrap = document.createElement("span");
    const plain = document.createElement("span");
    plain.textContent = text;
    plain.className = "md-link-text";
    const sup = document.createElement("sup");
    sup.textContent = `[${idx}]`;
    wrap.append(plain, sup);
    link.replaceWith(wrap);
  });

  const section = document.createElement("section");
  section.className = "md-link-refs";
  section.innerHTML = `<h3>参考链接</h3><ol>${refs
    .map((href, i) => `<li>[${i + 1}] ${escapeHtml(href)}</li>`)
    .join("")}</ol>`;
  container.appendChild(section);
}

function updateStats() {
  const markdown = state.markdown;
  const plain = markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/[#>*_~\-]/g, " ");

  const chars = plain.replace(/\s+/g, "").length;
  const words = (plain.match(/[A-Za-z0-9]+/g) || []).length;
  const minutes = chars + words * 1.8 <= 0 ? 0 : Math.max(1, Math.ceil((chars + words * 1.8) / 450));
  const headingCount = (markdown.match(/^#{1,6}\s+/gm) || []).length;
  const paragraphCount = markdown
    .split(/\n\s*\n/g)
    .map((part) => part.trim())
    .filter(Boolean).length;

  $("wordStats").textContent = `字数 ${chars} · 预计阅读 ${minutes} 分钟`;
  $("headingStats").textContent = `标题 ${headingCount} · 段落 ${paragraphCount}`;
}

function renderMarkdown() {
  const preview = $("previewArticle");
  if (!window.marked || !window.DOMPurify) {
    preview.innerHTML = "<p>渲染组件加载中，请稍候...</p>";
    return;
  }

  const rawHtml = window.marked.parse(state.markdown || "");
  const safeHtml = window.DOMPurify.sanitize(rawHtml);
  preview.innerHTML = safeHtml;

  const preset = THEME_PRESETS[state.themeKey] || THEME_PRESETS.blog_pro;
  preview.classList.remove("theme-wechat", "theme-blog", "theme-knowledge", "theme-sunrise", "img-card-mode");
  preview.classList.add(preset.className);
  if (state.imageCard) preview.classList.add("img-card-mode");

  preview.style.setProperty("--md-accent", state.accent);
  preview.style.setProperty("--md-font-size", `${state.fontSize}px`);
  preview.style.setProperty("--md-line-height", String(state.lineHeight));
  preview.style.setProperty("--md-width", `${state.contentWidth}px`);

  injectWechatFootnotes(preview);
  highlightCodeBlocks(preview);
  updateStats();
  refreshPlatformHint();
  updateRemixPrompt();
}

function escapeHtml(text) {
  return String(text || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function buildEmbeddedStyle() {
  return `<style>
  body{margin:0;padding:18px;background:#f6f8fb;font-family:'Noto Sans SC','PingFang SC','Microsoft YaHei',sans-serif}
  .md-wrap{max-width:${state.contentWidth}px;margin:0 auto;background:#fff;border-radius:12px;padding:18px;color:#1f2d3d;font-size:${state.fontSize}px;line-height:${state.lineHeight};word-break:break-word}
  .md-wrap h1,.md-wrap h2,.md-wrap h3,.md-wrap h4,.md-wrap h5,.md-wrap h6{font-family:'Sora','Noto Sans SC',sans-serif;color:#12263a;line-height:1.36}
  .md-wrap h1{border-bottom:2px solid #d8e6f3;padding-bottom:.36em}
  .md-wrap h2{border-left:4px solid ${state.accent};padding-left:.58em;margin-top:1.8em}
  .md-wrap p{margin:.95em 0}
  .md-wrap blockquote{margin:1em 0;border-left:4px solid ${state.accent};background:#f6fbff;padding:.6em .85em;border-radius:0 8px 8px 0;color:#33506a}
  .md-wrap a{color:#1f74c9}
  .md-wrap img{display:block;max-width:100%;margin:1.1em auto;border-radius:8px${state.imageCard ? ";border:1px solid #d2e6f6;box-shadow:0 10px 26px rgba(22,56,83,.18)" : ""}}
  .md-wrap code{font-family:'JetBrains Mono',Menlo,Consolas,monospace;background:#f1f5f9;padding:.16em .34em;border-radius:5px;font-size:.92em}
  .md-wrap pre{overflow:auto;background:#0f172a;color:#e8ecf1;border-radius:10px;padding:.9em}
  .md-wrap pre code{background:transparent;color:inherit;padding:0}
  .md-wrap table{border-collapse:collapse;width:100%;margin:1em 0;font-size:.95em}
  .md-wrap th,.md-wrap td{border:1px solid #d3e2ef;padding:.5em .65em;text-align:left}
  .md-wrap thead{background:#f1f7fc}
  .md-wrap .md-link-refs{margin-top:2em;border-top:1px dashed #cbd9e4;padding-top:1em;color:#516274;font-size:.9em}
  .md-wrap .md-link-refs h3{margin:0 0 .6em;font-size:1em;color:#1e3952}
  </style>`;
}

function buildExportFragment() {
  return `${buildEmbeddedStyle()}<article class="md-wrap">${$("previewArticle").innerHTML}</article>`;
}

function buildExportDocument() {
  const title = (state.markdown.match(/^#\s+(.+)$/m) || ["", "AiX Markdown Article"])[1];
  return `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /><title>${escapeHtml(
    title
  )}</title>${buildEmbeddedStyle()}</head><body><article class="md-wrap">${$("previewArticle").innerHTML}</article></body></html>`;
}

function downloadFile(name, content, mime) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

async function copyText(text) {
  await navigator.clipboard.writeText(text);
}

async function copyHtmlFragment() {
  const html = buildExportFragment();
  const plain = state.markdown || "";
  if (navigator.clipboard?.write && window.ClipboardItem) {
    const item = new ClipboardItem({
      "text/html": new Blob([html], { type: "text/html" }),
      "text/plain": new Blob([plain], { type: "text/plain" })
    });
    await navigator.clipboard.write([item]);
  } else {
    await copyText(html);
  }
}

function buildRemixPrompt() {
  const mode = $("remixModeSelect").value;
  const modeLabel = REMIX_MODES[mode] || REMIX_MODES.structure;
  const platform = getPlatformProfile().label;
  const content = (state.markdown || "").slice(0, 3200);

  return `你是资深内容主编，请对下面这篇 Markdown 长文做「${modeLabel}」二次创作，并适配「${platform}」。\n\n要求：\n1. 保留核心观点不变，但重构标题、开头和段落组织。\n2. 让每段更适合手机扫读（尽量 2-4 行）。\n3. 补强证据表达：每个关键观点后补一个案例/数据/对比。\n4. 结尾必须给出明确动作（评论、收藏、转发或订阅）。\n5. 输出格式保持 Markdown，附一版可直接发布的最终稿。\n\n原文如下：\n\n${content}`;
}

function updateRemixPrompt() {
  $("remixPromptOutput").value = buildRemixPrompt();
}

function saveLabState() {
  const payload = {
    markdown: state.markdown,
    platform: state.platform,
    themeKey: state.themeKey,
    accent: state.accent,
    fontSize: state.fontSize,
    lineHeight: state.lineHeight,
    contentWidth: state.contentWidth,
    wechatFootnotes: state.wechatFootnotes,
    imageCard: state.imageCard
  };
  localStorage.setItem(LAB_STATE_KEY, JSON.stringify(payload));
}

function loadLabState() {
  const payload = safeParse(localStorage.getItem(LAB_STATE_KEY), null);
  if (!payload) return false;

  state.markdown = normalizeMarkdown(payload.markdown || "");
  state.platform = payload.platform && PLATFORM_PROFILES[payload.platform] ? payload.platform : "blog";
  state.themeKey = payload.themeKey && THEME_PRESETS[payload.themeKey] ? payload.themeKey : PLATFORM_PROFILES[state.platform].defaultTheme;
  state.accent = payload.accent || THEME_PRESETS[state.themeKey].accent;
  if (state.themeKey === "blog_pro" && state.accent === LEGACY_BLOG_ACCENT) {
    state.accent = THEME_PRESETS.blog_pro.accent;
  }
  state.fontSize = Number(payload.fontSize) || THEME_PRESETS[state.themeKey].fontSize;
  state.lineHeight = Number(payload.lineHeight) || THEME_PRESETS[state.themeKey].lineHeight;
  state.contentWidth = Number(payload.contentWidth) || THEME_PRESETS[state.themeKey].contentWidth;
  state.wechatFootnotes = payload.wechatFootnotes !== false;
  state.imageCard = payload.imageCard !== false;
  return true;
}

function syncStateToControls() {
  $("markdownInput").value = state.markdown;
  $("platformSelect").value = state.platform;
  $("themeSelect").value = state.themeKey;
  $("accentColorInput").value = state.accent;
  $("fontSizeRange").value = String(state.fontSize);
  $("lineHeightRange").value = String(state.lineHeight);
  $("contentWidthRange").value = String(state.contentWidth);
  $("wechatFootnoteToggle").checked = state.wechatFootnotes;
  $("imageCardToggle").checked = state.imageCard;
}

function importMainDraft() {
  const raw = localStorage.getItem(MAIN_DRAFT_KEY);
  if (!raw) {
    flash("未找到主工具草稿，请先在主控台保存一次草稿");
    return;
  }

  const data = safeParse(raw, null);
  const article = data?.articleOutput || data?.state?.article || "";
  if (!article.trim()) {
    flash("主工具草稿为空，无法导入");
    return;
  }

  state.markdown = normalizeMarkdown(article);
  $("markdownInput").value = state.markdown;
  renderMarkdown();
  saveLabState();
  flash("已导入主工具草稿");
}

function bindEvents() {
  $("markdownInput").addEventListener("input", () => {
    state.markdown = normalizeMarkdown($("markdownInput").value);
    renderMarkdown();
    saveLabState();
  });

  $("platformSelect").addEventListener("change", () => {
    state.platform = $("platformSelect").value;
    const preferred = PLATFORM_PROFILES[state.platform].defaultTheme;
    applyPreset(preferred);
    readControls();
    renderMarkdown();
    saveLabState();
  });

  $("themeSelect").addEventListener("change", () => {
    applyPreset($("themeSelect").value);
    readControls();
    renderMarkdown();
    saveLabState();
  });

  ["accentColorInput", "fontSizeRange", "lineHeightRange", "contentWidthRange", "wechatFootnoteToggle", "imageCardToggle"].forEach((id) => {
    $(id).addEventListener("input", () => {
      readControls();
      renderMarkdown();
      saveLabState();
    });
    $(id).addEventListener("change", () => {
      readControls();
      renderMarkdown();
      saveLabState();
    });
  });

  $("loadSampleBtn").addEventListener("click", () => {
    state.markdown = SAMPLE_MARKDOWN;
    $("markdownInput").value = state.markdown;
    renderMarkdown();
    saveLabState();
    flash("示例 Markdown 已填充");
  });

  $("clearMarkdownBtn").addEventListener("click", () => {
    state.markdown = "";
    $("markdownInput").value = "";
    renderMarkdown();
    saveLabState();
  });

  $("importMainDraftBtn").addEventListener("click", importMainDraft);

  $("copyRichBtn").addEventListener("click", async () => {
    try {
      await copyHtmlFragment();
      flash("富文本已复制，可直接粘贴到编辑器");
    } catch {
      flash("复制失败，请检查浏览器剪贴板权限");
    }
  });

  $("copyHtmlBtn").addEventListener("click", async () => {
    try {
      await copyText(buildExportDocument());
      flash("HTML 已复制");
    } catch {
      flash("复制失败，请检查浏览器剪贴板权限");
    }
  });

  $("downloadMdBtn").addEventListener("click", () => {
    downloadFile(`aix-article-${Date.now()}.md`, state.markdown, "text/markdown;charset=utf-8");
  });

  $("downloadHtmlBtn").addEventListener("click", () => {
    downloadFile(`aix-article-${Date.now()}.html`, buildExportDocument(), "text/html;charset=utf-8");
  });

  $("remixModeSelect").addEventListener("change", updateRemixPrompt);

  $("copyRemixPromptBtn").addEventListener("click", async () => {
    try {
      await copyText($("remixPromptOutput").value);
      flash("二创提示词已复制");
    } catch {
      flash("复制失败，请检查浏览器剪贴板权限");
    }
  });
}

function boot() {
  populateThemes();

  const hasState = loadLabState();
  if (!hasState) {
    state.markdown = SAMPLE_MARKDOWN;
    state.platform = "blog";
    applyPreset(PLATFORM_PROFILES[state.platform].defaultTheme);
  }

  syncStateToControls();
  readControls();
  bindEvents();
  renderMarkdown();
  saveLabState();
}

window.addEventListener("DOMContentLoaded", () => {
  const tryBoot = () => {
    if (!window.marked || !window.DOMPurify) {
      setTimeout(tryBoot, 120);
      return;
    }
    boot();
  };
  tryBoot();
});
