const CARD_BATCH_KEY = "aix-card-suite-cards-v1";

const platformProfiles = {
  x: {
    label: "X",
    size: "1200×675",
    hashtags: ["#内容创作", "#效率", "#AIGC"],
    format: "短句 + 强钩子 + 回流链接"
  },
  xiaohongshu: {
    label: "小红书",
    size: "1080×1440",
    hashtags: ["#小红书运营", "#自媒体", "#内容创作"],
    format: "场景开头 + 清单正文 + 行动引导"
  },
  wechat: {
    label: "公众号",
    size: "封面 900×383",
    hashtags: ["#公众号运营", "#私域", "#内容策略"],
    format: "标题价值明确 + 段落小标题"
  },
  zhihu: {
    label: "知乎",
    size: "建议宽度 1080",
    hashtags: ["#写作", "#内容营销", "#个人成长"],
    format: "问题导向 + 结论先行 + 证据补充"
  },
  bilibili: {
    label: "B站",
    size: "封面 16:9",
    hashtags: ["#知识分享", "#效率", "#创作经验"],
    format: "要点清晰 + 互动提问 + 视频/专栏联动"
  }
};

function $(id) {
  return document.getElementById(id);
}

function getSelectedPlatforms() {
  return Array.from(document.querySelectorAll("#platformGrid input[type='checkbox']:checked")).map((node) => node.value);
}

function readBatch() {
  const data = readJsonStorage(CARD_BATCH_KEY);
  if (!data?.cards?.length) return null;
  return data;
}

function renderBatchMeta(batch) {
  if (!batch) {
    $("batchMeta").textContent = "未检测到卡片拆分数据，请先去卡片设计器执行“自动拆分为多张”。";
    return;
  }

  const lines = [
    `来源标题：${batch.source?.cardTitle || "未命名"}`,
    `卡片数量：${batch.cards.length}`,
    `模板：${batch.source?.template || "-"}`,
    `最近更新：${new Date(batch.updatedAt).toLocaleString()}`
  ];
  $("batchMeta").textContent = lines.join("\n");

  if (!$("topic").value.trim()) {
    $("topic").value = batch.source?.cardTitle || "";
  }
}

function buildPlatformCopy(platform, topic, cta, batch) {
  const profile = platformProfiles[platform];
  const excerpt = batch?.cards?.[0]?.text?.slice(0, 68) || "本期分享核心方法，帮助你更快完成内容生产。";
  const tags = profile.hashtags.join(" ");
  return `【${profile.label}发布文案】\n主题：${topic}\n建议尺寸：${profile.size}\n表达结构：${profile.format}\n\n开场：${excerpt}\n正文：给出1-3个关键做法，并附一个真实案例或数据。\n结尾：${cta || "收藏这份方法并立刻试一次"}\n\n标签：${tags}`;
}

function renderOutputs() {
  const batch = readBatch();
  const topic = $("topic").value.trim() || "内容创作提效";
  const cta = $("cta").value.trim() || "收藏并转发给需要的人";
  const selected = getSelectedPlatforms();

  const container = $("outputs");
  container.innerHTML = "";

  if (!selected.length) {
    container.innerHTML = '<p class="muted">请至少选择一个平台。</p>';
    return;
  }

  selected.forEach((platform) => {
    const profile = platformProfiles[platform];
    const text = buildPlatformCopy(platform, topic, cta, batch);
    const node = document.createElement("article");
    node.className = "output-card";
    node.innerHTML = `
      <h4>${profile.label}</h4>
      <textarea rows="8">${text}</textarea>
      <div class="actions">
        <button class="btn" data-copy="1">复制${profile.label}文案</button>
      </div>
    `;
    node.querySelector("button[data-copy='1']").addEventListener("click", () => {
      copyText(node.querySelector("textarea").value, `${profile.label} 文案已复制`);
    });
    container.appendChild(node);
  });
}

function copyAll() {
  const allText = Array.from(document.querySelectorAll("#outputs textarea"))
    .map((el) => el.value.trim())
    .filter(Boolean)
    .join("\n\n---\n\n");
  if (!allText) {
    showToast("请先生成发布包");
    return;
  }
  copyText(allText, "全部文案已复制");
}

function downloadPlan() {
  const allText = Array.from(document.querySelectorAll("#outputs textarea"))
    .map((el) => el.value.trim())
    .filter(Boolean)
    .join("\n\n---\n\n");
  if (!allText) {
    showToast("请先生成发布包");
    return;
  }
  const checklist = [
    "[ ] 发布前 2-6 小时预热",
    "[ ] 发布后 1 小时回复首波评论",
    "[ ] 24 小时内二次分发",
    "[ ] 72 小时做复盘"
  ].join("\n");
  downloadFile(`publish-pack-${nowTag()}.md`, `${allText}\n\n## 执行清单\n${checklist}`, "text/markdown;charset=utf-8");
}

window.addEventListener("DOMContentLoaded", () => {
  const batch = readBatch();
  renderBatchMeta(batch);
  renderOutputs();

  $("generateBtn").addEventListener("click", renderOutputs);
  $("copyAllBtn").addEventListener("click", copyAll);
  $("downloadPlanBtn").addEventListener("click", downloadPlan);

  ["topic", "cta"].forEach((id) => {
    $(id).addEventListener("input", renderOutputs);
  });

  document.querySelectorAll("#platformGrid input[type='checkbox']").forEach((node) => {
    node.addEventListener("change", renderOutputs);
  });
});
