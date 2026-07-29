/**
 * AiX AI Gateway v1.0
 * 统一 AI 接入层 — 所有工具页面共享
 * Worker: https://aix-ai-api.musd-app.workers.dev
 */

const AI_WORKER   = "https://aix-ai-api.musd-app.workers.dev";
const AI_CFG_KEY  = "aix-ai-settings-v1";
const OPENAI_BASE_URL = "https://api.openai.com/v1";
const KIMI_BASE_URL = "https://api.moonshot.cn/v1";
const KIMI_MODEL = "kimi-k2.6";

/* ── Settings ── */
function normalizeProvider(provider) {
  const value = String(provider || "cf").toLowerCase();
  if (["kimi", "moonshot"].includes(value)) return "kimi";
  if (["openai", "gpt"].includes(value)) return "openai";
  if (["cf", "worker", "cloudflare", "kimiclaw", "kimi-claw"].includes(value)) return "cf";
  return "cf";
}

function normalizeBaseUrl(url, fallback) {
  return String(url || fallback).replace(/\/+$/, "");
}

function getAISettings() {
  try {
    const s = JSON.parse(localStorage.getItem(AI_CFG_KEY) || "{}");
    return { ...s, provider: normalizeProvider(s.provider) };
  } catch {
    return { provider: "cf" };
  }
}
function saveAISettings(s) {
  localStorage.setItem(AI_CFG_KEY, JSON.stringify({ ...s, provider: normalizeProvider(s.provider) }));
}
function hasAIKey() {
  const s = getAISettings();
  return (s.provider === "openai" && !!s.openaiKey) || (s.provider === "kimi" && !!s.kimiKey);
}

