const COPY_STATE_KEY = "aix-card-suite-copy-v1";
const DESIGNER_INPUT_KEY = "aix-card-suite-designer-input";

const scenarioGuides = {
  xhs: "开场先给场景冲突 + 3条清单 + 结尾互动问题",
  "x-thread": "首条用强钩子，后续按观点分段，末条回流主文",
  wechat: "标题价值明确，正文小标题分段，结尾给行动建议",
  quote: "一句核心观点 + 一句解释 + 一句行动",
  ad: "用户痛点-方案-证据-行动，避免绝对化承诺"
};

function $(id) {
  return document.getElementById(id);
}

function getState() {
  return {
    scenario: $("scenario").value,
    platform: $("platform").value,
    tone: $("tone").value,
    length: $("length").value,
    topic: $("topic").value.trim(),
    audience: $("audience").value.trim(),
    thesis: $("thesis").value.trim(),
    cta: $("cta").value.trim(),
    draftOutput: $("draftOutput").value,
    promptOutput: $("promptOutput").value
  };
}

function setState(state) {
  if (!state) return;
  ["scenario", "platform", "tone", "length", "topic", "audience", "thesis", "cta", "draftOutput", "promptOutput"].forEach((key) => {
    if ($(key) && typeof state[key] !== "undefined") {
      $(key).value = state[key];
    }
  });
}

function buildDraft(state) {
  const topic = state.topic || "你的主题";
  const audience = state.audience || "目标读者";
  const thesis = state.thesis || "请在这里补充核心观点";
  const cta = state.cta || "收藏并尝试一次";

  return `# ${topic}\n\n你是否也发现：很多 ${audience} 在内容创作上投入很多时间，却很难稳定产出高质量结果。\n\n## 核心观点\n${thesis}\n\n## 三步做法\n1. 先把结论写出来，再补证据。\n2. 每段只讲一件事，确保手机上 2-4 行可读。\n3. 发布后 24h 内做二次分发与评论互动。\n\n## 可直接执行\n今天就把你上一条内容按这个结构重写一次，比较前后表现差异。\n\n**${cta}**`;
}

function buildPrompt(state) {
  return `你是资深内容主编。请围绕以下参数，产出一版可直接发布的 ${state.platform} 文案。\n\n参数：\n- 场景：${state.scenario}\n- 场景要求：${scenarioGuides[state.scenario]}\n- 平台：${state.platform}\n- 语气：${state.tone}\n- 长度：${state.length}\n- 主题：${state.topic || "（请补充）"}\n- 受众：${state.audience || "（请补充）"}\n- 核心观点：${state.thesis || "（请补充）"}\n- CTA：${state.cta || "（请补充）"}\n\n输出要求：\n1. 标题 + 正文 + 结尾行动引导。\n2. 适合移动端扫读，段落尽量 2-4 行。\n3. 避免绝对化承诺和夸大表达。\n4. 输出 Markdown。`;
}

function saveState() {
  localStorage.setItem(COPY_STATE_KEY, JSON.stringify(getState()));
}

function loadState() {
  setState(readJsonStorage(COPY_STATE_KEY));
}

function generate() {
  const state = getState();
  $("draftOutput").value = buildDraft(state);
  $("promptOutput").value = buildPrompt(state);
  saveState();
  showToast("已生成草稿与提示词");
}

function importSharedDraft() {
  const draft = getSharedDraftText();
  if (!draft) {
    showToast("未找到可导入草稿，请先在主工具或排版工坊保存内容");
    return;
  }
  $("draftOutput").value = draft;
  if (!$("topic").value.trim()) {
    const firstHeading = draft.match(/^#\s+(.+)$/m);
    if (firstHeading) $("topic").value = firstHeading[1].trim();
  }
  saveState();
  showToast("已导入共享草稿");
}

function sendToDesigner() {
  const content = $("draftOutput").value.trim();
  if (!content) {
    showToast("请先生成或粘贴草稿");
    return;
  }
  localStorage.setItem(
    DESIGNER_INPUT_KEY,
    JSON.stringify({
      text: content,
      topic: $("topic").value.trim(),
      platform: $("platform").value,
      updatedAt: Date.now()
    })
  );
  showToast("已发送到卡片设计器");
  setTimeout(() => {
    window.location.href = "/card-suite/card-designer.html";
  }, 220);
}

window.addEventListener("DOMContentLoaded", () => {
  loadState();
  if (!$("draftOutput").value.trim()) {
    generate();
  }

  $("generateBtn").addEventListener("click", generate);
  $("importDraftBtn").addEventListener("click", importSharedDraft);
  $("toCardBtn").addEventListener("click", sendToDesigner);

  $("copyDraftBtn").addEventListener("click", () => copyText($("draftOutput").value, "草稿已复制"));
  $("downloadDraftBtn").addEventListener("click", () => {
    downloadFile(`card-copy-${nowTag()}.md`, $("draftOutput").value, "text/markdown;charset=utf-8");
  });
  $("copyPromptBtn").addEventListener("click", () => copyText($("promptOutput").value, "提示词已复制"));

  ["scenario", "platform", "tone", "length", "topic", "audience", "thesis", "cta", "draftOutput"].forEach((id) => {
    $(id).addEventListener("input", saveState);
  });
});
