#!/usr/bin/env python3
import datetime as dt
import html
import json
from collections import Counter
from pathlib import Path


BASE = Path("/Users/mac/Documents/参考素材/来自收藏夹知识库")
DATA = BASE / "data" / "bookmarks_analysis.json"
ASSETS = BASE / "assets"

TOPIC_LABELS = {
    "dev-web": "开发建站",
    "design-ui": "设计素材",
    "device-system": "设备系统",
    "life-business": "生活商务",
    "media-culture": "影音转换",
    "account-service": "账号入口",
    "archive": "归档",
}

BUCKET_LABELS = {
    "offline": "可本地化",
    "api": "需联网/API",
    "binary": "需本地引擎",
    "external": "外部入口",
}

BUCKET_ACTIONS = {
    "offline": "已优先抽象为本页内置工具或离线组件。",
    "api": "保留入口；后续可接公开接口或本地缓存。",
    "binary": "需要 ffmpeg、WASM 或命令行封装，暂不伪装成纯 HTML。",
    "external": "作为外部工作台入口保留，不建议复刻商业平台。",
}


def read_tools():
    rows = json.loads(DATA.read_text(encoding="utf-8"))
    tools = [row for row in rows if row.get("content_type") == "tool"]
    slim = []
    for row in tools:
        slim.append(
            {
                "id": row["id"],
                "title": row.get("effective_title") or row.get("bookmark_title"),
                "url": row["url"],
                "host": row["host"],
                "topic": row["topic"],
                "topicLabel": TOPIC_LABELS.get(row["topic"], row["topic"]),
                "bucket": row.get("tool_bucket") or "external",
                "bucketLabel": BUCKET_LABELS.get(row.get("tool_bucket"), row.get("tool_bucket") or "外部入口"),
                "status": row.get("status"),
                "httpStatus": row.get("http_status"),
                "analysis": row.get("analysis", ""),
                "suggestion": row.get("suggestion", ""),
            }
        )
    return sorted(slim, key=lambda r: (r["bucket"], r["topic"], r["host"], r["title"]))


def write_data_js(tools):
    ASSETS.mkdir(parents=True, exist_ok=True)
    stats = {
        "total": len(tools),
        "byBucket": Counter(t["bucket"] for t in tools),
        "byTopic": Counter(t["topic"] for t in tools),
        "generatedAt": dt.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
    }
    js = "window.LOCAL_TOOL_LINKS = "
    js += json.dumps(tools, ensure_ascii=False, indent=2)
    js += ";\nwindow.LOCAL_TOOL_STATS = "
    js += json.dumps(stats, ensure_ascii=False, indent=2, default=dict)
    js += ";\n"
    (ASSETS / "local-tools-data.js").write_text(js, encoding="utf-8")
    (BASE / "data" / "local_tools_catalog.json").write_text(
        json.dumps({"tools": tools, "stats": stats}, ensure_ascii=False, indent=2, default=dict),
        encoding="utf-8",
    )


