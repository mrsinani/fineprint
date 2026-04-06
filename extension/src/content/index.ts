import { detectTermsOfService, extractMainContent } from "./detector";
import { FloatingButton } from "./floating-button";
import { ResultsOverlay } from "./overlay";

// Prevent double-injection
if (!(window as unknown as Record<string, boolean>).__fineprint_loaded) {
  (window as unknown as Record<string, boolean>).__fineprint_loaded = true;
  init();
}

function init() {
  const fab = new FloatingButton();
  const overlay = new ResultsOverlay();
  let currentText = "";

  // Run detection
  const detection = detectTermsOfService();
  if (detection.isToS) {
    fab.setState("detected");
  }

  fab.setOnClick(async () => {
    const state = fab.getState();

    if (state === "done" || state === "error") {
      overlay.toggle();
      return;
    }

    if (state === "analyzing") return;

    // Check auth first
    const authResponse = await sendMessage({ type: "GET_AUTH_STATUS" });
    if (!authResponse?.payload?.authenticated) {
      const authUrl =
        import.meta.env.MODE === "development"
          ? "http://localhost:3001/extension/auth"
          : "https://fineprint.dev/extension/auth";
      window.open(authUrl, "_blank");
      return;
    }

    // Extract text and analyze
    fab.setState("analyzing");
    currentText = extractMainContent();
    const title = detection.title || document.title || window.location.hostname;

    const response = await sendMessage({
      type: "ANALYZE_PAGE",
      payload: {
        text: currentText,
        title,
        url: window.location.href,
      },
    });

    if (response?.type === "ANALYSIS_RESULT") {
      const { result } = response.payload as {
        result: import("@shared/types").AnalyzeApiResponse;
        title: string;
        url: string;
      };
      fab.setState("done", result.overall_risk_score);
      overlay.show(result, title, window.location.href, currentText);
    } else {
      const errorMsg = (response?.payload as { error?: string })?.error ?? "Analysis failed";
      fab.setState("error", undefined, errorMsg);
      overlay.showError(errorMsg, window.location.href);
    }
  });

  overlay.setOnToggle((open) => {
    fab.setOverlayOpen(open);
  });

  overlay.setOnSave(async (data) => {
    overlay.setSaveState("saving");

    const response = await sendMessage({
      type: "SAVE_ANALYSIS",
      payload: data,
    });

    if (response?.type === "SAVE_RESULT") {
      const { appUrl } = response.payload as { id: string; appUrl: string };
      overlay.setSaveState("saved", appUrl);
    } else {
      overlay.setSaveState("error");
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
