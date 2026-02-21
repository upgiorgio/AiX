const X_SOURCE_URL = "https://trends24.in/";
const WECHAT_SOURCE_URL = "https://www.sogou.com/suggnew/hotwords";

function sendJson(res, statusCode, payload) {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=300");
  res.end(JSON.stringify(payload));
}

function clampInt(value, fallback, min, max) {
  const n = Number.parseInt(String(value ?? ""), 10);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, n));
}

function decodeEntities(text) {
  if (!text) return "";
  return String(text)
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll("&#x27;", "'");
}

function stripTags(text) {
  return decodeEntities(String(text || "").replace(/<[^>]*>/g, "").trim());
}

function parseTimestamp(value) {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "number") {
    if (value > 1e12) return value;
    if (value > 1e9) return value * 1000;
    return null;
  }
  const str = String(value).trim();
  if (!str) return null;
  if (/^\d+(\.\d+)?$/.test(str)) {
    const num = Number.parseFloat(str);
    if (num > 1e12) return num;
    if (num > 1e9) return num * 1000;
  }
  const t = Date.parse(str);
  return Number.isNaN(t) ? null : t;
}

function pickArray(payload) {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== "object") return [];

  const candidates = [
    payload.items,
    payload.list,
    payload.data,
    payload.result,
    payload.topics,
    payload.hot,
    payload.rows,
    payload.records,
    payload.data && payload.data.items,
    payload.data && payload.data.list,
    payload.data && payload.data.records,
    payload.result && payload.result.items,
    payload.result && payload.result.list
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return candidate;
  }
  return [];
}

function normalizeItems(rawItems, limit, hours) {
  const now = Date.now();
  const since = now - hours * 3600 * 1000;
  const normalized = [];

  for (const raw of rawItems) {
    if (raw === null || raw === undefined) continue;
    if (typeof raw === "string") {
      normalized.push({
        title: raw.trim(),
        url: "",
        score: null,
        timestamp: null
      });
      continue;
    }
    if (typeof raw !== "object") continue;

    const title = stripTags(
      raw.title || raw.name || raw.topic || raw.keyword || raw.word || raw.text || raw.query || raw.desc || ""
    );
    if (!title) continue;

    const timestamp = parseTimestamp(
      raw.timestamp ||
        raw.time ||
        raw.ts ||
        raw.publishedAt ||
        raw.published_at ||
        raw.publishTime ||
        raw.publish_time ||
        raw.createdAt ||
        raw.created_at ||
        raw.date
    );

    if (timestamp && timestamp < since) continue;

    normalized.push({
      title,
      url: String(raw.url || raw.link || raw.href || "").trim(),
      score:
        raw.score ??
        raw.hot ??
        raw.heat ??
        raw.count ??
        raw.popularity ??
        raw.value ??
        raw.trend ??
        null,
      timestamp
    });
  }

  normalized.sort((a, b) => {
    const scoreA = Number(a.score) || 0;
    const scoreB = Number(b.score) || 0;
    if (scoreA !== scoreB) return scoreB - scoreA;
    const timeA = a.timestamp || 0;
    const timeB = b.timestamp || 0;
    return timeB - timeA;
  });

  return normalized.slice(0, limit);
}

async function fetchJson(url, headers = {}) {
  const response = await fetch(url, { headers });
  if (!response.ok) {
    throw new Error(`请求失败: ${response.status}`);
  }
  return response.json();
}

function buildProviderUrl(endpoint, windowKey, limit) {
  try {
    const url = new URL(endpoint);
    url.searchParams.set("window", windowKey);
    url.searchParams.set("limit", String(limit));
    return url.toString();
  } catch {
    return endpoint;
  }
}

async function fetchCustomProvider(platform, endpoint, token, authHeader, windowKey, limit, hours) {
  if (!endpoint) {
    return {
      status: "needs_config",
      note: `未配置 ${platform} 数据源接口`,
      source: null,
      items: []
    };
  }

  const headers = {};
  if (token) headers[authHeader || "Authorization"] = token;
  const url = buildProviderUrl(endpoint, windowKey, limit);
  const payload = await fetchJson(url, headers);
  const items = normalizeItems(pickArray(payload), limit, hours);
  return {
    status: "ok",
    note: items.length ? "" : "接口可用，但当前窗口内无数据",
    source: endpoint,
    items
  };
}

function isLikelyChineseTopic(text) {
  const hasHan = /[\u4E00-\u9FFF]/.test(text);
  const hasKana = /[\u3040-\u30FF]/.test(text);
  return hasHan && !hasKana;
}

function parseXTopicsFromTrends24(html, hours, limit) {
  const now = Date.now();
  const since = now - hours * 3600 * 1000;
  const bucket = new Map();

  const blockRe =
    /<h3[^>]*class=title[^>]*data-timestamp=([0-9.]+)[^>]*>[\s\S]*?<\/h3>\s*<ol[^>]*class=trend-card__list[^>]*>([\s\S]*?)<\/ol>/g;
  let blockMatch;
  while ((blockMatch = blockRe.exec(html)) !== null) {
    const ts = parseTimestamp(blockMatch[1]);
    if (!ts || ts < since) continue;
    const listHtml = blockMatch[2];
    const itemRe = /<a[^>]*href="([^"]+)"[^>]*class=trend-link[^>]*>([\s\S]*?)<\/a>/g;
    let itemMatch;
    while ((itemMatch = itemRe.exec(listHtml)) !== null) {
      const title = stripTags(itemMatch[2]);
      if (!title) continue;
      const url = stripTags(itemMatch[1]);
      const key = title.toLowerCase();

      const existing = bucket.get(key);
      if (!existing) {
        bucket.set(key, {
          title,
          url,
          score: 1,
          timestamp: ts,
          isLikelyChinese: isLikelyChineseTopic(title)
        });
      } else {
        existing.score += 1;
        existing.timestamp = Math.max(existing.timestamp, ts);
        if (!existing.url && url) existing.url = url;
        existing.isLikelyChinese = existing.isLikelyChinese || isLikelyChineseTopic(title);
      }
    }
  }

  const all = Array.from(bucket.values()).sort((a, b) => {
    const scoreDiff = Number(b.score || 0) - Number(a.score || 0);
    if (scoreDiff) return scoreDiff;
    return (b.timestamp || 0) - (a.timestamp || 0);
  });

  const zh = all.filter((item) => item.isLikelyChinese);
  const picked = (zh.length ? zh : all).slice(0, limit).map((item) => ({
    title: item.title,
    url: item.url,
    score: item.score,
    timestamp: item.timestamp
  }));

  return {
    items: picked,
    hasChinese: zh.length > 0
  };
}

