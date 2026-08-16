import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { businessRanking, communityIssueBank, getBusinessGuide, planningFunds } from "./business-guides.mjs";
import { visaDifficultyRanking, companyRanking, bankingRanking } from "./ranking-data.mjs";

const root = path.dirname(fileURLToPath(import.meta.url));
const sourceRoot = path.resolve(root, "../visa-cards");
const dist = path.join(root, "dist");
const assetVersion = createHash("sha256")
  .update(fs.readFileSync(path.join(root, "styles.css")))
  .update(fs.readFileSync(path.join(root, "app.js")))
  .digest("hex")
  .slice(0, 12);
const data = JSON.parse(fs.readFileSync(path.join(sourceRoot, "policy-data.json"), "utf8"));
const totalCountries = data.countries.length;
const totalSections = data.countries.reduce((sum, country) => sum + country.cards.length, 0);
const latestVerified = [...data.countries.map(country => country.verified)].sort().at(-1);
const buildDate = new Date().toISOString().slice(0, 10);
const reviewState = country => country.nextReview < buildDate
  ? { key: "due", label: "到期将复核", note: `我们计划的复核日 ${country.nextReview} 已到，会尽快再核对一遍` }
  : { key: "current", label: "复核周期内", note: `最近一次核对在复核周期内，计划于 ${country.nextReview} 前再次核对` };
const reviewCounts = data.countries.reduce((counts, country) => {
  counts[reviewState(country).key] += 1;
  return counts;
}, { current: 0, due: 0 });
const riskLabel = value => ({
  "高": "政策变动风险高 / 入境条件较多",
  "中高": "政策变动风险中高 / 材料核验较细",
  "中": "政策变动风险中等 / 仍需逐项核对",
  "低": "政策变动风险较低 / 仍需出发前复核"
}[value] || value);

const futureCountries = [
  { flag: "🇮🇳", name: "印度", group: "电子签与领馆签证", code: "IN" },
  { flag: "🇱🇦", name: "老挝", group: "电子 / 落地签", code: "LA" },
  { flag: "🇨🇱", name: "智利", group: "签证与入境", code: "CL" },
  { flag: "🇵🇪", name: "秘鲁", group: "签证与入境", code: "PE" },
  { flag: "🇨🇴", name: "哥伦比亚", group: "在线签证", code: "CO" },
  { flag: "🇮🇪", name: "爱尔兰", group: "短期访问签证", code: "IE" },
  { flag: "🇵🇱", name: "波兰", group: "申根签证", code: "PL" },
  { flag: "🇨🇿", name: "捷克", group: "申根签证", code: "CZ" },
  { flag: "🇯🇲", name: "牙买加", group: "岛屿国家复核中", code: "JM" }
];

const slugMap = {
  US: "united-states", GB: "united-kingdom", AU: "australia", KR: "south-korea",
  JP: "japan", TH: "thailand", MY: "malaysia", SG: "singapore",
  FR: "france", DE: "germany", IT: "italy", ES: "spain",
  AE: "united-arab-emirates", ID: "indonesia", VN: "vietnam", NZ: "new-zealand",
  CA: "canada", TR: "turkiye", GE: "georgia", RU: "russia",
  PH: "philippines", KH: "cambodia", BR: "brazil", KZ: "kazakhstan", UZ: "uzbekistan", RS: "serbia", MA: "morocco",
  NL: "netherlands", CH: "switzerland", GR: "greece", PT: "portugal", MX: "mexico", SA: "saudi-arabia", EG: "egypt", ZA: "south-africa", KE: "kenya", TZ: "tanzania", AZ: "azerbaijan", AM: "armenia", MN: "mongolia", QA: "qatar", OM: "oman", PK: "pakistan", NP: "nepal", BD: "bangladesh", LK: "sri-lanka", JO: "jordan", MV: "maldives", MU: "mauritius", SC: "seychelles", FJ: "fiji", WS: "samoa", TO: "tonga", VU: "vanuatu", SB: "solomon-islands", PW: "palau", BS: "bahamas"
};

// eSIM.school 的目的地页会持续更新套餐、覆盖与价格；这里仅保存稳定的目的地 slug，
// 不把实时价格或套餐数量复制进 qdd.app，避免把会变的数据写死在政策页面里。
const esimDestinationSlugs = {
  US: "united-states", GB: "united-kingdom", AU: "australia", KR: "south-korea",
  JP: "japan", TH: "thailand", MY: "malaysia", SG: "singapore", FR: "france",
  DE: "germany", IT: "italy", ES: "spain", AE: "uae", ID: "indonesia",
  VN: "vietnam", NZ: "new-zealand", CA: "canada", TR: "turkey", BR: "brazil",
  MA: "morocco", NL: "netherlands", CH: "switzerland", GR: "greece", PT: "portugal",
  MX: "mexico", SA: "saudi-arabia", EG: "egypt", ZA: "south-africa", NP: "nepal",
  LK: "sri-lanka", KH: "cambodia"
};
const esimBase = "https://esim.school/zh";
const esimCompareUrl = (country, campaign = "country") => {
  const slug = esimDestinationSlugs[country.code];
  const target = slug ? `${esimBase}/compare/${slug}/` : `${esimBase}/compare/`;
  return `${target}?utm_source=qdd&utm_medium=referral&utm_campaign=${campaign}-${country.code.toLowerCase()}`;
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
  RU: ["免签", "每次最多 30 天", "free", "免签入境"],
  PH: ["免签", "最多 14 天", "free", "免签入境"],
  KH: ["免签", "限时最多 14 天", "free", "免签入境"],
  BR: ["免签", "限时累计 30 天", "free", "免签入境"],
  KZ: ["免签", "30 / 90 / 180", "free", "免签入境"],
  UZ: ["免签", "30 / 90 / 180", "free", "免签入境"],
  RS: ["免签", "最多 30 天", "free", "免签入境"],
  MA: ["免签", "最多 90 天", "free", "免签入境"],
  NL: ["需要签证", "申根 C 类", "high", "需要签证"], CH: ["需要签证", "申根 C 类", "high", "需要签证"], GR: ["需要签证", "申根 C 类", "high", "需要签证"], PT: ["需要签证", "申根 C 类", "high", "需要签证"], MX: ["需要签证", "访客签证", "high", "需要签证"],
  SA: ["电子签 / 入境许可", "官方系统核验", "arrival", "电子或落地签"], EG: ["电子签 / 入境许可", "官方系统核验", "arrival", "电子或落地签"], ZA: ["电子申请 / 访客签", "官方系统核验", "arrival", "电子或落地签"], KE: ["电子旅行授权", "eTA", "arrival", "电子或落地签"], TZ: ["电子签 / 落地签", "官方系统核验", "arrival", "电子或落地签"], AZ: ["电子签", "官方系统核验", "arrival", "电子或落地签"], AM: ["电子签 / 签证", "官方系统核验", "arrival", "电子或落地签"], MN: ["电子签 / 签证", "官方系统核验", "arrival", "电子或落地签"], QA: ["入境许可", "Hayya / 官方核验", "arrival", "电子或落地签"], OM: ["电子签", "官方系统核验", "arrival", "电子或落地签"],
  PK: ["需要签证", "在线签证", "high", "需要签证"], NP: ["电子申请 / 落地签", "官方系统核验", "arrival", "电子或落地签"], BD: ["需要签证", "官方签证门户", "high", "需要签证"], LK: ["电子旅行许可", "ETA", "arrival", "电子或落地签"], JO: ["需要签证", "入境许可", "high", "需要签证"],
  MV: ["抵达许可", "旅游入境核验", "free", "免签入境"], MU: ["入境许可", "按国籍表核验", "arrival", "电子或落地签"], SC: ["旅行授权", "出发前 ETA", "arrival", "电子或落地签"], FJ: ["免签 / 访客许可", "入境核验", "free", "免签入境"], WS: ["入境许可", "访客许可核验", "arrival", "电子或落地签"], TO: ["需要签证", "访客许可核验", "high", "需要签证"], VU: ["免签 / 访客许可", "入境核验", "free", "免签入境"], SB: ["需要签证", "访客许可核验", "high", "需要签证"], PW: ["入境许可", "访客许可核验", "arrival", "电子或落地签"], BS: ["需要签证", "访客许可核验", "high", "需要签证"]
};

const esc = (value = "") => String(value).replace(/[&<>"']/g, char => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
}[char]));

const layout = ({ title, description, body, page = "", schema = "", assetPath = "assets", iconPath = "favicon.svg", canonical, modified = buildDate, pageType = "website" }) => {
  const metaDescription = description.length < 90 && !description.includes("本站核验") ? `${description} 官方来源、办理步骤与核验日期清楚标注。` : description;
  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(metaDescription)}">
  <meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1">
  <meta name="googlebot" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1">
  <meta name="author" content="乔大帅">
  <link rel="canonical" href="${canonical}">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(metaDescription)}">
  <meta property="og:type" content="${pageType}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:site_name" content="qdd.app｜中国护照出境说明书">
  <meta property="og:locale" content="zh_CN">
  ${pageType === "article" ? `<meta property="article:modified_time" content="${esc(modified)}">` : ""}
  <meta name="twitter:card" content="summary">
  <meta name="twitter:title" content="${esc(title)}">
  <meta name="twitter:description" content="${esc(metaDescription)}">
  <meta name="theme-color" content="#16302c">
  <link rel="icon" href="${iconPath}" type="image/svg+xml">
  <link rel="alternate" type="text/plain" href="https://qdd.app/llms.txt" title="qdd.app AI 阅读说明">
  <link rel="stylesheet" href="${assetPath}/styles.css?v=${assetVersion}">
  <script type="application/ld+json">${JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": "https://qdd.app/#organization",
    name: "乔大帅｜中国护照出境说明书",
    url: "https://qdd.app/",
    description: "面向中国普通护照持有人的出境政策核验与官方办理说明。",
    logo: "https://qdd.app/favicon.svg"
  })}</script>
  ${schema ? `<script type="application/ld+json">${schema}</script>` : ""}
</head>
<body data-page="${page}">
  <a class="skip-link" href="#main">跳到正文</a>
  <header class="site-header">
    <a class="wordmark" href="/" aria-label="qdd.app 首页">
      <span class="wordmark-mark">验</span>
      <span><strong>乔大帅</strong><small>中国护照出境说明书</small></span>
    </a>
    <button class="nav-toggle" aria-expanded="false" aria-controls="site-nav">目录</button>
    <nav class="site-nav" id="site-nav" aria-label="主导航">
      <a href="/#countries">国家说明</a>
      <a href="/topics/">专题</a>
      <a href="/topics/esim/">出国上网</a>
      <a href="/personal-banking/">银行卡指南</a>
      <a href="/faq/">常见问题</a>
      <a href="/updates/">更新记录</a>
      <a href="/methodology/">核验方法</a>
      <a href="/rankings/">出海排行</a>
      <a href="/for-business/">机构合作</a>
      <a class="nav-domain" href="/">qdd.app</a>
    </nav>
  </header>
  ${body}
  <footer class="site-footer">
    <div>
      <strong>乔大帅｜中国护照出境说明书</strong>
      <p>面向中国大陆居民、中国普通护照、短期旅游的政策核验与办理教程。</p>
    </div>
    <div class="footer-stamp"><span>已核验</span><b>qdd.app</b></div>
    <div class="footer-links">
      <a href="/#countries">国家目录</a>
      <a href="/faq/">常见问题</a>
      <a href="/personal-banking/">银行卡指南</a>
      <a href="/topics/esim/">出国上网</a>
      <a href="/glossary/">词汇表</a>
      <a href="/updates/">更新记录</a>
      <a href="/methodology/">核验方法</a>
      <a href="/for-business/">机构合作</a>
      <a href="mailto:hello@qdd.app">hello@qdd.app</a>
    </div>
    <p class="legal">© 2026 qdd.app · 乔大帅整理。本站不是政府机构或签证代理；政策以目的地官方审核及口岸最终决定为准。</p>
  </footer>
  <script src="${assetPath}/app.js?v=${assetVersion}" defer></script>
