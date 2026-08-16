import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const dist = path.join(root, "dist");
const policyData = JSON.parse(fs.readFileSync(path.resolve(root, "../visa-cards/policy-data.json"), "utf8"));
const htmlFiles = [];

if (policyData.countries.length < 57) throw new Error(`Expected at least 57 country records, found ${policyData.countries.length}`);
if (policyData.countries.filter(country => country.island).length < 10) throw new Error("Expected at least 10 island-country records");

for (const country of policyData.countries) {
  const application = country.application;
  if (!application) throw new Error(`${country.code} missing application guide`);
  for (const key of ["applicationUrl", "officialGuideUrl", "documentsUrl", "processingUrl", "feeUrl"]) {
    if (!application[key] || !/^https:\/\//.test(application[key])) throw new Error(`${country.code} missing HTTPS ${key}`);
  }
  if (!Array.isArray(application.requiredDocuments) || application.requiredDocuments.length < 3) throw new Error(`${country.code} missing required documents`);
  if (!Array.isArray(application.applicationSteps) || application.applicationSteps.length < 3) throw new Error(`${country.code} missing application steps`);
  if (!application.successRate?.status || !application.successRate?.url) throw new Error(`${country.code} missing success-rate provenance`);
}

function walk(folder) {
  for (const entry of fs.readdirSync(folder, { withFileTypes: true })) {
    const full = path.join(folder, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.name.endsWith(".html")) htmlFiles.push(full);
  }
}

walk(dist);
const expectedHtml = 15 + (policyData.countries.length * 2);
if (htmlFiles.length !== expectedHtml) throw new Error(`Expected ${expectedHtml} HTML files, found ${htmlFiles.length}`);

const rankingHtml = fs.readFileSync(path.join(dist, "rankings", "index.html"), "utf8");
for (const section of ["需要签证国家的准备难度", "公司注册准备度", "银行与银行卡准备度", "岛屿国家专题"]) {
  if (!rankingHtml.includes(section)) throw new Error(`rankings page missing ${section}`);
}
const bankingHtml = fs.readFileSync(path.join(dist, "personal-banking", "index.html"), "utf8");
for (const required of ["个人银行卡、借记卡、信用卡准备指南", "banking-table", "banking-mindmap", "FAQPage", "HowTo", "合规", "不合规", "https://www.npc.gov.cn", "https://www.oecd.org"]) {
  if (!bankingHtml.includes(required)) throw new Error(`personal-banking page missing ${required}`);
}
const esimHtml = fs.readFileSync(path.join(dist, "topics", "esim", "index.html"), "utf8");
for (const required of ["出国上网与 eSIM", "esim.school", "关联服务说明", "esim-compare-table", "esim-flow", "https://esim.school/zh/devices/"]) {
  if (!esimHtml.includes(required)) throw new Error(`eSIM topic page missing ${required}`);
}
const countryHtml = htmlFiles.filter(file => file.includes(`${path.sep}country${path.sep}`));
if (countryHtml.length !== policyData.countries.length) throw new Error(`Expected ${policyData.countries.length} country pages, found ${countryHtml.length}`);
for (const file of countryHtml) {
  const html = fs.readFileSync(file, "utf8");
  for (const required of ["business-eligibility", "工作许可与 EP", "公司与营业许可", "个人账户与借记卡", "企业账户与信用卡", "资料准备框架"]) {
    if (!html.includes(required)) throw new Error(`${file} missing business guide field ${required}`);
  }
}
if (!fs.existsSync(path.join(dist, "llms.txt"))) throw new Error("missing llms.txt GEO index");
const robots = fs.readFileSync(path.join(dist, "robots.txt"), "utf8");
for (const bot of ["GPTBot", "PerplexityBot", "ClaudeBot", "Google-Extended"]) {
  if (!robots.includes(`User-agent: ${bot}`)) throw new Error(`robots.txt missing ${bot}`);
}

for (const file of htmlFiles) {
  const html = fs.readFileSync(file, "utf8");
  const isCardTool = file.includes(`${path.sep}cards${path.sep}`);
  for (const required of ["<title>", 'name="description"', "qdd.app"]) {
    if (!html.includes(required)) throw new Error(`${file} missing ${required}`);
  }
  if (!isCardTool) {
    for (const seoTag of ['name="robots"', 'property="og:title"', 'name="twitter:card"', 'rel="canonical"']) {
      if (!html.includes(seoTag)) throw new Error(`${file} missing SEO tag ${seoTag}`);
    }
  }
  if (!isCardTool) {
    const cssHref = html.match(/<link rel="stylesheet" href="([^"]+)"/)?.[1];
    const scriptSrc = html.match(/<script src="([^"]+)" defer>/)?.[1];
    if (!cssHref || !scriptSrc) throw new Error(`${file} missing stylesheet or script path`);
    for (const asset of [cssHref, scriptSrc]) {
      const assetPath = path.resolve(path.dirname(file), asset.split("?", 1)[0]);
      if (!fs.existsSync(assetPath)) throw new Error(`${file} broken asset ${asset}`);
    }
  }
  const bannedCopy = [
    "每个结论都要能回到原文",
    "发现政策变化或页面错误？",
    "同类规则继续查",
    "免签也要办这些手续",
    "从这里开始",
    "APPLICATION DESK",
    "OFFICIAL SOURCES",
    "PASSPORT BRIEF",
    "BOOKMARK THE BRIEF",
    "UPDATE DESK",
    "VERIFIED"
  ];
  for (const phrase of bannedCopy) {
    if (html.includes(phrase)) throw new Error(file + " contains legacy copy: " + phrase);
  }
  if (isCardTool) continue;
  if (file.includes(`${path.sep}country${path.sep}`)) {
    if (!html.includes('"@type":"FAQPage"') || !html.includes('"@type":"HowTo"')) throw new Error(`${file} missing FAQ/HowTo schema`);
  }
  const hrefs = [...html.matchAll(/href="(\/[^"#?]*)"/g)].map(match => match[1]);
  for (const href of hrefs) {
    if (href.endsWith(".html") && href.startsWith("/cards/")) {
      if (!fs.existsSync(path.join(dist, decodeURIComponent(href)))) throw new Error(`${file} broken ${href}`);
      continue;
    }
    const target = href.endsWith("/") ? path.join(dist, href, "index.html") : path.join(dist, href);
    if (!fs.existsSync(target)) throw new Error(`${file} broken ${href}`);
  }
}

new vm.Script(fs.readFileSync(path.join(dist, "assets/app.js"), "utf8"));
console.log(`PASS: ${htmlFiles.length} HTML files; internal links, metadata, scripts and qdd.app attribution verified.`);
