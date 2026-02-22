const DESIGNER_STATE_KEY = "aix-card-suite-designer-v1";
const DESIGNER_INPUT_KEY = "aix-card-suite-designer-input";
const CARD_BATCH_KEY = "aix-card-suite-cards-v1";

const sizeMap = {
  xhs: { label: "1080 × 1440", ratio: "3 / 4", maxChars: 120 },
  x: { label: "1200 × 675", ratio: "16 / 9", maxChars: 90 },
  wechat: { label: "900 × 383", ratio: "2.35 / 1", maxChars: 68 },
  square: { label: "1080 × 1080", ratio: "1 / 1", maxChars: 100 }
};

/* ── Typography presets ── */
const TYPO_PRESETS = {
  default: { titleSize: 24, bodySize: 15, paddingH: 24, paddingV: 24, lineHeight: 1.6, textAlign: "left" },
  large:   { titleSize: 42, bodySize: 18, paddingH: 28, paddingV: 28, lineHeight: 1.65, textAlign: "left" },
  hero:    { titleSize: 76, bodySize: 15, paddingH: 32, paddingV: 36, lineHeight: 1.1,  textAlign: "center" }
};

const ALL_TEMPLATE_CLASSES = [
  "template-a","template-b","template-c","template-d","template-e",
  "template-f","template-g","template-h","template-i","template-j",
  "template-k","template-l","template-m","template-n","template-o",
  "template-p","template-q","template-r",
  "template-s","template-t","template-u","template-v","template-w",
  "template-x","template-y","template-z",
  "template-aa","template-ab","template-ac","template-ad"
];

let splitCards = [];

function $(id) {
  return document.getElementById(id);
}

/* ── Markdown rendering ── */

function escHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function inlineMarkdown(str) {
  let s = escHtml(str);
  s = s.replace(/\*\*\*(.+?)\*\*\*/g,  "<strong><em>$1</em></strong>");
  s = s.replace(/\*\*(.+?)\*\*/g,      "<strong>$1</strong>");
  s = s.replace(/\*(.+?)\*/g,          "<em>$1</em>");
  s = s.replace(/`(.+?)`/g,            "<code>$1</code>");
  s = s.replace(/\[(.+?)\]\(.+?\)/g,   "$1");
  return s;
}