async function fetchXTopics(windowKey, limit, hours) {
  if (process.env.HOT_X_ENDPOINT) {
    return fetchCustomProvider(
      "X",
      process.env.HOT_X_ENDPOINT,
      process.env.HOT_X_TOKEN,
      process.env.HOT_X_AUTH_HEADER,
      windowKey,
      limit,
      hours
    );
  }

  const response = await fetch(X_SOURCE_URL, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; AiX-HotTopics/1.0)"
    }
  });
  if (!response.ok) {
    throw new Error(`X 源请求失败: ${response.status}`);
  }
  const html = await response.text();
  const parsed = parseXTopicsFromTrends24(html, hours, limit);

  return {
    status: "ok",
    note: parsed.hasChinese
      ? "公开源按汉字话题聚合，可能混入汉字圈词条，发布前请人工复核。"
      : "当前窗口内中文话题较少，已回退为通用趋势词",
    source: X_SOURCE_URL,
    items: parsed.items
  };
}

async function fetchWechatTopics(windowKey, limit, hours) {
  if (process.env.HOT_WECHAT_ENDPOINT) {
    return fetchCustomProvider(
      "公众号",
      process.env.HOT_WECHAT_ENDPOINT,
      process.env.HOT_WECHAT_TOKEN,
      process.env.HOT_WECHAT_AUTH_HEADER,
      windowKey,
      limit,
      hours
    );
  }

  const url = `${WECHAT_SOURCE_URL}?v=${Date.now()}`;
  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; AiX-HotTopics/1.0)"
    }
  });

  if (!response.ok) {
    throw new Error(`公众号源请求失败: ${response.status}`);
  }

  const text = await response.text();
  const match = text.match(/sogou_top_words\s*=\s*(\[[\s\S]*?\]);?/);
  if (!match) {
    throw new Error("公众号源解析失败");
  }
  let words = [];
  try {
    words = JSON.parse(match[1]);
  } catch {
    words = [];
  }

  const now = Date.now();
  const items = words.slice(0, limit).map((title, index) => ({
    title: String(title || "").trim(),
    url: `https://weixin.sogou.com/weixin?type=2&query=${encodeURIComponent(String(title || ""))}`,
    score: limit - index,
    timestamp: now
  }));

  return {
    status: "ok",
    note: "该来源提供当前热词快照，不含完整历史时间序列",
    source: WECHAT_SOURCE_URL,
    items
  };
}

async function fetchXhsTopics(windowKey, limit, hours) {
  if (!process.env.HOT_XHS_ENDPOINT) {
    return {
      status: "needs_config",
      note: "小红书平台通常需要专用 API / 登录态；请配置 HOT_XHS_ENDPOINT",
      source: null,
      items: []
    };
  }

  return fetchCustomProvider(
    "小红书",
    process.env.HOT_XHS_ENDPOINT,
    process.env.HOT_XHS_TOKEN,
    process.env.HOT_XHS_AUTH_HEADER,
    windowKey,
    limit,
    hours
  );
}

function maskError(error) {
  const msg = String(error && error.message ? error.message : error || "unknown");
  return msg.length > 160 ? `${msg.slice(0, 160)}...` : msg;
}

module.exports = async function handler(req, res) {
  try {
    const windowKey = String((req.query && req.query.window) || "48h").toLowerCase() === "7d" ? "7d" : "48h";
    const hours = windowKey === "7d" ? 24 * 7 : 48;
    const limit = clampInt(req.query && req.query.limit, 10, 3, 20);

    const [xResult, wechatResult, xhsResult] = await Promise.allSettled([
      fetchXTopics(windowKey, limit, hours),
      fetchWechatTopics(windowKey, limit, hours),
      fetchXhsTopics(windowKey, limit, hours)
    ]);

    const platforms = {
      x:
        xResult.status === "fulfilled"
          ? xResult.value
          : { status: "error", note: `X 拉取失败：${maskError(xResult.reason)}`, source: X_SOURCE_URL, items: [] },
      wechat:
        wechatResult.status === "fulfilled"
          ? wechatResult.value
          : {
              status: "error",
              note: `公众号拉取失败：${maskError(wechatResult.reason)}`,
              source: WECHAT_SOURCE_URL,
              items: []
            },
      xiaohongshu:
        xhsResult.status === "fulfilled"
          ? xhsResult.value
          : { status: "error", note: `小红书拉取失败：${maskError(xhsResult.reason)}`, source: null, items: [] }
    };

    sendJson(res, 200, {
      ok: true,
      window: windowKey,
      limit,
      updatedAt: new Date().toISOString(),
      platforms
    });
  } catch (error) {
    sendJson(res, 500, {
      ok: false,
      error: maskError(error)
    });
  }
};
