import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const dist = path.join(root, "dist");
const policyData = JSON.parse(fs.readFileSync(path.resolve(root, "../visa-cards/policy-data.json"), "utf8"));
const htmlFiles = [];

function walk(folder) {
  for (const entry of fs.readdirSync(folder, { withFileTypes: true })) {
    const full = path.join(folder, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.name.endsWith(".html")) htmlFiles.push(full);
  }
}

walk(dist);
const expectedHtml = 2 + (policyData.countries.length * 2);
if (htmlFiles.length !== expectedHtml) throw new Error(`Expected ${expectedHtml} HTML files, found ${htmlFiles.length}`);

for (const file of htmlFiles) {
  const html = fs.readFileSync(file, "utf8");
  const isCardTool = file.includes(`${path.sep}cards${path.sep}`);
  for (const required of ["<title>", 'name="description"', "qdd.app"]) {
    if (!html.includes(required)) throw new Error(`${file} missing ${required}`);
  }
  if (isCardTool) continue;
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
