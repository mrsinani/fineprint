import { analyzeText, saveAnalysis, isAuthenticated, getAppUrl } from "../api/client";

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = atob(parts[1].replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(payload);
  } catch {
    return null;
  }
}

function storeTokenAndUserInfo(token: string): Promise<void> {
  const claims = decodeJwtPayload(token);
  const userInfo = claims
    ? {
        email: claims.email ?? null,
        first_name: claims.first_name ?? null,
        last_name: claims.last_name ?? null,
        image_url: claims.image_url ?? null,
      }
    : null;

  const data: Record<string, unknown> = { fp_token: token };
  if (userInfo) data.fp_user_info = userInfo;
  return chrome.storage.local.set(data);
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "GET_AUTH_STATUS") {
    isAuthenticated().then((authed) => {
      sendResponse({ type: "AUTH_STATUS", payload: { authenticated: authed } });
    });
    return true;
  }

  if (message.type === "SIGN_OUT") {
    chrome.storage.local.remove("fp_token").then(() => {
      sendResponse({ type: "AUTH_STATUS", payload: { authenticated: false } });
    });
    return true;
  }

  if (message.type === "ANALYZE_PAGE") {
    const { text, title, url } = message.payload as {
      text: string;
      title: string;
      url: string;
    };

    analyzeText(text)
      .then((result) => {
        chrome.storage.local.set({
          fp_last_analysis: { result, title, url, timestamp: Date.now() },
        });
        sendResponse({ type: "ANALYSIS_RESULT", payload: { result, title, url } });
      })
      .catch((err) => {
        sendResponse({
          type: "ANALYSIS_ERROR",
          payload: { error: err.message ?? "Analysis failed" },
        });
      });
    return true;
  }

  if (message.type === "AUTH_TOKEN" && message.payload?.token) {
    storeTokenAndUserInfo(message.payload.token as string).then(() => {
      sendResponse({ type: "AUTH_STATUS", payload: { authenticated: true } });
    });
    return true;
  }

  if (message.type === "SAVE_ANALYSIS") {
    const { title, sourceUrl, rawText, analysisResult } = message.payload as {
      title: string;
      sourceUrl: string;
      rawText: string;
      analysisResult: Parameters<typeof saveAnalysis>[0]["analysisResult"];
    };

    saveAnalysis({ title, sourceUrl, rawText, analysisResult })
      .then((res) => {
        sendResponse({
          type: "SAVE_RESULT",
          payload: { id: res.id, appUrl: getAppUrl(`/documents/${res.id}`) },
        });
      })
      .catch((err) => {
        sendResponse({
          type: "ANALYSIS_ERROR",
          payload: { error: err.message ?? "Save failed" },
        });
      });
    return true;
  }

  return false;
});

// Handle auth token from the web app auth page (external messaging)
chrome.runtime.onMessageExternal.addListener((message, _sender, sendResponse) => {
  if (message.type === "AUTH_TOKEN" && message.payload?.token) {
    storeTokenAndUserInfo(message.payload.token as string).then(() => {
      sendResponse({ success: true });
    });
    return true;
  }
  return false;
});