</body>
</html>`;
};

function countryCards() {
  return data.countries.map((country, index) => {
    const [label, detail, type, category] = statusMap[country.code];
    const review = reviewState(country);
    return `<a class="country-card reveal" style="--delay:${index * 45}ms" href="/country/${slugMap[country.code]}/" data-search="${esc(`${country.country} ${country.topic} ${label} ${detail} ${category}`)}">
      <div class="country-top"><span class="country-flag">${country.flag}</span><span class="country-code">${country.code}</span></div>
      <div><span class="status status-${type}">${label}</span><h3>${esc(country.country)}</h3><p>${esc(detail)} · ${esc(country.topic)}</p></div>
      <div class="country-meta"><span class="review-pill review-${review.key}">${review.label} · ${country.verified}</span><span>${country.cards.length} 节教程 →</span></div>
    </a>`;
  }).join("");
}

function futureCards() {
  return futureCountries.map(country => `<article class="future-card" data-search="${esc(`${country.name} ${country.group}`)}">
    <span>${country.flag}</span><div><b>${esc(country.name)}</b><small>${esc(country.group)}</small></div><em>${country.group === "签证政策核对中" ? "核对中，将优先上线" : "筹备中"}</em>
  </article>`).join("");
}

const homeSchema = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": "https://qdd.app/#website",
  name: "乔大帅｜中国护照出境说明书",
  alternateName: "China Passport Brief",
  url: "https://qdd.app/",
  description: "中国普通护照免签、签证办理和入境政策核验网站",
  potentialAction: { "@type": "SearchAction", target: "https://qdd.app/?q={search_term_string}", "query-input": "required name=search_term_string" }
});

const home = layout({
  title: "乔大帅｜中国护照出境说明书 · qdd.app",
  description: "中国普通护照出境政策查询：免签、电子签、签证申请、材料清单、官方入口、入境卡、停留期限、公司与银行卡提示，以及每个页面的核验日期。",
  canonical: "https://qdd.app/",
  page: "home",
  schema: homeSchema,
  body: `<main id="main">
    <section class="hero">
      <div class="hero-copy">
        <p class="eyebrow"><span>中国护照 · 出境说明</span> 人工核对版</p>
        <h1>拿中国护照，<br><em>下一站怎么走？</em></h1>
        <p class="hero-lead">把签证、免签、入境卡和停留期限，拆成一步步能照着做的说明。不卖焦虑，也不承诺“包过”。</p>
        <form class="hero-search" role="search" id="country-search">
          <label class="sr-only" for="search-input">搜索国家或政策</label>
          <span>⌕</span><input id="search-input" type="search" placeholder="搜国家或问题，比如：日本、免签、入境卡" autocomplete="off">
          <button type="submit">查一查</button>
        </form>
        <div class="quick-links"><span>热门：</span><a href="/country/japan/">日本电子签</a><a href="/country/thailand/">泰国免签 30 天</a><a href="/country/united-states/">美国 B1/B2 签证</a></div>
      </div>
      <div class="hero-document" aria-hidden="true">
        <div class="doc-corner">QDD<br>01</div>
        <div class="doc-label">中国普通护照<br>短期旅游</div>
        <div class="doc-title">出境<br>说明书</div>
        <div class="doc-route"><span>CHN</span><i></i><span>WORLD</span></div>
        <div class="visa-stamp">人工核验<br><b>已核验</b><small>${latestVerified}</small></div>
        <div class="doc-code">qdd.app / CPB-2026</div>
      </div>
    </section>

    <section class="trust-strip" aria-label="本站原则">
      <div><b>03</b><span>三种日期<br>分开显示</span></div>
      <div><b>100%</b><span>重要说明<br>都附有官方出处</span></div>
      <div><b>0</b><span>不写“包过”<br>不承诺出签</span></div>
      <p>三个日期各管各的：政策哪天生效、官方页面哪天更新、我们哪天核对——都不等于彼此。</p>
    </section>

    <section class="review-dashboard" aria-label="数据更新时间说明">
      <div><p class="section-kicker">数据更新</p><h2>数据多久核对一次？<br>日期都写在这里。</h2></div>
      <dl><div><dt>复核周期内</dt><dd>${reviewCounts.current}</dd></div><div><dt>到期将复核</dt><dd>${reviewCounts.due}</dd></div><div><dt>最近全站核对</dt><dd>${latestVerified}</dd></div></dl>
      <p>每个国家页面都先由人工对照官方来源，再整理发布；过一段时间还会再查一遍。<b>${latestVerified}</b> 是最近一次全站核对的日期。现在有 ${reviewCounts.current} 个国家仍在复核周期内，${reviewCounts.due} 个已经到了计划复核日——这只是提醒我们尽快重查，不表示页面已经失效。政策可能随时变化，出发前请再打开官方页面确认。<a href="/updates/">查看各国核对记录 →</a></p>
    </section>

    <section class="section countries-section" id="countries">
      <header class="section-head"><div><p class="section-kicker">国家说明</p><h2>先选你要去的国家</h2></div><p>目前已有 ${totalCountries} 个国家上线。每页先给一句话结论，再按顺序说明办理或入境步骤。</p></header>
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
      <header class="section-head light"><div><p class="section-kicker">第一次出国</p><h2>不知道从哪开始？<br>照这个顺序准备。</h2></div></header>
      <ol class="steps">
        <li><span>01</span><div><b>先看护照和目的</b><p>普通护照还是其他旅行证件？旅游、探亲、商务不能混写。</p></div></li>
        <li><span>02</span><div><b>确认签证或免签条件</b><p>免签也有停留天数、累计限制和不能做的事。</p></div></li>
        <li><span>03</span><div><b>再准备申请和入境材料</b><p>身份、资金、行程、住宿和返程票，日期和信息要互相对得上。</p></div></li>
        <li><span>04</span><div><b>最后核对入境卡与官方域名</b><p>只从政府网站进入，警惕搜索广告里的收费仿冒站。</p></div></li>
      </ol>
      <aside class="warning-note"><span>!</span><p><b>两个最容易搞错的地方：</b>签证能用的期限≠每次能待的天数；免签≠一定能入境，边检有最终决定权。</p></aside>
      <p class="faq-entry">还有具体问题？看<a href="/faq/">《签证疑难杂症 50 问》</a>；专业词看不懂？查<a href="/glossary/">大白话词汇表</a>。</p>
    </section>

    <section class="section topic-section" id="topics">
      <header class="section-head"><div><p class="section-kicker">按问题查</p><h2>不只按国家查，<br>也可以按问题找答案。</h2></div><p>丝路、非洲、巴尔干等专题正在准备中；目前先把已经人工核对过的 ${totalCountries} 个国家，按大家常问的问题分组。</p></header>
      <div class="topic-grid">
        <a href="/topics/visa-free/"><span>01</span><h3>免签目的地</h3><p>停留上限、累计规则、禁止活动与入境材料。</p></a>
        <a href="/topics/visa-required/"><span>02</span><h3>需要签证</h3><p>从在线申请、材料、录指纹到领取护照。</p></a>
        <a href="/topics/arrival-cards/"><span>03</span><h3>入境卡与网上申报</h3><p>泰国、马来西亚、新加坡等国要求抵达前 3 天内网上填入境卡。</p></a>
        <a href="/topics/first-trip/"><span>04</span><h3>第一次出国</h3><p>按护照、目的、签证、材料、入境顺序核验。</p></a>
        <a href="/personal-banking/"><span>05</span><h3>银行卡与开户</h3><p>看懂账户、借记卡、信用卡的区别，按 KYC 和资金来源准备。</p></a>
        <a href="/topics/esim/"><span>06</span><h3>出国上网与 eSIM</h3><p>先查设备兼容，再比较 eSIM、实体 SIM、漫游和随身 Wi‑Fi。</p></a>
      </div>
    </section>

    <section class="section update-section" id="updates">
      <div class="update-board">
        <div><p class="section-kicker">更新记录</p><h2>政策会变，我们会及时重查。</h2><p>每个页面都列出三个日期：政策生效日、官方页面日期和本站核对日期。自动扫描只负责找出变化；涉及签证、免签和入境的内容，必须经过人工复核才会更新。</p><a class="text-link" href="/methodology/">看看我们怎样核对 →</a></div>
        <dl>
          <div><dt>最近全站核对</dt><dd>${latestVerified}</dd></div>
          <div><dt>当前上线</dt><dd>${totalCountries} 国 · ${totalSections} 节</dd></div>
          <div><dt>当前状态</dt><dd>${reviewCounts.current} 国刚核对过 · ${reviewCounts.due} 国到点待再看</dd></div>
        </dl>
      </div>
    </section>

    <section class="section coming-section" id="coming">
      <header class="section-head"><div><p class="section-kicker">后续国家</p><h2>这些国家，还在核对</h2></div><p>页面结构已经准备好。官方资料没有逐条核对完之前，我们不会急着上线。</p></header>
      <div class="future-grid">${futureCards()}</div>
    </section>

    <section class="cta-band">
      <p>收藏这份说明</p><h2>出发前，记得再查一遍。</h2><a href="mailto:hello@qdd.app?subject=qdd.app%20政策变动邮件提醒">有政策变化，请提醒我</a><span>留下你要去的国家，政策更新时我们发邮件通知 · 乔大帅</span>
    </section>
  </main>`
});

function sourceList(country) {
  return country.sources.map((source, index) => `<li>
    <span>${String(index + 1).padStart(2, "0")}</span>
    <div><a href="${esc(source.url)}" target="_blank" rel="noopener noreferrer">${esc(source.label)} ↗</a><small>官方页面日期：${esc(source.pageDate)}</small></div>
  </li>`).join("");
}

function applicationPanel(country) {
  const application = country.application;
  if (!application) return "";
  const isFree = application.routeType === "visa_free";
  const isEvisa = application.routeType === "evisa";
  const success = application.successRate;
  const linkItems = [
    { url: application.officialGuideUrl, label: application.officialGuideLabel },
    { url: application.documentsUrl, label: application.documentsLabel },
    { url: application.processingUrl, label: isFree ? "查看入境要求和停留规则" : "查看官方处理时间和入境说明" },
    ...(!isFree ? [{ url: application.feeUrl, label: "查看费用和支付方式" }] : [])
  ].filter((item, index, items) => item.url && items.findIndex(other => other.url === item.url) === index);
  return `<section class="application-panel" id="apply">
    <header><p class="section-kicker">官方办理入口</p><h2>${isFree ? "免签入境，也要做好这些准备" : isEvisa ? "办电子签，先认准官方入口" : "办签证，先从官方入口开始"}</h2><p>${isFree ? "不用提前申请签证，但仍要填入境卡、准备材料，并确认允许停留多久。" : "申请入口、材料、费用和办理时间都列在这里，省得在搜索结果里踩到仿冒网站。"}</p></header>
    <div class="application-grid">
      <div class="application-entry"><span class="status status-${isFree ? "free" : isEvisa ? "arrival" : "high"}">${esc(application.routeLabel)}</span><h3>${esc(application.applicationLabel)}</h3><a class="primary-apply" href="${esc(application.applicationUrl)}" target="_blank" rel="noopener noreferrer">进入官方页面 ↗</a>${application.backupRouteUrl ? `<a class="backup-apply" href="${esc(application.backupRouteUrl)}" target="_blank" rel="noopener noreferrer">${esc(application.backupRouteLabel)} ↗</a>` : ""}<small>官方域名：${esc(new URL(application.applicationUrl).hostname)}</small></div>
      <div class="application-links"><h3>相关官方页面</h3>${linkItems.map(item => `<a href="${esc(item.url)}" target="_blank" rel="noopener noreferrer">${esc(item.label)} ↗</a>`).join("")}</div>
    </div>
    <div class="materials-block"><div><h3>${isFree ? "入境前要准备的材料" : "申请前和入境前要准备的资料"}</h3><p>${isFree ? "以下是边检入境时可能会看的材料。标“建议携带”的最好都准备好；具体要求以出发前和入境时的官方规定为准，材料齐全也不代表一定获准入境。" : "以下是根据官方要求整理的常见资料。最终要交什么，以官方申请系统生成的清单为准。标“需要”的通常都要准备，标“按情况”的请结合自己的情况判断。"}</p></div><ul>${application.requiredDocuments.map(item => `<li class="${item.required === false ? "optional" : "required"}"><b>${item.required === false ? "按情况" : "需要"}</b><span><strong>${esc(item.name)}</strong><small>${esc(item.detail)}</small></span></li>`).join("")}</ul></div>
    <div class="application-steps"><h3>按这个顺序办</h3><ol>${application.applicationSteps.map((step, index) => `<li><span>${String(index + 1).padStart(2, "0")}</span>${esc(step)}</li>`).join("")}</ol></div>
    ${isFree ? `<div class="success-rate success-official"><div><span class="section-kicker">能否入境</span><strong>免签也不等于一定能入境</strong></div><p>实际停留天数和能否入境，由目的地边检按现场情况决定。<a href="${esc(success.url)}" target="_blank" rel="noopener noreferrer">查看官方说明 ↗</a></p></div>` : `<div class="success-rate success-${esc(success.status)}"><div><span class="section-kicker">成功率怎么看</span><strong>${esc(success.label)}</strong><em>这是整体统计，不能直接推算个人结果</em></div><p>${esc(success.note)} <a href="${esc(success.url)}" target="_blank" rel="noopener noreferrer">查看官方说明 ↗</a></p></div>`}
    <div class="risk-tips"><h3>实用提醒：最容易出错的地方</h3><ul>${application.riskTips.map(tip => `<li>${esc(tip)}</li>`).join("")}</ul></div>
    <p class="application-verified">申请入口与材料清单最后核对：${esc(application.lastVerified)}。费用、排期、入口和材料可能变化，提交前请重新打开官方页面。</p>
  </section>`;
}

function esimPanel(country) {
  const compareUrl = esimCompareUrl(country);
  const hasDestinationPage = Boolean(esimDestinationSlugs[country.code]);
  const destinationLabel = hasDestinationPage ? `查看${country.country}套餐对比` : "打开目的地列表";
  return `<section class="esim-panel" id="connectivity">
    <div class="esim-panel-head"><div><p class="section-kicker">出发前通信 / 可选服务</p><h2>签证办好后，手机上网也提前安排。</h2><p>旅行 eSIM、当地实体 SIM、国际漫游和随身 Wi‑Fi 各有适用场景。先看设备、覆盖和套餐限制，再决定要不要买；这不是签证或入境要求。</p></div><span class="esim-mark">eSIM<br><small>school</small></span></div>
    <div class="esim-panel-grid">
      <article class="esim-card esim-card-primary"><span class="esim-label">${hasDestinationPage ? `${esc(country.country)}目的地比价` : "目的地套餐比价"}</span><h3>${destinationLabel}</h3><p>按流量、有效期、网络覆盖和运营商比较。套餐数量、价格与退款条件会变化，请以打开页面时显示的内容为准。</p><a class="esim-cta" href="${compareUrl}" target="_blank" rel="sponsored noopener noreferrer">${destinationLabel} ↗</a><small class="esim-domain">官方页面：esim.school/zh/compare/</small></article>
      <article class="esim-card"><span class="esim-label">先确认再购买</span><h3>三件事，少走弯路</h3><ul><li><b>设备</b> 手机要支持 eSIM，且通常需要已解锁；国行机型、地区版本和运营商限制要单独确认。</li><li><b>用途</b> 旅行 eSIM 多数只提供数据，不一定含本地号码、短信或通话；验证码需求要保留原号码。</li><li><b>时机</b> 可以出发前安装，到达后再打开这条线路的数据；不要因为提前安装就误以为套餐已经开始计时。</li></ul></article>
      <article class="esim-card esim-card-note"><span class="esim-label">关联服务说明</span><h3>为什么这里会出现 eSIM.school？</h3><p>eSIM.school 是乔大帅团队的关联网站，用来做 eSIM 教程和套餐比较。点击或购买可能为 qdd.app 带来收入，但不会改变本站的签证结论、国家排序、风险提示或官方来源。</p><div class="esim-links"><a href="${esimBase}/learn/what-is-esim/" target="_blank" rel="sponsored noopener noreferrer">先看 eSIM 入门 ↗</a><a href="${esimBase}/devices/" target="_blank" rel="sponsored noopener noreferrer">查设备兼容性 ↗</a></div></article>
    </div>
    <p class="esim-source-note">价格、网络覆盖、有效期、热点、通话短信、退款和运营商条款，以 eSIM.school 及对应运营商当前页面为准。qdd.app 不代售、不代激活，也不保证任何网络服务可用。</p>
  </section>`;
}

function businessPanel(country) {
  const guide = getBusinessGuide(country.code, country.country);
  const rank = businessRanking.find(item => item.code === country.code);
  const external = url => url ? `<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">打开官方页面 ↗</a>` : "";
  const matrix = guide.matrix;
  const officialLink = (url, label) => url ? `<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(label)} ↗</a>` : "";
  const matrixRows = matrix ? `<dl class="business-eligibility-list"><div><dt>中国公民能否发起</dt><dd>${esc(guide.eligibility || matrix.company)}</dd></div><div><dt>本地条件</dt><dd>${esc(matrix.local)}</dd></div><div><dt>工作许可边界</dt><dd>${esc(matrix.work)}</dd></div><div><dt>账户前置条件</dt><dd>${esc(matrix.bank)}</dd></div></dl>` : `<p class="business-pending">这部分还没有完成同等深度的逐条核验。先从官方入口确认公司类型、工作许可和银行 KYC，不要按其他国家的经验办理。</p>`;
  const matrixLinks = matrix ? [officialLink(matrix.sources?.[0], "公司登记 / 投资"), officialLink(matrix.sources?.[1], "工作许可 / 移民"), officialLink(matrix.sources?.[2], "金融监管 / KYC")].filter(Boolean).join("") : "";
  return `<section class="business-panel" id="business">
    <header class="business-panel-head"><div><p class="section-kicker">出海经营 / 公司与金融</p><h2>${rank ? `出海优先级第 ${rank.rank} 名：${esc(country.country)}` : `${esc(country.country)}：公司注册与开户`}</h2></div><span class="business-status business-status-${guide.status}">${esc(guide.statusLabel)}</span></header>
    <p class="business-basis">${esc(guide.basis)} <a href="/rankings/">看看排行依据和全部国家 →</a></p>
    <div class="business-eligibility"><div><span class="business-label">先判断你能不能走这条路</span><h3>注册公司、拿工作许可、开银行账户，是三件事。</h3><p>短期旅游或商务访问不会自动变成工作权；公司登记成功，也不会自动带来个人账户、企业账户或信用卡。</p></div>${matrixRows}<div class="business-links business-matrix-links">${matrixLinks}</div></div>
    <div class="business-grid">
      <article class="business-card"><span class="business-label">01 / 公司与营业许可</span><h3>先定主体，再查行业牌照</h3><p>${esc(guide.company.setup)}</p><p><strong>营业执照 / 行业许可：</strong>${esc(guide.license || guide.company.localRule)}</p><dl><div><dt>当地规则</dt><dd>${esc(guide.company.localRule)}</dd></div><div><dt>最低资本</dt><dd>${esc(guide.company.capital)}</dd></div><div><dt>公司规模</dt><dd>${esc(guide.company.scale)}</dd></div><div><dt>资金规划</dt><dd>${esc(guide.company.funds)}</dd></div></dl><div class="business-links">${external(guide.company.portal)}${(guide.company.sources || []).filter(url => url !== guide.company.portal).map(external).join("")}</div></article>
      <article class="business-card"><span class="business-label">02 / 工作许可与 EP</span><h3>有公司，不等于你能在当地工作</h3><p>${esc(guide.visa.entry)}</p><p><strong>对应路径：</strong>${esc(guide.workPermit?.route || guide.visa.work)}</p><p class="business-redline"><strong>不能直接做：</strong>旅游、免签或普通商务访问不能推导出受雇、领工资或亲自经营的许可。</p><div class="business-links">${external(guide.workPermit?.official || guide.visa.source)}</div></article>
      <article class="business-card"><span class="business-label">03 / 个人账户与借记卡</span><h3>先过身份和地址核验</h3><p><strong>个人账户：</strong>${esc(guide.banking.personal)}</p><p><strong>借记卡 / 储蓄账户：</strong>${esc(guide.banking.debit)}</p><p><strong>首轮核对银行：</strong>${esc(guide.bankingOption)}</p><div class="business-links">${external(guide.banking.source)}</div></article>
      <article class="business-card"><span class="business-label">04 / 企业账户与信用卡</span><h3>把业务实质和资金来源讲清楚</h3><p><strong>企业账户：</strong>${esc(guide.banking.corporate)}</p><p><strong>信用卡：</strong>${esc(guide.banking.credit)}</p><p class="business-redline">${esc(guide.banking.redline)}</p><div class="business-links">${external(guide.banking.source)}</div></article>
    </div>
    <section class="business-materials"><header><span class="business-label">06 / 资料准备框架</span><h3>先把这些资料整理好，再进入官方系统</h3><p>下面是跨国家通用的准备框架，不是最终提交清单；最终以移民局、公司登记处、税务机关和银行当前页面为准。</p></header><div class="business-material-grid"><article><b>工作许可 / EP</b><ul><li>护照与现有合法身份</li><li>雇佣、任职或投资关系证明</li><li>公司注册、营业许可和岗位/业务说明</li><li>学历、职业经历或行业资质（按类别）</li></ul></article><article><b>公司注册与营业许可</b><ul><li>拟定公司类型、股东和最终受益人结构</li><li>注册地址、实际办公地址与授权代表</li><li>税号、商业计划和预计经营范围</li><li>行业、进出口、门店或专业许可（如适用）</li></ul></article><article><b>个人 / 企业银行账户</b><ul><li>护照、合法居留、地址与税务居民信息</li><li>公司注册证书、章程、董事和 UBO 资料</li><li>客户/供应商、合同/发票、网站和预计流水</li><li>股东注资、资金来源和跨境付款用途</li></ul></article></div></section>
    <div class="business-issues"><div><span class="business-label">07 / 常见卡点</span><h3>论坛经验只用来提醒你核对问题</h3></div><ul>${guide.issues.map(issue => `<li>${esc(issue)}</li>`).join("")}</ul></div>
    <p class="business-verified">本专题基础核验：${esc(guide.lastVerified)}。公司法、签证、银行 KYC、税务和外汇规则可能分别变化；提交注册或开户前，应再打开官方页面并咨询当地持牌专业人士。</p>
  </section>`;
}