/* ── Core: generate (non-streaming) ── */
async function aiGenerate(prompt, { system = "", fast = false } = {}) {
  const s = getAISettings();
  if (s.provider === "openai" && s.openaiKey) {
    return callChatCompletions(prompt, { system, key: s.openaiKey, model: s.model || "gpt-4o-mini", baseUrl: OPENAI_BASE_URL });
  }
  if (s.provider === "kimi" && s.kimiKey) {
    return callChatCompletions(prompt, {
      system,
      key: s.kimiKey,
      model: s.kimiModel || KIMI_MODEL,
      baseUrl: normalizeBaseUrl(s.kimiBaseUrl, KIMI_BASE_URL),
    });
  }
  const res = await fetch(`${AI_WORKER}/ai/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, system, fast }),
  });
  if (!res.ok) throw new Error(`AI error ${res.status}`);
  const data = await res.json();
  return data.content || "";
}

/* ── Core: stream (SSE) ── */
async function aiStream(prompt, { system = "", onChunk, onDone, onError, fast = false, signal } = {}) {
  const s = getAISettings();
  if (s.provider === "openai" && s.openaiKey) {
    return streamChatCompletions(prompt, { system, key: s.openaiKey, model: s.model || "gpt-4o-mini", baseUrl: OPENAI_BASE_URL, onChunk, onDone, onError, signal });
  }
  if (s.provider === "kimi" && s.kimiKey) {
    return streamChatCompletions(prompt, {
      system,
      key: s.kimiKey,
      model: s.kimiModel || KIMI_MODEL,
      baseUrl: normalizeBaseUrl(s.kimiBaseUrl, KIMI_BASE_URL),
      onChunk,
      onDone,
      onError,
      signal,
    });
  }
  try {
    const res = await fetch(`${AI_WORKER}/ai/stream`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, system, fast }),
      signal,
    });
    if (!res.ok) { onError?.("连接失败 " + res.status); return; }
    const reader = res.body.getReader();
    const dec = new TextDecoder();
    let buf = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });
      const lines = buf.split("\n");
      buf = lines.pop();
      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        const raw = line.slice(6).trim();
        if (raw === "[DONE]") { onDone?.(); return; }
        try {
          const parsed = JSON.parse(raw);
          const chunk = parsed.response ?? parsed.choices?.[0]?.delta?.content ?? "";
          if (chunk) onChunk?.(chunk);
        } catch {}
      }
    }
    onDone?.();
  } catch (e) {
    onError?.(e.message);
  }
}

/* ── URL Extract ── */
async function aiExtractUrl(url) {
  const res = await fetch(`${AI_WORKER}/url/extract`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });
  if (!res.ok) throw new Error("提取失败");
  return await res.json();
}

/* ── OpenAI-compatible direct ── */
async function callChatCompletions(prompt, { system, key, model, baseUrl }) {
  const messages = [];
  if (system) messages.push({ role: "system", content: system });
  messages.push({ role: "user", content: prompt });
  const res = await fetch(`${normalizeBaseUrl(baseUrl, OPENAI_BASE_URL)}/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${key}` },
    body: JSON.stringify({ model, messages, max_tokens: 2048 }),
  });
  if (!res.ok) {
    const e = await res.json().catch(() => ({}));
    throw new Error(e.error?.message || `AI provider error ${res.status}`);
  }
  const data = await res.json();
  return data.choices[0]?.message?.content || "";
}

async function streamChatCompletions(prompt, { system, key, model, baseUrl, onChunk, onDone, onError, signal }) {
  const messages = [];
  if (system) messages.push({ role: "system", content: system });
  messages.push({ role: "user", content: prompt });
  try {
    const res = await fetch(`${normalizeBaseUrl(baseUrl, OPENAI_BASE_URL)}/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${key}` },
      body: JSON.stringify({ model, messages, max_tokens: 2048, stream: true }),
      signal,
    });
    if (!res.ok) { onError?.("AI provider error " + res.status); return; }
    const reader = res.body.getReader();
    const dec = new TextDecoder();
    let buf = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });
      const lines = buf.split("\n");
      buf = lines.pop();
      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        const raw = line.slice(6).trim();
        if (raw === "[DONE]") { onDone?.(); return; }
        try {
          const p = JSON.parse(raw);
          const chunk = p.choices?.[0]?.delta?.content ?? "";
          if (chunk) onChunk?.(chunk);
        } catch {}
      }
    }
    onDone?.();
  } catch (e) { onError?.(e.message); }
}

/* ── Settings Modal (injected into DOM) ── */
function injectSettingsModal() {
  if (document.getElementById("aiSettingsModal")) return;
  const s = getAISettings();

  const modal = document.createElement("div");
  modal.id = "aiSettingsModal";
  modal.className = "ai-modal-overlay";
  modal.setAttribute("aria-hidden", "true");
  modal.innerHTML = `
<div class="ai-modal" role="dialog" aria-labelledby="aiModalTitle">
  <div class="ai-modal-head">
    <span id="aiModalTitle">⚙️ AI 设置</span>
    <button class="ai-modal-close" id="aiModalClose" aria-label="关闭">✕</button>
  </div>
  <div class="ai-modal-body">
    <label class="ai-field">
      <span>AI 服务</span>
      <select id="aiProvider">
        <option value="cf">🌙 KimiClaw 后端（Worker 代理）</option>
        <option value="kimi">🔑 Kimi / Moonshot（本地 Key）</option>
        <option value="openai">🔑 OpenAI (GPT-4o / mini)</option>
      </select>
    </label>
    <div id="aiKimiSection" class="ai-openai-section">
      <label class="ai-field">
        <span>Kimi API Key</span>
        <input id="aiKimiKey" type="password" placeholder="sk-..." autocomplete="off" />
      </label>
      <label class="ai-field">
        <span>Kimi Base URL</span>
        <input id="aiKimiBaseUrl" type="url" placeholder="${KIMI_BASE_URL}" autocomplete="off" />
      </label>
      <label class="ai-field">
        <span>Kimi 模型</span>
        <input id="aiKimiModel" type="text" placeholder="${KIMI_MODEL}" autocomplete="off" />
      </label>
    </div>
    <div id="aiOpenaiSection" class="ai-openai-section">
      <label class="ai-field">
        <span>OpenAI API Key</span>
        <input id="aiOpenaiKey" type="password" placeholder="sk-..." autocomplete="off" />
      </label>
      <label class="ai-field">
        <span>模型</span>
        <select id="aiOpenaiModel">
          <option value="gpt-4o-mini">gpt-4o-mini（快速·经济）</option>
          <option value="gpt-4o">gpt-4o（高质量）</option>
          <option value="gpt-4-turbo">gpt-4-turbo</option>
        </select>
      </label>
    </div>
    <p class="ai-hint">默认走 KimiClaw Worker 代理，无需在浏览器填写 Key。<br>本地 Key 只存储在当前浏览器，不上传服务器。</p>
    <div class="ai-modal-actions">
      <button class="btn btn-primary" id="aiSaveBtn">保存设置</button>
      <button class="btn" id="aiTestBtn">测试连接</button>
    </div>
    <p class="ai-test-result" id="aiTestResult"></p>
  </div>
</div>`;
  document.body.appendChild(modal);

  // Populate
  const providerEl = document.getElementById("aiProvider");
  const keyEl      = document.getElementById("aiOpenaiKey");
  const modelEl    = document.getElementById("aiOpenaiModel");
  const openaiSec  = document.getElementById("aiOpenaiSection");
  const kimiSec    = document.getElementById("aiKimiSection");
  const kimiKeyEl  = document.getElementById("aiKimiKey");
  const kimiBaseEl = document.getElementById("aiKimiBaseUrl");
  const kimiModelEl= document.getElementById("aiKimiModel");

  providerEl.value = s.provider || "cf";
  keyEl.value      = s.openaiKey || "";
  modelEl.value    = s.model || "gpt-4o-mini";
  kimiKeyEl.value   = s.kimiKey || "";
  kimiBaseEl.value  = s.kimiBaseUrl || KIMI_BASE_URL;
  kimiModelEl.value = s.kimiModel || KIMI_MODEL;

  function syncProviderSections() {
    openaiSec.style.display = providerEl.value === "openai" ? "flex" : "none";
    kimiSec.style.display = providerEl.value === "kimi" ? "flex" : "none";
  }
  syncProviderSections();

  providerEl.addEventListener("change", () => {
    syncProviderSections();
  });

  document.getElementById("aiModalClose").addEventListener("click", closeAISettings);
  modal.addEventListener("click", e => { if (e.target === modal) closeAISettings(); });

  document.getElementById("aiSaveBtn").addEventListener("click", () => {
    saveAISettings({
      provider: providerEl.value,
      openaiKey: keyEl.value.trim(),
      model: modelEl.value,
      kimiKey: kimiKeyEl.value.trim(),
      kimiBaseUrl: normalizeBaseUrl(kimiBaseEl.value, KIMI_BASE_URL),
      kimiModel: kimiModelEl.value.trim() || KIMI_MODEL,
    });
    window.showToast?.("AI 设置已保存 ✓");
    closeAISettings();
  });

  document.getElementById("aiTestBtn").addEventListener("click", async () => {
    const resultEl = document.getElementById("aiTestResult");
    resultEl.textContent = "测试中…";
    try {
      const old = getAISettings();
      saveAISettings({
        provider: providerEl.value,
        openaiKey: keyEl.value.trim(),
        model: modelEl.value,
        kimiKey: kimiKeyEl.value.trim(),
        kimiBaseUrl: normalizeBaseUrl(kimiBaseEl.value, KIMI_BASE_URL),
        kimiModel: kimiModelEl.value.trim() || KIMI_MODEL,
      });
      const reply = await aiGenerate("用一句话介绍你自己（中文，20字以内）", { fast: true });
      resultEl.textContent = "✅ " + reply;
      saveAISettings(old); // restore unsaved
    } catch (e) {
      resultEl.textContent = "❌ " + e.message;
    }
  });
}

function openAISettings() {
  const m = document.getElementById("aiSettingsModal");
  if (!m) return;
  m.setAttribute("aria-hidden", "false");
  m.classList.add("ai-modal-open");
}
function closeAISettings() {
  const m = document.getElementById("aiSettingsModal");
  if (!m) return;
  m.setAttribute("aria-hidden", "true");
  m.classList.remove("ai-modal-open");
}

/* ── Inject AI button into topbar ── */
function injectAIButton() {
  const topbar = document.querySelector(".topbar");
  if (!topbar || document.getElementById("aiSettingsBtn")) return;
  const btn = document.createElement("button");
  btn.id = "aiSettingsBtn";
  btn.className = "btn ai-settings-btn";
  btn.setAttribute("title", "AI 设置");
  const cfg = getAISettings();
  btn.innerHTML = hasAIKey() ? "🔑 AI" : (cfg.provider === "cf" ? "🌙 AI" : "🤖 AI");
  btn.addEventListener("click", openAISettings);
  topbar.querySelector(".nav-links, nav")?.before(btn) || topbar.appendChild(btn);
}

/* ── Streaming helper: pump text into a textarea/element ── */
function streamIntoEl(el, { clearFirst = true, cursorChar = "▋" } = {}) {
  if (clearFirst) el.value !== undefined ? (el.value = "") : (el.textContent = "");
  let full = "";
  return {
    onChunk(chunk) {
      full += chunk;
      if (el.value !== undefined) {
        el.value = full + cursorChar;
        el.scrollTop = el.scrollHeight;
      } else {
        el.textContent = full + cursorChar;
      }
    },
    onDone() {
      if (el.value !== undefined) el.value = full;
      else el.textContent = full;
    },
    onError(msg) {
      if (el.value !== undefined) el.value = `[错误] ${msg}`;
      else el.textContent = `[错误] ${msg}`;
    },
    getText() { return full; },
  };
}

/* ── Expose to window ── */
window.AiGateway = {
  generate:    aiGenerate,
  stream:      aiStream,
  extractUrl:  aiExtractUrl,
  openSettings: openAISettings,
  closeSettings: closeAISettings,
  streamIntoEl,
  hasKey:      hasAIKey,
  getSettings: getAISettings,
};

/* ── Auto-init on DOM ready ── */
document.addEventListener("DOMContentLoaded", () => {
  injectSettingsModal();
  injectAIButton();
});
