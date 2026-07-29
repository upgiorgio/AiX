#!/usr/bin/env node
import { writeFileSync, mkdirSync } from "fs";
import { execFileSync } from "child_process";
import { join } from "path";
import { fileURLToPath } from "url";

const outDir = fileURLToPath(new URL("./auto-gen/", import.meta.url));
mkdirSync(outDir, { recursive: true });

const gold = "#a88030";
const gold2 = "#c8a45c";
const dark = "#242424";
const muted = "#6f6a60";
const paper = "#fffdf7";
const card = "#faf7ee";
const line = "#e8e0c8";
const graphite = "#34363b";
const font = "'PingFang SC','Hiragino Sans GB','Noto Serif SC','Songti SC',serif";

function esc(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function station(x, y, w, h, title, sub, icon) {
  return `
  <g>
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="18" fill="#ffffff" stroke="${line}" stroke-width="1.6"/>
    <rect x="${x}" y="${y}" width="${w}" height="5" rx="2.5" fill="${gold}"/>
    <text x="${x + 22}" y="${y + 38}" font-family=${JSON.stringify(font)} font-size="21" font-weight="700" fill="${dark}">${esc(title)}</text>
    <text x="${x + 22}" y="${y + 68}" font-family=${JSON.stringify(font)} font-size="15" fill="${muted}">${esc(sub)}</text>
    <circle cx="${x + w - 36}" cy="${y + 42}" r="18" fill="${card}" stroke="${gold2}"/>
    <text x="${x + w - 36}" y="${y + 49}" text-anchor="middle" font-family=${JSON.stringify(font)} font-size="20" font-weight="700" fill="${gold}">${esc(icon)}</text>
  </g>`;
}

function coverSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="384" viewBox="0 0 900 384">
  <defs>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="10" stdDeviation="14" flood-color="#8b6820" flood-opacity="0.12"/>
    </filter>
    <linearGradient id="bar" x1="0" x2="1">
      <stop offset="0" stop-color="${gold}"/>
      <stop offset="1" stop-color="${gold2}"/>
    </linearGradient>
  </defs>
  <rect width="900" height="384" fill="${paper}"/>
  <path d="M72 304 C214 98 688 78 828 304" fill="none" stroke="${line}" stroke-width="2"/>
  <path d="M450 192 L194 98 M450 192 L706 98 M450 192 L198 286 M450 192 L708 286" stroke="${gold2}" stroke-width="2" stroke-dasharray="6 8"/>
  <g filter="url(#shadow)">
    <rect x="318" y="102" width="264" height="154" rx="28" fill="#ffffff" stroke="${line}" stroke-width="2"/>
    <rect x="350" y="132" width="200" height="66" rx="14" fill="${graphite}"/>
    <path d="M376 170 L410 150 L450 176 L494 142 L526 162" fill="none" stroke="${gold2}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
    <rect x="388" y="215" width="124" height="10" rx="5" fill="${line}"/>
    <rect x="418" y="233" width="64" height="8" rx="4" fill="${gold2}"/>
    <circle cx="450" cy="102" r="30" fill="url(#bar)"/>
    <text x="450" y="113" text-anchor="middle" font-family=${JSON.stringify(font)} font-size="30" font-weight="800" fill="#fff">H</text>
  </g>
  ${station(62, 42, 210, 88, "Claude", "架构判断", "C")}
  ${station(628, 42, 210, 88, "Codex", "代码落地", "X")}
  ${station(62, 252, 210, 88, "Kimi K2.6", "长任务执行", "K")}
  ${station(628, 252, 210, 88, "公众号", "排版入草稿", "稿")}
  </svg>`;
}

function workbenchSvg() {
  const cells = [
    ["Claude", "判断", "复杂需求、架构风险、重构边界"],
    ["Codex", "实现", "改文件、跑测试、修 CI、做 review"],
    ["Kimi K2.6", "长跑", "长上下文、多轮任务、低成本执行"],
    ["Hermes", "总控", "技能、工具、记忆、发布链路"],
  ];
  const rows = cells.map((c, i) => {
    const y = 220 + i * 118;
    return `<g>
      <rect x="112" y="${y}" width="800" height="86" rx="18" fill="${i % 2 ? "#ffffff" : card}" stroke="${line}"/>
      <text x="152" y="${y + 36}" font-family=${JSON.stringify(font)} font-size="26" font-weight="800" fill="${gold}">${esc(c[0])}</text>
      <text x="330" y="${y + 36}" font-family=${JSON.stringify(font)} font-size="22" font-weight="700" fill="${dark}">${esc(c[1])}</text>
      <text x="330" y="${y + 66}" font-family=${JSON.stringify(font)} font-size="18" fill="${muted}">${esc(c[2])}</text>
    </g>`;
  }).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  <rect width="1024" height="1024" fill="${paper}"/>
  <circle cx="512" cy="118" r="58" fill="${gold}"/>
  <text x="512" y="139" text-anchor="middle" font-family=${JSON.stringify(font)} font-size="58" font-weight="900" fill="#fff">AI</text>
  <text x="512" y="214" text-anchor="middle" font-family=${JSON.stringify(font)} font-size="34" font-weight="800" fill="${dark}">四个 agent，不抢同一个工位</text>
  ${rows}
  <path d="M512 176 V220" stroke="${gold2}" stroke-width="4"/>
  <text x="512" y="780" text-anchor="middle" font-family=${JSON.stringify(font)} font-size="22" font-weight="700" fill="${dark}">Kimi 建上下文，Claude 定方向，Codex 动手，Hermes 串流程</text>
  <rect x="252" y="826" width="520" height="92" rx="20" fill="#ffffff" stroke="${gold2}" stroke-width="2"/>
  <text x="512" y="864" text-anchor="middle" font-family=${JSON.stringify(font)} font-size="20" fill="${muted}">不是问哪个模型最强</text>
  <text x="512" y="894" text-anchor="middle" font-family=${JSON.stringify(font)} font-size="24" font-weight="800" fill="${gold}">而是哪件事该交给谁</text>
  </svg>`;
}