function countryPage(country) {
  const [status, detail, type] = statusMap[country.code];
  const slug = slugMap[country.code];
  const review = reviewState(country);
  const primaryActionLabel = country.application?.routeType === "visa_free"
    ? "看官方入境要求"
    : review.key === "due" ? "先核对官方要求" : "看官方申请入口";
  const related = data.countries
    .filter(item => item.code !== country.code)
    .sort((a, b) => {
      const aScore = statusMap[a.code][3] === statusMap[country.code][3] ? 1 : 0;
      const bScore = statusMap[b.code][3] === statusMap[country.code][3] ? 1 : 0;
      return bScore - aScore;
    }).slice(0, 4);
  const pageUrl = `https://qdd.app/country/${slug}/`;
  const schema = JSON.stringify({
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        "@id": `${pageUrl}#article`,
        headline: `中国护照去${country.country}：${country.topic}完整说明`,
        description: `${country.country}${country.topic}的申请入口、材料清单、办理步骤和官方来源。`,
        dateModified: country.verified,
        author: { "@type": "Person", name: "乔大帅", url: "https://qdd.app/" },
        publisher: { "@id": "https://qdd.app/#organization" },
        mainEntityOfPage: pageUrl,
        inLanguage: "zh-CN"
      },
      {
        "@type": "FAQPage",
        "@id": `${pageUrl}#faq`,
        mainEntity: country.cards.slice(0, 7).map(card => ({
          "@type": "Question",
          name: card.title,
          acceptedAnswer: { "@type": "Answer", text: `${card.answer} ${card.bullets.join("；")}` }
        }))
      },
      {
        "@type": "HowTo",
        "@id": `${pageUrl}#howto`,
        name: `中国普通护照办理或准备${country.country}行程`,
        description: `按官方入口、资料、办理和出发前复核顺序准备${country.country}行程。`,
        step: (country.application?.applicationSteps || []).map((name, index) => ({ "@type": "HowToStep", position: index + 1, name }))
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${pageUrl}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "首页", item: "https://qdd.app/" },
          { "@type": "ListItem", position: 2, name: "国家说明", item: "https://qdd.app/#countries" },
          { "@type": "ListItem", position: 3, name: country.country, item: pageUrl }
        ]
      }
    ]
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
    title: `中国护照去${country.country}：${country.topic}｜官方入口与材料教程｜qdd.app`,
    description: `中国普通护照去${country.country}的${country.topic}说明，先看适用护照与旅行目的，再查官方申请或入境入口、材料清单、办理步骤、费用与处理时间、风险限制、公司与银行卡提示。本站核验 ${country.verified}。`,
    canonical: `https://qdd.app/country/${slug}/`,
    page: "country",
    assetPath: "../../assets",
    iconPath: "../../favicon.svg",
    modified: country.verified,
    pageType: "article",
    schema,
    body: `<main id="main">
      <section class="country-hero">
        <nav class="breadcrumb" aria-label="面包屑"><a href="/">首页</a><span>/</span><a href="/#countries">国家说明</a><span>/</span><b>${esc(country.country)}</b></nav>
        <div class="review-notice review-notice-${review.key}"><b>${review.label}</b><span>${esc(review.note)}。${review.key === "due" ? "请先打开官方来源确认最新要求，再使用下方入口。本页材料清单可能先于政策结论更新，两者日期不同属正常。" : "页面结论仅适用于中国普通护照短期旅游；出发前请打开本页官方来源复核。"}</span></div>
        <div class="country-hero-grid">
          <div>
            <p class="eyebrow"><span>${country.code} / 中国护照说明</span> ${esc(country.topic)}</p>
            <h1><span>${country.flag}</span> 持中国普通护照去${esc(country.country)}，<br>先看这份说明。</h1>
            <p class="country-summary">${esc(country.cards[0].answer)}。本页按实际操作顺序整理，共 ${country.cards.length} 节。</p>
            <div class="country-actions"><a href="#apply">${primaryActionLabel}</a><a href="#guide" class="secondary-action">按步骤查看教程</a><a class="secondary-action" href="/cards/${encodeURIComponent(country.slug)}.html">打开速查卡（可保存到手机）</a></div>
          </div>
          <aside class="verdict-card">
            <span class="status status-${type}">${status}</span>
            <strong>${esc(detail)}</strong>
            <dl>
              <div><dt>适用护照</dt><dd>${esc(country.fields.passport)}</dd></div>
              <div><dt>单次停留</dt><dd>${esc(country.fields.stay)}</dd></div>
              <div><dt>入境卡</dt><dd>${esc(country.fields.arrivalCard)}</dd></div>
              <div class="verdict-risk"><dt>变动提示</dt><dd>${esc(riskLabel(country.fields.risk))}</dd></div>
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
        <p class="date-ribbon-note">“政策生效”是规则开始适用的日期；“官方页面”是来源网页显示的日期；“本站核验”是我们最后一次对照原文的日期；“下次复核”是计划再次核对的日期。</p>
        ${country.application ? `<div class="hero-apply-strip">
          <div class="route-marker"><span class="route-dot"></span><span>${esc(country.application.routeLabel)}</span></div>
          <div class="hero-apply-copy"><strong>${esc(country.application.applicationLabel)}</strong><small>${country.application.requiredDocuments.length} 项资料 · 先看官方入口再准备</small></div>
          <a class="hero-apply-primary" href="${esc(country.application.applicationUrl)}" target="_blank" rel="noopener noreferrer">${review.key === "due" ? "先核对官方最新要求 ↗" : "进入官方页面 ↗"}</a>
          <a class="hero-apply-secondary" href="#apply">查看材料清单</a>
        </div>` : ""}
      </section>

      ${applicationPanel(country)}

      ${esimPanel(country)}

      ${businessPanel(country)}

      <section class="country-content">
        <aside class="guide-toc">
          <p>本页目录</p>
          <ol>${country.cards.map((card, index) => `<li><a href="#step-${index + 1}"><span>${String(index + 1).padStart(2, "0")}</span>${esc(card.title)}</a></li>`).join("")}</ol>
          <a class="back-all" href="/#countries">← 返回全部国家</a>
        </aside>
        <div class="guide" id="guide">
          <header><p class="section-kicker">办理步骤</p><h2>${country.cards.length} 个问题，按顺序讲清楚</h2></header>
          ${sections}
        </div>
      </section>

      <section class="policy-facts">
        <header><p class="section-kicker">政策要点</p><h2>这个国家，先记住这些规则</h2></header>
        <dl>
          ${Object.entries({
            "适用目的": country.fields.purpose,
            "是否需要签证": country.fields.visa,
            "累计停留": country.fields.cumulative,
            "费用": country.fields.fee,
            "官方处理时间": country.fields.processing,
            "在哪申请（领区）": country.fields.districtException,
            "风险等级": country.fields.risk
          }).map(([key, value]) => `<div><dt>${esc(key)}</dt><dd>${esc(value)}</dd></div>`).join("")}
        </dl>
      </section>

      <section class="official-sources">
        <header><p class="section-kicker">官方出处</p><h2>每条说明，都有官方来源</h2><p>离出发越近，越要重新打开官方页面确认一次。</p></header>
        <ol>${sourceList(country)}</ol>
      </section>

      <section class="correction-band">
        <div><p class="section-kicker">页面更正</p><h2>发现政策变了，或页面写错了？</h2><p>请附上官方链接或截图。我们会先核对，确认后再修改页面。</p></div>
        <a href="mailto:hello@qdd.app?subject=${encodeURIComponent(`qdd.app ${country.country}页面更正`)}&body=${encodeURIComponent(`页面：https://qdd.app/country/${slug}/\n本站核验：${country.verified}\n需要更正的地方：`)}">告诉我们哪里需要更正</a>
      </section>

      <section class="next-country">
        <p>还想看看类似目的地？</p>
        ${related.map(item => `<a href="/country/${slugMap[item.code]}/">${item.flag} ${item.country}<span>→</span></a>`).join("")}
      </section>
    </main>`
  });
}

const contentSchema = ({ title, description, canonical, modified = buildDate, extra = [] }) => JSON.stringify({
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "WebPage", "@id": `${canonical}#webpage`, url: canonical, name: title, description, dateModified: modified, inLanguage: "zh-CN", isPartOf: { "@id": "https://qdd.app/#website" }, breadcrumb: { "@id": `${canonical}#breadcrumb` } },
    { "@type": "BreadcrumbList", "@id": `${canonical}#breadcrumb`, itemListElement: [{ "@type": "ListItem", position: 1, name: "首页", item: "https://qdd.app/" }, { "@type": "ListItem", position: 2, name: title, item: canonical }] },
    ...extra
  ]
});

const contentPage = ({ title, description, canonical, kicker, heading, intro, content, page = "content", assetPath = "../assets", iconPath = "../favicon.svg", schema = "", modified = buildDate }) => layout({
  title: `${title}｜qdd.app`, description, canonical, page, assetPath, iconPath, modified,
  schema: schema || contentSchema({ title, description, canonical, modified }),
  body: `<main id="main" class="content-page"><header class="content-hero"><p class="section-kicker">${kicker}</p><h1>${heading}</h1><p>${intro}</p></header>${content}</main>`
});

function destinationList(countries) {
  return `<div class="destination-list">${countries.map(country => {
    const [label, detail, type] = statusMap[country.code];
    const review = reviewState(country);
    return `<a href="/country/${slugMap[country.code]}/"><span class="country-flag">${country.flag}</span><div><b>${esc(country.country)}</b><small>${esc(label)} · ${esc(detail)} · 核验 ${country.verified}</small></div><em class="review-${review.key}">${review.label}</em><i>→</i></a>`;
  }).join("")}</div>`;
}

const topicDefinitions = [
  {
    slug: "visa-free", title: "中国护照免签目的地", heading: "免签，先别只看“能去”。",
    intro: "还要同时看适用护照、旅行目的、单次与累计停留、入境材料，以及边境机关的最终决定。",
    countries: data.countries.filter(country => statusMap[country.code][3] === "免签入境"),
    rules: ["免签不等于无条件入境", "单次停留与累计停留要分别计算", "旅游免签通常不能用于工作、学习或长期居留"]
  },
  {
    slug: "visa-required", title: "需要提前办签证的目的地", heading: "需要签证，先把材料备齐。",
    intro: "申请表、身份、资金、行程、住宿和证明你会回国的材料应互相一致；处理时间不是固定出签承诺。",
    countries: data.countries.filter(country => statusMap[country.code][3] === "需要签证"),
    rules: ["先确认签证类别与访问目的", "材料完整不等于保证获签", "签证有效期不等于单次获准停留期"]
  },
  {
    slug: "arrival-cards", title: "入境卡与电子申报", heading: "拿到签证后，还有几道网上手续。",
    intro: "一些目的地要求在抵达前或入境时提交电子入境卡。请只从政府域名进入，并核对开放填报时间。",
    countries: data.countries.filter(country => /TDAC|MDAC|Arrival|入境卡|电子入境|申报/i.test(country.fields.arrivalCard)),
    rules: ["入境卡是申报信息，不等于签证", "过早填报可能无效，按官方时间窗口操作", "搜索广告中的仿冒收费站不等于官方网站"]
  },
  {
    slug: "first-trip", title: "第一次出国核验顺序", heading: "第一次出国，按四步走。",
    intro: "先确认护照和出行目的，再判断签证或免签；然后是机票、材料、入境卡与出发前复核。",
    countries: data.countries.slice(0, 8),
    rules: ["检查护照有效期与空白页", "确认旅游、探亲、商务等目的没有混用", "出发前重新打开官方来源并保存必要材料"]
  },
  {
    slug: "esim", title: "出国上网与 eSIM", heading: "签证之外，手机上网也要提前准备。",
    intro: "先确认设备是否支持 eSIM，再比较旅行 eSIM、当地实体 SIM、国际漫游和随身 Wi‑Fi。这里的套餐推荐属于关联服务，不是政府要求。",
    countries: data.countries,
    rules: ["eSIM 不是签证、入境卡或当地实名登记的替代品", "国行机型、锁网手机和地区版本可能不支持 eSIM", "价格、流量、覆盖与退款规则要以购买时的页面和运营商条款为准"]
  }
];

function esimDestinationList(countries) {
  return `<div class="esim-destination-grid">${countries.map(country => {
    const hasDestinationPage = Boolean(esimDestinationSlugs[country.code]);
    return `<article><div><span class="country-flag">${country.flag}</span><b>${esc(country.country)}</b><small>${hasDestinationPage ? "有目的地比价页" : "从全部目的地查找"}</small></div><a href="${esimCompareUrl(country, "topic-esim")}" target="_blank" rel="sponsored noopener noreferrer">${hasDestinationPage ? "看套餐对比" : "查找目的地"} ↗</a></article>`;
  }).join("")}</div>`;
}

function esimTopicContent(topic) {
  return `<section class="content-block esim-intro-block"><div class="esim-topic-lead"><div><span class="esim-label">先做设备检查</span><h2>别先买，先确认手机能不能用。</h2><p>eSIM 需要兼容的手机和合适的运营商配置。国行手机、锁网机、双卡组合和通话短信需求，都可能改变选择。</p><div class="esim-topic-actions"><a class="esim-cta" href="${esimBase}/devices/" target="_blank" rel="sponsored noopener noreferrer">查看设备兼容性 ↗</a><a class="esim-outline-cta" href="${esimBase}/learn/what-is-esim/" target="_blank" rel="sponsored noopener noreferrer">先看 eSIM 入门 ↗</a></div></div><div class="esim-topic-stamp"><b>DATA</b><span>出发前通信</span><small>qdd.app × eSIM.school</small></div></div></section>
  <section class="content-block"><div class="block-head"><h2>四种上网方式，怎么选？</h2><p>没有一种方案适合所有人；先按设备、时间、流量和号码需求筛选。</p></div><div class="esim-compare-wrap"><table class="esim-compare-table"><thead><tr><th>方式</th><th>适合谁</th><th>主要优点</th><th>出发前要确认</th></tr></thead><tbody><tr><th>旅行 eSIM</th><td>手机支持 eSIM、希望出发前准备好流量的人</td><td>不用换卡，可按目的地和流量比较</td><td>设备兼容、是否锁网、只含数据还是也含号码</td></tr><tr><th>当地实体 SIM</th><td>手机不支持 eSIM，或需要当地号码的人</td><td>线下可咨询，部分当地套餐含通话短信</td><td>机场/门店价格、实名登记、护照要求和营业时间</td></tr><tr><th>国际漫游</th><td>只停留很短时间，或必须保留原号码的人</td><td>不用换卡，原号码和短信更直接</td><td>资费、日包触发方式、后台流量和境外收短信费用</td></tr><tr><th>随身 Wi‑Fi</th><td>多人同行、需要多台设备共享的人</td><td>可让多台设备共用一台热点</td><td>取还设备、续航、押金、超量限速和同行距离</td></tr></tbody></table></div></section>
  <section class="content-block"><div class="block-head"><h2>旅行 eSIM 的正确顺序</h2><p>购买、安装和启用不是同一件事；按这个顺序做，比较不容易误开套餐。</p></div><ol class="esim-flow"><li><span>01</span><div><b>查设备和网络锁</b><p>在手机设置或品牌官网确认 eSIM 选项；必要时查设备兼容页。</p></div></li><li><span>02</span><div><b>看目的地和套餐条件</b><p>对比覆盖国家、流量、有效期、是否限速、是否支持热点、是否含通话短信。</p></div></li><li><span>03</span><div><b>出发前安装并命名</b><p>在稳定 Wi‑Fi 下扫码安装，给线路写上国家名；不要删除原号码。</p></div></li><li><span>04</span><div><b>落地后切换数据线路</b><p>打开旅行 eSIM 的数据和必要的漫游开关，按运营商说明操作；原号码是否开漫游要单独确认。</p></div></li></ol></section>
  <section class="content-block"><div class="block-head"><h2>按目的地查看通信选项</h2><p>下面只提供跳转入口，不把会变化的价格和套餐数量写死在 qdd.app。</p></div>${esimDestinationList(topic.countries)}</section>
  <section class="content-block esim-guardrails"><div class="block-head"><h2>三个容易忽略的限制</h2><p>通信服务是出行准备的一部分，但它不改变签证和入境规则。</p></div><div class="method-grid"><article><span>01</span><h2>不一定有号码</h2><p>很多旅行 eSIM 是纯数据产品，不能收本地短信，也不一定能拨打电话。需要银行验证码或原号码短信时，保留原 SIM 并确认漫游设置。</p></article><article><span>02</span><h2>信号不是承诺</h2><p>套餐覆盖、合作网络、地下/山区信号、限速和热点限制要看当前条款。qdd.app 不承诺“落地一定有网”。</p></article><article><span>03</span><h2>链接不是官方入境入口</h2><p>eSIM.school 是关联比价与教程网站；签证、入境卡、实名登记和工作许可，仍然只能按目的地官方页面办理。</p></article></div></section>
  <section class="content-block"><div class="block-head"><h2>常见问题</h2><p>先把购买前最常见的误解说清楚。</p></div><div class="esim-faq"><details><summary>可以在国内提前安装吗？</summary><p>通常可以在稳定 Wi‑Fi 下安装，但安装不等于马上启用流量。具体激活和计时规则要看运营商说明，建议按购买页面提示操作。</p></details><details><summary>国行 iPhone 能用旅行 eSIM 吗？</summary><p>不能一概而论。国行机型、地区版本和运营商支持差异很大，先到设备兼容页和手机设置里确认，不要只看机型名称。</p></details><details><summary>用了 eSIM，国内号码还能收短信吗？</summary><p>很多双卡手机可以保留国内实体 SIM，但是否产生漫游费、能否收验证码、是否要关闭数据漫游，要按你的运营商和套餐规则确认。</p></details><details><summary>eSIM.school 的价格会一直不变吗？</summary><p>不会。套餐价格、库存、覆盖、有效期、退款和运营商条款都可能变化。qdd.app 只提供场景入口，不复制实时价格，也不把某个套餐写成唯一答案。</p></details></div></section>
  <section class="content-block"><div class="esim-disclosure"><b>关联服务说明</b><p>eSIM.school 是乔大帅团队的关联网站。点击或购买可能产生收入；这不会影响 qdd.app 的签证/入境结论、国家排序、官方来源或风险提示。请在购买前阅读 eSIM.school 和对应运营商的当前条款。</p><div class="esim-links"><a href="${esimBase}/compare/" target="_blank" rel="sponsored noopener noreferrer">打开全部目的地比价 ↗</a><a href="${esimBase}/learn/esim-for-travel/" target="_blank" rel="sponsored noopener noreferrer">阅读旅行设置指南 ↗</a></div></div></section>`;
}