def write_html(tools):
    generated = dt.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    counts = Counter(t["bucket"] for t in tools)
    page = f"""<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>本地工具台</title>
  <link rel="stylesheet" href="assets/local-tools-hub.css">
  <script src="assets/local-tools-data.js"></script>
  <script src="assets/local-tools-hub.js" defer></script>
</head>
<body>
  <header class="topbar">
    <div>
      <p class="eyebrow">Local Tools Console</p>
      <h1>本地工具台</h1>
      <p class="lead">从收藏夹里的 33 个工具链接整理而来：离线工具直接做进本页；汇率、天气、短链已接入真实联网 API；账号、专有数据库和本地引擎类保留为入口与后续执行层。</p>
    </div>
    <div class="status-board" aria-label="工具统计">
      <div><strong>{len(tools)}</strong><span>工具链接</span></div>
      <div><strong>{counts["offline"]}</strong><span>可本地化</span></div>
      <div><strong>{counts["api"]}</strong><span>需联网</span></div>
      <div><strong>{counts["binary"]}</strong><span>需引擎</span></div>
    </div>
  </header>

  <main class="layout">
    <aside class="rail" aria-label="工具导航">
      <button class="nav-button is-active" data-jump="textLab">文本与代码</button>
      <button class="nav-button" data-jump="urlLab">链接处理</button>
      <button class="nav-button" data-jump="imageLab">图片与图标</button>
      <button class="nav-button" data-jump="emojiLab">Emoji 与颜色</button>
      <button class="nav-button" data-jump="appLab">App 页面</button>
      <button class="nav-button" data-jump="plateLab">车牌筛选</button>
      <button class="nav-button" data-jump="financeLab">联网查询</button>
      <button class="nav-button" data-jump="toolDirectory">工具目录</button>
      <a class="nav-link" href="tools-expert-review.html">专家会议纪要</a>
      <a class="nav-link" href="tools-local-plan.html">原工具计划</a>
    </aside>

    <section class="workspace">
      <section class="band" id="textLab">
        <div class="section-head">
          <div>
            <p class="kicker">Text Lab</p>
            <h2>文本与代码工具</h2>
          </div>
          <button class="ghost" id="swapText">输入/输出互换</button>
        </div>
        <div class="split">
          <label class="field">
            <span>输入</span>
            <textarea id="textInput" spellcheck="false" placeholder="粘贴 JSON、HTML、URL、Base64 或代码片段"></textarea>
          </label>
          <label class="field">
            <span>输出</span>
            <textarea id="textOutput" spellcheck="false" readonly></textarea>
          </label>
        </div>
        <div class="command-grid">
          <button data-text-action="jsonFormat">JSON 格式化</button>
          <button data-text-action="jsonMinify">JSON 压缩</button>
          <button data-text-action="htmlEscape">HTML 转义</button>
          <button data-text-action="htmlUnescape">HTML 反转义</button>
          <button data-text-action="urlEncode">URL 编码</button>
          <button data-text-action="urlDecode">URL 解码</button>
          <button data-text-action="base64Encode">Base64 编码</button>
          <button data-text-action="base64Decode">Base64 解码</button>
          <button data-text-action="webMinify">HTML/CSS/JS 简压缩</button>
          <button data-text-action="stats">文本统计</button>
          <button id="copyTextOutput">复制输出</button>
        </div>
        <p class="result-line" id="textStatus">等待输入。</p>
      </section>

      <section class="band" id="urlLab">
        <div class="section-head">
          <div>
            <p class="kicker">URL Lab</p>
            <h2>链接处理工具</h2>
          </div>
          <button class="ghost" id="copyCleanUrl">复制清理链接</button>
        </div>
        <label class="field compact">
          <span>URL</span>
          <input id="urlInput" value="https://example.com/page?utm_source=newsletter&id=42#top">
        </label>
        <div class="command-grid">
          <button id="analyzeUrl">解析链接</button>
          <button id="cleanUrl">移除追踪参数</button>
          <button id="openUrl">打开原链接</button>
        </div>
        <div class="table-card">
          <table id="urlTable">
            <tbody></tbody>
          </table>
        </div>
      </section>

      <section class="band" id="imageLab">
        <div class="section-head">
          <div>
            <p class="kicker">Image Lab</p>
            <h2>图片与图标工具</h2>
          </div>
          <button class="ghost" id="downloadFavicon512">下载 512 PNG</button>
        </div>
        <div class="image-grid">
          <div>
            <label class="field compact">
              <span>上传图片</span>
              <input type="file" id="imageInput" accept="image/*">
            </label>
            <label class="field compact">
              <span>文字图标</span>
              <input id="iconText" maxlength="3" value="LZ">
            </label>
            <div class="mini-grid">
              <label class="field compact">
                <span>背景</span>
                <input type="color" id="iconBg" value="#f47b20">
              </label>
              <label class="field compact">
                <span>文字</span>
                <input type="color" id="iconFg" value="#fffaf2">
              </label>
            </div>
            <div class="command-grid tight">
              <button id="renderIconText">生成文字图标</button>
              <button id="clearImage">清空图片</button>
            </div>
          </div>
          <div class="preview-box">
            <canvas id="imageCanvas" width="512" height="512"></canvas>
            <div id="imageInfo" class="result-line">上传图片或生成文字图标。</div>
          </div>
        </div>
        <div class="favicon-row" id="faviconRow"></div>
      </section>

      <section class="band" id="emojiLab">
        <div class="section-head">
          <div>
            <p class="kicker">Pocket Board</p>
            <h2>Emoji 与颜色</h2>
          </div>
          <button class="ghost" id="copyColorCss">复制颜色 CSS</button>
        </div>
        <div class="split uneven">
          <div>
            <label class="field compact">
              <span>Emoji 搜索</span>
              <input id="emojiSearch" placeholder="搜索：check、money、火、文档">
            </label>
            <div class="emoji-grid" id="emojiGrid"></div>
          </div>
          <div>
            <label class="field compact">
              <span>颜色</span>
              <input type="color" id="colorPicker" value="#f47b20">
            </label>
            <div class="color-card" id="colorCard">
              <div class="color-swatch" id="colorSwatch"></div>
              <pre id="colorOutput"></pre>
            </div>
          </div>
        </div>
      </section>

      <section class="band" id="appLab">
        <div class="section-head">
          <div>
            <p class="kicker">AppStop Local</p>
            <h2>App 介绍页生成器</h2>
          </div>
          <button class="ghost" id="downloadAppHtml">下载 HTML</button>
        </div>
        <div class="split">
          <div class="form-stack">
            <label class="field compact"><span>App 名称</span><input id="appName" value="Pocket Tool"></label>
            <label class="field compact"><span>一句话介绍</span><input id="appSubtitle" value="一个本地优先的效率工具"></label>
            <label class="field compact"><span>图标 URL 或 Emoji</span><input id="appIcon" value="🧰"></label>
            <label class="field compact"><span>下载/项目链接</span><input id="appDownload" value="https://example.com"></label>
            <label class="field"><span>核心卖点，每行一个</span><textarea id="appFeatures">离线可用，不上传数据
快速生成介绍页
适合个人工具和小产品</textarea></label>
            <label class="field"><span>截图 URL，每行一个，可留空</span><textarea id="appScreens"></textarea></label>
            <div class="command-grid tight">
              <button id="renderAppPage">生成页面</button>
              <button id="copyAppHtml">复制 HTML</button>
            </div>
          </div>
          <div>
            <iframe id="appPreview" class="app-preview" title="App 页面预览" sandbox=""></iframe>
            <label class="field generated-output"><span>生成结果</span><textarea id="appHtmlOutput" readonly></textarea></label>
          </div>
        </div>
      </section>

      <section class="band" id="plateLab">
        <div class="section-head">
          <div>
            <p class="kicker">Plate Helper</p>
            <h2>车牌组合筛选器</h2>
          </div>
          <button class="ghost" id="copyPlates">复制结果</button>
        </div>
        <p class="muted">只做本地组合筛选，不代表真实可选号；不保存输入历史。</p>
        <div class="calc-grid plate-options">
          <label class="field compact"><span>地区前缀</span><input id="platePrefix" value="粤B" maxlength="3"></label>
          <label class="field compact"><span>模式</span><input id="platePattern" value="66VM*" maxlength="5"></label>
          <label class="field compact"><span>包含字符</span><input id="plateMust" value=""></label>
          <label class="field compact"><span>最多显示</span><input id="plateLimit" type="number" value="120" min="10" max="1000"></label>
        </div>
        <div class="command-grid">
          <button id="generatePlates">生成组合</button>
          <button id="clearPlates">清空结果</button>
        </div>
        <div class="chip-grid" id="plateResults"></div>
      </section>

      <section class="band" id="financeLab">
        <div class="section-head">
          <div>
            <p class="kicker">Live Network Tools</p>
            <h2>联网查询工具</h2>
          </div>
          <button class="ghost" id="checkApiServer">检查本地服务</button>
        </div>
        <p class="muted" id="networkStatus">汇率使用 Frankfurter；天气使用 Open-Meteo；短链使用 is.gd。本页会优先走本地代理服务，失败时尝试直连公开 API。</p>
        <div class="network-grid">
          <article class="net-card">
            <h3>实时汇率换算</h3>
            <div class="mini-grid">
              <label class="field compact"><span>金额</span><input id="liveAmount" type="number" value="100" step="0.01"></label>
              <label class="field compact"><span>从</span><select id="liveFrom"></select></label>
              <label class="field compact"><span>到</span><select id="liveTo"></select></label>
              <button id="fetchRate">获取最新汇率</button>
            </div>
            <div class="live-result" id="liveRateResult">等待查询。</div>
            <p class="small">参考源：Frankfurter 公共汇率 API。中行牌价可作为人工复核入口。</p>
            <a class="link-button subtle" href="https://www.boc.cn/sourcedb/whpj/" target="_blank" rel="noreferrer">打开中行牌价</a>
          </article>

          <article class="net-card">
            <h3>天气查询</h3>
            <div class="mini-grid">
              <label class="field compact"><span>城市</span><input id="weatherCity" value="深圳"></label>
              <button id="fetchWeather">查询天气</button>
            </div>
            <div class="live-result" id="weatherResult">等待查询。</div>
            <p class="small">参考源：Open-Meteo 地理编码与天气预报 API，无需 API Key。</p>
          </article>

          <article class="net-card">
            <h3>短链接生成</h3>
            <label class="field compact"><span>长链接</span><input id="shortUrlInput" value="https://example.com/page?id=42"></label>
            <div class="command-grid tight">
              <button id="shortenUrl">生成短链</button>
              <button id="copyShortUrl">复制短链</button>
            </div>
            <div class="live-result" id="shortUrlResult">等待生成。</div>
            <p class="small">参考源：is.gd API。若直连被跨域限制，请用本地服务打开本页。</p>
          </article>

          <article class="net-card">
            <h3>外部数据库查询助手</h3>
            <label class="field compact"><span>序列号 / IMEI / 手机号 / 图片 URL</span><input id="lookupInput" placeholder="粘贴要查询的值"></label>
            <div class="command-grid tight">
              <button id="openAppleSerial">苹果序列号</button>
              <button id="openImei">IMEI 入口</button>
              <button id="openPhoneQuery">手机号入口</button>
              <button id="openTinEye">TinEye 图片 URL</button>
            </div>
            <div class="live-result" id="lookupStatus">这些服务没有稳定免密公开 API，本页只做输入整理、复制和跳转。</div>
          </article>

          <article class="net-card">
            <h3>手动倍率计算</h3>
            <div class="calc-grid compact-calc">
              <label class="field compact"><span>金额</span><input id="moneyAmount" type="number" value="100" step="0.01"></label>
              <label class="field compact"><span>汇率/倍率</span><input id="moneyRate" type="number" value="7.2" step="0.0001"></label>
              <label class="field compact"><span>手续费</span><input id="moneyFee" type="number" value="0" step="0.01"></label>
              <div class="calc-result"><strong id="moneyResult">720.00</strong><span>金额 × 汇率 + 手续费</span></div>
            </div>
          </article>
        </div>
      </section>

      <section class="band" id="toolDirectory">
        <div class="section-head">
          <div>
            <p class="kicker">Tool Directory</p>
            <h2>工具链接目录</h2>
          </div>
          <span class="count-pill" id="directoryCount">33</span>
        </div>
        <div class="filters">
          <input id="toolSearch" placeholder="搜索工具、域名、建议">
          <select id="bucketFilter">
            <option value="">全部分桶</option>
            <option value="offline">可本地化</option>
            <option value="api">需联网/API</option>
            <option value="binary">需本地引擎</option>
            <option value="external">外部入口</option>
          </select>
          <select id="topicFilter">
            <option value="">全部主题</option>
            <option value="dev-web">开发建站</option>
            <option value="design-ui">设计素材</option>
            <option value="device-system">设备系统</option>
            <option value="life-business">生活商务</option>
            <option value="media-culture">影音转换</option>
          </select>
        </div>
        <div class="directory" id="toolCards"></div>
      </section>
    </section>
  </main>

  <footer class="footer">
    <span>生成时间：{html.escape(generated)}</span>
    <span>数据源：data/bookmarks_analysis.json</span>
    <span>本页不上传任何输入内容。</span>
  </footer>
</body>
</html>
"""
    (BASE / "local-tools-hub.html").write_text(page, encoding="utf-8")