function renderMarkdown(text) {
  if (!text) return "";
  const raw = String(text)
    .replace(/```[\s\S]*?```/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  const lines = raw.split("\n");
  const out = [];

  for (const line of lines) {
    if (line.trim() === "") {
      out.push('<span class="md-blank"> </span>');
      continue;
    }
    if (/^###\s/.test(line)) {
      out.push(`<span class="md-h3">${inlineMarkdown(line.replace(/^###\s+/, ""))}</span>`);
    } else if (/^##\s/.test(line)) {
      out.push(`<span class="md-h2">${inlineMarkdown(line.replace(/^##\s+/, ""))}</span>`);
    } else if (/^#\s/.test(line)) {
      out.push(`<span class="md-h1">${inlineMarkdown(line.replace(/^#\s+/, ""))}</span>`);
    } else if (/^[-*+]\s/.test(line)) {
      out.push(`<span class="md-li">·&thinsp;${inlineMarkdown(line.replace(/^[-*+]\s+/, ""))}</span>`);
    } else if (/^>\s?/.test(line)) {
      out.push(`<span class="md-quote">${inlineMarkdown(line.replace(/^>\s?/, ""))}</span>`);
    } else {
      out.push(`<span class="md-p">${inlineMarkdown(line)}</span>`);
    }
  }

  return out.join("\n");
}

/* ── Background override ── */

function applyBgOverride(bg) {
  const canvas = $("cardCanvas");
  if (!canvas) return;
  if (bg) {
    canvas.style.background = bg;
  } else {
    canvas.style.background = "";
  }
}

function readBgOverride() {
  return $("cardCanvas")?.style.background || "";
}

/* ── Core state ── */

function readTypography() {
  return {
    titleSize:  parseInt($("titleSize")?.value)    || TYPO_PRESETS.default.titleSize,
    bodySize:   parseInt($("bodySize")?.value)     || TYPO_PRESETS.default.bodySize,
    paddingH:   parseInt($("paddingH")?.value)     || TYPO_PRESETS.default.paddingH,
    paddingV:   parseInt($("paddingV")?.value)     || TYPO_PRESETS.default.paddingV,
    lineHeight: parseFloat($("lineHeight")?.value) || TYPO_PRESETS.default.lineHeight,
    textAlign:  $("textAlign")?.value              || TYPO_PRESETS.default.textAlign
  };
}

function setTypoUI(t) {
  if (!t) return;
  const set = (id, val, dispId) => {
    const el = $(id); if (!el) return;
    el.value = val;
    const disp = $(dispId); if (disp) disp.textContent = val;
  };
  set("titleSize",  t.titleSize,  "titleSizeVal");
  set("bodySize",   t.bodySize,   "bodySizeVal");
  set("paddingH",   t.paddingH,   "paddingHVal");
  set("paddingV",   t.paddingV,   "paddingVVal");
  set("lineHeight", t.lineHeight, "lineHeightVal");
  if ($("textAlign")) $("textAlign").value = t.textAlign;
}

function applyTypography(t) {
  if (!t) return;
  const canvas = $("cardCanvas"); if (!canvas) return;

  canvas.style.paddingLeft   = t.paddingH + "px";
  canvas.style.paddingRight  = t.paddingH + "px";
  canvas.style.paddingTop    = t.paddingV + "px";
  canvas.style.paddingBottom = t.paddingV + "px";

  const titleEl = $("previewTitle");
  if (titleEl) {
    titleEl.style.fontSize   = t.titleSize + "px";
    titleEl.style.textAlign  = t.textAlign;
    titleEl.style.lineHeight = t.titleSize > 50 ? "1.1" : "1.3";
  }

  const textEl = $("previewText");
  if (textEl) {
    textEl.style.fontSize   = t.bodySize + "px";
    textEl.style.lineHeight = String(t.lineHeight);
    textEl.style.textAlign  = t.textAlign;
  }
}

function readState() {
  return {
    template:   $("template").value,
    sizePreset: $("sizePreset").value,
    author:     $("author").value.trim(),
    cardTitle:  $("cardTitle").value.trim(),
    cardText:   $("cardText").value,
    typography: readTypography(),
    bgOverride: readBgOverride()
  };
}

function applyState(state) {
  if (!state) return;
  ["template", "sizePreset", "author", "cardTitle", "cardText"].forEach((key) => {
    if ($(key) && typeof state[key] !== "undefined") {
      $(key).value = state[key];
    }
  });
  if (state.typography) {
    setTypoUI(state.typography);
    applyTypography(state.typography);
  }
  if (typeof state.bgOverride !== "undefined") {
    applyBgOverride(state.bgOverride);
  }
}

function saveState() {
  localStorage.setItem(DESIGNER_STATE_KEY, JSON.stringify(readState()));
}

function loadState() {
  applyState(readJsonStorage(DESIGNER_STATE_KEY));
}

/* ── Draft import ── */

function importDraft() {
  const incoming = readJsonStorage(DESIGNER_INPUT_KEY);
  const shared = getSharedDraftText();
  if (incoming?.text) {
    $("cardText").value = incoming.text;
    if (incoming.topic && !$("cardTitle").value.trim()) {
      $("cardTitle").value = incoming.topic;
    }
    showToast("已导入文案工场内容");
  } else if (shared) {
    $("cardText").value = shared;
    const heading = shared.match(/^#\s+(.+)$/m);
    if (heading && !$("cardTitle").value.trim()) {
      $("cardTitle").value = heading[1].trim();
    }
    showToast("已导入共享草稿");
  } else {
    showToast("未找到可导入草稿");
    return;
  }
  syncPreview();
  saveState();
}

/* ── Text helpers ── */

function cleanText(text) {
  return String(text || "")
    .replace(/```[\s\S]*?```/g, "")
    .replace(/^#\s+/gm, "")
    .replace(/^>\s?/gm, "")
    .replace(/\*\*/g, "")
    .replace(/\[(.*?)\]\((.*?)\)/g, "$1")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function splitIntoCards(text, maxChars) {
  const paragraphs = cleanText(text)
    .split(/\n\s*\n/g)
    .map((p) => p.trim())
    .filter(Boolean);

  if (!paragraphs.length) return [];

  const chunks = [];
  let buffer = "";

  paragraphs.forEach((part) => {
    if ((buffer + "\n\n" + part).trim().length <= maxChars) {
      buffer = buffer ? `${buffer}\n\n${part}` : part;
    } else {
      if (buffer) chunks.push(buffer);
      if (part.length <= maxChars) {
        buffer = part;
      } else {
        const segments = part.match(new RegExp(`.{1,${Math.max(30, Math.floor(maxChars * 0.72))}}`, "g")) || [part];
        segments.forEach((seg, idx) => {
          if (idx < segments.length - 1) chunks.push(seg);
          else buffer = seg;
        });
      }
    }
  });

  if (buffer) chunks.push(buffer);
  return chunks;
}

/* ── Preview ── */

function syncPreview() {
  const state = readState();
  const size = sizeMap[state.sizePreset] || sizeMap.xhs;
  const title = state.cardTitle || "卡片标题";
  const rawText = state.cardText || "";
  const author = state.author || "Giorgio";

  const canvas = $("cardCanvas");
  canvas.classList.remove(...ALL_TEMPLATE_CLASSES);
  canvas.classList.add(state.template);
  canvas.style.aspectRatio = size.ratio;
  /* 模板切换后保留自定义背景 */
  if (state.bgOverride) {
    canvas.style.background = state.bgOverride;
  }

  $("previewTitle").textContent = title;

  /* Markdown 渲染正文 */
  const textEl = $("previewText");
  const displayText = rawText.trim()
    ? rawText.slice(0, size.maxChars * 3)   // 宽松截取给 MD 处理
    : "正文内容会在这里展示。";
  textEl.innerHTML = renderMarkdown(displayText);

  $("previewSize").textContent = size.label;
  $("previewAuthor").textContent = `@${author}`;

  applyTypography(readTypography());
}

/* ── Split cards ── */

function renderSplitCards() {
  const grid = $("cardsGrid");
  grid.innerHTML = "";

  if (!splitCards.length) {
    $("splitMeta").textContent = "暂无拆分结果。";
    return;
  }

  $("splitMeta").textContent = `已拆分 ${splitCards.length} 张（可在发布中心直接复用）。`;
  splitCards.forEach((card) => {
    const node = document.createElement("article");
    node.className = "mini-card";
    node.innerHTML = `<p>${card.text.replaceAll("<", "&lt;").replaceAll(">", "&gt;")}</p><div class="meta">第 ${card.index} 张 · ${card.chars} 字</div>`;
    grid.appendChild(node);
  });
}

function splitCardsAction() {
  const state = readState();
  const size = sizeMap[state.sizePreset] || sizeMap.xhs;
  const pieces = splitIntoCards(state.cardText, size.maxChars);
  splitCards = pieces.map((text, idx) => ({
    index: idx + 1,
    text,
    chars: text.replace(/\s+/g, "").length,
    title: state.cardTitle || "未命名卡片",
    template: state.template,
    sizePreset: state.sizePreset,
    author: state.author || "Giorgio"
  }));

  localStorage.setItem(CARD_BATCH_KEY, JSON.stringify({
    updatedAt: Date.now(),
    cards: splitCards,
    source: state
  }));

  renderSplitCards();
  showToast(`已拆分 ${splitCards.length} 张`);
}

/* ── PNG Export (hides size label) ── */

async function exportCurrentPng() {
  const target = $("cardCanvas");
  if (!window.html2canvas) {
    showToast("导出组件加载中，请稍后重试");
    return;
  }
  /* 导出时隐藏尺寸标签，保留作者水印 */
  const sizeEl = $("previewSize");
  if (sizeEl) sizeEl.style.visibility = "hidden";

  try {
    const canvas = await window.html2canvas(target, {
      backgroundColor: null,
      scale: 2,
      useCORS: true
    });
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `aix-card-${nowTag()}.png`;
    a.click();
    showToast("PNG 已导出");
  } finally {
    if (sizeEl) sizeEl.style.visibility = "";
  }
}

/* ── Copy image to clipboard ── */

async function copyImageToClipboard() {
  const target = $("cardCanvas");
  if (!window.html2canvas) {
    showToast("导出组件加载中，请稍后重试");
    return;
  }
  const sizeEl = $("previewSize");
  if (sizeEl) sizeEl.style.visibility = "hidden";

  try {
    const canvas = await window.html2canvas(target, {
      backgroundColor: null,
      scale: 2,
      useCORS: true
    });
    canvas.toBlob(async (blob) => {
      if (!blob) { showToast("生成图片失败"); return; }
      try {
        await navigator.clipboard.write([
          new ClipboardItem({ "image/png": blob })
        ]);
        showToast("图片已复制到剪贴板 ✓");
      } catch {
        /* 降级：弹出图片 */
        const url = URL.createObjectURL(blob);
        window.open(url, "_blank");
        showToast("已在新标签打开，请手动右键复制");
      }
    }, "image/png");
  } finally {
    if (sizeEl) sizeEl.style.visibility = "";
  }
}

/* ── Publish hub ── */

function toPublishHub() {
  const state = readState();
  if (!splitCards.length) {
    splitCardsAction();
  }
  localStorage.setItem(CARD_BATCH_KEY, JSON.stringify({
    updatedAt: Date.now(),
    cards: splitCards,
    source: state
  }));
  window.location.href = "/card-suite/publish-hub.html";
}

/* ── Boot ── */

window.addEventListener("DOMContentLoaded", () => {
  loadState();

  /* ── URL preset override (from platform navigation) ── */
  const urlPreset = new URLSearchParams(location.search).get("preset");
  if (urlPreset && sizeMap[urlPreset]) {
    $("sizePreset").value = urlPreset;
  }

  if (!$("author").value.trim()) {
    $("author").value = "Giorgio";
  }
  if (!$("cardText").value.trim()) {
    importDraft();
  }

  syncPreview();

  /* Main controls */
  ["template", "sizePreset", "author", "cardTitle", "cardText"].forEach((id) => {
    $(id).addEventListener("input",  () => { syncPreview(); saveState(); });
    $(id).addEventListener("change", () => { syncPreview(); saveState(); });
  });

  /* Typography sliders */
  ["titleSize", "bodySize", "paddingH", "paddingV", "lineHeight"].forEach((id) => {
    const el = $(id); if (!el) return;
    el.addEventListener("input", () => {
      const disp = $(id + "Val"); if (disp) disp.textContent = el.value;
      applyTypography(readTypography());
      saveState();
    });
  });

  /* Text align */
  const alignEl = $("textAlign");
  if (alignEl) {
    alignEl.addEventListener("change", () => {
      applyTypography(readTypography());
      saveState();
    });
  }

  /* Preset buttons */
  document.querySelectorAll("[data-typo-preset]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const preset = TYPO_PRESETS[btn.dataset.typoPreset];
      if (preset) {
        setTypoUI(preset);
        applyTypography(preset);
        saveState();
        showToast("排版已切换：" + (btn.textContent || btn.dataset.typoPreset));
      }
    });
  });

  /* Action buttons */
  $("importDraftBtn").addEventListener("click", importDraft);
  $("splitBtn").addEventListener("click", splitCardsAction);
  $("saveStateBtn").addEventListener("click", () => {
    saveState();
    showToast("设计参数已保存");
  });

  $("exportPngBtn").addEventListener("click", exportCurrentPng);

  const copyImgBtn = $("copyImageBtn");
  if (copyImgBtn) copyImgBtn.addEventListener("click", copyImageToClipboard);

  $("copyJsonBtn").addEventListener("click", () => {
    const payload = { updatedAt: Date.now(), source: readState(), cards: splitCards };
    copyText(JSON.stringify(payload, null, 2), "批量JSON已复制");
  });
  $("downloadJsonBtn").addEventListener("click", () => {
    const payload = { updatedAt: Date.now(), source: readState(), cards: splitCards };
    downloadFile(`aix-card-batch-${nowTag()}.json`, JSON.stringify(payload, null, 2), "application/json;charset=utf-8");
  });

  $("toPublishBtn").addEventListener("click", toPublishHub);

  /* ── 背景自定义 ── */
  document.querySelectorAll(".bg-swatch[data-bg]").forEach((btn) => {
    btn.addEventListener("click", () => {
      applyBgOverride(btn.dataset.bg);
      saveState();
    });
  });

  const bgResetBtn = $("bgResetBtn");
  if (bgResetBtn) {
    bgResetBtn.addEventListener("click", () => {
      applyBgOverride("");
      saveState();
      showToast("已恢复模板背景");
    });
  }

  const bgColorPicker = $("bgColorPicker");
  if (bgColorPicker) {
    bgColorPicker.addEventListener("input", () => {
      applyBgOverride(bgColorPicker.value);
      saveState();
    });
  }

  const cachedBatch = readJsonStorage(CARD_BATCH_KEY);
  if (cachedBatch?.cards?.length) {
    splitCards = cachedBatch.cards;
    renderSplitCards();
  }
});
