import { detectTermsOfService, extractMainContent } from "./detector";
import { FloatingButton } from "./floating-button";
import { ResultsOverlay } from "./overlay";

// Prevent double-injection
if (!(window as unknown as Record<string, boolean>).__fineprint_loaded) {
  (window as unknown as Record<string, boolean>).__fineprint_loaded = true;
  init();
}

function init() {
  let fab: FloatingButton | null = null;
  let overlay: ResultsOverlay | null = null;
  let currentText = "";

  const detection = detectTermsOfService();
  if (detection.isToS) {
    ({ fab, overlay } = createUI());
    fab.setState("detected");
  }

  function createUI() {
    if (fab && overlay) return { fab, overlay };

    const f = new FloatingButton();
    const o = new ResultsOverlay();

    o.setOnToggle((open) => f.setOverlayOpen(open));
    o.setOnSave(async (data) => {
      o.setSaveState("saving");
      const response = await sendMessage({ type: "SAVE_ANALYSIS", payload: data });
      if (response?.type === "SAVE_RESULT") {
        const { appUrl } = response.payload as { id: string; appUrl: string };
        o.setSaveState("saved", appUrl);
      } else {
        o.setSaveState("error");
      }
    });

    f.setOnClick(() => runAnalysis());

    return { fab: f, overlay: o };
  }

  async function runAnalysis() {
    if (!fab || !overlay) {
      ({ fab, overlay } = createUI());
    }

    const state = fab!.getState();
    if (state === "done" || state === "error") {
      overlay!.toggle();
      return;
    }
    if (state === "analyzing") return;

    const authResponse = await sendMessage({ type: "GET_AUTH_STATUS" });
    if (!authResponse?.payload?.authenticated) {
      window.open("https://fineprint.dev/extension/auth", "_blank");
      return;
    }

    fab!.setState("analyzing");
    currentText = extractMainContent();
    const title = detection.title || document.title || window.location.hostname;

    const response = await sendMessage({
      type: "ANALYZE_PAGE",
      payload: { text: currentText, title, url: window.location.href },
    });

    if (response?.type === "ANALYSIS_RESULT") {
      const { result } = response.payload as {
        result: import("@shared/types").AnalyzeApiResponse;
        title: string;
        url: string;
      };
      fab!.setState("done", result.overall_risk_score);
      overlay!.show(result, title, window.location.href, currentText);
    } else {
      const errorMsg = (response?.payload as { error?: string })?.error ?? "Analysis failed";
      fab!.setState("error", undefined, errorMsg);
      overlay!.showError(errorMsg, window.location.href);
    }
  }

  // Listen for manual trigger from the popup
  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.type === "TRIGGER_ANALYSIS") {
      runAnalysis();
      sendResponse({ ok: true });
    }
  });

  // Listen for auth token from the auth page
  window.addEventListener("message", (event) => {
    if (event.data?.source === "fineprint-auth" && event.data?.type === "AUTH_TOKEN") {
      chrome.runtime.sendMessage({
        type: "AUTH_TOKEN",
        payload: { token: event.data.token },
      });
    }
  });
}

function sendMessage(message: {
  type: string;
  payload?: unknown;
}): Promise<{ type: string; payload: Record<string, unknown> } | null> {
  return new Promise((resolve) => {
    try {
      chrome.runtime.sendMessage(message, (response) => {
        if (chrome.runtime.lastError) {
          console.error("[FinePrint]", chrome.runtime.lastError.message);
          resolve(null);
          return;
        }
        resolve(response ?? null);
      });
    } catch {
      resolve(null);
    }
  });
}