function topicPage(topic) {
  if (topic.slug === "esim") {
    return contentPage({
      title: topic.title,
      description: "中国护照出境时，旅行 eSIM、当地实体 SIM、国际漫游和随身 Wi‑Fi 的选择、设备兼容、安装步骤与目的地比价入口。",
      canonical: "https://qdd.app/topics/esim/", assetPath: "../../assets", iconPath: "../../favicon.svg", kicker: "出发前准备 / 通信说明", heading: topic.heading, intro: topic.intro,
      content: esimTopicContent(topic),
      schema: contentSchema({ title: topic.title, description: topic.intro, canonical: "https://qdd.app/topics/esim/", extra: [{ "@type": "HowTo", name: "旅行 eSIM 准备顺序", step: ["确认设备支持 eSIM 并检查是否锁网", "比较目的地、流量、有效期和网络限制", "出发前在 Wi‑Fi 下安装并给线路命名", "抵达后按运营商说明切换数据线路"] .map((name, index) => ({ "@type": "HowToStep", position: index + 1, name })) }] })
    });
  }
  return contentPage({
    title: topic.title,
    description: `${topic.title}的共同规则、国家差异、核验日期与官方来源入口。`,
    canonical: `https://qdd.app/topics/${topic.slug}/`, assetPath: "../../assets", iconPath: "../../favicon.svg", kicker: "按场景查 / 专题说明", heading: topic.heading, intro: topic.intro,
    content: `<section class="content-block"><h2>先记住三条共同规则</h2><ol class="rule-list">${topic.rules.map((rule, index) => `<li><span>${String(index + 1).padStart(2, "0")}</span><b>${esc(rule)}</b></li>`).join("")}</ol></section><section class="content-block"><div class="block-head"><h2>逐国查看差异</h2><p>以下状态截至 ${buildDate}，按各国计划的复核日期自动算出。</p></div>${destinationList(topic.countries)}</section>`
  });
}

const topicsIndex = contentPage({
  title: "按场景查出境政策", description: "按免签、需要签证、入境卡和第一次出国场景查询中国普通护照出境政策。", canonical: "https://qdd.app/topics/",
  kicker: "按问题查 / 场景专题", heading: "从你的问题开始，<br>不用先学会签证术语。", intro: "专题只收录已经人工核对过的国家。宁可少一些，也不把还没核对完的国家匆忙放进来。",
  content: `<section class="content-block"><div class="topic-grid">${topicDefinitions.map((topic, index) => `<a href="/topics/${topic.slug}/"><span>${String(index + 1).padStart(2, "0")}</span><h3>${esc(topic.title)}</h3><p>${esc(topic.intro)}</p></a>`).join("")}<a href="/personal-banking/"><span>${String(topicDefinitions.length + 1).padStart(2, "0")}</span><h3>银行卡与开户</h3><p>看懂账户、借记卡、信用卡的区别，按 KYC 和资金来源准备。</p></a></div></section>`
});

const methodology = contentPage({
  title: "核验方法与编辑原则", description: "qdd.app 的来源优先级、三日期定义、自动扫描与人工审核边界。", canonical: "https://qdd.app/methodology/",
  kicker: "我们怎么核对 / 核验方法", heading: "机器帮忙找变化，<br>人来决定要不要改。", intro: "qdd.app 提供中文政策解释和操作说明，不是政府、使领馆、承运人或边境机关，也不能代替它们作最终决定。",
  content: `<section class="content-block method-grid"><article><span>01</span><h2>适用范围</h2><p>默认面向中国大陆居民、持有效中国普通护照、短期出行。居住地、出发地、旅行目的、同行人和已有签证，都可能改变结果。</p></article><article><span>02</span><h2>来源先后</h2><p>优先看目的地政府和移民部门、驻华使领馆、中国驻外使领馆及官方签证系统；承运人的要求另行核对。旅行社和媒体只用来发现线索。</p></article><article><span>03</span><h2>三个日期</h2><p>政策生效日说明规则从什么时候适用；官方页面日期是来源网页标注的日期；本站核对日期是编辑最后一次对照原文的时间。这三个日期各有用途。</p></article><article><span>04</span><h2>自动化能做什么</h2><p>脚本可以抓取官方页面、保存快照、比较前后差异，并列出需要复查的地方；但不会自动改写正式结论。签证、免签、停留和入境限制都要人工复核。</p></article><article><span>05</span><h2>AI 怎么参与</h2><p>AI 可以帮忙翻译、标出变化、整理字段和排版；编辑仍要回到官方原文，核对数字、日期、例外情况和适用人群。</p></article><article><span>06</span><h2>怎么更正页面</h2><p>你提供的线索会先由人工核对，确认后才会修改页面。重要修改会记入更新记录，并写明影响哪些国家。</p></article></section><section class="content-cta"><h2>发现页面有误，或政策有变化？</h2><p>请告诉我们国家、页面和官方来源线索。</p><a href="mailto:hello@qdd.app?subject=qdd.app%20政策纠错">提交更正线索</a></section>`
});

const updates = contentPage({
  title: "政策更新与核对记录", description: "qdd.app 的签证政策变更记录，以及每个国家页面最近一次人工核对的日期。", canonical: "https://qdd.app/updates/",
  kicker: "更新记录", heading: "政策会变，<br>每次核对都记在这里。", intro: `截至 ${buildDate}：${reviewCounts.current} 个国家仍在复核周期内，${reviewCounts.due} 个已经到了计划复核日，我们会尽快再查一遍。“到期将复核”不代表页面已经失效，出发前请以官方页面为准。`,
  content: `<section class="content-block"><div class="change-log"><article><time>2026-08-13</time><div><span class="status status-free">重大修正</span><h2>俄罗斯：由电子签主路径改为 30 天免签</h2><p>适用于中国普通护照、旅游等公告允许的短期事由；免签安排已延长至 2027-12-31。工作、采访、学习、长期居留仍需办理对应签证。</p><a href="/country/russia/">查看俄罗斯完整说明 →</a></div></article></div></section><section class="content-block"><div class="block-head"><h2>全部页面复核状态</h2><p>按每个国家计划的复核日期自动计算。</p></div>${destinationList([...data.countries].sort((a, b) => reviewState(a).key.localeCompare(reviewState(b).key)))}</section>`
});

const business = contentPage({
  title: "机构政策订阅合作", description: "qdd.app 面向企业差旅、旅行机构和内容团队的政策监测需求登记。", canonical: "https://qdd.app/for-business/",
  kicker: "机构服务 / 合作方式", heading: "链接再多，也不如<br>尽早知道政策变了。", intro: "我们正在了解企业差旅、旅行机构和内容团队，是否需要国家政策监测、结构化字段、品牌定制卡片和内部简报。现在只是登记需求，服务还没有正式开通。",
  content: `<section class="content-block method-grid"><article><span>01</span><h2>政策变更提醒</h2><p>按关注国家发现官方页面差异，并在人工复核后形成可读摘要。</p></article><article><span>02</span><h2>结构化数据</h2><p>把适用护照、出行目的、停留天数、签证类型、入境卡、日期和来源整理成标准数据字段，方便核对与留档。</p></article><article><span>03</span><h2>内容贴牌与同步</h2><p>同一份核对过的政策数据，可生成你们官网的说明、社交卡片或内部简报（可不带 qdd.app 品牌）。</p></article></section><section class="content-cta"><h2>成为早期需求访谈对象</h2><p>请说明机构类型、关注国家与使用场景。我们不会承诺获签、登机或入境结果。</p><a href="mailto:hello@qdd.app?subject=qdd.app%20企业政策订阅需求登记&body=机构类型：%0A关注国家：%0A使用场景：">邮件登记需求</a><small>登记不代表服务已开通；上线后再单独通知。</small></section>`
});

const rankingSection = (title, note, rows, kind) => {
  const content = rows.map(item => {
    const slug = slugMap[item.code];
    const inner = `<b class="ranking-number">${String(item.rank).padStart(2, "0")}</b><span class="ranking-country">${esc(item.country)}</span><span class="ranking-score">${item.score}<small>/100</small></span><span class="ranking-tags">${item.tags.map(tag => `<em>${esc(tag)}</em>`).join("")}</span><span class="ranking-reason">${esc(item.reason)}</span><i>→</i>`;
    return slug ? `<a class="ranking-row" href="/country/${slug}/">${inner}</a>` : `<div class="ranking-row ranking-row-static">${inner}</div>`;
  }).join("");
  return `<section class="content-block ranking-block ranking-${kind}"><div class="block-head"><h2>${title}</h2><p>${note}</p></div><div class="ranking-table">${content}</div></section>`;
};

const rankingSchema = contentSchema({
  title: "出海热门国家排行榜",
  description: "签证准备难度、公司注册准备度、银行与银行卡准备度三套编辑榜单。",
  canonical: "https://qdd.app/rankings/",
  extra: [
    ...[
      ["签证准备难度榜", visaDifficultyRanking],
      ["公司注册准备度榜", companyRanking],
      ["银行与银行卡准备度榜", bankingRanking]
    ].map(([name, rows]) => ({
      "@type": "ItemList",
      name,
      itemListOrder: "https://schema.org/ItemListOrderDescending",
      numberOfItems: rows.length,
      itemListElement: rows.slice(0, 20).map(item => ({ "@type": "ListItem", position: item.rank, name: item.country, url: slugMap[item.code] ? `https://qdd.app/country/${slugMap[item.code]}/` : undefined }))
    }))
  ]
});

const rankings = contentPage({
  title: "出海热门国家排行榜",
  description: "按中国创业者常见出海场景整理的国家热度排行，并补充公司注册、签证、资金规划、银行账户和信用卡核验清单。",
  canonical: "https://qdd.app/rankings/",
  schema: rankingSchema,
  kicker: "出海国家排行",
  heading: "先选适合落脚的国家，<br>再看注册和开户。",
  intro: "这不是官方排名，也不是获签、注册或开户成功率。我们把市场需求、公司注册透明度、签证可操作性、银行/KYC 难点和中文用户公开讨论的频率放在一起，形成可解释的编辑排序；具体条件仍要回到当地官方机构。",
  content: `<section class="content-block ranking-method"><div class="ranking-method-grid"><article><span>01</span><h2>排行看什么</h2><p>看市场和支付机会、公司注册是否好查、经营签证是否有清晰路径、银行 KYC 难不难，以及中文用户反复遇到哪些问题。</p></article><article><span>02</span><h2>排行不代表什么</h2><p>中介说的“包开户”、论坛里的个案和所谓成功率，都不能当政策依据；旅游免签也不等于可以在当地经营。</p></article><article><span>03</span><h2>怎么使用</h2><p>先选国家，再看对应页面里的公司、签证和银行三部分，最后通过官方入口逐项确认。</p></article></div></section>
  <section class="content-block"><div class="block-head"><h2>当前出海热度榜</h2><p>截至 2026-08-14；这是研究优先级，不代表投资建议或办理结果。</p></div><div class="ranking-table">${businessRanking.map(item => { const slug = slugMap[item.code]; return `<a class="ranking-row" href="/country/${slug}/"><b class="ranking-number">${String(item.rank).padStart(2,"0")}</b><span class="ranking-country">${esc(item.country)}</span><span class="ranking-score">${item.score}<small>/100</small></span><span class="ranking-tags">${item.tags.map(tag => `<em>${esc(tag)}</em>`).join("")}</span><span class="ranking-reason">${esc(item.reason)}</span><i>→</i></a>`; }).join("")}</div></section>
  ${rankingSection("需要签证国家的准备难度", "D 分越高，前期材料、预约、领区或身份判断越多；不是获签率。", visaDifficultyRanking, "difficulty")}
  ${rankingSection("公司注册准备度", "R 分越高，官方登记和税务入口越容易研究；不代表注册后自动获得经营或居留资格。", companyRanking, "company")}
  ${rankingSection("银行与银行卡准备度", "B 分越高，身份、地址、KYC 和卡片路径越容易研究；不代表非居民一定能开户或拿到信用卡。", bankingRanking, "banking")}
  <section class="content-block island-ranking"><div class="block-head"><h2>岛屿国家专题</h2><p>已上线的岛屿国家：${data.countries.filter(country => country.island).length} 个。旅游入境、公司经营和银行卡资格必须分开核对。</p></div><div class="island-pill-grid">${data.countries.filter(country => country.island).map(country => `<a href="/country/${slugMap[country.code]}/"><span>${country.flag}</span><b>${esc(country.country)}</b><small>${esc(country.topic)}</small><i>→</i></a>`).join("")}</div></section>
  <section class="content-block funds-block"><div class="block-head"><h2>本人要准备多少资金？</h2><p>先把“法定最低资本”和“能活下来的现金流”分开。</p></div><div class="funds-grid"><article><h3>轻资产验证</h3><p>${planningFunds.light}</p></article><article><h3>实体运营</h3><p>${planningFunds.operating}</p></article><article><h3>牌照/雇员</h3><p>${planningFunds.regulated}</p></article></div><p class="notice-line">页面里的资金规划线是预算框架，不是银行余额证明、签证资金要求或税务意见；个人出境、购汇、跨境汇款和税务申报要遵守中国及目的地法律。</p></section>
  <section class="content-block bank-checklist"><div class="block-head"><h2>个人银行卡、借记卡、信用卡怎么准备？</h2><p>通常先确认身份和地址，再做 KYC、开账户，之后才是借记卡和信用卡。</p></div><ol class="rule-list"><li><span>01</span><b>先确认身份</b><p>旅游、商务访问、工作、留学和投资居留，能否开户的条件完全不同。</p></li><li><span>02</span><b>准备真实资料</b><p>护照、当地地址或居留证明、税务居民信息、手机号、收入或资金来源，以及开户用途。</p></li><li><span>03</span><b>企业账户另备材料</b><p>注册证书、章程、UBO、董事和股东地址、官网、合同或发票、商业计划、预计流水和资金来源。</p></li><li><span>04</span><b>信用卡先别急</b><p>先建立当地账户和信用记录；刚开户的人，可能只能先用借记卡或担保信用卡。</p></li></ol><p class="notice-line">不要伪造海外地址、合同或税号，也不要尝试绕过 KYC；所谓“保证开户”的攻略可能导致账户关闭、冻结，甚至带来税务或刑事风险。</p><p class="bank-guide-link"><a href="/personal-banking/">打开《个人银行卡、借记卡、信用卡准备指南》→</a></p></section>
  <section class="content-block community-block"><div class="block-head"><h2>公开社区里反复出现的疑难杂症</h2><p>以下是论坛和创业社区的经验线索，不是法律事实；我们用它们来提醒页面该核对什么。</p></div><div class="community-grid">${communityIssueBank.map(issue => `<article><h3>${issue.title}</h3><p>${issue.detail}</p><a href="${issue.source}" target="_blank" rel="noopener noreferrer">查看公开讨论 ↗</a></article>`).join("")}</div></section>
  <section class="content-cta"><h2>下一步，打开一个国家页面</h2><p>每个已上线国家页面都有“出海经营与账户”模块；资料会标明已经核验还是待核验，不会把排队中的国家写成完成版。</p><a href="/#countries">查看全部国家 →</a></section>`
});