def write_css():
    css = r"""
:root {
  --paper: #fff8ee;
  --panel: #fffdf9;
  --ink: #211f1b;
  --muted: #6e6258;
  --line: #dccfbe;
  --orange: #f47b20;
  --teal: #0c7d80;
  --blue: #315f9b;
  --plum: #81466f;
  --green: #4b7d40;
  --red: #a23a2a;
  --shadow: 0 18px 44px rgba(49, 35, 18, .12);
}
* { box-sizing: border-box; }
html { scroll-behavior: smooth; background: var(--paper); color: var(--ink); }
body {
  margin: 0;
  font-family: "Avenir Next", "PingFang SC", "Hiragino Sans GB", "Songti SC", sans-serif;
  letter-spacing: 0;
}
button, input, textarea, select { font: inherit; letter-spacing: 0; }
button, .link-button {
  min-height: 38px;
  border: 1px solid #cbbba6;
  background: #fff;
  color: var(--ink);
  border-radius: 8px;
  padding: 8px 12px;
  font-weight: 800;
  cursor: pointer;
  text-decoration: none;
}
button:hover, .link-button:hover { border-color: var(--orange); color: #9b450b; }
.topbar {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 24px;
  padding: 36px clamp(18px, 4vw, 54px) 28px;
  border-bottom: 1px solid var(--line);
  background:
    linear-gradient(112deg, rgba(244,123,32,.18), transparent 42%),
    linear-gradient(292deg, rgba(12,125,128,.14), transparent 40%),
    #fff0dc;
}
.eyebrow, .kicker {
  margin: 0;
  color: var(--teal);
  text-transform: uppercase;
  font-size: 12px;
  font-weight: 900;
}
h1 {
  margin: 8px 0 10px;
  font-family: "Songti SC", Georgia, serif;
  font-size: clamp(38px, 7vw, 82px);
  line-height: 1;
}
h2 {
  margin: 6px 0 0;
  font-family: "Songti SC", Georgia, serif;
  font-size: clamp(24px, 3vw, 36px);
  line-height: 1.16;
}
.lead { max-width: 900px; margin: 0; color: #4f463d; font-size: 17px; line-height: 1.72; }
.status-board {
  display: grid;
  grid-template-columns: repeat(2, minmax(110px, 1fr));
  gap: 10px;
  align-self: end;
}
.status-board div {
  border: 1px solid var(--line);
  background: rgba(255,255,255,.72);
  border-radius: 8px;
  padding: 14px;
  min-width: 112px;
}
.status-board strong { display: block; font-size: 30px; line-height: 1; color: #9b450b; }
.status-board span { display: block; color: var(--muted); margin-top: 5px; font-size: 13px; }
.layout {
  display: grid;
  grid-template-columns: 210px minmax(0, 1fr);
  gap: 18px;
  width: min(1440px, calc(100vw - 28px));
  margin: 18px auto 32px;
}
.rail {
  position: sticky;
  top: 16px;
  align-self: start;
  display: grid;
  gap: 8px;
  border: 1px solid var(--line);
  border-radius: 8px;
  padding: 10px;
  background: rgba(255,253,249,.88);
  box-shadow: var(--shadow);
}
.nav-button, .nav-link {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
  border-radius: 7px;
  text-align: left;
}
.nav-button.is-active {
  background: var(--ink);
  border-color: var(--ink);
  color: #fff8ee;
}
.nav-link {
  min-height: 38px;
  padding: 8px 12px;
  border: 1px solid var(--line);
  color: var(--ink);
  background: #fff;
  font-weight: 800;
  text-decoration: none;
}
.workspace { display: grid; gap: 18px; min-width: 0; }
.band {
  border: 1px solid var(--line);
  border-radius: 8px;
  background: var(--panel);
  padding: clamp(16px, 3vw, 24px);
  box-shadow: var(--shadow);
  scroll-margin-top: 14px;
}
.section-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 16px;
}
.ghost { background: #fff9ef; }
.split {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}
.split.uneven { grid-template-columns: minmax(0, 1.25fr) minmax(280px, .75fr); }
.form-stack { display: grid; gap: 10px; }
.field { display: grid; gap: 7px; color: var(--muted); font-size: 13px; font-weight: 800; }
.field input, .field textarea, .filters input, .filters select {
  width: 100%;
  border: 1px solid #cdbda9;
  border-radius: 8px;
  background: #fff;
  color: var(--ink);
  padding: 10px 12px;
}
textarea {
  min-height: 220px;
  resize: vertical;
  font-family: "Menlo", "SFMono-Regular", monospace;
  font-size: 13px;
  line-height: 1.55;
}
.field.compact input { min-height: 42px; }
.command-grid, .filters {
  display: flex;
  flex-wrap: wrap;
  gap: 9px;
  margin-top: 14px;
}
.command-grid.tight { margin-top: 10px; }
.result-line, .muted { color: var(--muted); font-size: 13px; line-height: 1.65; }
.table-card {
  margin-top: 14px;
  overflow-x: auto;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: white;
}
table { width: 100%; border-collapse: collapse; }
td, th { border-bottom: 1px solid #eadfce; padding: 10px 12px; text-align: left; vertical-align: top; }
tr:last-child td { border-bottom: 0; }
td:first-child { width: 180px; color: var(--muted); font-weight: 900; }
.image-grid { display: grid; grid-template-columns: 320px minmax(0, 1fr); gap: 18px; align-items: start; }
.mini-grid, .calc-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}
.calc-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); align-items: end; }
.plate-options { grid-template-columns: 1fr 1fr 1fr 140px; }
.network-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}
.net-card {
  display: grid;
  align-content: start;
  gap: 12px;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: #fff;
  padding: 16px;
}
.net-card h3 {
  margin: 0;
  font-size: 18px;
}
.net-card .mini-grid {
  grid-template-columns: repeat(4, minmax(0, 1fr));
  align-items: end;
}
.net-card:nth-child(2) .mini-grid {
  grid-template-columns: minmax(0, 1fr) auto;
}
.live-result {
  min-height: 62px;
  border: 1px solid #eadfce;
  border-radius: 8px;
  background: #fff8ee;
  padding: 10px 12px;
  color: #3e342b;
  line-height: 1.55;
}
.live-result strong {
  color: #9b450b;
  font-size: 24px;
}
.subtle {
  justify-self: start;
  background: #fff9ef;
}
.compact-calc { grid-template-columns: repeat(4, minmax(0, 1fr)); }
.app-preview {
  width: 100%;
  min-height: 360px;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: #fff;
}
.generated-output { margin-top: 10px; }
.generated-output textarea { min-height: 150px; }
.chip-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  min-height: 70px;
  margin-top: 14px;
  padding: 12px;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: #fff;
}
.chip-grid span {
  display: inline-flex;
  align-items: center;
  min-height: 30px;
  padding: 4px 9px;
  border-radius: 999px;
  background: rgba(12,125,128,.12);
  color: #075f62;
  font-weight: 900;
  font-size: 13px;
}
.preview-box {
  display: grid;
  grid-template-columns: minmax(220px, 320px) minmax(0, 1fr);
  gap: 16px;
  align-items: center;
}
canvas {
  width: 100%;
  max-width: 320px;
  aspect-ratio: 1;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: #f4eadb;
}
.favicon-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 10px;
  margin-top: 16px;
}
.favicon-tile {
  display: grid;
  gap: 8px;
  justify-items: center;
  border: 1px solid var(--line);
  border-radius: 8px;
  padding: 10px;
  background: #fff;
}
.favicon-tile canvas { width: 68px; height: 68px; }
.emoji-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(56px, 1fr));
  gap: 8px;
  margin-top: 10px;
}
.emoji-grid button {
  min-height: 52px;
  font-size: 24px;
  padding: 4px;
}
.color-card {
  display: grid;
  grid-template-columns: 120px minmax(0, 1fr);
  gap: 12px;
  align-items: stretch;
}
.color-swatch {
  min-height: 120px;
  border: 1px solid var(--line);
  border-radius: 8px;
}
pre {
  margin: 0;
  overflow: auto;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: #fff;
  padding: 12px;
  font-size: 13px;
  line-height: 1.5;
}
.calc-result {
  min-height: 70px;
  display: grid;
  align-content: center;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: #fff5e8;
  padding: 10px 12px;
}
.calc-result strong { font-size: 28px; color: #9b450b; }
.calc-result span { color: var(--muted); font-size: 12px; }
.filters { margin: 0 0 14px; }
.filters input { flex: 1 1 320px; }
.filters select { flex: 0 0 170px; }
.count-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 44px;
  height: 36px;
  padding: 0 12px;
  border-radius: 999px;
  background: var(--ink);
  color: #fff8ee;
  font-weight: 900;
}
.directory {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 12px;
}
.tool-card {
  display: grid;
  gap: 10px;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: #fff;
  padding: 14px;
}
.tool-card h3 { margin: 0; font-size: 16px; line-height: 1.35; }
.tool-card h3 a { color: var(--ink); text-decoration-thickness: .08em; text-underline-offset: .16em; }
.badges { display: flex; flex-wrap: wrap; gap: 6px; }
.badge {
  display: inline-flex;
  align-items: center;
  min-height: 24px;
  padding: 3px 8px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 900;
}
.bucket-offline { color: #075f62; background: rgba(12,125,128,.13); }
.bucket-api { color: #814104; background: rgba(244,123,32,.16); }
.bucket-binary { color: #7a2f22; background: rgba(162,58,42,.13); }
.bucket-external { color: #64395b; background: rgba(129,70,111,.14); }
.topic { color: #294d80; background: rgba(49,95,155,.12); }
.small { font-size: 12px; color: var(--muted); line-height: 1.55; }
.footer {
  width: min(1440px, calc(100vw - 28px));
  margin: 0 auto 28px;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  padding-top: 14px;
  border-top: 1px solid var(--line);
  color: var(--muted);
  font-size: 13px;
}
@media (max-width: 980px) {
  .topbar, .layout, .split, .split.uneven, .image-grid, .preview-box, .calc-grid, .plate-options, .network-grid, .net-card .mini-grid, .compact-calc {
    grid-template-columns: 1fr;
  }
  .rail { position: static; grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (max-width: 620px) {
  .rail { grid-template-columns: 1fr; }
  .status-board, .mini-grid { grid-template-columns: 1fr; }
  .band { padding: 14px; }
}
"""
    (ASSETS / "local-tools-hub.css").write_text(css.strip() + "\n", encoding="utf-8")


