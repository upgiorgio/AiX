const X_DRAFT_KEY = "x-articles-studio-draft";
const MD_LAB_KEY = "aix-md-lab-state-v1";

function showToast(message) {
  const node = document.createElement("div");
  node.textContent = message;
  Object.assign(node.style, {
    position: "fixed",
    right: "14px",
    bottom: "14px",
    padding: "10px 12px",
    borderRadius: "10px",
    border: "1px solid rgba(150, 206, 234, .5)",
    background: "#10273a",
    color: "#ebf6ff",
    zIndex: "9999",
    boxShadow: "0 14px 34px rgba(0,0,0,.35)"
  });
  document.body.appendChild(node);
  setTimeout(() => node.remove(), 1500);
}

function readJsonStorage(key) {
  try {
    return JSON.parse(localStorage.getItem(key) || "null");
  } catch {
    return null;
  }
}

function getSharedDraftText() {
  const xDraft = readJsonStorage(X_DRAFT_KEY);
  const mdLab = readJsonStorage(MD_LAB_KEY);
  const candidates = [
    xDraft?.articleOutput,
    xDraft?.state?.article,
    mdLab?.markdown
  ];
  return String(candidates.find((item) => typeof item === "string" && item.trim()) || "").trim();
}

async function copyText(text, doneText = "已复制") {
  try {
    await navigator.clipboard.writeText(String(text || ""));
    showToast(doneText);
    return true;
  } catch {
    showToast("复制失败，请检查浏览器权限");
    return false;
  }
}

function downloadFile(filename, content, type = "text/plain;charset=utf-8") {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function nowTag() {
  const d = new Date();
  const mm = `${d.getMonth() + 1}`.padStart(2, "0");
  const dd = `${d.getDate()}`.padStart(2, "0");
  const hh = `${d.getHours()}`.padStart(2, "0");
  const mi = `${d.getMinutes()}`.padStart(2, "0");
  return `${d.getFullYear()}${mm}${dd}-${hh}${mi}`;
}

// Auto-mark current page in nav-links
(function () {
  const cur = location.pathname.replace(/\.html$/, "").replace(/\/$/, "");
  document.querySelectorAll(".nav-links a[href]").forEach(a => {
    try {
      const linkPath = new URL(a.href, location.origin).pathname.replace(/\.html$/, "").replace(/\/$/, "");
      if (linkPath && linkPath === cur) {
        a.classList.add("active");
      }
    } catch (_) {}
  });
})();