const bankingFaq = [
  {
    q: "人在当地只是旅游，可以直接办一张当地信用卡吗？",
    a: "通常不要这样预期。银行会先看你是否属于可服务的客户类型、是否有当地地址或居留依据、税务居民信息和可解释的资金来源。旅游入境并不自动带来开户权，更不等于有信用卡资格；有些机构只向居民、学生、雇员或特定签证持有人提供完整账户。先查目标银行的非居民政策，别把论坛个案当成通行规则。"
  },
  {
    q: "为什么我有护照，却还被要求提供地址证明？",
    a: "护照主要证明身份和国籍，地址证明用于确认居住地、服务范围和风险画像。银行可能区分实际居住地址、通信地址、税务地址和公司注册地址；名称或日期不一致时，常见结果是补件、转人工审核或暂缓开户。提交前把地址写法统一，按银行接受的文件类型准备。"
  },
  {
    q: "税务居民自证是不是等于我要交税？",
    a: "不是一回事。税务居民自证是银行为履行 CRS 等信息收集和申报义务，要求你说明自己在哪些国家或地区具有税收居民身份；是否产生税款、税率和申报方式，要按相关国家税法判断。不能为了开户随便填一个‘低税地区’，也不能把国籍、居留权和税务居民身份混为一谈。"
  },
  {
    q: "银行要我解释第一笔钱从哪里来，怎么准备？",
    a: "按真实来源整理一条能被文件支持的资金链。例如工资对应劳动合同和工资流水，经营收入对应合同、发票和企业流水，留学生活费对应录取/缴费材料和汇款记录，家庭赠与对应赠与关系和转账说明。不要把多人的钱集中到一个账户后再临时编故事，也不要购买假流水。"
  },
  {
    q: "没有当地信用记录，信用卡怎么办？",
    a: "先问银行是否提供基础借记账户、担保信用卡或低额度入门卡；同时按时缴费、保持联系方式和地址真实、避免短期密集申请。信用卡额度和审批是银行的风险决定，不存在通用的‘存多少钱就一定下卡’公式。"
  },
  {
    q: "用朋友的地址、公司地址或虚拟地址能不能开户？",
    a: "只有在银行明确接受、且你确实有权使用并能提供证明时才可以。借用地址、购买地址、伪造租约或把公司注册地址冒充个人居住地址，都可能构成虚假信息。地址是 KYC 的一部分，后续对账单、税务信件和卡片寄送也可能用到。"
  }
];

const bankingSchema = contentSchema({
  title: "个人银行卡、借记卡、信用卡准备指南",
  description: "面向中国护照持有人的境外个人银行卡准备、借记卡与信用卡区别、材料清单、KYC/AML 合规边界与开户流程。",
  canonical: "https://qdd.app/personal-banking/",
  modified: "2026-08-14",
  extra: [
    {
      "@type": "HowTo",
      "@id": "https://qdd.app/personal-banking/#howto",
      name: "准备境外个人银行卡和信用卡申请",
      description: "按身份、地址、税务居民、资金来源和用途准备资料，再由目标银行进行客户尽职调查。",
      step: [
        "确认你在目标地的身份、签证或居留状态，以及银行是否接受该类客户。",
        "准备护照、地址、税务居民、联系方式和开户用途资料。",
        "把工资、经营收入、储蓄、家庭赠与或奖学金等资金来源整理成可解释的文件链。",
        "先申请适合身份的存款账户或借记卡，再根据当地信用规则评估信用卡。",
        "如实完成 KYC、AML 和税务居民自证，按银行要求补件或面谈。",
        "收到卡后检查姓名、有效期、限额、费用和境外交易设置，并持续更新资料。"
      ]
    },
    {
      "@type": "FAQPage",
      "@id": "https://qdd.app/personal-banking/#faq",
      mainEntity: bankingFaq.map(item => ({ "@type": "Question", name: item.q, acceptedAnswer: { "@type": "Answer", text: item.a } }))
    }
  ]
});

const personalBanking = contentPage({
  title: "个人银行卡、借记卡、信用卡准备指南",
  description: "中国护照持有人准备境外个人银行卡、借记卡和信用卡的完整指南：开户条件、材料清单、KYC/AML、税务居民自证、资金来源、流程、合规与常见拒绝原因。",
  canonical: "https://qdd.app/personal-banking/",
  schema: bankingSchema,
  kicker: "个人金融准备 / 银行卡指南",
  heading: "银行卡不是“办一张就完事”，<br>先把身份和资金说清楚。",
  intro: "这页专门解释中国护照持有人在境外准备个人账户、借记卡和信用卡时，银行到底在看什么。先确认身份和地址，再准备税务居民信息、资金来源与用途；借记卡和信用卡是两条不同的审核路径。银行最终是否开户、给什么额度，只由目标银行按当地法律和内部风险政策决定。",
  content: `<section class="content-block banking-answer" id="answer"><div class="banking-answer-grid"><div><span class="section-kicker">先说结论</span><h2>四个问题没答清楚，先不要申请。</h2><p>你是谁？住在哪里？钱从哪里来？准备拿账户做什么？这四项信息要互相一致，才有机会顺利进入银行的 KYC 流程。</p></div><ol><li><b>身份</b><span>护照、签证/居留、姓名拼写</span></li><li><b>地址</b><span>实际住址、通信地址、税务地址</span></li><li><b>资金</b><span>收入来源、金额、转账路径</span></li><li><b>用途</b><span>生活、工资、留学、经营或储蓄</span></li></ol></div></section>
  <section class="content-block"><div class="block-head"><h2>先看懂：账户、借记卡、信用卡不是一回事</h2><p>卡片只是工具，能不能申请取决于账户关系和身份。</p></div><div class="banking-card-compare"><article class="banking-type banking-type-account"><span class="banking-type-no">01</span><h3>存款账户</h3><p>放钱、收款、转账和支付的基础关系。</p><div class="banking-meter"><i style="--value:92%"></i></div><small>开户优先级：最高</small></article><article class="banking-type banking-type-debit"><span class="banking-type-no">02</span><h3>借记卡</h3><p>直接使用账户余额，不是银行借款。</p><div class="banking-meter"><i style="--value:78%"></i></div><small>通常先于信用卡评估</small></article><article class="banking-type banking-type-credit"><span class="banking-type-no">03</span><h3>信用卡</h3><p>使用银行授信，涉及信用记录、额度和还款。</p><div class="banking-meter"><i style="--value:38%"></i></div><small>非居民与新客户门槛更不确定</small></article><article class="banking-type banking-type-prepaid"><span class="banking-type-no">04</span><h3>预付/多币种卡</h3><p>先充值再使用，不能把它当成完整银行账户。</p><div class="banking-meter"><i style="--value:58%"></i></div><small>功能、保障和限额看发行方</small></article></div><div class="banking-table-wrap"><table class="banking-table"><thead><tr><th>类型</th><th>主要解决什么</th><th>银行通常先看什么</th><th>新到当地的人要注意</th></tr></thead><tbody><tr><th>普通存款账户</th><td>收款、转账、存钱、日常支付</td><td>身份、地址、税务居民、用途</td><td>先确认是否接受非居民或短期身份</td></tr><tr><th>借记卡</th><td>消费、取现、线上支付</td><td>关联账户和 KYC 是否完成</td><td>可能有境外交易、ATM、最低余额或实体卡费用</td></tr><tr><th>信用卡</th><td>先消费后还款、建立信用记录</td><td>当地收入、信用记录、还款能力、地址</td><td>可能先给担保卡、低额度或直接不提供</td></tr><tr><th>预付/多币种卡</th><td>旅行支付、预算管理、特定场景消费</td><td>身份核验、资金来源、产品资格</td><td>不等于银行账户；充值、退款、存款保障要单独看</td></tr></tbody></table></div></section>
  <section class="content-block banking-mindmap-section"><div class="block-head"><h2>开户准备思维导图</h2><p>从中心问题向外展开：身份、地址、税务、资金和用途必须闭环。</p></div><div class="banking-mindmap" role="img" aria-label="开户准备思维导图：身份、地址、税务、资金、用途和卡片选择六个分支"><svg viewBox="0 0 960 460" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><defs><linearGradient id="bankingMapLine" x1="0" x2="1"><stop offset="0" stop-color="#c03f2b"/><stop offset="1" stop-color="#22504a"/></linearGradient></defs><path d="M480 230 C360 230 290 105 150 105 M480 230 C370 230 300 355 150 355 M480 230 C600 230 660 105 810 105 M480 230 C600 230 660 355 810 355 M480 230 C480 155 480 105 480 70 M480 230 C480 305 480 355 480 390" fill="none" stroke="url(#bankingMapLine)" stroke-width="3" stroke-linecap="round"/><circle cx="480" cy="230" r="78" fill="#16302c"/><text x="480" y="222" text-anchor="middle" fill="#f7f3ea" font-size="24" font-weight="700">开户准备</text><text x="480" y="250" text-anchor="middle" fill="#e8d9b8" font-size="14">六个问题闭环</text><g class="banking-map-node"><rect x="72" y="70" width="166" height="70" rx="12" fill="#f6e3cf"/><text x="155" y="102" text-anchor="middle" font-size="18" font-weight="700" fill="#16302c">身份</text><text x="155" y="124" text-anchor="middle" font-size="12" fill="#56615f">护照 · 签证 · 姓名</text></g><g class="banking-map-node"><rect x="72" y="320" width="166" height="70" rx="12" fill="#f6e3cf"/><text x="155" y="352" text-anchor="middle" font-size="18" font-weight="700" fill="#16302c">地址</text><text x="155" y="374" text-anchor="middle" font-size="12" fill="#56615f">居住 · 通信 · 税务</text></g><g class="banking-map-node"><rect x="397" y="30" width="166" height="70" rx="12" fill="#e8d9b8"/><text x="480" y="62" text-anchor="middle" font-size="18" font-weight="700" fill="#16302c">税务居民</text><text x="480" y="84" text-anchor="middle" font-size="12" fill="#56615f">CRS 自证 · TIN</text></g><g class="banking-map-node"><rect x="397" y="360" width="166" height="70" rx="12" fill="#e8d9b8"/><text x="480" y="392" text-anchor="middle" font-size="18" font-weight="700" fill="#16302c">资金来源</text><text x="480" y="414" text-anchor="middle" font-size="12" fill="#56615f">工资 · 经营 · 储蓄</text></g><g class="banking-map-node"><rect x="722" y="70" width="166" height="70" rx="12" fill="#d9e6df"/><text x="805" y="102" text-anchor="middle" font-size="18" font-weight="700" fill="#16302c">账户用途</text><text x="805" y="124" text-anchor="middle" font-size="12" fill="#56615f">生活 · 留学 · 工作</text></g><g class="banking-map-node"><rect x="722" y="320" width="166" height="70" rx="12" fill="#d9e6df"/><text x="805" y="352" text-anchor="middle" font-size="18" font-weight="700" fill="#16302c">卡片选择</text><text x="805" y="374" text-anchor="middle" font-size="12" fill="#56615f">借记 · 信用 · 预付</text></g></svg></div><ul class="banking-mindmap-text"><li><b>身份</b> 护照、签证或居留、姓名拼写</li><li><b>地址</b> 实际居住、通信和税务地址</li><li><b>税务居民</b> CRS 自证和税号（如适用）</li><li><b>资金来源</b> 工资、经营、储蓄、奖学金或家庭支持</li><li><b>账户用途</b> 生活、留学、工资、经营或储蓄</li><li><b>卡片选择</b> 存款账户、借记卡、信用卡或预付卡</li></ul></section>
  <section class="content-block"><div class="block-head"><h2>材料清单：哪些是常见必备，哪些只是按情况补充？</h2><p>“银行可能要求”不等于“每家银行都必须交”。先看目标银行清单。</p></div><div class="banking-table-wrap"><table class="banking-table banking-material-table"><thead><tr><th>材料</th><th>准备级别</th><th>用于说明什么</th><th>常见错误</th></tr></thead><tbody><tr><th>有效护照</th><td><span class="bank-badge bank-badge-core">通常必备</span></td><td>身份、国籍、姓名拼写</td><td>护照姓名与申请表、机票或地址文件不一致</td></tr><tr><th>签证、居留或入境身份</th><td><span class="bank-badge bank-badge-case">按身份</span></td><td>是否属于银行可服务的客户类型</td><td>把旅游入境当成居民资格，或忽略有效期</td></tr><tr><th>地址证明</th><td><span class="bank-badge bank-badge-case">按银行</span></td><td>实际居住地、通信和服务范围</td><td>使用借来的地址、虚拟地址或过期文件</td></tr><tr><th>税务居民自证与税号</th><td><span class="bank-badge bank-badge-core">常见要求</span></td><td>履行 CRS 等信息收集和申报义务</td><td>把国籍、居留权和税务居民地混填</td></tr><tr><th>收入和职业证明</th><td><span class="bank-badge bank-badge-case">信用卡常见</span></td><td>还款能力、账户画像和风险评估</td><td>只交截图，不说明来源或时间范围</td></tr><tr><th>资金来源文件</th><td><span class="bank-badge bank-badge-case">高风险/大额时</span></td><td>解释第一笔钱和预期流水</td><td>临时大额转入、多人混款、文件互相矛盾</td></tr><tr><th>雇佣、录取、租约或合同</th><td><span class="bank-badge bank-badge-case">按用途</span></td><td>说明工作、留学、居住或经营背景</td><td>拿旅游订单解释长期经营或高频商业流水</td></tr><tr><th>本地手机号和邮箱</th><td><span class="bank-badge bank-badge-reco">建议准备</span></td><td>接收验证、通知和安全提醒</td><td>使用他人手机号，换号后不更新银行资料</td></tr></tbody></table></div></section>
  <section class="content-block banking-compliance"><div class="block-head"><h2>合规与不合规：一眼看懂边界</h2><p>银行可以拒绝高风险申请，但不能靠“攻略”绕过客户尽调。</p></div><div class="banking-compliance-grid"><article class="compliance-good"><span>✓ 可以做</span><h3>把真实情况讲清楚</h3><ul><li>如实填写身份、地址、税务居民和开户用途。</li><li>用工资单、合同、纳税或银行流水解释资金来源。</li><li>按银行要求接受视频核验、补件或到场面谈。</li><li>账户用途变化时及时更新职业、地址和税务信息。</li><li>个人账户和公司账户分开使用，保留合同和付款凭证。</li></ul></article><article class="compliance-bad"><span>× 不要这样做</span><h3>不要把“能开户”建立在虚假信息上</h3><ul><li>购买或伪造地址、流水、雇佣证明、税号或合同。</li><li>借用他人身份、手机号、银行卡或让他人代持账户。</li><li>拆分转账、多人集中入账，再假装是个人工资或储蓄。</li><li>把旅游身份包装成工作、投资或长期居留资格。</li><li>隐瞒税务居民身份，或把境外账户当作规避申报的工具。</li></ul></article></div><div class="banking-redline"><b>红线提示：</b>中国《反洗钱法》要求金融机构开展客户尽职调查；个人也有义务提供真实有效的身份证明和与交易、资金有关的资料。拒绝、虚假或故意规避尽调，可能导致限制、拒绝、终止业务关系，并产生更严重的法律后果。</div></section>
  <section class="content-block banking-flow"><div class="block-head"><h2>更稳妥的办理顺序</h2><p>先开对的账户，再考虑卡片和额度；不要一上来同时申请十家银行。</p></div><ol class="banking-flow-list"><li><span>01</span><div><b>确认身份路径</b><p>明确自己是短期访客、学生、雇员、居民、投资者还是企业实际控制人，并查看目标银行的客户范围。</p></div></li><li><span>02</span><div><b>整理一套主文件</b><p>把护照、签证/居留、地址、税务居民、电话、邮箱和用途说明整理成同一套信息，姓名和日期保持一致。</p></div></li><li><span>03</span><div><b>先查费用与限制</b><p>核对最低余额、月费、实体卡费、ATM 费、跨境交易费、汇率、存款保障和关闭账户规则。</p></div></li><li><span>04</span><div><b>优先申请存款账户/借记卡</b><p>先建立正常的收付款记录，确认卡片、手机银行和安全验证都能正常使用。</p></div></li><li><span>05</span><div><b>需要时再评估信用卡</b><p>看当地信用历史、收入、担保金、额度、年费和还款周期；不以论坛“秒批”作为判断。</p></div></li><li><span>06</span><div><b>保存决定和补件记录</b><p>记录申请日期、补件内容、客服编号和最终结果；被拒后先解决原因，不要重复提交完全相同的资料。</p></div></li></ol></section>
  <section class="content-block banking-issues"><div class="block-head"><h2>最常见的卡点，分别怎么处理？</h2><p>论坛经验只能帮助你提早准备，不能取代银行的书面要求。</p></div><div class="banking-issue-grid"><article><b>地址不被接受</b><p>问清银行认可的文件类型和日期范围；不要把公司注册地址直接当个人居住证明。</p></article><article><b>远程开户转人工</b><p>准备好原件、视频面谈、签证/居留和用途说明；远程申请不代表一定免到场。</p></article><article><b>第一笔钱被问来源</b><p>按一笔资金对应一组凭证整理，不要只给一张余额截图。</p></article><article><b>信用卡没有额度</b><p>先确认是否需要本地收入、信用历史或担保金；没有就先用借记卡建立正常记录。</p></article><article><b>账户突然被限制</b><p>通过银行官方渠道提交补件，停止继续转入异常资金，不要找所谓“解冻中介”。</p></article><article><b>多人共用一个账户</b><p>按实际所有人和用途开立账户；代收代付、借卡给别人使用都可能触发风险审查。</p></article></div></section>
  <section class="content-block banking-tax"><div class="block-head"><h2>中国境内资金、税务和境外账户：不要混成一件事</h2><p>开户只是银行关系，不会自动改变你的税务居民身份，也不会替你解决外汇手续。</p></div><div class="banking-tax-grid"><article><h3>税务居民</h3><p>按相关国家税法判断，不按护照或“拿到居留卡”简单判断。银行可能要求你自证一个或多个税务居民地，并在信息变化时更新。</p><a href="https://www.oecd.org/en/networks/global-forum-on-tax-transparency/resources/aeoi-implementation-portal/tax-residency.html" target="_blank" rel="noopener noreferrer">查看 OECD 税务居民说明 ↗</a></article><article><h3>跨境汇款与购汇</h3><p>境内个人办理购汇、结汇和跨境收支，要按真实用途和银行要求准备资料。年度便利化额度不是“可以用来拆分规避监管”的工具。</p><a href="https://www.safe.gov.cn/tianjin/2025/0714/2833.html" target="_blank" rel="noopener noreferrer">查看国家外汇管理局问答 ↗</a></article><article><h3>境外账户信息</h3><p>CRS 等信息交换制度关注账户持有人、税务居民和账户信息。不要把“境外账户”理解成隐匿收入或不申报的办法。</p><a href="https://www.oecd.org/en/topics/sub-issues/international-standards-on-tax-transparency/tax-transparency-resource-centre.html" target="_blank" rel="noopener noreferrer">查看 OECD CRS 资源 ↗</a></article></div></section>
  <section class="content-block banking-faq"><div class="block-head"><h2>银行卡准备 FAQ</h2><p>下面的回答解释常见原则，具体还是以目标银行和当地法规为准。</p></div><div class="banking-faq-list">${bankingFaq.map(item => `<details><summary>${esc(item.q)}</summary><p>${esc(item.a)}</p></details>`).join("")}</div></section>
  <section class="content-block banking-sources"><div class="block-head"><div><p class="section-kicker">官方依据 / 规则原文</p><h2>这页依据哪些官方规则？</h2></div><p>不同国家的开户条件会变化，以下链接用于理解共同的合规框架。</p></div><ol class="banking-source-list"><li><a href="https://www.npc.gov.cn/npc/c2/c30834/202411/t20241108_440887.html" target="_blank" rel="noopener noreferrer"><span class="bank-source-index">01</span><span class="bank-source-body"><span class="bank-source-kicker">中国法规</span><b>中国《反洗钱法》</b><span class="bank-source-desc">客户尽职调查、真实身份、资金来源与交易用途。</span><span class="bank-source-action">打开官方原文 ↗</span></span></a></li><li><a href="https://www.fatf-gafi.org/content/dam/fatf-gafi/recommendations/FATF%20Standards%20-%2040%20Recommendations%20rc.pdf.coredownload.pdf" target="_blank" rel="noopener noreferrer"><span class="bank-source-index">02</span><span class="bank-source-body"><span class="bank-source-kicker">国际标准</span><b>FATF 40 项建议</b><span class="bank-source-desc">全球通用的客户尽调、受益所有人和持续监测框架。</span><span class="bank-source-action">打开官方原文 ↗</span></span></a></li><li><a href="https://www.oecd.org/en/networks/global-forum-on-tax-transparency/resources/aeoi-implementation-portal/tax-residency.html" target="_blank" rel="noopener noreferrer"><span class="bank-source-index">03</span><span class="bank-source-body"><span class="bank-source-kicker">税务框架</span><b>OECD 税务居民说明</b><span class="bank-source-desc">税务居民自证不能简单按国籍或居留权判断。</span><span class="bank-source-action">打开官方原文 ↗</span></span></a></li><li><a href="https://www.fincen.gov/resources/statutes-regulations/cdd-final-rule" target="_blank" rel="noopener noreferrer"><span class="bank-source-index">04</span><span class="bank-source-body"><span class="bank-source-kicker">美国监管示例</span><b>美国 FinCEN CDD 规则</b><span class="bank-source-desc">客户身份、受益所有人和持续监测的监管示例。</span><span class="bank-source-action">打开官方原文 ↗</span></span></a></li><li><a href="https://www.eba.europa.eu/publications-and-media/press-releases/eba-publishes-guidelines-remote-customer-onboarding" target="_blank" rel="noopener noreferrer"><span class="bank-source-index">05</span><span class="bank-source-body"><span class="bank-source-kicker">欧洲远程开户</span><b>欧洲银行管理局远程开户指引</b><span class="bank-source-desc">远程身份核验仍需符合反洗钱和数据保护要求。</span><span class="bank-source-action">打开官方原文 ↗</span></span></a></li><li><a href="https://www.safe.gov.cn/safe/2006/1225/5319.html" target="_blank" rel="noopener noreferrer"><span class="bank-source-index">06</span><span class="bank-source-body"><span class="bank-source-kicker">中国外汇规则</span><b>国家外汇管理局个人外汇规则</b><span class="bank-source-desc">境内个人外汇收支、购汇、结汇和真实性材料要求。</span><span class="bank-source-action">打开官方原文 ↗</span></span></a></li></ol></section>
  <section class="content-cta"><h2>下一步怎么做？</h2><p>先打开目标国家页面，确认当地身份和银行入口；再按本页清单整理资料。不要向 qdd.app 或任何第三方发送护照扫描件、银行卡密码、验证码或完整银行流水。</p><a href="/#countries">返回国家目录 →</a><a class="content-cta-secondary" href="/rankings/">查看银行准备度排行 →</a></section>`
});

