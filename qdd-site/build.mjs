import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const sourceRoot = path.resolve(root, "../visa-cards");
const dist = path.join(root, "dist");
const data = JSON.parse(fs.readFileSync(path.join(sourceRoot, "policy-data.json"), "utf8"));
const totalCountries = data.countries.length;
const totalSections = data.countries.reduce((sum, country) => sum + country.cards.length, 0);
const latestVerified = [...data.countries.map(country => country.verified)].sort().at(-1);

const futureCountries = [
  { flag: "🇳🇱", name: "荷兰", group: "申根签证", code: "NL" },
  { flag: "🇨🇭", name: "瑞士", group: "申根签证", code: "CH" },
  { flag: "🇬🇷", name: "希腊", group: "申根签证", code: "GR" },
  { flag: "🇵🇹", name: "葡萄牙", group: "申根签证", code: "PT" },
  { flag: "🇵🇭", name: "菲律宾", group: "短期签证", code: "PH" },
  { flag: "🇰🇭", name: "柬埔寨", group: "电子 / 落地签", code: "KH" },
  { flag: "🇱🇦", name: "老挝", group: "电子 / 落地签", code: "LA" },
  { flag: "🇸🇦", name: "沙特阿拉伯", group: "电子签证", code: "SA" },
  { flag: "🇪🇬", name: "埃及", group: "签证与入境", code: "EG" },
  { flag: "🇿🇦", name: "南非", group: "访客签证", code: "ZA" },
  { flag: "🇧🇷", name: "巴西", group: "旅游签证", code: "BR" },
  { flag: "🇲🇽", name: "墨西哥", group: "签证与有条件免签", code: "MX" }
];

const slugMap = {
  US: "united-states", GB: "united-kingdom", AU: "australia", KR: "south-korea",
  JP: "japan", TH: "thailand", MY: "malaysia", SG: "singapore",
  FR: "france", DE: "germany", IT: "italy", ES: "spain",
  AE: "united-arab-emirates", ID: "indonesia", VN: "vietnam", NZ: "new-zealand",
  CA: "canada", TR: "turkiye", GE: "georgia", RU: "russia"
};
const statusMap = {
  US: ["需要签证", "B1/B2", "high", "需要签证"],
  GB: ["需要签证", "Standard Visitor", "high", "需要签证"],
  AU: ["需要签证", "600 类别", "high", "需要签证"],
  KR: ["需要签证", "C-3-9", "high", "需要签证"],
  JP: ["需要签证", "旅游签 / eVISA", "high", "需要签证"],
  TH: ["免签", "30 天", "free", "免签入境"],
  MY: ["免签", "30 天", "free", "免签入境"],
  SG: ["免签", "最多 30 天", "free", "免签入境"],
  FR: ["需要签证", "申根 C 类", "high", "需要签证"],
  DE: ["需要签证", "申根 C 类", "high", "需要签证"],
  IT: ["需要签证", "申根 C 类", "high", "需要签证"],
  ES: ["需要签证", "申根 C 类", "high", "需要签证"],
  AE: ["免签", "最多 30 天", "free", "免签入境"],
  ID: ["落地签", "B1 / e-VOA", "arrival", "电子或落地签"],
  VN: ["电子签证", "最长 90 天", "arrival", "电子或落地签"],
  NZ: ["需要签证", "Visitor Visa", "high", "需要签证"],
  CA: ["需要签证", "Visitor Visa", "high", "需要签证"],
  TR: ["免签", "90 / 180", "free", "免签入境"],
  GE: ["免签", "30 / 90 / 180", "free", "免签入境"],
  RU: ["电子签证", "30 天 / 120 天有效", "arrival", "电子或落地签"]
};

const esc = (value = "") => String(value).replace(/[&<>"']/g, char => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
}[char]));

