import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const registry = JSON.parse(fs.readFileSync(path.join(root, "source-registry.json"), "utf8"));
const policyData = JSON.parse(fs.readFileSync(path.join(root, "../visa-cards/policy-data.json"), "utf8"));
const stateFile = path.join(root, "source-state.json");
const previous = fs.existsSync(stateFile) ? JSON.parse(fs.readFileSync(stateFile, "utf8")) : { sources: {} };
const normalize = html => html.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
const now = new Date().toISOString();
const next = { checkedAt: now, publishPolicy: registry.publishPolicy, sources: {} };

const registrySources = process.argv.includes("--all")
  ? [...registry.sources, ...policyData.countries.flatMap(country => {
      const application = country.application;
      return [
        ["applicationUrl", application.applicationUrl], ["officialGuideUrl", application.officialGuideUrl],
        ["documentsUrl", application.documentsUrl], ["processingUrl", application.processingUrl], ["feeUrl", application.feeUrl]
      ].map(([kind, url]) => ({ id: `${country.code.toLowerCase()}-${kind}`, countryCode: country.code, label: `${country.country}｜${kind}`, url, cadence: "monthly", risk: "high", watch: [] }));
    })]
  : registry.sources;
const uniqueSources = [...new Map(registrySources.map(source => [source.id, source])).values()];
const inspect = async source => {
  const result = { id: source.id, countryCode: source.countryCode, url: source.url, checkedAt: now };
  try {
    const response = await fetch(source.url, { headers: { "user-agent": "qdd.app policy monitor; contact hello@qdd.app" }, redirect: "follow", signal: AbortSignal.timeout(15000) });
    const text = normalize(await response.text());
    result.httpStatus = response.status;
    result.hash = crypto.createHash("sha256").update(text).digest("hex");
    result.changed = Boolean(previous.sources[source.id]?.hash && previous.sources[source.id].hash !== result.hash);
    result.watch = Object.fromEntries(source.watch.map(term => [term, text.toLowerCase().includes(term.toLowerCase())]));
    result.needsReview = !response.ok || result.changed || Object.values(result.watch).includes(false);
  } catch (error) {
    result.error = error.message;
    result.needsReview = true;
  }
  return result;
};
const results = await Promise.all(uniqueSources.map(inspect));
for (const result of results) next.sources[result.id] = result;

fs.writeFileSync(stateFile, `${JSON.stringify(next, null, 2)}\n`);
const queue = Object.values(next.sources).filter(source => source.needsReview);
console.log(JSON.stringify({ checkedAt: now, checked: uniqueSources.length, reviewQueue: queue.map(item => item.id), note: "差异只进入人工复核队列，不自动发布。" }, null, 2));
if (queue.some(item => item.error || item.httpStatus >= 400)) process.exitCode = 2;