const faqOfficialDomains = [
  ["越南电子签", "https://evisa.gov.vn", "evisa.gov.vn"],
  ["韩国签证门户", "https://visa.go.kr", "visa.go.kr"],
  ["泰国电子入境卡 TDAC", "https://tdac.immigration.go.th", "tdac.immigration.go.th"],
  ["新加坡移民局 ICA", "https://www.ica.gov.sg", "ica.gov.sg"],
  ["印尼移民局", "https://www.imigrasi.go.id", "imigrasi.go.id"],
  ["美国 EVUS 登记", "https://evus.gov", "evus.gov"],
  ["英国政府 GOV.UK", "https://www.gov.uk", "gov.uk"],
  ["法国签证 France-Visas", "https://france-visas.gouv.fr", "france-visas.gouv.fr"],
  ["日本外务省", "https://www.mofa.go.jp", "mofa.go.jp"],
  ["澳大利亚内政部", "https://immi.homeaffairs.gov.au", "immi.homeaffairs.gov.au"]
];

const faqCategories = [
  { title: "一、护照与基本材料", items: [
    { q: "我护照只剩 5 个月有效期，能出国吗？",
      a: "悬。大多数国家通行惯例是护照入境时还要有 6 个月以上有效期，阿联酋、马来西亚白纸黑字写的就是 6 个月；申根要求“离开申根区后还有 3 个月”；土耳其更特殊，要求护照有效期覆盖停留期结束后再加 60 天。只剩 5 个月，航空公司值机时可能直接不让你登机。建议先去出入境管理局换发新护照（一般 7 个工作日左右），再办签证。",
      meta: "涉及国家：全部｜依据：马来西亚移民局互免 FAQ（2025-12-01）；中国驻阿使馆公告（2025-04-11）；德国驻华使领馆须知（2024-06 版）；“6 个月有效期”为通行惯例" },
    { q: "护照空白页不够了怎么办？",
      a: "申根国家通常要求至少 2 页空白页，越南也有“2 页空白页”的通行要求。贴纸签证要占一整页，出入境章也要地方盖。空白页不足，签证中心可能直接拒收材料。护照没到期但页用完了，只能去出入境管理局换发新护照——护照不能加页，别等递材料那天才发现。",
      meta: "涉及国家：申根、越南｜依据：意大利驻华使馆材料页（2026-07-29 核验）；越南申请要求第三方汇总（NA 级，官方原文待核验）" },
    { q: "换了新护照，旧护照上的签证还能用吗？",
      a: "分国家：1. 美国：旧护照上的有效签证可以新旧两本一起用，但持 10 年 B 签的换护照后必须重新做 EVUS 登记（30 美元）；2. 申根：停留记录存在 EES 系统里跟人不跟本，换护照不会“清零”90/180 天数；3. 其他国家出发前查一下使领馆说明。稳妥起见，两本护照都带上。",
      meta: "涉及国家：美国、申根｜依据：美国 KB 第 8 节；欧盟委员会 EES 页面（2026-04-10）" },
    { q: "在国外把护照弄丢了，怎么办？",
      a: "三步走：1. 先报警，拿报案单（补办证件常要看）；2. 联系最近的中国使领馆，申请补办旅行证（办得快，用于紧急回国）或护照；3. 证件补好后，还要找当地移民局补办入境记录或签证手续才能顺利出境。出发前把护照资料页、签证页拍照存手机和邮箱，关键时刻能省很多事。",
      meta: "涉及国家：全部｜依据：通行惯例（领事保护常识）" },
    { q: "签证照片有什么讲究？能拿一张证件照通用吗？",
      a: "不能。各国规格不一样：美国要 5cm×5cm 白底、6 个月内近照；申根要近 6 个月的生物识别证件照；日本有自己的尺寸要求。别拿一张旧证件照打天下，也别自己用手机自拍。按办理国家官方清单上的规格去照相馆拍，说清是哪个国家签证用——照片不合格是退件的高发原因。",
      meta: "涉及国家：美国、申根、日本｜依据：德国驻华使领馆须知（2024-06 版）；美国国务院页面（基线，2026-05-01）" }
  ]},
  { title: "二、签证申请流程", items: [
    { q: "日本签证为什么不能自己递？到底怎么办？",
      a: "日本驻华使领馆不收个人直接递交，必须通过所属领区的指定旅行社；2026-05-15 起也可经指定代理机构办 eVISA 电子签（仅限单次观光，给 15 或 30 天停留）。流程：1. 按常住地确定领区；2. 在使馆官网查指定旅行社/代理机构名单；3. 按清单交材料。2026-07-01 起签证费单次 15,000 日元（人民币实收以使领馆公示为准），旅行社另收服务费。",
      meta: "涉及国家：日本｜依据：日本驻华使馆（2026-07-01）；日本外务省 eVISA 页面（2026-05-15）" },
    { q: "一次去欧洲好几个国家，申根签找哪国办？",
      a: "记住“主目的地”规则：哪国待的时间最长、或哪国是旅行的主要目的，就找哪国申请；分不清主次的，找你第一个入境的国家。别因为“听说某国好约”就办它的签但实际不去——这叫跳签，被查到可能拒签还留记录。一张申根签可以通行 29 个申根国，不用一国一签。",
      meta: "涉及国家：法国、德国、意大利、西班牙等申根国｜依据：EUR-Lex《欧盟签证法典》（2026-07-29 核验）" },
    { q: "签证要提前多久开始办？",
      a: "申根：最早出行前 6 个月、最晚出发前 15 天；英国：最早提前 3 个月，官方审理通常约 3 周；韩国上海领区 2026 年 7 月起审理最长约 20 个工作日；美国要预约面谈，遇行政审查可能拖数周。一句话原则：旺季至少提前 2-3 个月动手，没拿到签证前别买不可退的机票酒店。",
      meta: "涉及国家：申根、英国、韩国、美国｜依据：西班牙驻北京总领馆（2026-07-29）；GOV.UK（2026-07-01）；韩国驻上海总领馆公告（2026-07-06）" },
    { q: "录指纹是怎么回事？每次办签证都要录吗？",
      a: "录指纹就是“生物识别”——到签证中心现场按指纹、拍照片，申根、英国、加拿大都要。好消息：申根 59 个月内录过且记录能调出来的，不用重录；加拿大 10 年内录过通常也免；12 岁以下儿童免指纹。费用上加拿大生物识别单收 85 加元，申根含在流程里不另收。",
      meta: "涉及国家：申根、英国、加拿大｜依据：德国驻华使领馆须知（2024-06 版）；IRCC 口径（多源一致，2026-07 核验）" },
    { q: "材料交上去后通知我补材料，是不是要被拒了？",
      a: "别慌，补件不等于要拒你。按通知要求的材料和期限补齐就行，拖着不交才可能按材料不全处理。注意三点：1. 补件期间审理时间重新拉长，行程留余量；2. 补的材料要和申请表信息一致，别前后矛盾；3. 日本 eVISA 比较特殊，信息填错或材料不全会被直接取消申请，得重新交钱再办。",
      meta: "涉及国家：全部（日本尤注意）｜依据：日本外务省 eVISA 页面（2026-05-15）；各国使领馆通用流程" },
    { q: "网上说“24-48 小时出签”，靠谱吗？",
      a: "那是法国官方对中国申请写的“原则性参考时间”，白纸黑字注明不是承诺。西班牙法定一般 15 个日历日，复杂的可以到 45 天；英国官方口径通常约 3 周；这些都会因旺季、补件、背景核查延长。把“参考时间”当“保证时间”来订机票，就是在赌。拿到签证再出不可退的票。",
      meta: "涉及国家：法国、西班牙、英国｜依据：France-Visas 中国页（2026-07-29）；西班牙驻北京总领馆；GOV.UK 审理时效页（2026-07-01）" }
  ]},
  { title: "三、被拒签了怎么办", items: [
    { q: "被拒签了，签证费能退吗？",
      a: "基本不能。英国明确拒签不退款；申根 90 欧元签证费拒签不退；越南 eVisa 25/50 美元拒签不退；美国 185 美元申请费也不退。签证费买的是“审理”不是“结果”，所以交钱之前把材料做扎实，别抱着“随便试试”的心态递申请。",
      meta: "涉及国家：英国、申根、越南、美国｜依据：GOV.UK 费用表（2026-04-08）；西班牙驻北京总领馆；越南移民局 eVisa 系统；美国国务院页面" },
    { q: "拒签后还能再申请吗？要等多久？",
      a: "大多数国家没有强制“冷静期”，理论上随时可再递。但关键不是“等多久”，是“改什么”：加拿大官方口径很明确——新申请必须针对拒签理由补强，原样再交大概率还是拒。先搞清拒签原因（有的国家给书面理由），缺资金补资金、缺回国约束补约束，准备好了再递。",
      meta: "涉及国家：加拿大及全部｜依据：IRCC 口径（基线，2026-07-29 核验）" },
    { q: "美国面谈后给了我一张 221(g) 单子，是被拒了吗？",
      a: "不是拒签，是“行政审查”——签证官要进一步核实你的情况，可能让你补材料，耗时几周到几个月都有可能，而且没办法加急催。所以办美签千万别卡着出发日期安排，官网的等待时间只是估算不是承诺。审查期间护照可能被收走，期间要出境的行程提前想清楚。",
      meta: "涉及国家：美国｜依据：美国国务院 Visitor Visa 页面（基线，2026-05-01）" },
    { q: "找中介做假材料、假流水，风险有多大？",
      a: "非常大，而且是长期风险。申根用假行程假酒店单“制造主目的地”，领事核查发现就是拒签加留记录；英国审理看“流水来源能不能解释”，临时大额存入反而扣分；美国 DS-160 和面谈回答不一致、编造邀请人或收入，是拒签高发原因，还可能被认定虚假陈述，影响以后所有申请。材料可以弱，不能假。",
      meta: "涉及国家：申根、英国、美国｜依据：法国/西班牙 KB 常见错误；GOV.UK 材料指南（2026-07-01）；美国国务院页面" },
    { q: "被一个国家拒签过，申请别的国家要如实说吗？",
      a: "申请表里问到的，必须如实填。各国签证系统互相独立，A 国拒签不会自动导致 B 国拒你；但撒谎被查出来就是诚信问题，比拒签记录本身严重得多。正确做法：如实申报，附一句简短说明（后来情况有什么变化），多数签证官看的是你现在的情况。",
      meta: "涉及国家：全部｜依据：通行惯例（各国申请表均设拒签史申报项）" }
  ]},
  { title: "四、免签也会踩的坑", items: [
    { q: "泰国免签现在到底能待 30 天还是 60 天？",
      a: "现在是政策切换期，两套口径并存：中泰互免协定写的是单次 30 天、180 天累计 90 天；泰方单方面 60 天框架截至 2026-08-06 仍在实际执行（废止公告未在《皇家公报》刊登）。网上流传的“8 月 1 日起变 30 天”来自自媒体，没有官方依据。稳妥做法：按 30 天规划行程，出发前再查一次最新公告，抵达当天以口岸口径为准。另外入境前 72 小时内必须填 TDAC（官方免费）。",
      meta: "涉及国家：泰国｜依据：中泰互免协定（2024-03-01）；泰国领事司（2026-05-19）；中新社（2026-07-15）；截至 2026-08-06 核对" },
    { q: "免签是不是带上护照就能走？",
      a: "不是。免签只是不用提前办签证，入境门槛一样不少：1. 多国要求填电子入境卡——马来西亚 MDAC、新加坡 SG Arrival Card、泰国 TDAC、印尼 All Indonesia，都是抵达前 3 天内填、官方免费；2. 返程票、酒店订单、资金证明边检可能查；3. 格鲁吉亚 2026 年起还要求买够保额的旅行保险，没有可能不让进。",
      meta: "涉及国家：马来西亚、新加坡、泰国、印尼、格鲁吉亚｜依据：各国移民局官方公告（2025-10-01 至 2026-07 核验）" },
    { q: "去格鲁吉亚免签，为什么还要买保险？不买会怎样？",
      a: "2026-01-01 起，所有入境格鲁吉亚的游客必须持有旅行医疗+意外保险：保额不低于 30,000 拉里（GEL，约 1.1 万美元）、覆盖全部停留时间、保单须英文或格鲁吉亚文。没有合规保单，可能被罚款甚至拒绝入境。这是 2026 年免签目的地里最容易被忽略的新坑，出发前在正规渠道买好，保单打印或存手机随身带。",
      meta: "涉及国家：格鲁吉亚｜依据：中国驻格使馆通知（落款 2025-12-29）" },
    { q: "“180 天内累计 90 天”到底怎么算？",
      a: "土耳其、格鲁吉亚、马来西亚是滚动算法：从任意一天往前数 180 天，你在该国待的总天数不能超过 90 天——不是出境一次就清零重算。阿联酋算法不同：从你第一次入境那天起算 180 天窗口。频繁往返的自己拿日历数清楚，边境系统记得比你牢。超了可能罚款、拒绝入境。",
      meta: "涉及国家：土耳其、格鲁吉亚、马来西亚、阿联酋｜依据：土耳其外交部国别表（2026-07-29）；马来西亚移民局 FAQ（2025-12-01）；中国驻阿使馆公告（2025-04-11）" },
    { q: "听说韩国对中国免签了，是真的吗？",
      a: "半真半假，而且已过时。真事是：2025-09-29 到 2026-06-30 有个 3 人以上团队免签试点（须指定旅行社组团、同机进出、最多 15 天），但已到期，截至 2026-08-13 官方未宣布延长。自由行从来不在试点范围内，个人赴韩还是要办 C-3-9 签证。现行的好消息：跟团办 C-3-2 团体签证，手续费免除延至 2026-12-31；直飞济州岛免签 30 天。",
      meta: "涉及国家：韩国｜依据：新华社（2025-09-29）；韩宣网/韩联社（2026-07-01）" },
    { q: "印尼不是免签吗？怎么到了要交钱？",
      a: "自媒体说的“印尼免签 30 天”对中国普通护照已暂停多年，别再信。现在去印尼旅游走落地签：提前网上办电子落地签（e-VOA）或到机场 VoA 柜台办，费用都是 500,000 印尼盾，首次停留 30 天、可延期一次再 30 天。另外 2025-10-01 起还要在抵达前 3 天内完成 All Indonesia 申报（免费）——签证和申报是两个步骤，缺一不可。",
      meta: "涉及国家：印尼｜依据：印尼移民局 B1 页面（2026-07-29 核验）；移民局新闻稿（2025-09-29）" }
  ]},
  { title: "五、入境被问被拦", items: [
    { q: "入境时边检一般会问什么？怎么答？",
      a: "万变不离其宗四个问题：来干嘛、住哪、待多久、什么时候走。回答原则：和签证申请、行程单上写的一致，别临时编。随身带好返程机票、酒店订单、资金证明。西班牙官方明确“无法证明旅行目的可以拒绝入境”——签证在手不等于一定放行。态度自然、对答如流，基本都能顺利过；支支吾吾、前后矛盾才容易被请进小黑屋详查。",
      meta: "涉及国家：全部（西班牙尤明确）｜依据：西班牙驻北京总领馆（2026-07-29）；各国入境提示" },
    { q: "没买返程机票，能入境吗？",
      a: "多数免签/落地签国家把“返程或续程机票”列在入境要求里：马来西亚移民局 FAQ、新加坡 ICA、印尼移民局都写明了。没票不一定当场遣返，但航空公司值机时就可能拦你（放你过去他们要担责）。建议出票后再出发；行程没定死的，买可退改的票。",
      meta: "涉及国家：马来西亚、新加坡、印尼｜依据：马来西亚移民局互免 FAQ（2025-12-01）；ICA Entering Singapore（2026-06-01）；印尼 KB 第 5 节" },
    { q: "去俄罗斯免签，入境后还要办什么手续？",
      a: "要办“移民登记”（миграционный учёт，就是把住宿信息报备给移民部门）。住酒店：酒店通常帮你办，留好凭证；住朋友家或民宿：要和接待方确认谁去办、什么时候办。登记凭证保存到离境，离境时拿不出来可能有麻烦。入境时填的移民卡（入境卡）出境联也要留好。免签≠什么都不用管。",
      meta: "涉及国家：俄罗斯｜依据：中国驻哈巴罗夫斯克总领馆说明（2025-12-02）；俄驻华使馆答问（基线）" },
    { q: "日本电子签为什么说截图、打印都没用？",
      a: "日本 eVISA 拿到的是“签证签发通知”，值机和入境时必须在有网络的环境下现场在线打开给工作人员看——截图、PDF、打印件官方明确一概不认。所以：1. 出发前确认手机能上网（买好流量包或确认漫游）；2. 登录信息妥善保存；3. 预留机场网络不好的可能，提前到机场。别到值机柜台才发现打不开。",
      meta: "涉及国家：日本｜依据：日本外务省 eVISA 页面（2026-05-15）" },
    { q: "韩国签证怎么没贴在护照上？是不是没办成？",
      a: "韩国已基本不贴签了。获批后上 Korea Visa Portal（visa.go.kr）查询结果，下载打印“签证签发确认书”，入境时连同护照一起出示。注意：1. 确认书信息要和护照一致；2. 打印件随身带，别只存手机里；3. visa.go.kr 是唯一官方域名，别在来路不明的网站输入护照信息。",
      meta: "涉及国家：韩国｜依据：韩国驻华使馆签证流程（基线，2026-07-14）" }
  ]},
  { title: "六、费用与仿冒网站防骗", domains: true, items: [
    { q: "怎么认出仿冒的签证网站？",
      a: "三招：1. 看域名——官方都用政府域名：日本 mofa.go.jp、韩国 visa.go.kr、越南 evisa.gov.vn、印尼 imigrasi.go.id、泰国 tdac.immigration.go.th、新加坡 ica.gov.sg、美国 evus.gov、英国 gov.uk、法国 france-visas.gouv.fr、澳大利亚 immi.homeaffairs.gov.au；2. 搜索引擎排第一的多半是广告，认准域名再点；3. 凡是“官方免费项目”收你钱的（SGAC、MDAC、TDAC、All Indonesia 官方都免费），必是假站。",
      meta: "涉及国家：全部｜依据：各国 KB 官方域名清单（2026-07 至 2026-08 核验）" },
    { q: "日本签证现在多少钱？怎么涨了这么多？",
      a: "2026-07-01 起，日本签证费从单次 3,000 日元涨到 15,000 日元、多次 6,000 涨到 30,000 日元——1978 年以来第一次调价。人民币实收金额以使领馆当期公示为准。另外离境税（国际观光旅客税）也从 1,000 涨到 3,000 日元，含在机票里代收。找旅行社代办的，问价时把“使领馆规费”和“服务费”分开问清。",
      meta: "涉及国家：日本｜依据：日本外务省发布转引（神州学人网 2026-06-22；人民网日本频道 2025-11-14）" },
    { q: "EVUS 是什么？在哪办？多少钱？",
      a: "EVUS（签证更新电子系统）是持中国护照+10 年美签（B1/B2）的人，每次赴美前必须做的网上登记，不做连飞机都上不了。只认官网 evus.gov，2025-09-30 起收费 30 美元一次，登记通常 2 年有效；换护照或换签证要重新登记。市面上一堆“代填”网站收几十到上百美元，填的内容和你自己填的一模一样——10 分钟的事，别花冤枉钱。",
      meta: "涉及国家：美国｜依据：CBP EVUS FAQ；Federal Register 费用公告（2025-08-28）" },
    { q: "有人向我收“ETA 费”“ETIAS 费”，该交吗？",
      a: "不该，因为中国普通护照根本用不上这些东西：英国 ETA、申根 ETIAS、加拿大 eTA、新西兰 NZeTA 都只给免签国护照用，中国护照该办签证就办签证（唯一例外：持有效澳签从澳大利亚飞新西兰的试点可用 NZeTA）。拿这些名目收你钱的，不是骗子就是冤你。真签证费在官方系统或签证中心缴纳，拿正规收据。",
      meta: "涉及国家：英国、申根、加拿大、新西兰｜依据：GOV.UK ETA 页；欧委会 ETIAS 页（2026-04-10）；IRCC；INZ（2026-07-29 核验）" },
    { q: "办美国签证一共要花多少钱？",
      a: "确定的：申请费（MRV）185 美元，拒签不退；已有 10 年签的每次赴美另加 EVUS 30 美元。不确定的：法律增设了 250 美元“签证诚信费”（Visa Integrity Fee），2025 年 10 月起法定生效，但各使领馆分批落地、进度不一，中国辖区是否已实际收取尚无官方确认——以预约缴费时官方系统显示为准，任何“代收”都别信。",
      meta: "涉及国家：美国｜依据：美国国务院页面；PL 119-21；多家二手来源（2026-08，中国辖区执行待核验）" },
    { q: "“保签”“包过”“内部渠道”可信吗？",
      a: "一律不信。逻辑很简单：签证批不批是外国签证官说了算，中介没有任何“内部渠道”能影响结果；英国、加拿大、澳洲、新西兰等国官方都未公布可直接套用的中国护照个人成功率，中介嘴里的“通过率 98%”无法验证。付了“保签费”，过了他收钱，拒了他退你一部分——稳赚不赔的生意。正规代办可以帮你整理材料，承诺结果的都是话术。",
      meta: "涉及国家：全部｜依据：各国 KB 常见错误汇总（2026-08-13）" }
  ]},
  { title: "七、带孩子 / 老人出行", items: [
    { q: "小孩也要单独办签证吗？",
      a: "要，每个人单独申请，婴儿也一样。费用有优惠：申根 6 岁以下免签证费、6-12 岁 45 欧元（成人 90 欧元）；英国、美国、加拿大都是每人一份申请一份费用（美国 DS-160 每人填一份）。免签国家的孩子同样要填入境卡，泰国 TDAC 明确婴儿由家长代填。",
      meta: "涉及国家：申根、英国、美国、加拿大、泰国｜依据：欧盟授权法规 (EU) 2024/1415；美国国务院；泰国移民局 TDAC 中文指南" },
    { q: "带孩子去录指纹，孩子也要按吗？",
      a: "12 岁以下免指纹，这是申根等国的通行规则，孩子不用按指纹（拍照要求以现场为准）。但签证申请本身不能免——申请表还是每人一份，资金证明可以用父母的，记得附关系证明（户口本、出生证明）。",
      meta: "涉及国家：申根、英国｜依据：德国驻华使领馆须知（2024-06 版）；TLScontact 流程" },
    { q: "带老人出国，保险怎么买才合规？",
      a: "分两种：1. 办申根签的，保险是强制材料——覆盖整个申根区和全部行程，医疗+遣返保额不低于 30,000 欧元，保额不够或未覆盖全程可能退件；2. 去格鲁吉亚的，2026 年起人人强制：保额不低于 30,000 拉里、保单英文或格文。其他国家虽不一定查，老人出行也强烈建议买——国外看病很贵。买的时候对着“承保区域、保额、日期覆盖”三项核对。",
      meta: "涉及国家：申根、格鲁吉亚｜依据：德国驻华使领馆须知（2024-06 版）；中国驻格使馆通知（2025-12-29）" },
    { q: "一家人一起申请，材料要准备几套？",
      a: "人多不等于一套材料通用。申请表每人一份；资金证明可以共用（比如主出资人的流水），但每份申请里要能看出“谁出钱、什么关系”；户口本、亲属关系证明按清单备复印件。加拿大有家庭优惠：5 人及以上一起申请，签证费封顶 500 加元、生物识别费封顶 170 加元。",
      meta: "涉及国家：加拿大及全部｜依据：IRCC 费用表（2026-04-30 版）" }
  ]},
  { title: "八、转机与过境", items: [
    { q: "在迪拜转机需要签证吗？",
      a: "分情况：1. 联程机票、行李直挂、不出机场国际中转区——不需要任何签证；2. 分开买的两段票、要取行李重新托运、或要换机场——必须入境，那就用免签（中国普通护照免签，护照 6 个月以上有效即可）。买票时看清是不是联程；不是联程的，留足入境再出境的中转时间。",
      meta: "涉及国家：阿联酋｜依据：阿联酋 KB 第 8 节（基线，2026-07-29 核验）" },
    { q: "经第三国转机去免签国家，还要注意什么？",
      a: "免签只管目的地，不管路上。经土耳其转机去格鲁吉亚、经第三国去俄罗斯，每一段都要单独核过境要求：同机场不出中转区通常没问题；换机场、过夜、重新托运多半要入境，就得看转机国给不给你过境资格。出发前把“去程每一段、回程每一段”都过一遍，别只查目的地。",
      meta: "涉及国家：格鲁吉亚、俄罗斯及中转国｜依据：格/俄 KB 第 8 节（2026-08-13）" },
    { q: "在越南转机不出机场，要签证吗？",
      a: "不出机场国际中转区、24 小时内转走的，过境免签。但如果你办了越南 eVisa 想顺便入境玩两天，注意两点：1. 入境口岸必须是你申请时填写的那个，且在 eVisa 允许清单内（陆路小口岸尤其要核对）；2. 中国电子护照入境要在口岸领另纸签证，转机时间紧的别把“顺便入境”排太满。",
      meta: "涉及国家：越南｜依据：越南 KB（过境口径为 B 级来源；口岸清单以 evisa.gov.vn 为准）" },
    { q: "济州岛免签，能顺路去首尔吗？",
      a: "不能。济州免签只允许在济州岛活动，最多 30 天，且要求直飞济州（或韩方认可路径）。想从济州去首尔等韩国本土城市，必须提前办好韩国签证（C-3-9）。拿着济州免签资格去本土，被查到就是违规滞留，影响以后入境。",
      meta: "涉及国家：韩国｜依据：新华社（2025-09-29）；观察者网（2026-01-01）" }
  ]},
  { title: "九、签证有效期 vs 停留期", items: [
    { q: "签证上的“有效期”和能待的天数是一回事吗？",
      a: "完全两回事，混淆这个最容易逾期。有效期（Valid From/Until）：你可以在这个时间窗内入境；停留期（Duration of Stay）：每次入境后能待几天。举例：日本签证有效期 3 个月、停留 15 或 30 天——3 个月内任何一天进去都行，但进去后只能待 15/30 天。获批后第一件事：核对签证页上的有效期、入境次数、停留天数三行，有错立即联系受理方。",
      meta: "涉及国家：全部（日本为示例）｜依据：日本外务省口径；申根签证页核对（各国 KB 第 3 节）" },
    { q: "美国 10 年签证，是不是可以在美国住 10 年？",
      a: "想多了。10 年只是“可以入境的窗口”，每次能待多久由入境口岸 CBP 官员当场决定，通常最多 6 个月，写在你的 I-94 记录上（可在 i94.cbp.dhs.gov 查询）。以访客身份常年住在美国，会被认定滥用身份，可能取消签证。记住：签证有效期≠停留期，10 年签≠长期居住证。",
      meta: "涉及国家：美国｜依据：美国国务院 Visitor Visa 页；CBP I-94 说明" },
    { q: "英国两年多次签证，是不是能每年去住半年？",
      a: "规则上每次入境最多 6 个月，但英国官方明确：用访问签“频繁、连续长住”搞变相居住，会被质疑访问目的，可能被拒绝入境或影响下次申请。两年多次的正确用法是“来去自由的短期访问”，不是把半个家安在英国。每次行程保留真实的旅游、探亲痕迹。",
      meta: "涉及国家：英国｜依据：GOV.UK Standard Visitor 页（2026-07-01 核验）" },
    { q: "越南电子签给了 90 天，是不是哪天去都能待满 90 天？",
      a: "不是。越南 eVisa 批准文件上有固定的 From—To 日期，只能在这个窗口内入境和停留，最长 90 天——不是“入境后起算 90 天”。申请时填的预计入出境日期就是窗口，填错了获批后改不了，25/50 美元也不退。行程没定的，窗口尽量按真实计划填。",
      meta: "涉及国家：越南｜依据：越南 KB 基线（2026-07-29 核验）" },
    { q: "不小心逾期滞留了，后果有多严重？",
      a: "看国家，但都不轻：阿联酋超出 90 天的部分每天罚 50 迪拉姆；泰国有“每天 500 泰铢、上限 2 万泰铢”的第三方口径（官方细则待核验），严重的会被禁止再入境；印尼、越南按天罚款还影响下次签证。共同规律：罚款是小事，留下逾期记录影响以后所有申请是大事。发现要超期，提前去当地移民局办延期（泰国、印尼都有延期通道）。",
      meta: "涉及国家：阿联酋、泰国、印尼、越南｜依据：中国驻阿使馆公告（2025-04-11）；泰国 KB（第三方口径待核验）" }
  ]},
  { title: "十、特殊证件与特殊情况", items: [
    { q: "拿港澳证件的，规则和大陆普通护照一样吗？",
      a: "不一样，别混。持香港签证身份书、澳门旅行证去新加坡，仍须办签证（普通护照互免不适用）；EVUS 只针对中国大陆护照，港澳台居民不需要登记；香港特区护照 2025-05-15 起去阿联酋可免签 30 天。一句话：本文所有“中国普通护照”的结论，拿其他证件的请单独查询确认。",
      meta: "涉及国家：新加坡、美国、阿联酋｜依据：VFS 通知（2025-08-01）；EVUS 官网 FAQ；阿方公告" },
    { q: "中国电子护照去越南，为什么不能在护照上盖章？",
      a: "因为护照内页地图含南海争议区域，越方不在中国护照上盖章贴签。解决办法是“另纸签证”：持 eVisa 入境时在口岸免费领取一张单独的签证纸，出入境章盖在那张纸上。这张纸出境也要出示，千万别弄丢。这是中国旅客去越南最重要的特殊环节，到口岸先找领另纸签的地方，留足办理时间。",
      meta: "涉及国家：越南｜依据：越南 KB（多源一致，与多年实践一致）" },
    { q: "签证还没下来，护照押在使馆了，急用护照怎么办？",
      a: "审理期间护照押在签证中心或使领馆是常态（英国、申根、美国面谈后都可能）。急用可联系受理方申请借出或返还，但通常意味着撤销这次申请、费用不退。预防办法：1. 行程排开，办签期间不安排其他出境；2. 日本 eVISA 等电子路径不押护照；3. 别同时赶着办两个国家的签证。",
      meta: "涉及国家：英国、申根、美国｜依据：各国申请流程 KB（通行做法）" },
    { q: "旧护照过期了，上面的签证和出入境记录会作废吗？",
      a: "分两层：签证本身——美国旧护照上的有效签证可以和新护照一起使用；申根是 EES 电子记录跟人不跟护照，换新护照后 90/180 天数照算，不会“洗白”重来。建议：1. 新旧护照都带上出行；2. 出发前查官方携带规则；3. 指纹记录与换护照无关，申根 59 个月免录规则照旧。",
      meta: "涉及国家：美国、申根｜依据：美国 KB 第 8 节；欧盟委员会 EES 页（2026-04-10）" }
  ]}
];

