import type { AnalyzeApiResponse } from "@shared/types";

export type ButtonState = "idle" | "detected" | "analyzing" | "done" | "error";

const STYLES = `
  :host {
    all: initial;
    position: fixed;
    bottom: 24px;
    right: 24px;
    z-index: 2147483647;
    font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
    transition: right 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .fp-fab {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 16px;
    border: none;
    border-radius: 50px;
    cursor: pointer;
    font-size: 13px;
    font-weight: 600;
    line-height: 1;
    white-space: nowrap;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 4px 24px rgba(0,0,0,0.15), 0 0 0 1px rgba(255,255,255,0.05);
    color: #fff;
  }

  .fp-fab:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 32px rgba(0,0,0,0.25), 0 0 0 1px rgba(255,255,255,0.1);
  }

  .fp-fab--idle {
    background: #1a2030;
    opacity: 0.7;
    padding: 10px;
  }
  .fp-fab--idle:hover { opacity: 1; }

  .fp-fab--detected {
    background: linear-gradient(135deg, #0d9488, #14b8a6);
    animation: fp-pulse 2s ease-in-out infinite;
  }

  .fp-fab--analyzing {
    background: #1a2030;
    pointer-events: none;
  }

  .fp-fab--done {
    background: linear-gradient(135deg, #059669, #10b981);
  }

  .fp-fab--error {
    background: linear-gradient(135deg, #dc2626, #ef4444);
  }

  @keyframes fp-pulse {
    0%, 100% { box-shadow: 0 4px 24px rgba(0,0,0,0.15), 0 0 0 0 rgba(20,184,166,0.4); }
    50% { box-shadow: 0 4px 24px rgba(0,0,0,0.15), 0 0 0 8px rgba(20,184,166,0); }
  }

  .fp-icon {
    width: 20px;
    height: 20px;
    flex-shrink: 0;
  }

  .fp-spinner {
    width: 18px;
    height: 18px;
    border: 2px solid rgba(255,255,255,0.3);
    border-top-color: #fff;
    border-radius: 50%;
    animation: fp-spin 0.8s linear infinite;
  }

  @keyframes fp-spin {
    to { transform: rotate(360deg); }
  }

  .fp-badge {
    background: rgba(255,255,255,0.2);
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 11px;
    font-weight: 700;
  }
`;

const FP_LOGO_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="fp-icon"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>`;

const CHECK_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="fp-icon"><polyline points="20 6 9 17 4 12"/></svg>`;

const ALERT_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="fp-icon"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`;

export class FloatingButton {
  private shadow: ShadowRoot;
  private button: HTMLButtonElement;
  private state: ButtonState = "idle";
  private onClick: (() => void) | null = null;
  private riskScore: number | null = null;
  private errorMessage: string | null = null;

  constructor() {
    const host = document.createElement("div");
    host.id = "fineprint-fab-host";
    this.shadow = host.attachShadow({ mode: "closed" });

    const style = document.createElement("style");
    style.textContent = STYLES;
    this.shadow.appendChild(style);

    this.button = document.createElement("button");
    this.button.className = "fp-fab fp-fab--idle";
    this.button.setAttribute("aria-label", "FinePrint - Analyze Terms of Service");
    this.button.addEventListener("click", () => this.onClick?.());
    this.shadow.appendChild(this.button);

    document.body.appendChild(host);
    this.render();
  }

  setOnClick(handler: () => void) {
    this.onClick = handler;
  }

  setOverlayOpen(open: boolean) {
    (this.shadow.host as HTMLElement).style.right = open ? "444px" : "24px";
  }

  setState(state: ButtonState, riskScore?: number, errorMessage?: string) {
    this.state = state;
    if (riskScore !== undefined) this.riskScore = riskScore;
    this.errorMessage = errorMessage ?? null;
    this.render();
  }

  getState(): ButtonState {
    return this.state;
  }

  private render() {
    this.button.className = `fp-fab fp-fab--${this.state}`;

    switch (this.state) {
      case "idle":
        this.button.innerHTML = FP_LOGO_SVG;
        this.button.setAttribute("aria-label", "FinePrint");
        break;

      case "detected":
        this.button.innerHTML = `${FP_LOGO_SVG}<span>Terms of Service detected</span>`;
        this.button.setAttribute("aria-label", "Terms of Service detected - click to analyze");
        break;

      case "analyzing":
        this.button.innerHTML = `<div class="fp-spinner"></div><span>Analyzing...</span>`;
        this.button.setAttribute("aria-label", "Analyzing terms of service");
        break;

      case "done":
        this.button.innerHTML = `${CHECK_SVG}<span>Analysis ready</span>${
          this.riskScore !== null
            ? `<span class="fp-badge">${this.riskScore}/100</span>`
            : ""
        }`;
        this.button.setAttribute("aria-label", "Analysis complete - click to view");
        break;

      case "error": {
        const label = this.errorMessage
          ? truncate(this.errorMessage, 50)
          : "Analysis failed";
        this.button.innerHTML = `${ALERT_SVG}<span>${escapeHtml(label)}</span>`;
        this.button.setAttribute("aria-label", this.errorMessage ?? "Analysis failed - click to retry");
        break;
      }
    }
  }

  getErrorMessage(): string | null {
    return this.errorMessage;
  }

  destroy() {
    this.shadow.host.remove();
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function truncate(str: string, max: number): string {
  if (str.length <= max) return str;
  const end = str.lastIndexOf(" ", max);
  return str.slice(0, end > 0 ? end : max) + "…";
}