const layout = ({ title, description, canonical, body, page = "", schema = "" }) => `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
  <link rel="canonical" href="${canonical}">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${canonical}">
  <meta name="theme-color" content="#172d45">
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="/assets/styles.css">
  ${schema ? `<script type="application/ld+json">${schema}</script>` : ""}
</head>
<body data-page="${page}">
  <a class="skip-link" href="#main">跳到正文</a>
  <header class="site-header">
    <a class="wordmark" href="/" aria-label="qdd.app 首页">
      <span class="wordmark-mark">Q</span>
      <span><strong>乔大帅</strong><small>中国护照出境说明书</small></span>
    </a>
    <button class="nav-toggle" aria-expanded="false" aria-controls="site-nav">目录</button>
    <nav class="site-nav" id="site-nav" aria-label="主导航">
      <a href="/#countries">国家说明</a>
      <a href="/#first-trip">第一次出国</a>
      <a href="/#updates">政策更新</a>
      <a href="/#coming">更多国家</a>
      <a class="nav-domain" href="/">qdd.app</a>
    </nav>
  </header>
  ${body}
  <footer class="site-footer">
    <div>
      <strong>乔大帅｜中国护照出境说明书</strong>
      <p>面向中国大陆居民、中国普通护照、短期旅游的政策核验与办理教程。</p>
    </div>
    <div class="footer-stamp"><span>VERIFIED</span><b>qdd.app</b></div>
    <div class="footer-links">
      <a href="/#countries">国家目录</a>
      <a href="/#updates">更新机制</a>
      <a href="mailto:hello@qdd.app">hello@qdd.app</a>
    </div>
    <p class="legal">© 2026 qdd.app · 乔大帅整理。本站不是政府机构或签证代理；政策以目的地官方审核及口岸最终决定为准。</p>
  </footer>
  <script src="/assets/app.js" defer></script>
</body>
</html>`;

function countryCards() {
  return data.countries.map((country, index) => {
    const [label, detail, type, category] = statusMap[country.code];
    return `<a class="country-card reveal" style="--delay:${index * 45}ms" href="/country/${slugMap[country.code]}/" data-search="${esc(`${country.country} ${country.topic} ${label} ${detail} ${category}`)}">
      <div class="country-top"><span class="country-flag">${country.flag}</span><span class="country-code">${country.code}</span></div>
      <div><span class="status status-${type}">${label}</span><h3>${esc(country.country)}</h3><p>${esc(detail)} · ${esc(country.topic)}</p></div>
      <div class="country-meta"><span>核验 ${country.verified}</span><span>${country.cards.length} 节教程 →</span></div>
    </a>`;
  }).join("");
}

function futureCards() {
  return futureCountries.map(country => `<article class="future-card" data-search="${esc(`${country.name} ${country.group}`)}">
    <span>${country.flag}</span><div><b>${esc(country.name)}</b><small>${esc(country.group)}</small></div><em>准备中</em>
  </article>`).join("");
}

const homeSchema = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "乔大帅｜中国护照出境说明书",
  alternateName: "China Passport Brief",
  url: "https://qdd.app/",
  description: "中国普通护照免签、签证办理和入境政策核验网站",
  potentialAction: { "@type": "SearchAction", target: "https://qdd.app/?q={search_term_string}", "query-input": "required name=search_term_string" }
});