const faqSchema = JSON.stringify({
  "@context": "https://schema.org",
  "@graph": [{
    "@type": "FAQPage",
    "@id": "https://qdd.app/faq/#faq",
    mainEntity: faqCategories.flatMap(category => category.items.map(item => ({
      "@type": "Question", name: item.q, acceptedAnswer: { "@type": "Answer", text: item.a }
    })))
  }, {
    "@type": "BreadcrumbList",
    "@id": "https://qdd.app/faq/#breadcrumb",
    itemListElement: [{ "@type": "ListItem", position: 1, name: "首页", item: "https://qdd.app/" }, { "@type": "ListItem", position: 2, name: "签证疑难杂症 50 问", item: "https://qdd.app/faq/" }]
  }]
});

const faq = contentPage({
  title: "签证疑难杂症 50 问",
  description: "50 个中国护照出国常见问题的大白话解答：护照材料、签证流程、拒签、免签、入境、防骗、带孩子老人、转机、停留期与特殊情况。",
  canonical: "https://qdd.app/faq/",
  schema: faqSchema,
  kicker: "常见问题",
  heading: "签证疑难杂症，<br>大白话讲清楚。",
  intro: `50 个出国常见问题的大白话解答：怎么办、去哪办、多少钱。依据 ${totalCountries} 国官方资料整理（核验日 2026-08-13），帮你避坑，但不能替代官方信息；政策随时会变，出发前请以各国使领馆、移民局官网为准。`,
  content: faqCategories.map(category => `<section class="content-block faq-category"><h2>${category.title}</h2><div class="faq-list">${category.items.map(item => `<article class="faq-item"><h3>${item.q}</h3><p>${item.a}</p><small>${item.meta}</small></article>`).join("")}</div>${category.domains ? `<div class="official-domains"><h3>认准这些官方域名</h3><p>办签证、填入境卡、做登记，只从政府域名进入。搜索结果排第一的多半是广告，先核对域名再点。</p><ul>${faqOfficialDomains.map(([label, url, host]) => `<li><a href="${url}" target="_blank" rel="noopener">${label} · ${host} ↗</a></li>`).join("")}</ul></div>` : ""}</section>`).join("")
});

