/**
 * AiX AI API Worker
 * Kimi/Moonshot 优先的 AI 后端代理
 * Account: Account1-Khelifi (07728da33c7e188b00a80f1462376afc)
 */

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Max-Age": "86400",
};

const MODEL_DEFAULT = "@cf/meta/llama-3.3-70b-instruct-fp8-fast";
// The non-suffixed llama-3.1-8b-instruct model was deprecated by Workers AI
// on 2026-05-30 and returns 5028. Keep the fast path on the active model.
const MODEL_FAST    = "@cf/meta/llama-3.1-8b-instruct-fast";
const KIMI_BASE_URL_DEFAULT = "https://api.moonshot.cn/v1";
const KIMI_MODEL_DEFAULT = "kimi-k2.6";
const REQUEST_TIMEOUT_MS = 20_000;

function ok(body, extra = {}) {
  return new Response(body, {
    status: 200,
    headers: { ...CORS, "Content-Type": "application/json", ...extra },
  });
}
function err(msg, status = 400) {
  return new Response(JSON.stringify({ error: msg }), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}

function getKimiConfig(env, fast = false) {
  const key = env.MOONSHOT_API_KEY || env.KIMI_API_KEY || env.KIMICLAW_API_KEY;
  if (!key) return null;

  const baseUrl = (env.MOONSHOT_BASE_URL || env.KIMI_BASE_URL || env.KIMICLAW_BASE_URL || KIMI_BASE_URL_DEFAULT)
    .replace(/\/+$/, "");
  const defaultModel = env.MOONSHOT_MODEL || env.KIMI_MODEL || env.KIMICLAW_MODEL || KIMI_MODEL_DEFAULT;
  const fastModel = env.MOONSHOT_FAST_MODEL || env.KIMI_FAST_MODEL || env.KIMICLAW_FAST_MODEL || defaultModel;

  return {
    key,
    baseUrl,
    model: fast ? fastModel : defaultModel,
  };
}

function getActiveProvider(env) {
  if (getKimiConfig(env)) return "kimi";
  if (env.AI) return "cloudflare";
  return "none";
}

async function callKimiChat(messages, env, { fast = false, stream = false, maxTokens = 2048 } = {}) {
  const cfg = getKimiConfig(env, fast);
  if (!cfg) throw new Error("Kimi API key missing");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort("upstream timeout"), REQUEST_TIMEOUT_MS);
  let resp;
  try {
    resp = await fetch(`${cfg.baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${cfg.key}`,
    },
      body: JSON.stringify({
      model: cfg.model,
      messages,
      stream,
      max_tokens: maxTokens,
      }),
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Kimi error ${resp.status}: ${text.slice(0, 500)}`);
  }

  if (stream) return resp.body;

  const data = await resp.json();
  return data.choices?.[0]?.message?.content || data.choices?.[0]?.text || "";
}

async function runTextGeneration(messages, env, { fast = false, maxTokens = 2048 } = {}) {
  if (getKimiConfig(env, fast)) {
    return callKimiChat(messages, env, { fast, maxTokens });
  }

  if (!env.AI) {
    throw new Error("No AI provider configured. Set MOONSHOT_API_KEY or bind Cloudflare Workers AI.");
  }

  const model = fast ? MODEL_FAST : MODEL_DEFAULT;
  const result = await env.AI.run(model, { messages, max_tokens: maxTokens });
  return result.response || "";
}

async function runTextStream(messages, env, { fast = false, maxTokens = 2048 } = {}) {
  if (getKimiConfig(env, fast)) {
    return callKimiChat(messages, env, { fast, stream: true, maxTokens });
  }

  if (!env.AI) {
    throw new Error("No AI provider configured. Set MOONSHOT_API_KEY or bind Cloudflare Workers AI.");
  }

  const model = fast ? MODEL_FAST : MODEL_DEFAULT;
  return env.AI.run(model, {
    messages,
    stream: true,
    max_tokens: maxTokens,
  });
}

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS });
    }
    if (request.method === "GET") {
      return ok(JSON.stringify({
        status: "ok",
        version: "1.1",
        service: "AiX AI API",
        provider: getActiveProvider(env),
      }));
    }
    if (request.method !== "POST") {
      return err("Method not allowed", 405);
    }

    const url = new URL(request.url);
    let body;
    try { body = await request.json(); } catch { return err("Invalid JSON"); }

    switch (url.pathname) {
      case "/ai/generate": return handleGenerate(body, env, false);
      case "/ai/stream":   return handleGenerate(body, env, true);
      case "/url/extract": return handleUrlExtract(body, env);
      default: return err("Not found", 404);
    }
  },
};

/* ── /ai/generate + /ai/stream ── */
async function handleGenerate(body, env, streaming) {
  const { prompt, system, fast = false } = body;
  if (!prompt) return err("prompt required");

  const messages = [];
  if (system) messages.push({ role: "system", content: system });
  messages.push({ role: "user", content: prompt });

  try {
    if (streaming) {
      const stream = await runTextStream(messages, env, { fast });
      return new Response(stream, {
        headers: {
          ...CORS,
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          "X-Content-Type-Options": "nosniff",
        },
      });
    } else {
      const content = await runTextGeneration(messages, env, { fast });
      return ok(JSON.stringify({ content }));
    }
  } catch (e) {
    return err("AI error: " + e.message, 500);
  }
}

/* ── /url/extract ── */
async function handleUrlExtract(body, env) {
  const { url: targetUrl } = body;
  if (!targetUrl) return err("url required");

  let rawText = "";
  try {
    const resp = await fetch(targetUrl, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; AixBot/1.0)" },
      cf: { cacheTtl: 1800, cacheEverything: true },
    });
    const html = await resp.text();
    rawText = html
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<!--[\s\S]*?-->/g, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/\s{2,}/g, " ")
      .trim()
      .slice(0, 4000);
  } catch (e) {
    return err("URL fetch failed: " + e.message);
  }

  if (!rawText) return err("No text content found");

  const sys = `你是内容摘要助手。从网页内容中提取关键信息，严格返回如下JSON（不加其他说明）：
{"title":"建议标题（10字以内）","points":["核心要点1","核心要点2","核心要点3"],"quote":"最值得摘录的金句（原文或改写，20字以内）","summary":"一句话摘要（30字以内）"}`;

  try {
    const response = await runTextGeneration([
      { role: "system", content: sys },
      { role: "user", content: rawText },
    ], env, { maxTokens: 512 });
    let parsed;
    try {
      const m = response.match(/\{[\s\S]*\}/);
      parsed = m ? JSON.parse(m[0]) : { summary: response, points: [], title: "", quote: "" };
    } catch {
      parsed = { summary: response, points: [], title: "", quote: "" };
    }
    return ok(JSON.stringify(parsed));
  } catch (e) {
    return err("AI summary error: " + e.message, 500);
  }
}