def write_js():
    js = r"""
const byId = (id) => document.getElementById(id);
const setText = (id, value) => { const el = byId(id); if (el) el.textContent = value; };

function copyValue(value, statusId) {
  if (!value) return;
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(value).then(() => statusId && setText(statusId, "已复制。"));
    return;
  }
  const tmp = document.createElement("textarea");
  tmp.value = value;
  document.body.appendChild(tmp);
  tmp.select();
  document.execCommand("copy");
  tmp.remove();
  if (statusId) setText(statusId, "已复制。");
}

function utf8ToBase64(text) {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  bytes.forEach((b) => binary += String.fromCharCode(b));
  return btoa(binary);
}

function base64ToUtf8(text) {
  const binary = atob(text.trim());
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function htmlEscape(text) {
  return text.replace(/[&<>"']/g, (ch) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[ch]));
}

function htmlUnescape(text) {
  const textarea = document.createElement("textarea");
  textarea.innerHTML = text;
  return textarea.value;
}

function simpleWebMinify(text) {
  return text
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/\s+/g, " ")
    .replace(/\s*([{}:;,>])\s*/g, "$1")
    .trim();
}

function handleTextAction(action) {
  const input = byId("textInput").value;
  const output = byId("textOutput");
  try {
    if (action === "jsonFormat") output.value = JSON.stringify(JSON.parse(input), null, 2);
    if (action === "jsonMinify") output.value = JSON.stringify(JSON.parse(input));
    if (action === "htmlEscape") output.value = htmlEscape(input);
    if (action === "htmlUnescape") output.value = htmlUnescape(input);
    if (action === "urlEncode") output.value = encodeURIComponent(input);
    if (action === "urlDecode") output.value = decodeURIComponent(input);
    if (action === "base64Encode") output.value = utf8ToBase64(input);
    if (action === "base64Decode") output.value = base64ToUtf8(input);
    if (action === "webMinify") output.value = simpleWebMinify(input);
    if (action === "stats") {
      const lines = input ? input.split(/\r\n|\r|\n/).length : 0;
      const chars = input.length;
      const words = (input.match(/[\p{L}\p{N}_-]+/gu) || []).length;
      output.value = `字符：${chars}\n行数：${lines}\n词/片段：${words}\n字节 UTF-8：${new TextEncoder().encode(input).length}`;
    }
    setText("textStatus", "处理完成。");
  } catch (error) {
    output.value = "";
    setText("textStatus", `处理失败：${error.message}`);
  }
}

function normalizeUrlInput(value) {
  if (!/^https?:\/\//i.test(value)) return `https://${value}`;
  return value;
}

function analyzeUrl() {
  const raw = byId("urlInput").value.trim();
  const tbody = byId("urlTable").querySelector("tbody");
  tbody.innerHTML = "";
  try {
    const url = new URL(normalizeUrlInput(raw));
    const rows = [
      ["协议", url.protocol],
      ["域名", url.hostname],
      ["端口", url.port || "默认"],
      ["路径", url.pathname || "/"],
      ["Hash", url.hash || "无"],
      ["完整链接", url.href],
    ];
    const params = Array.from(url.searchParams.entries());
    rows.push(["参数数量", String(params.length)]);
    params.forEach(([key, value]) => rows.push([`参数：${key}`, value]));
    tbody.innerHTML = rows.map(([k, v]) => `<tr><td>${htmlEscape(k)}</td><td>${htmlEscape(v)}</td></tr>`).join("");
  } catch (error) {
    tbody.innerHTML = `<tr><td>错误</td><td>${htmlEscape(error.message)}</td></tr>`;
  }
}

function cleanUrl() {
  const raw = byId("urlInput").value.trim();
  try {
    const url = new URL(normalizeUrlInput(raw));
    const junk = ["fbclid", "gclid", "yclid", "mc_cid", "mc_eid", "spm", "utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"];
    Array.from(url.searchParams.keys()).forEach((key) => {
      if (junk.includes(key.toLowerCase()) || key.toLowerCase().startsWith("utm_")) url.searchParams.delete(key);
    });
    byId("urlInput").value = url.href;
    analyzeUrl();
  } catch (error) {
    analyzeUrl();
  }
}

let sourceImage = null;

function drawTextIcon() {
  const canvas = byId("imageCanvas");
  const ctx = canvas.getContext("2d");
  const bg = byId("iconBg").value;
  const fg = byId("iconFg").value;
  const text = byId("iconText").value.trim() || "LZ";
  ctx.clearRect(0, 0, 512, 512);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 512, 512);
  ctx.fillStyle = fg;
  ctx.font = `900 ${text.length > 2 ? 190 : 230}px Avenir Next, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text.toUpperCase(), 256, 270);
  sourceImage = canvas;
  renderFavicons();
  setText("imageInfo", "文字图标已生成。");
}

async function sha256Hex(file) {
  if (!crypto.subtle) return "当前浏览器不支持 crypto.subtle";
  const buffer = await file.arrayBuffer();
  const hash = await crypto.subtle.digest("SHA-256", buffer);
  return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function loadImageFile(file) {
  const img = new Image();
  img.onload = () => {
    const canvas = byId("imageCanvas");
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, 512, 512);
    const size = Math.min(img.width, img.height);
    const sx = (img.width - size) / 2;
    const sy = (img.height - size) / 2;
    ctx.drawImage(img, sx, sy, size, size, 0, 0, 512, 512);
    sourceImage = canvas;
    renderFavicons();
    const kb = (file.size / 1024).toFixed(1);
    setText("imageInfo", `${file.name} | ${img.width}×${img.height} | ${kb} KB | ${file.type || "未知类型"}`);
    sha256Hex(file).then((hash) => {
      setText("imageInfo", `${file.name} | ${img.width}×${img.height} | ${kb} KB | ${file.type || "未知类型"} | SHA-256 ${hash}`);
    });
  };
  img.src = URL.createObjectURL(file);
}

function renderFavicons() {
  const row = byId("faviconRow");
  row.innerHTML = "";
  [16, 32, 64, 180, 512].forEach((size) => {
    const tile = document.createElement("div");
    tile.className = "favicon-tile";
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(byId("imageCanvas"), 0, 0, size, size);
    const label = document.createElement("span");
    label.className = "small";
    label.textContent = `${size}×${size}`;
    const button = document.createElement("button");
    button.textContent = "下载 PNG";
    button.addEventListener("click", () => downloadCanvas(canvas, `favicon-${size}.png`));
    tile.append(canvas, label, button);
    row.append(tile);
  });
}

function downloadCanvas(canvas, filename) {
  const a = document.createElement("a");
  a.download = filename;
  a.href = canvas.toDataURL("image/png");
  a.click();
}

const emojiData = [
  ["✅", "check done ok 完成"], ["⚠️", "warning alert 风险"], ["❌", "cross error 错误"],
  ["📌", "pin mark 标记"], ["🔗", "link url 链接"], ["🧰", "tool kit 工具"],
  ["💡", "idea light 灵感"], ["📄", "doc page 文档"], ["🧾", "invoice receipt 票据"],
  ["💰", "money finance 钱"], ["📦", "package box 包"], ["🔒", "lock secure 安全"],
  ["🔓", "unlock 解锁"], ["🖼️", "image picture 图片"], ["🎧", "audio music 音频"],
  ["🎬", "video film 视频"], ["🚀", "launch deploy 发布"], ["🧪", "test lab 测试"],
  ["📊", "chart data 数据"], ["🧭", "nav guide 导航"], ["🧱", "build block 构建"],
  ["🪄", "magic ai 魔法"], ["🕒", "time clock 时间"], ["⭐", "star favorite 收藏"]
];

function renderEmoji() {
  const query = byId("emojiSearch").value.trim().toLowerCase();
  const grid = byId("emojiGrid");
  grid.innerHTML = "";
  emojiData
    .filter(([symbol, tags]) => !query || tags.toLowerCase().includes(query) || symbol.includes(query))
    .forEach(([symbol, tags]) => {
      const button = document.createElement("button");
      button.title = tags;
      button.textContent = symbol;
      button.addEventListener("click", () => copyValue(symbol));
      grid.append(button);
    });
}

function hexToRgb(hex) {
  const value = hex.replace("#", "");
  const bigint = parseInt(value, 16);
  return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
}

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > .5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
    if (max === g) h = (b - r) / d + 2;
    if (max === b) h = (r - g) / d + 4;
    h /= 6;
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

function updateColor() {
  const hex = byId("colorPicker").value;
  const [r, g, b] = hexToRgb(hex);
  const [h, s, l] = rgbToHsl(r, g, b);
  byId("colorSwatch").style.background = hex;
  byId("colorOutput").textContent = `HEX ${hex}\nRGB rgb(${r}, ${g}, ${b})\nHSL hsl(${h} ${s}% ${l}%)\nCSS --accent: ${hex};`;
}

function updateMoney() {
  const amount = Number(byId("moneyAmount").value || 0);
  const rate = Number(byId("moneyRate").value || 0);
  const fee = Number(byId("moneyFee").value || 0);
  byId("moneyResult").textContent = (amount * rate + fee).toFixed(2);
}

const currencies = ["CNY", "USD", "HKD", "EUR", "JPY", "GBP", "AUD", "CAD", "SGD", "CHF"];
const weatherCodeMap = {
  0: "晴朗", 1: "大致晴朗", 2: "局部多云", 3: "阴天",
  45: "雾", 48: "霜雾", 51: "小毛毛雨", 53: "毛毛雨", 55: "强毛毛雨",
  61: "小雨", 63: "中雨", 65: "大雨", 71: "小雪", 73: "中雪", 75: "大雪",
  80: "阵雨", 81: "中等阵雨", 82: "强阵雨", 95: "雷暴"
};

function localApiOrigin() {
  if (/^https?:$/.test(location.protocol) && /^(127\.0\.0\.1|localhost)$/.test(location.hostname)) {
    return location.origin;
  }
  return "http://127.0.0.1:8765";
}

async function fetchJsonWithTimeout(url, ms = 12000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    const response = await fetch(url, {signal: controller.signal});
    const text = await response.text();
    let data;
    try { data = JSON.parse(text); } catch { data = {raw: text}; }
    if (!response.ok) throw new Error(data.error || data.message || `HTTP ${response.status}`);
    return data;
  } finally {
    clearTimeout(timer);
  }
}

function paramsToQuery(params) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => query.set(key, value));
  return query.toString();
}

async function apiJson(path, params, directUrlFactory) {
  const query = paramsToQuery(params);
  const localUrl = `${localApiOrigin()}/api/${path}?${query}`;
  try {
    const data = await fetchJsonWithTimeout(localUrl, 9000);
    return {...data, sourceMode: "本地代理"};
  } catch (localError) {
    if (!directUrlFactory) throw localError;
    const directUrl = directUrlFactory(params);
    const data = await fetchJsonWithTimeout(directUrl, 12000);
    return {...data, sourceMode: "浏览器直连"};
  }
}

function populateCurrencySelects() {
  const from = byId("liveFrom");
  const to = byId("liveTo");
  from.innerHTML = currencies.map((code) => `<option value="${code}">${code}</option>`).join("");
  to.innerHTML = currencies.map((code) => `<option value="${code}">${code}</option>`).join("");
  from.value = "USD";
  to.value = "CNY";
}

async function fetchLiveRate() {
  const amount = Number(byId("liveAmount").value || 0);
  const base = byId("liveFrom").value;
  const target = byId("liveTo").value;
  const result = byId("liveRateResult");
  result.textContent = "正在获取实时汇率...";
  try {
    if (base === target) {
      result.innerHTML = `<strong>${amount.toFixed(2)} ${target}</strong><br>同币种无需换算。`;
      return;
    }
    const data = await apiJson(
      "rates",
      {base, symbols: target},
      (p) => `https://api.frankfurter.dev/v1/latest?base=${encodeURIComponent(p.base)}&symbols=${encodeURIComponent(p.symbols)}`
    );
    const rate = Number(data.rates && data.rates[target]);
    if (!rate) throw new Error("没有返回目标币种汇率");
    const converted = amount * rate;
    result.innerHTML = `<strong>${converted.toFixed(4)} ${target}</strong><br>1 ${base} = ${rate} ${target}<br>日期：${htmlEscape(data.date || "未知")} · ${htmlEscape(data.sourceMode || "")}`;
    byId("moneyAmount").value = amount;
    byId("moneyRate").value = rate;
    byId("moneyFee").value = 0;
    updateMoney();
  } catch (error) {
    result.textContent = `汇率获取失败：${error.message}`;
  }
}

async function fetchWeather() {
  const city = byId("weatherCity").value.trim() || "深圳";
  const result = byId("weatherResult");
  result.textContent = "正在查询天气...";
  try {
    let data;
    try {
      data = await apiJson("weather", {city}, null);
      data.sourceMode = data.sourceMode || "本地代理";
    } catch {
      const geo = await fetchJsonWithTimeout(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=zh&format=json`);
      if (!geo.results || !geo.results.length) throw new Error("没有找到城市");
      const place = geo.results[0];
      const forecast = await fetchJsonWithTimeout(`https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min&timezone=auto`);
      data = {place, forecast, sourceMode: "浏览器直连"};
    }
    const place = data.place;
    const current = data.forecast.current;
    const daily = data.forecast.daily || {};
    const code = current.weather_code;
    result.innerHTML = `<strong>${htmlEscape(place.name)} ${current.temperature_2m}°C</strong><br>${htmlEscape(weatherCodeMap[code] || `天气代码 ${code}`)} · 湿度 ${current.relative_humidity_2m}% · 风速 ${current.wind_speed_10m} km/h<br>今日 ${daily.temperature_2m_min ? daily.temperature_2m_min[0] : "-"}°C / ${daily.temperature_2m_max ? daily.temperature_2m_max[0] : "-"}°C · ${htmlEscape(data.sourceMode)}`;
  } catch (error) {
    result.textContent = `天气查询失败：${error.message}`;
  }
}

async function shortenUrlOnline() {
  const raw = byId("shortUrlInput").value.trim();
  const result = byId("shortUrlResult");
  if (!raw) return;
  result.textContent = "正在生成短链...";
  try {
    const data = await apiJson(
      "shorten",
      {url: normalizeUrlInput(raw)},
      (p) => `https://is.gd/create.php?format=json&url=${encodeURIComponent(p.url)}`
    );
    const shortUrl = data.shorturl || data.shortUrl;
    if (!shortUrl) throw new Error(data.errormessage || "没有返回短链接");
    const provider = data.provider ? ` · ${data.provider}` : "";
    const fallback = data.fallbackFrom ? `（${data.fallbackFrom} 失败后兜底）` : "";
    result.innerHTML = `<strong>${htmlEscape(shortUrl)}</strong><br>${htmlEscape(data.sourceMode || "")}${htmlEscape(provider)}${htmlEscape(fallback)}`;
    result.dataset.shortUrl = shortUrl;
  } catch (error) {
    result.textContent = `短链生成失败：${error.message}。请确认本地服务已启动，或打开 is.gd 外部入口。`;
  }
}

async function checkApiServer() {
  const status = byId("networkStatus");
  status.textContent = "正在检查本地服务...";
  try {
    const data = await fetchJsonWithTimeout(`${localApiOrigin()}/api/status`, 5000);
    status.textContent = `本地服务可用：${data.service}，端口 ${data.port}。联网工具将优先走本地代理。`;
  } catch (error) {
    status.textContent = `本地服务未连上：${error.message}。汇率/天气会尝试浏览器直连；短链等可能需要启动本地服务。`;
  }
}

function openExternalLookup(kind) {
  const value = byId("lookupInput").value.trim();
  if (value) copyValue(value);
  const encoded = encodeURIComponent(value);
  const urls = {
    apple: value ? `http://www.pingguo110.com/index.php/index/search.htm?sn=${encoded}` : "http://www.pingguo110.com/",
    imei: "http://www.numberingplans.com/?page=analysis&sub=imeinr",
    phone: "http://mobile.9om.com/",
    tineye: value ? `https://tineye.com/search?url=${encoded}` : "https://tineye.com/"
  };
  byId("lookupStatus").textContent = value ? "已复制输入值，并打开外部查询入口。" : "未填写输入，已打开外部入口。";
  window.open(urls[kind], "_blank", "noreferrer");
}

function buildAppHtml() {
  const name = byId("appName").value.trim() || "Untitled App";
  const subtitle = byId("appSubtitle").value.trim() || "A focused local app.";
  const icon = byId("appIcon").value.trim() || "🧰";
  const download = byId("appDownload").value.trim() || "#";
  const features = byId("appFeatures").value.split(/\r?\n/).map((x) => x.trim()).filter(Boolean);
  const screenshots = byId("appScreens").value.split(/\r?\n/).map((x) => x.trim()).filter(Boolean);
  const iconMarkup = /^https?:\/\//i.test(icon)
    ? `<img src="${htmlEscape(icon)}" alt="" class="app-icon">`
    : `<div class="app-icon emoji">${htmlEscape(icon)}</div>`;
  const featureMarkup = features.map((item) => `<li>${htmlEscape(item)}</li>`).join("");
  const screenshotMarkup = screenshots.length
    ? `<div class="shots">${screenshots.map((src) => `<img src="${htmlEscape(src)}" alt="App screenshot">`).join("")}</div>`
    : `<div class="empty-shot">截图位</div>`;
  return `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${htmlEscape(name)}</title>
<style>
body{margin:0;font-family:-apple-system,BlinkMacSystemFont,"PingFang SC",sans-serif;background:#fff8ee;color:#211f1b}
.wrap{max-width:960px;margin:0 auto;padding:42px 22px}
.hero{display:grid;grid-template-columns:120px 1fr;gap:22px;align-items:center}
.app-icon{width:112px;height:112px;border-radius:26px;object-fit:cover;background:#f47b20;color:#fff;display:grid;place-items:center;font-size:52px;font-weight:900}
h1{font-size:44px;line-height:1;margin:0 0 10px;font-family:Georgia,"Songti SC",serif}.lead{font-size:19px;line-height:1.7;color:#574d43}.btn{display:inline-flex;margin-top:18px;padding:11px 16px;border-radius:10px;background:#211f1b;color:#fff;text-decoration:none;font-weight:800}
.panel{margin-top:28px;border:1px solid #deceb9;border-radius:14px;background:#fff;padding:22px}.panel h2{margin-top:0}.features{display:grid;gap:10px;font-size:16px}.shots{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:14px}.shots img,.empty-shot{width:100%;min-height:220px;border-radius:14px;border:1px solid #deceb9;background:#f4eadb;object-fit:cover;display:grid;place-items:center;color:#7a6b5d}
@media(max-width:640px){.hero{grid-template-columns:1fr}.app-icon{width:96px;height:96px}h1{font-size:34px}}
</style>
</head>
<body><main class="wrap"><section class="hero">${iconMarkup}<div><h1>${htmlEscape(name)}</h1><p class="lead">${htmlEscape(subtitle)}</p><a class="btn" href="${htmlEscape(download)}">获取 / 打开</a></div></section><section class="panel"><h2>核心卖点</h2><ul class="features">${featureMarkup}</ul></section><section class="panel"><h2>截图</h2>${screenshotMarkup}</section></main></body></html>`;
}

function renderAppPage() {
  const html = buildAppHtml();
  byId("appHtmlOutput").value = html;
  byId("appPreview").srcdoc = html;
}

function downloadAppHtml() {
  const html = byId("appHtmlOutput").value || buildAppHtml();
  const name = (byId("appName").value.trim() || "app-page").toLowerCase().replace(/[^\w\u4e00-\u9fff-]+/g, "-").replace(/^-|-$/g, "");
  const blob = new Blob([html], {type: "text/html;charset=utf-8"});
  const a = document.createElement("a");
  a.download = `${name || "app-page"}.html`;
  a.href = URL.createObjectURL(blob);
  a.click();
  URL.revokeObjectURL(a.href);
}

function generatePlateCombinations() {
  const chars = "0123456789ABCDEFGHJKLMNPQRSTUVWXYZ";
  const prefix = byId("platePrefix").value.trim() || "粤B";
  const pattern = (byId("platePattern").value.trim().toUpperCase() || "*****").slice(0, 5).padEnd(5, "*");
  const must = byId("plateMust").value.trim().toUpperCase();
  const limit = Math.min(1000, Math.max(10, Number(byId("plateLimit").value || 120)));
  const slots = pattern.split("").map((ch) => ch === "*" || ch === "?" ? chars.split("") : [ch]);
  const results = [];
  function walk(index, acc) {
    if (results.length >= limit) return;
    if (index === slots.length) {
      const plate = `${prefix}${acc}`;
      if (!must || plate.includes(must)) results.push(plate);
      return;
    }
    for (const ch of slots[index]) walk(index + 1, acc + ch);
  }
  walk(0, "");
  const box = byId("plateResults");
  box.innerHTML = results.length
    ? results.map((plate) => `<span>${htmlEscape(plate)}</span>`).join("")
    : `<span>没有匹配结果</span>`;
}

function renderDirectory() {
  const cards = byId("toolCards");
  const query = byId("toolSearch").value.trim().toLowerCase();
  const bucket = byId("bucketFilter").value;
  const topic = byId("topicFilter").value;
  const tools = (window.LOCAL_TOOL_LINKS || []).filter((tool) => {
    const hay = `${tool.title} ${tool.host} ${tool.analysis} ${tool.suggestion} ${tool.bucketLabel} ${tool.topicLabel}`.toLowerCase();
    return (!query || hay.includes(query)) && (!bucket || tool.bucket === bucket) && (!topic || tool.topic === topic);
  });
  byId("directoryCount").textContent = String(tools.length);
  cards.innerHTML = tools.map((tool) => `
    <article class="tool-card">
      <div class="badges">
        <span class="badge bucket-${tool.bucket}">${htmlEscape(tool.bucketLabel)}</span>
        <span class="badge topic">${htmlEscape(tool.topicLabel)}</span>
      </div>
      <h3><a href="${htmlEscape(tool.url)}" target="_blank" rel="noreferrer">${htmlEscape(tool.title)}</a></h3>
      <div class="small">${htmlEscape(tool.host)} · 状态 ${htmlEscape(String(tool.httpStatus || tool.status || ""))}</div>
      <p class="small">${htmlEscape(tool.suggestion || "")}</p>
    </article>
  `).join("");
}

function bindEvents() {
  document.querySelectorAll("[data-text-action]").forEach((button) => {
    button.addEventListener("click", () => handleTextAction(button.dataset.textAction));
  });
  byId("copyTextOutput").addEventListener("click", () => copyValue(byId("textOutput").value, "textStatus"));
  byId("swapText").addEventListener("click", () => {
    const input = byId("textInput");
    const output = byId("textOutput");
    [input.value, output.value] = [output.value, input.value];
  });
  byId("analyzeUrl").addEventListener("click", analyzeUrl);
  byId("cleanUrl").addEventListener("click", cleanUrl);
  byId("openUrl").addEventListener("click", () => window.open(normalizeUrlInput(byId("urlInput").value.trim()), "_blank", "noreferrer"));
  byId("copyCleanUrl").addEventListener("click", () => copyValue(byId("urlInput").value));
  byId("imageInput").addEventListener("change", (event) => {
    const file = event.target.files && event.target.files[0];
    if (file) loadImageFile(file);
  });
  byId("renderIconText").addEventListener("click", drawTextIcon);
  byId("clearImage").addEventListener("click", drawTextIcon);
  byId("downloadFavicon512").addEventListener("click", () => downloadCanvas(byId("imageCanvas"), "favicon-512.png"));
  byId("emojiSearch").addEventListener("input", renderEmoji);
  byId("colorPicker").addEventListener("input", updateColor);
  byId("copyColorCss").addEventListener("click", () => copyValue(byId("colorOutput").textContent));
  ["moneyAmount", "moneyRate", "moneyFee"].forEach((id) => byId(id).addEventListener("input", updateMoney));
  byId("checkApiServer").addEventListener("click", checkApiServer);
  byId("fetchRate").addEventListener("click", fetchLiveRate);
  byId("fetchWeather").addEventListener("click", fetchWeather);
  byId("shortenUrl").addEventListener("click", shortenUrlOnline);
  byId("copyShortUrl").addEventListener("click", () => copyValue(byId("shortUrlResult").dataset.shortUrl || byId("shortUrlResult").textContent));
  byId("openAppleSerial").addEventListener("click", () => openExternalLookup("apple"));
  byId("openImei").addEventListener("click", () => openExternalLookup("imei"));
  byId("openPhoneQuery").addEventListener("click", () => openExternalLookup("phone"));
  byId("openTinEye").addEventListener("click", () => openExternalLookup("tineye"));
  ["appName", "appSubtitle", "appIcon", "appDownload", "appFeatures", "appScreens"].forEach((id) => byId(id).addEventListener("input", renderAppPage));
  byId("renderAppPage").addEventListener("click", renderAppPage);
  byId("copyAppHtml").addEventListener("click", () => copyValue(byId("appHtmlOutput").value));
  byId("downloadAppHtml").addEventListener("click", downloadAppHtml);
  ["platePrefix", "platePattern", "plateMust", "plateLimit"].forEach((id) => byId(id).addEventListener("input", generatePlateCombinations));
  byId("generatePlates").addEventListener("click", generatePlateCombinations);
  byId("clearPlates").addEventListener("click", () => { byId("plateResults").innerHTML = ""; });
  byId("copyPlates").addEventListener("click", () => copyValue(Array.from(byId("plateResults").querySelectorAll("span")).map((node) => node.textContent).join("\n")));
  ["toolSearch", "bucketFilter", "topicFilter"].forEach((id) => byId(id).addEventListener("input", renderDirectory));
  document.querySelectorAll("[data-jump]").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll("[data-jump]").forEach((b) => b.classList.remove("is-active"));
      button.classList.add("is-active");
      byId(button.dataset.jump).scrollIntoView({behavior: "smooth", block: "start"});
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  bindEvents();
  analyzeUrl();
  drawTextIcon();
  renderEmoji();
  updateColor();
  updateMoney();
  populateCurrencySelects();
  checkApiServer();
  fetchLiveRate();
  fetchWeather();
  renderAppPage();
  generatePlateCombinations();
  renderDirectory();
});
"""
    (ASSETS / "local-tools-hub.js").write_text(js.strip() + "\n", encoding="utf-8")