function pipelineSvg() {
  const steps = [
    ["采集", "热点与资料"],
    ["选题", "判断角度"],
    ["初稿", "进入筛选池"],
    ["人审", "升级母版"],
    ["插图", "匹配内容"],
    ["排版", "inline HTML"],
    ["草稿箱", "appMsgId"],
  ];
  const nodes = steps.map((s, i) => {
    const x = 74 + i * 126;
    return `<g>
      <circle cx="${x}" cy="404" r="42" fill="${i === steps.length - 1 ? gold : "#ffffff"}" stroke="${gold2}" stroke-width="3"/>
      <text x="${x}" y="413" text-anchor="middle" font-family=${JSON.stringify(font)} font-size="20" font-weight="800" fill="${i === steps.length - 1 ? "#fff" : gold}">${esc(s[0])}</text>
      <text x="${x}" y="486" text-anchor="middle" font-family=${JSON.stringify(font)} font-size="15" fill="${muted}">${esc(s[1])}</text>
      ${i < steps.length - 1 ? `<path d="M${x + 46} 404 H${x + 82}" stroke="${gold2}" stroke-width="4" stroke-linecap="round"/><path d="M${x + 82} 404 l-10 -8 v16 z" fill="${gold2}"/>` : ""}
    </g>`;
  }).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  <rect width="1024" height="1024" fill="${paper}"/>
  <text x="512" y="126" text-anchor="middle" font-family=${JSON.stringify(font)} font-size="38" font-weight="900" fill="${dark}">公众号不是直接发，是跑一条流水线</text>
  <text x="512" y="170" text-anchor="middle" font-family=${JSON.stringify(font)} font-size="20" fill="${muted}">从素材到草稿箱，中间每一步都要可检查、可回退</text>
  <rect x="92" y="244" width="840" height="388" rx="34" fill="#ffffff" stroke="${line}" stroke-width="2"/>
  <path d="M124 404 H902" stroke="${line}" stroke-width="2"/>
  ${nodes}
  <rect x="164" y="704" width="696" height="132" rx="24" fill="${card}" stroke="${line}"/>
  <text x="512" y="752" text-anchor="middle" font-family=${JSON.stringify(font)} font-size="25" font-weight="800" fill="${gold}">关键门禁</text>
  <text x="512" y="790" text-anchor="middle" font-family=${JSON.stringify(font)} font-size="20" fill="${dark}">初稿先筛选，插图要贴题，排版必须公众号兼容</text>
  <text x="512" y="820" text-anchor="middle" font-family=${JSON.stringify(font)} font-size="18" fill="${muted}">这样自动化才是生产力，不是制造更多平庸草稿</text>
  </svg>`;
}

const assets = [
  ["cover.svg", "cover.png", coverSvg()],
  ["agent-workbench.svg", "agent-workbench.png", workbenchSvg()],
  ["wechat-pipeline.svg", "wechat-pipeline.png", pipelineSvg()],
];

for (const [svgName, pngName, svg] of assets) {
  const svgPath = join(outDir, svgName);
  const pngPath = join(outDir, pngName);
  writeFileSync(svgPath, svg, "utf8");
  execFileSync("/usr/bin/sips", ["-s", "format", "png", svgPath, "--out", pngPath], { stdio: "ignore" });
  console.log(pngPath);
}
