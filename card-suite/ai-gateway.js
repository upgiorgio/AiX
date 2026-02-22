/**
 * AiX AI Gateway v1.0
 * 统一 AI 接入层 — 所有工具页面共享
 * Worker: https://aix-ai-api.musd-app.workers.dev
 */

const AI_WORKER   = "https://aix-ai-api.musd-app.workers.dev";
const AI_CFG_KEY  = "aix-ai-settings-v1";

/* ── Settings ── */
function getAISettings() {
  try { return JSON.parse(localStorage.getItem(AI_CFG_KEY) || "{}"); } catch { return {}; }
}
function saveAISettings(s) {
  localStorage.setItem(AI_CFG_KEY, JSON.stringify(s));
}
function hasAIKey() {
  const s = getAISettings();
  return s.provider === "openai" && !!s.openaiKey;
}

/* ── Core: generate (non-streaming) ── */
async function aiGenerate(prompt, { system = "", fast = false } = {}) {
  const s = getAISettings();
  if (s.provider === "openai" && s.openaiKey) {
    return callOpenAI(prompt, { system, key: s.openaiKey, model: s.model || "gpt-4o-mini" });
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
async function aiStream(prompt, { system = "", onChunk, onDone, onError, fast = false } = {}) {
  const s = getAISettings();
  if (s.provider === "openai" && s.openaiKey) {
    return streamOpenAI(prompt, { system, key: s.openaiKey, model: s.model || "gpt-4o-mini", onChunk, onDone, onError });
  }
  try {
    const res = await fetch(`${AI_WORKER}/ai/stream`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, system, fast }),
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

/* ── OpenAI direct ── */
async function callOpenAI(prompt, { system, key, model }) {
  const messages = [];
  if (system) messages.push({ role: "system", content: system });
  messages.push({ role: "user", content: prompt });
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${key}` },
    body: JSON.stringify({ model, messages, max_tokens: 2048 }),
  });
  if (!res.ok) { const e = await res.json(); throw new Error(e.error?.message || "OpenAI error"); }
  const data = await res.json();
  return data.choices[0]?.message?.content || "";
}

async function streamOpenAI(prompt, { system, key, model, onChunk, onDone, onError }) {
  const messages = [];
  if (system) messages.push({ role: "system", content: system });
  messages.push({ role: "user", content: prompt });
  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${key}` },
      body: JSON.stringify({ model, messages, max_tokens: 2048, stream: true }),
    });
    if (!res.ok) { onError?.("OpenAI error " + res.status); return; }
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
        <option value="cf">🆓 免费层 · Cloudflare AI (Llama 3.3 70B)</option>
        <option value="openai">🔑 OpenAI (GPT-4o / mini)</option>
      </select>
    </label>
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
    <p class="ai-hint">🆓 免费层无需填写任何 Key，直接使用 Cloudflare Workers AI。<br>Key 只存储在本地浏览器，不上传服务器。</p>
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

  providerEl.value = s.provider || "cf";
  keyEl.value      = s.openaiKey || "";
  modelEl.value    = s.model || "gpt-4o-mini";
  openaiSec.style.display = providerEl.value === "openai" ? "flex" : "none";

  providerEl.addEventListener("change", () => {
    openaiSec.style.display = providerEl.value === "openai" ? "flex" : "none";
  });

  document.getElementById("aiModalClose").addEventListener("click", closeAISettings);
  modal.addEventListener("click", e => { if (e.target === modal) closeAISettings(); });

  document.getElementById("aiSaveBtn").addEventListener("click", () => {
    saveAISettings({ provider: providerEl.value, openaiKey: keyEl.value.trim(), model: modelEl.value });
    window.showToast?.("AI 设置已保存 ✓");
    closeAISettings();
  });

  document.getElementById("aiTestBtn").addEventListener("click", async () => {
    const resultEl = document.getElementById("aiTestResult");
    resultEl.textContent = "测试中…";
    try {
      const old = getAISettings();
      saveAISettings({ provider: providerEl.value, openaiKey: keyEl.value.trim(), model: modelEl.value });
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
  btn.innerHTML = cfg.provider === "openai" && cfg.openaiKey ? "🔑 AI" : "🤖 AI";
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