def write_review(tools):
    generated = dt.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    counts = Counter(t["bucket"] for t in tools)
    rows = "\n".join(
        f"<tr><td>{html.escape(BUCKET_LABELS.get(bucket, bucket))}</td><td>{count}</td><td>{html.escape(BUCKET_ACTIONS.get(bucket, ''))}</td></tr>"
        for bucket, count in counts.most_common()
    )
    page = f"""<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>工具站专家会议纪要</title>
  <link rel="stylesheet" href="assets/local-tools-hub.css">
</head>
<body>
  <header class="topbar">
    <div>
      <p class="eyebrow">Expert Review</p>
      <h1>工具站专家会议纪要</h1>
      <p class="lead">围绕 33 个工具链接形成的产品、工程、隐私和后续路线建议。</p>
    </div>
    <div class="status-board">
      <div><strong>{len(tools)}</strong><span>工具链接</span></div>
      <div><strong>{counts["offline"]}</strong><span>可本地化</span></div>
      <div><strong>{counts["api"]}</strong><span>需联网</span></div>
      <div><strong>{counts["binary"]}</strong><span>需引擎</span></div>
    </div>
  </header>
  <main class="layout">
    <aside class="rail">
      <a class="nav-link" href="local-tools-hub.html">返回工具台</a>
      <a class="nav-link" href="tools-local-plan.html">原工具计划</a>
      <a class="nav-link" href="all-links-analysis.html">全量分析</a>
    </aside>
    <section class="workspace">
      <section class="band">
        <p class="kicker">Meeting Summary</p>
        <h2>会议结论</h2>
        <ul>
          <li>第一版已经完成“离线工具 + 联网查询”的混合工具台，不把商业在线设计平台、音频解密站、账号入口硬复刻成本地功能。</li>
          <li>已内置文本/代码处理、URL 清理、图片信息、favicon 生成、emoji/颜色、App 页面生成、车牌筛选、手动换算等稳定能力。</li>
          <li>已接入真实联网功能：Frankfurter 汇率、Open-Meteo 天气、is.gd/TinyURL 短链。本地服务优先代理请求，避免浏览器跨域限制。</li>
          <li>IMEI、苹果序列号、手机号、TinEye 等没有稳定免密公开 API 的服务，保留为外部查询助手，不伪造本地结果。</li>
          <li>音频转换、QMC/NCM 转换、资源下载需要本地引擎或命令行封装，后续应做独立执行层，不在静态 HTML 中冒险实现。</li>
          <li>涉及破解、账号、版权资源的工具只保留私人入口；不做自动下载、不执行未知脚本。</li>
        </ul>
      </section>
      <section class="band">
        <p class="kicker">Grouping</p>
        <h2>工具分组</h2>
        <div class="table-card">
          <table>
            <thead><tr><th>分组</th><th>数量</th><th>处理建议</th></tr></thead>
            <tbody>{rows}</tbody>
          </table>
        </div>
      </section>
      <section class="band">
        <p class="kicker">Roadmap</p>
        <h2>后续实施路线</h2>
        <ol>
          <li>本轮已完成本地工具台和本地联网代理服务，优先保障汇率、天气、短链可真实使用。</li>
          <li>第二阶段接入本地命令行桥：ffmpeg、图片压缩、批量重命名、音频格式转换。</li>
          <li>第三阶段补缓存和历史：汇率日期缓存、天气城市收藏、短链历史、查询记录一键清空。</li>
          <li>第四阶段把工具使用记录存在本地 JSON/SQLite，形成个人工作台历史。</li>
        </ol>
      </section>
      <footer class="footer"><span>生成时间：{html.escape(generated)}</span><span>会议产物来自本地工具链接分析。</span></footer>
    </section>
  </main>
</body>
</html>
"""
    (BASE / "tools-expert-review.html").write_text(page, encoding="utf-8")


def main():
    tools = read_tools()
    write_data_js(tools)
    write_html(tools)
    write_css()
    write_js()
    write_review(tools)
    print(json.dumps({"tools": len(tools), "files": [
        "local-tools-hub.html",
        "tools-expert-review.html",
        "assets/local-tools-hub.css",
        "assets/local-tools-hub.js",
        "assets/local-tools-data.js",
        "data/local_tools_catalog.json",
    ]}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