const home = layout({
  title: "乔大帅｜中国护照出境说明书 · qdd.app",
  description: "面向中国大陆普通护照持有人的免签、签证办理、入境卡与官方政策核验教程。",
  canonical: "https://qdd.app/",
  page: "home",
  schema: homeSchema,
  body: `<main id="main">
    <section class="hero">
      <div class="hero-copy">
        <p class="eyebrow"><span>CHINA PASSPORT BRIEF</span> 政策核验版</p>
        <h1>拿中国护照，<br><em>下一站怎么走？</em></h1>
        <p class="hero-lead">不卖焦虑，不承诺“包过”。把签证、免签、入境卡和停留期限拆成能照着做的步骤。</p>
        <form class="hero-search" role="search" id="country-search">
          <label class="sr-only" for="search-input">搜索国家或政策</label>
          <span>⌕</span><input id="search-input" type="search" placeholder="搜索：日本、泰国、B1/B2、免签…" autocomplete="off">
          <button type="submit">查说明</button>
        </form>
        <div class="quick-links"><span>热门：</span><a href="/country/japan/">日本电子签</a><a href="/country/thailand/">泰国 30/90/180</a><a href="/country/united-states/">美国 EVUS</a></div>
      </div>
      <div class="hero-document" aria-hidden="true">
        <div class="doc-corner">QDD<br>01</div>
        <div class="doc-label">中国普通护照<br>短期旅游</div>
        <div class="doc-title">出境<br>说明书</div>
        <div class="doc-route"><span>CHN</span><i></i><span>WORLD</span></div>
        <div class="visa-stamp">人工核验<br><b>VERIFIED</b><small>${latestVerified}</small></div>
        <div class="doc-code">qdd.app / CPB-2026</div>
      </div>
    </section>

    <section class="trust-strip" aria-label="本站原则">
      <div><b>03</b><span>三种日期<br>分开显示</span></div>
      <div><b>100%</b><span>关键结论<br>追溯官方</span></div>
      <div><b>0</b><span>不写包过<br>不卖通过率</span></div>
      <p>政策生效日 ≠ 官方页面日 ≠ 本站核验日</p>
    </section>

    <section class="section countries-section" id="countries">
      <header class="section-head"><div><p class="section-kicker">DESTINATIONS / 目的地</p><h2>先选你要去的国家</h2></div><p>当前 ${totalCountries} 国已上线。每个页面都从“三秒结论”开始，再进入完整办理或入境步骤。</p></header>
      <div class="filter-row">
        <button class="filter active" data-filter="all">全部 ${totalCountries} 国</button>
        <button class="filter" data-filter="需要签证">需要签证</button>
        <button class="filter" data-filter="免签入境">免签入境</button>
        <button class="filter" data-filter="电子或落地签">电子 / 落地签</button>
        <span id="result-count">显示 ${totalCountries} 个国家</span>
      </div>
      <div class="country-grid" id="country-grid">${countryCards()}</div>
      <p class="empty-state" id="empty-state" hidden>暂时没有匹配结果。可以在下方“更多国家”查看筹备名单。</p>
    </section>

    <section class="section first-trip" id="first-trip">
      <header class="section-head light"><div><p class="section-kicker">FIRST DEPARTURE / 第一次出国</p><h2>不知道从哪开始？<br>按这个顺序走。</h2></div></header>
      <ol class="steps">
        <li><span>01</span><div><b>先看护照和目的</b><p>普通护照还是其他旅行证件？旅游、探亲、商务不能混写。</p></div></li>
        <li><span>02</span><div><b>确认签证或免签条件</b><p>免签也有停留期限、累计规则和禁止活动。</p></div></li>
        <li><span>03</span><div><b>再准备申请和入境材料</b><p>把身份、资金、行程、住宿与返程证据组成一致的证据链。</p></div></li>
        <li><span>04</span><div><b>最后核对入境卡与官方域名</b><p>只从政府网站进入，警惕搜索广告里的收费仿冒站。</p></div></li>
      </ol>
      <aside class="warning-note"><span>!</span><p><b>永远记住：</b>签证有效期不等于单次允许停留期；免签不等于保证入境。</p></aside>
    </section>

    <section class="section update-section" id="updates">
      <div class="update-board">
        <div><p class="section-kicker">UPDATE DESK / 更新台</p><h2>政策会变，旧攻略不会自己消失。</h2><p>本站保留政策生效日期、官方页面日期与人工核验日期。美国、韩国、日本、泰国按周扫描，其余国家按月复核。</p></div>
        <dl>
          <div><dt>最近内容核验</dt><dd>${latestVerified}</dd></div>
          <div><dt>当前上线</dt><dd>${totalCountries} 国 · ${totalSections} 节</dd></div>
          <div><dt>下一批</dt><dd>更多申根 · 亚洲 · 美洲</dd></div>
        </dl>
      </div>
    </section>

    <section class="section coming-section" id="coming">
      <header class="section-head"><div><p class="section-kicker">ROADMAP / 后续国家</p><h2>导航已经留好位置</h2></div><p>这些页面会沿用同一套核验结构；资料未完成前不会用半成品结论误导读者。</p></header>
      <div class="future-grid">${futureCards()}</div>
    </section>

    <section class="cta-band">
      <p>BOOKMARK THE BRIEF</p><h2>出发前，再核验一次。</h2><a href="#countries">选择目的地</a><span>qdd.app · 乔大帅</span>
    </section>
  </main>`
});