const glossaryTerms = [
  ["免签", "不用提前办签证，拿护照买机票就能去。", "免签≠一定能入境，边检仍有权拒绝；也≠想待多久待多久。"],
  ["落地签", "不用提前办，飞到目的地机场后现场办签证。", "通常要排队、缴费、备照片和现金；也可能被拒。"],
  ["电子签（eVISA / e-VOA）", "出发前在网上申请签证，获批后凭电子凭证入境。", "电子签也是签证，要审批；e-VOA 是“先网上办好的落地签”。"],
  ["申根签证", "一张签证通行欧洲申根区 20 多个国家。C 类就是短期旅游签。", "不是“欧盟签证”；去哪个国家待最久就申哪国。"],
  ["EES", "欧盟新的出入境电子登记系统，入境时录指纹和照片，取代盖章。", "它不是签证，也不用提前申请，到口岸现场完成。"],
  ["ETIAS", "欧盟针对“免签国家旅客”的事前网上授权。", "和中国护照无关——中国护照本来就要办申根签，不需要 ETIAS。"],
  ["EVUS", "拿到美国十年 B1/B2 签证后，出发前必须做的网上登记。", "不是签证；没登记或登记过期，拿到签证也登不了机。"],
  ["TDAC", "泰国电子入境卡，抵达前 3 天内网上填。", "不是签证，免费；只在泰国官方网站上填，警惕收费仿冒站。"],
  ["MDAC", "马来西亚电子入境卡，抵达前 3 天内网上填。", "同上：不是签证，免费，认准官方域名。"],
  ["SG Arrival Card", "新加坡电子入境卡，抵达前 3 天内网上填。", "同上：不是签证，免费。"],
  ["All Indonesia", "印尼的统一入境申报（含海关、健康等），到达前可网上填。", "与落地签是两件事，都要办。"],
  ["NZeTA / NZ Traveller Declaration", "新西兰的电子旅行授权/入境申报。", "中国护照仍需签证；NZeTA 只适用于特定免签/过境人群。"],
  ["Visit Japan Web", "日本官方的入境信息网上填报系统。", "填它不等于办签证；日本仍需提前办旅游签。"],
  ["签证有效期", "你必须在这个日期范围内“入境”的期限。", "有效期长≠能停留久；它是“入场券的使用期限”。"],
  ["停留期", "每次入境后允许实际待的天数。", "和有效期是两回事，overstaying（超期滞留）后果严重。"],
  ["单次 / 多次入境", "单次：签证用一次就作废；多次：有效期内可反复进出。", "多次签≠每次能无限期停留，每次停留期单独算。"],
  ["累计停留（如 90/180）", "任意 180 天滚动窗口里，累计最多待 90 天。", "不是“一年能待 90 天”，窗口是滚动的，要倒着数。"],
  ["领区", "使领馆按你的常住地划分受理范围，跨区递交可能不受理。", "按“常住地”而不是户口或出发城市判断。"],
  ["指定代理 / 指定旅行社", "日本等国规定旅游签必须经官方名单上的旅行社递交，不接受个人直递。", "名单会更新，以使领馆当期公布为准，别信广告自封。"],
  ["生物识别（录指纹）", "办签证时现场采集指纹和照片。", "本人必须到场，旅行社不能代录；通常有有效期（如申根 59 个月）。"],
  ["VFS / TLScontact / 签证中心", "使领馆外包的收件机构，负责收材料、收指纹，不做审批。", "批不批签是使领馆决定，签证中心只收服务费。"],
  ["返程票", "离开目的地的机票（或车船票）凭证。", "免签/落地签入境常被抽查，只买单程票风险高。"],
  ["行程单", "逐日行程计划：哪天在哪、玩什么、怎么移动。", "要和机票、酒店日期对得上，互相矛盾易被怀疑。"],
  ["酒店预订单", "住宿预订确认（通常可免费取消的即可）。", "需覆盖全部晚数；Airbnb 订单有的国家不认。"],
  ["资金证明 / 银行流水", "证明你有钱负担旅行的材料，常用近几个月银行流水。", "临时大额存入反而可疑；余额要和行程花费匹配。"],
  ["入境卡", "入境时向边检申报个人信息的卡片或电子表格。", "入境卡≠签证；很多国家已电子化且有填报时间窗。"],
  ["边检 / 海关", "边检查“人能不能进”，海关查“东西能不能带”。", "两道关都要过；签证由边检查验，申报品找海关。"],
  ["过境签", "只在某国转机不入境时，部分国籍仍需办理的签证。", "“不出机场”也可能要过境签，订票前先查。"],
  ["BRP / 英国 eVisa", "英国的居留卡/电子签证状态。BRP 是实体卡，正全面转向线上 eVisa。", "短期旅游签一般涉及不到；针对在英长期居留者。"],
  ["ESTA", "美国针对免签计划国家旅客的网上授权。", "中国护照不适用；中国护照须办 B1/B2 签证。"],
  ["白本护照", "没有任何出境记录的新护照。", "白本不是拒签理由，但材料要更扎实；别被中介吓。"],
  ["拒签", "签证申请被使领馆拒绝。", "拒签率是一国整体统计，不能换算成你个人的成功率。"],
  ["销签", "部分国家要求回国后向使领馆“报到”确认已按时离境。", "漏办可能影响下次申请；按要求留意签证页备注。"]
];

const glossary = contentPage({
  title: "大白话词汇表",
  description: "免签、落地签、电子签、申根、EVUS、TDAC……办签证和看出入境政策最常碰到的 33 个术语，大白话解释加常见误解提醒。",
  canonical: "https://qdd.app/glossary/",
  kicker: "词汇表",
  heading: "这些词，用大白话讲清楚。",
  intro: "办签证、看出入境政策时最常碰到的 33 个词：每个配一句话解释和一条常见误解提醒。在别的页面碰到看不懂的术语，回这里查。",
  content: `<section class="content-block"><div class="glossary-wrap"><table class="glossary-table"><thead><tr><th>术语</th><th>大白话解释</th><th>常见误解提醒</th></tr></thead><tbody>${glossaryTerms.map(([term, explain, warning]) => `<tr><td>${term}</td><td>${explain}</td><td>${warning}</td></tr>`).join("")}</tbody></table></div></section><section class="content-block"><h2>补充收录：这些叫法也在表里</h2><p class="glossary-variants">B1/B2（美国旅游/商务访客签）、C-3-9（韩国一般观光签）、600 类别（澳大利亚访客签）、Standard Visitor（英国访客签）、e-VOA（印尼网上落地签）、另纸签证（越南对中国电子普通护照在口岸换发的单独签证纸）。</p></section>`
});

fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(path.join(dist, "assets"), { recursive: true });
fs.mkdirSync(path.join(dist, "country"), { recursive: true });
fs.mkdirSync(path.join(dist, "cards"), { recursive: true });
fs.mkdirSync(path.join(dist, "topics"), { recursive: true });

fs.copyFileSync(path.join(root, "styles.css"), path.join(dist, "assets/styles.css"));
fs.copyFileSync(path.join(root, "app.js"), path.join(dist, "assets/app.js"));
fs.writeFileSync(path.join(dist, "index.html"), home);

for (const country of data.countries) {
  const folder = path.join(dist, "country", slugMap[country.code]);
  fs.mkdirSync(folder, { recursive: true });
  fs.writeFileSync(path.join(folder, "index.html"), countryPage(country));
  fs.copyFileSync(path.join(sourceRoot, `${country.slug}.html`), path.join(dist, "cards", `${country.slug}.html`));
}

for (const [route, html] of [["topics", topicsIndex], ["methodology", methodology], ["updates", updates], ["for-business", business], ["rankings", rankings], ["personal-banking", personalBanking], ["faq", faq], ["glossary", glossary]]) {
  const folder = path.join(dist, route);
  fs.mkdirSync(folder, { recursive: true });
  fs.writeFileSync(path.join(folder, "index.html"), html);
}
for (const topic of topicDefinitions) {
  const folder = path.join(dist, "topics", topic.slug);
  fs.mkdirSync(folder, { recursive: true });
  fs.writeFileSync(path.join(folder, "index.html"), topicPage(topic));
}

fs.writeFileSync(path.join(dist, "favicon.svg"), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="12" fill="#f7f3ea"/><rect x="10" y="10" width="44" height="44" rx="7" fill="#c03f2b" transform="rotate(-3 32 32)"/><text x="32" y="43" font-size="30" text-anchor="middle" fill="#fdf8ef" font-family="STKaiti,KaiTi,serif">验</text></svg>`);
fs.writeFileSync(path.join(dist, "_headers"), `/*
  X-Content-Type-Options: nosniff
  X-Frame-Options: SAMEORIGIN
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
  Cache-Control: public, max-age=300

/assets/*
  Cache-Control: public, max-age=86400
`);
fs.writeFileSync(path.join(dist, "robots.txt"), `User-agent: *\nAllow: /\n\nUser-agent: GPTBot\nAllow: /\n\nUser-agent: PerplexityBot\nAllow: /\n\nUser-agent: ClaudeBot\nAllow: /\n\nUser-agent: Google-Extended\nAllow: /\n\nUser-agent: Applebot-Extended\nAllow: /\n\nSitemap: https://qdd.app/sitemap.xml\n`);
const urls = [
  { url: "", lastmod: latestVerified },
  ...data.countries.map(country => ({ url: `country/${slugMap[country.code]}/`, lastmod: country.verified })),
  ...["topics/", ...topicDefinitions.map(topic => `topics/${topic.slug}/`), "methodology/", "updates/", "for-business/", "rankings/", "personal-banking/", "faq/", "glossary/"].map(url => ({ url, lastmod: url === "topics/esim/" ? buildDate : latestVerified }))
];
fs.writeFileSync(path.join(dist, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(item => `  <url><loc>https://qdd.app/${item.url}</loc><lastmod>${item.lastmod}</lastmod></url>`).join("\n")}\n</urlset>`);
const llms = [
  "# qdd.app｜中国护照出境说明书",
  "> 面向中国大陆居民、中国普通护照、短期旅游的签证、免签、电子许可和入境准备说明。",
  "",
  "## 如何使用",
  "- 先看国家页首屏结论，再打开官方办理入口和材料清单。",
  "- 每页分别显示政策生效日、官方页面日期、本站核验日和下次复核日。",
  "- 本站不是政府机构、签证代理或银行；签证、开户和入境决定以官方机构为准。",
  "- 榜单分数是编辑部准备度，不是获签率、开户率、信用卡通过率或投资建议。",
  "",
  "## 重要入口",
  "- 首页：https://qdd.app/",
  "- 按场景查：https://qdd.app/topics/",
  "- 常见问题：https://qdd.app/faq/",
  "- 核验方法：https://qdd.app/methodology/",
  "- 更新记录：https://qdd.app/updates/",
  "- 出海三榜：https://qdd.app/rankings/",
  "- 个人银行卡指南：https://qdd.app/personal-banking/",
  "- 出国上网与 eSIM：https://qdd.app/topics/esim/",
  "- 关联通信服务：eSIM.school（目的地套餐比价、设备兼容与旅行设置；点击或购买可能产生收入，不影响本站政策结论）",
  "- 机构合作：https://qdd.app/for-business/",
  "",
  "## 国家页",
  ...data.countries.map(country => `- ${country.country}：${country.topic}｜https://qdd.app/country/${slugMap[country.code]}/`),
  "",
  "## 引用规则",
  "引用本站时，请同时保留对应国家页的官方来源链接和核验日期；动态政策不要只引用摘要或旧截图。"
].join("\n");
fs.writeFileSync(path.join(dist, "llms.txt"), `${llms}\n`);
fs.writeFileSync(path.join(dist, "404.html"), layout({
  title: "页面没有找到｜qdd.app",
  description: "这个页面暂时不存在。",
  canonical: "https://qdd.app/404",
  body: `<main id="main" class="not-found"><p class="eyebrow"><span>404 / 页面不存在</span></p><h1>这张“签证页”还没盖章。</h1><p>你访问的国家说明可能仍在准备，或者链接已经变化。</p><a href="/">返回 qdd.app 首页</a></main>`
}));

console.log(`Built qdd.app v3: ${data.countries.length} country pages, ${data.countries.reduce((sum, country) => sum + country.cards.length, 0)} guide sections.`);
