const API_BASE = "https://fineprint.dev";

const signedOutEl = document.getElementById("signed-out")!;
const signedInEl = document.getElementById("signed-in")!;
const signInBtn = document.getElementById("sign-in-btn")!;
const signOutBtn = document.getElementById("sign-out-btn")!;
const analyzeBtn = document.getElementById("analyze-btn")!;
const userAvatar = document.getElementById("user-avatar") as HTMLDivElement;
const userName = document.getElementById("user-name")!;
const userEmail = document.getElementById("user-email")!;
const appLink = document.getElementById("app-link") as HTMLAnchorElement;
const autoDetectToggle = document.getElementById("auto-detect-toggle") as HTMLInputElement;
const recentSection = document.getElementById("recent-section")!;
const recentList = document.getElementById("recent-list")!;

async function checkAuth() {
  return new Promise<boolean>((resolve) => {
    chrome.runtime.sendMessage({ type: "GET_AUTH_STATUS" }, (response) => {
      resolve(response?.payload?.authenticated ?? false);
    });
  });
}

async function loadUserInfo() {
  const result = await chrome.storage.local.get(["fp_token", "fp_user_info"]);
  if (result.fp_user_info) {
    const info = result.fp_user_info;
    userName.textContent = [info.first_name, info.last_name].filter(Boolean).join(" ") || "User";
    userEmail.textContent = info.email ?? "";
    if (info.image_url) {
      const img = document.createElement("img");
      img.className = "fp-popup-avatar";
      img.src = info.image_url;
      img.alt = "";
      userAvatar.replaceWith(img);
    }
  } else {
    userName.textContent = "Signed In";
    userEmail.textContent = "";
  }
}

async function loadRecent() {
  const result = await chrome.storage.local.get("fp_last_analysis");
  if (result.fp_last_analysis) {
    const { title, url, result: analysis, timestamp } = result.fp_last_analysis;
    let recentSummary = "No clauses flagged";
    let level = "low";

    if (Array.isArray(analysis?.clauses) && analysis.clauses.length > 0) {
      const counts = analysis.clauses.reduce(
        (acc, clause) => {
          if (clause.severity === "HIGH") acc.high += 1;
          else if (clause.severity === "MEDIUM") acc.medium += 1;
          else acc.low += 1;
          return acc;
        },
        { high: 0, medium: 0, low: 0 },
      );
      level = counts.high > 0 ? "high" : counts.medium > 0 ? "medium" : "low";
      recentSummary = `${counts.high} high, ${counts.medium} medium, ${counts.low} low`;
    } else {
      const score = analysis?.overall_risk_score ?? 0;
      level = score >= 7 ? "high" : score >= 4 ? "medium" : "low";
      recentSummary = `Score: ${score}`;
    }

    recentSection.style.display = "block";
    recentList.innerHTML = `
      <a href="${escapeAttr(url)}" target="_blank" class="fp-popup-recent-item">
        <span class="fp-popup-recent-title">${escapeHtml(title)}</span>
        <span class="fp-popup-recent-score fp-popup-recent-score--${level}">${escapeHtml(recentSummary)}</span>
      </a>
    `;
  }
}

async function loadSettings() {
  const result = await chrome.storage.local.get("fp_auto_detect");
  autoDetectToggle.checked = result.fp_auto_detect !== false;
}

signInBtn.addEventListener("click", () => {
  chrome.tabs.create({ url: `${API_BASE}/extension/auth` });
  window.close();
});

analyzeBtn.addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) return;
  chrome.tabs.sendMessage(tab.id, { type: "TRIGGER_ANALYSIS" });
  window.close();
});

signOutBtn.addEventListener("click", () => {
  chrome.runtime.sendMessage({ type: "SIGN_OUT" }, () => {
    chrome.storage.local.remove(["fp_token", "fp_user_info", "fp_last_analysis"]);
    showSignedOut();
  });
});

autoDetectToggle.addEventListener("change", () => {
  chrome.storage.local.set({ fp_auto_detect: autoDetectToggle.checked });
});

appLink.href = `${API_BASE}/dashboard`;

function showSignedIn() {
  signedOutEl.style.display = "none";
  signedInEl.style.display = "block";
}

function showSignedOut() {
  signedOutEl.style.display = "block";
  signedInEl.style.display = "none";
}

function escapeHtml(str: string): string {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function escapeAttr(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

(async () => {
  const authed = await checkAuth();
  if (authed) {
    showSignedIn();
    await Promise.all([loadUserInfo(), loadRecent(), loadSettings()]);
  } else {
    showSignedOut();
  }
})();