function sourceList(country) {
  return country.sources.map((source, index) => `<li>
    <span>${String(index + 1).padStart(2, "0")}</span>
    <div><a href="${esc(source.url)}" target="_blank" rel="noopener noreferrer">${esc(source.label)} ↗</a><small>官方页面日期：${esc(source.pageDate)}</small></div>
  </li>`).join("");
}

function countryPage(country) {
  const [status, detail, type] = statusMap[country.code];
  const slug = slugMap[country.code];
  const schema = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `中国护照去${country.country}：${country.topic}完整说明`,
    dateModified: country.verified,
    author: { "@type": "Person", name: "乔大帅", url: "https://qdd.app/" },
    publisher: { "@type": "Organization", name: "qdd.app" },
    mainEntityOfPage: `https://qdd.app/country/${slug}/`
  });
  const sections = country.cards.map((card, index) => `<article class="guide-step" id="step-${index + 1}">
    <div class="step-index">${String(index + 1).padStart(2, "0")}</div>
    <div class="step-copy">
      <h2>${esc(card.title)}</h2>
      <p class="step-answer">${esc(card.answer)}</p>
      <ul>${card.bullets.map(item => `<li>${esc(item)}</li>`).join("")}</ul>
      <p class="source-ref">依据：${card.sourceIds.map(id => country.sources.find(source => source.id === id)?.label).filter(Boolean).map(esc).join(" · ")}</p>
    </div>
  </article>`).join("");

  return layout({
    title: `中国护照去${country.country}：${country.topic}完整教程｜qdd.app`,
    description: `${country.country}${country.topic}政策说明，包含停留期限、办理步骤、入境材料、风险提示和官方来源。核验日期 ${country.verified}。`,
    canonical: `https://qdd.app/country/${slug}/`,
    page: "country",
    schema,
    body: `<main id="main">
      <section class="country-hero">
        <nav class="breadcrumb" aria-label="面包屑"><a href="/">首页</a><span>/</span><a href="/#countries">国家说明</a><span>/</span><b>${esc(country.country)}</b></nav>
        <div class="country-hero-grid">
          <div>
            <p class="eyebrow"><span>${country.code} / PASSPORT BRIEF</span> ${esc(country.topic)}</p>
            <h1><span>${country.flag}</span> 中国护照去${esc(country.country)}，<br>从这里开始。</h1>
            <p class="country-summary">${esc(country.cards[0].answer)}。本页按实际操作顺序整理，共 ${country.cards.length} 节。</p>
            <div class="country-actions"><a href="#guide">开始阅读教程</a><a class="secondary-action" href="/cards/${encodeURIComponent(country.slug)}.html">打开卡片工具</a></div>
          </div>
          <aside class="verdict-card">
            <span class="status status-${type}">${status}</span>
            <strong>${esc(detail)}</strong>
            <dl>
              <div><dt>适用护照</dt><dd>${esc(country.fields.passport)}</dd></div>
              <div><dt>单次停留</dt><dd>${esc(country.fields.stay)}</dd></div>
              <div><dt>入境卡</dt><dd>${esc(country.fields.arrivalCard)}</dd></div>
            </dl>
            <p>签证或免签均不保证入境</p>
          </aside>
        </div>
        <div class="date-ribbon">
          <div><span>政策生效</span><b>${country.policyEffective}</b></div>
          <div><span>官方页面</span><b>${country.officialUpdated}</b></div>
          <div><span>本站核验</span><b>${country.verified}</b></div>
          <div><span>下次复核</span><b>${country.nextReview}</b></div>
        </div>
      </section>

      <section class="country-content">
        <aside class="guide-toc">
          <p>本页目录</p>
          <ol>${country.cards.map((card, index) => `<li><a href="#step-${index + 1}"><span>${String(index + 1).padStart(2, "0")}</span>${esc(card.title)}</a></li>`).join("")}</ol>
          <a class="back-all" href="/#countries">← 返回全部国家</a>
        </aside>
        <div class="guide" id="guide">
          <header><p class="section-kicker">STEP-BY-STEP / 办理说明</p><h2>${country.cards.length} 个问题，一次说明白</h2></header>
          ${sections}
        </div>
      </section>

      <section class="policy-facts">
        <header><p class="section-kicker">POLICY DATA / 政策字段</p><h2>不要混淆这些概念</h2></header>
        <dl>
          ${Object.entries({
            "适用目的": country.fields.purpose,
            "是否需要签证": country.fields.visa,
            "累计停留": country.fields.cumulative,
            "费用": country.fields.fee,
            "官方处理时间": country.fields.processing,
            "领区或例外": country.fields.districtException,
            "风险等级": country.fields.risk
          }).map(([key, value]) => `<div><dt>${esc(key)}</dt><dd>${esc(value)}</dd></div>`).join("")}
        </dl>
      </section>

      <section class="official-sources">
        <header><p class="section-kicker">OFFICIAL SOURCES / 官方来源</p><h2>每个结论都要能回到原文</h2><p>离出发越近，越应该重新打开官方页面核验。</p></header>
        <ol>${sourceList(country)}</ol>
      </section>

      <section class="next-country">
        <p>继续查下一个目的地</p>
        ${data.countries.filter(item => item.code !== country.code).slice(0, 4).map(item => `<a href="/country/${slugMap[item.code]}/">${item.flag} ${item.country}<span>→</span></a>`).join("")}
      </section>
    </main>`
  });
}

fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(path.join(dist, "assets"), { recursive: true });
fs.mkdirSync(path.join(dist, "country"), { recursive: true });
fs.mkdirSync(path.join(dist, "cards"), { recursive: true });

fs.copyFileSync(path.join(root, "styles.css"), path.join(dist, "assets/styles.css"));
fs.copyFileSync(path.join(root, "app.js"), path.join(dist, "assets/app.js"));
fs.writeFileSync(path.join(dist, "index.html"), home);

for (const country of data.countries) {
  const folder = path.join(dist, "country", slugMap[country.code]);
  fs.mkdirSync(folder, { recursive: true });
  fs.writeFileSync(path.join(folder, "index.html"), countryPage(country));
  fs.copyFileSync(path.join(sourceRoot, `${country.slug}.html`), path.join(dist, "cards", `${country.slug}.html`));
}

fs.writeFileSync(path.join(dist, "favicon.svg"), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="13" fill="#172d45"/><path d="M15 14h34v36H15z" fill="#f6eddd" stroke="#e87537" stroke-width="3"/><path d="M26 26c0-7 13-7 13 1 0 7-13 7-13 0m8 6 7 8" fill="none" stroke="#172d45" stroke-width="4" stroke-linecap="round"/></svg>`);
fs.writeFileSync(path.join(dist, "_headers"), `/*
  X-Content-Type-Options: nosniff
  X-Frame-Options: SAMEORIGIN
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
  Cache-Control: public, max-age=300

/assets/*
  Cache-Control: public, max-age=86400
`);
fs.writeFileSync(path.join(dist, "robots.txt"), `User-agent: *\nAllow: /\nSitemap: https://qdd.app/sitemap.xml\n`);
const urls = ["", ...data.countries.map(country => `country/${slugMap[country.code]}/`)];
fs.writeFileSync(path.join(dist, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(url => `  <url><loc>https://qdd.app/${url}</loc><lastmod>${latestVerified}</lastmod></url>`).join("\n")}\n</urlset>`);
fs.writeFileSync(path.join(dist, "404.html"), layout({
  title: "页面没有找到｜qdd.app",
  description: "这个页面暂时不存在。",
  canonical: "https://qdd.app/404",
  body: `<main id="main" class="not-found"><p class="eyebrow"><span>404 / NOT FOUND</span></p><h1>这张“签证页”还没盖章。</h1><p>你访问的国家说明可能仍在准备，或者链接已经变化。</p><a href="/">返回 qdd.app 首页</a></main>`
}));

console.log(`Built qdd.app: ${data.countries.length} country pages, ${data.countries.reduce((sum, country) => sum + country.cards.length, 0)} guide sections.`);
