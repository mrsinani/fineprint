import type { AnalyzeApiResponse } from "@shared/types";

const OVERLAY_STYLES = `
  :host {
    all: initial;
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    z-index: 2147483646;
    font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
    pointer-events: none;
  }

  .fp-overlay {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    width: 420px;
    max-width: 100vw;
    background: #fafbfc;
    border-left: 1px solid #d5d9e2;
    box-shadow: -8px 0 32px rgba(0,0,0,0.08);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    transform: translateX(100%);
    transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
    pointer-events: auto;
  }

  .fp-overlay--open {
    transform: translateX(0);
  }

  .fp-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    border-bottom: 1px solid #d5d9e2;
    background: #fff;
    flex-shrink: 0;
  }

  .fp-header-left {
    flex: 1;
    min-width: 0;
  }

  .fp-title {
    font-size: 15px;
    font-weight: 700;
    color: #1a2030;
    margin: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .fp-subtitle {
    font-size: 12px;
    color: #6b7585;
    margin-top: 2px;
  }

  .fp-score-badge {
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    min-width: 170px;
    padding: 12px 14px;
    border-radius: 18px;
    font-weight: 700;
    color: #fff;
    margin-left: 12px;
  }

  .fp-score-badge .fp-score-title {
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    opacity: 0.85;
    margin: 0 0 4px 0;
  }

  .fp-score-badge .fp-score-value {
    font-size: 14px;
    margin: 0;
    line-height: 1.2;
  }

  .fp-score-badge .fp-score-meta {
    font-size: 11px;
    opacity: 0.85;
    margin-top: 4px;
  }

  .fp-score--low { background: #059669; }
  .fp-score--medium { background: #d97706; }
  .fp-score--high { background: #dc2626; }

  .fp-close {
    background: none;
    border: none;
    cursor: pointer;
    padding: 6px;
    margin-left: 8px;
    border-radius: 6px;
    color: #6b7585;
    flex-shrink: 0;
  }
  .fp-close:hover { background: #eef0f3; color: #1a2030; }

  .fp-body {
    flex: 1;
    overflow-y: auto;
    padding: 20px;
  }

  .fp-section {
    margin-bottom: 24px;
  }

  .fp-section-title {
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #8b95a5;
    margin: 0 0 10px 0;
  }

  .fp-overview {
    font-size: 14px;
    line-height: 1.6;
    color: #2d3544;
    margin: 0;
  }

  .fp-bullets {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .fp-bullets li {
    position: relative;
    padding: 6px 0 6px 16px;
    font-size: 13px;
    line-height: 1.5;
    color: #4a5464;
  }

  .fp-bullets li::before {
    content: '';
    position: absolute;
    left: 0;
    top: 13px;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #14b8a6;
  }

  .fp-clause {
    padding: 12px;
    border-radius: 10px;
    border: 1px solid #eef0f3;
    background: #fff;
    margin-bottom: 10px;
  }

  .fp-clause-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 6px;
  }

  .fp-severity {
    display: inline-block;
    padding: 2px 8px;
    border-radius: 10px;
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.03em;
  }

  .fp-severity--HIGH { background: #fef2f2; color: #dc2626; }
  .fp-severity--MEDIUM { background: #fffbeb; color: #d97706; }
  .fp-severity--LOW { background: #f0fdf4; color: #059669; }

  .fp-clause-section {
    font-size: 12px;
    color: #8b95a5;
  }

  .fp-clause-explanation {
    font-size: 13px;
    line-height: 1.5;
    color: #2d3544;
    margin: 0 0 8px 0;
  }

  .fp-clause-quote {
    font-size: 12px;
    line-height: 1.5;
    color: #6b7585;
    padding: 8px 12px;
    border-left: 3px solid #d5d9e2;
    margin: 0 0 8px 0;
    background: #f5f6f8;
    border-radius: 0 6px 6px 0;
  }

  .fp-clause-rec {
    font-size: 12px;
    color: #0d9488;
    font-weight: 500;
    margin: 0;
  }

  .fp-action-item {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 10px 12px;
    border-radius: 8px;
    background: #fff;
    border: 1px solid #eef0f3;
    margin-bottom: 8px;
  }

  .fp-action-priority {
    flex-shrink: 0;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    margin-top: 5px;
  }

  .fp-action-priority--HIGH { background: #dc2626; }
  .fp-action-priority--MEDIUM { background: #d97706; }
  .fp-action-priority--LOW { background: #059669; }

  .fp-action-text { flex: 1; min-width: 0; }
  .fp-action-title {
    font-size: 13px;
    font-weight: 600;
    color: #1a2030;
    margin: 0;
  }
  .fp-action-desc {
    font-size: 12px;
    color: #6b7585;
    margin: 2px 0 0 0;
    line-height: 1.4;
  }

  .fp-footer {
    display: flex;
    gap: 8px;
    padding: 16px 20px;
    border-top: 1px solid #d5d9e2;
    background: #fff;
    flex-shrink: 0;
  }

  .fp-btn {
    flex: 1;
    padding: 10px 16px;
    border: none;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    text-align: center;
    text-decoration: none;
    transition: all 0.2s;
  }

  .fp-btn--primary {
    background: linear-gradient(135deg, #0d9488, #14b8a6);
    color: #fff;
  }
  .fp-btn--primary:hover { filter: brightness(1.1); }
  .fp-btn--primary:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .fp-btn--secondary {
    background: #eef0f3;
    color: #2d3544;
  }
  .fp-btn--secondary:hover { background: #d5d9e2; }

  .fp-save-status {
    font-size: 12px;
    color: #059669;
    text-align: center;
    padding: 8px;
  }

  .fp-error-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 48px 32px;
    text-align: center;
    flex: 1;
  }

  .fp-error-icon {
    width: 48px;
    height: 48px;
    color: #dc2626;
    margin-bottom: 16px;
  }

  .fp-error-title {
    font-size: 16px;
    font-weight: 700;
    color: #1a2030;
    margin: 0 0 12px 0;
  }

  .fp-error-message {
    font-size: 14px;
    line-height: 1.6;
    color: #4a5464;
    margin: 0 0 24px 0;
    max-width: 340px;
  }

  .fp-error-context {
    font-size: 12px;
    color: #8b95a5;
    word-break: break-all;
    margin: 0;
    max-width: 340px;
  }
`;

const CLOSE_SVG = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;

export class ResultsOverlay {
  private shadow: ShadowRoot;
  private panel: HTMLDivElement;
  private isOpen = false;
  private analysisData: AnalyzeApiResponse | null = null;
  private lastError: string | null = null;
  private pageTitle = "";
  private pageUrl = "";
  private pageText = "";
  private onSave: ((data: {
    title: string;
    sourceUrl: string;
    rawText: string;
    analysisResult: AnalyzeApiResponse;
  }) => void) | null = null;
  private saveState: "idle" | "saving" | "saved" | "error" = "idle";
  private savedAppUrl: string | null = null;
  private onToggle: ((open: boolean) => void) | null = null;

  constructor() {
    const host = document.createElement("div");
    host.id = "fineprint-overlay-host";
    this.shadow = host.attachShadow({ mode: "closed" });

    const style = document.createElement("style");
    style.textContent = OVERLAY_STYLES;
    this.shadow.appendChild(style);

    this.panel = document.createElement("div");
    this.panel.className = "fp-overlay";
    this.shadow.appendChild(this.panel);

    document.body.appendChild(host);
  }

  setOnSave(handler: typeof this.onSave) {
    this.onSave = handler;
  }

  setOnToggle(handler: (open: boolean) => void) {
    this.onToggle = handler;
  }

  show(result: AnalyzeApiResponse, title: string, url: string, text: string) {
    this.analysisData = result;
    this.lastError = null;
    this.pageTitle = title;
    this.pageUrl = url;
    this.pageText = text;
    this.saveState = "idle";
    this.savedAppUrl = null;
    this.render();
    requestAnimationFrame(() => {
      this.panel.classList.add("fp-overlay--open");
      this.isOpen = true;
      this.onToggle?.(true);
    });
  }

  showError(errorMessage: string, url: string) {
    this.analysisData = null;
    this.lastError = errorMessage;
    this.pageTitle = "";
    this.pageUrl = url;
    this.pageText = "";
    this.saveState = "idle";
    this.savedAppUrl = null;
    this.renderError(errorMessage);
    requestAnimationFrame(() => {
      this.panel.classList.add("fp-overlay--open");
      this.isOpen = true;
      this.onToggle?.(true);
    });
  }

  hide() {
    this.panel.classList.remove("fp-overlay--open");
    this.isOpen = false;
    this.onToggle?.(false);
  }

  toggle() {
    if (this.isOpen) {
      this.hide();
    } else if (this.analysisData) {
      this.show(this.analysisData, this.pageTitle, this.pageUrl, this.pageText);
    } else if (this.lastError) {
      this.showError(this.lastError, this.pageUrl);
    }
  }

  isVisible() {
    return this.isOpen;
  }

  setSaveState(state: typeof this.saveState, appUrl?: string) {
    this.saveState = state;
    if (appUrl) this.savedAppUrl = appUrl;
    this.renderFooter();
  }

  private renderError(errorMessage: string) {
    this.panel.innerHTML = "";

    const style = document.createElement("style");
    style.textContent = OVERLAY_STYLES;
    this.panel.appendChild(style);

    const header = document.createElement("div");
    header.className = "fp-header";
    header.innerHTML = `
      <div class="fp-header-left">
        <h2 class="fp-title">FinePrint</h2>
        <div class="fp-subtitle">Analysis Error</div>
      </div>
    `;
    const closeBtn = document.createElement("button");
    closeBtn.className = "fp-close";
    closeBtn.innerHTML = CLOSE_SVG;
    closeBtn.addEventListener("click", () => this.hide());
    header.appendChild(closeBtn);
    this.panel.appendChild(header);

    const body = document.createElement("div");
    body.className = "fp-error-container";

    const errorIcon = `<svg class="fp-error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`;

    body.innerHTML = `
      ${errorIcon}
      <h3 class="fp-error-title">Couldn't analyze this page</h3>
      <p class="fp-error-message">${escapeHtml(errorMessage)}</p>
      ${this.pageUrl ? `<p class="fp-error-context">${escapeHtml(this.pageUrl)}</p>` : ""}
    `;

    this.panel.appendChild(body);
  }

  private render() {
    if (!this.analysisData) return;
    const data = this.analysisData;
    const clauseCounts = (data.clauses ?? []).reduce(
      (acc, clause) => {
        if (clause.severity === "HIGH") acc.high += 1;
        else if (clause.severity === "MEDIUM") acc.medium += 1;
        else acc.low += 1;
        return acc;
      },
      { high: 0, medium: 0, low: 0 },
    );
    const totalClauses = clauseCounts.high + clauseCounts.medium + clauseCounts.low;
    const concerningCount = clauseCounts.high + clauseCounts.medium;
    const scoreLevel = clauseCounts.high > 0 ? "high" : clauseCounts.medium > 0 ? "medium" : "low";
    const summaryText =
      totalClauses === 0
        ? "No clauses flagged"
        : `${concerningCount} of ${totalClauses} clauses flagged as concerning`;
    const breakdownText =
      totalClauses === 0
        ? "No risk clauses detected"
        : `${clauseCounts.high} high, ${clauseCounts.medium} medium, ${clauseCounts.low} low`;

    this.panel.innerHTML = "";

    const style = document.createElement("style");
    style.textContent = OVERLAY_STYLES;
    this.panel.appendChild(style);

    // Header
    const header = document.createElement("div");
    header.className = "fp-header";
    header.innerHTML = `
      <div class="fp-header-left">
        <h2 class="fp-title">${escapeHtml(this.pageTitle)}</h2>
        <div class="fp-subtitle">Terms of Service Analysis</div>
      </div>
      <div class="fp-score-badge fp-score--${scoreLevel}">
        <p class="fp-score-title">Risk summary</p>
        <p class="fp-score-value">${escapeHtml(summaryText)}</p>
        <p class="fp-score-meta">${escapeHtml(breakdownText)}</p>
      </div>
    `;

    const closeBtn = document.createElement("button");
    closeBtn.className = "fp-close";
    closeBtn.innerHTML = CLOSE_SVG;
    closeBtn.addEventListener("click", () => this.hide());
    header.appendChild(closeBtn);
    this.panel.appendChild(header);

    // Body
    const body = document.createElement("div");
    body.className = "fp-body";

    // Overview
    if (data.summary?.overview) {
      body.innerHTML += `
        <div class="fp-section">
          <h3 class="fp-section-title">Summary</h3>
          <p class="fp-overview">${escapeHtml(data.summary.overview)}</p>
        </div>
      `;
    }

    // Key points
    if (data.summary?.plain_english?.length) {
      body.innerHTML += `
        <div class="fp-section">
          <h3 class="fp-section-title">Key Points</h3>
          <ul class="fp-bullets">
            ${data.summary.plain_english.map((p) => `<li>${escapeHtml(p)}</li>`).join("")}
          </ul>
        </div>
      `;
    }

    // Risky clauses
    if (data.clauses?.length) {
      const clausesHtml = data.clauses
        .slice(0, 10)
        .map(
          (c) => `
          <div class="fp-clause">
            <div class="fp-clause-header">
              <span class="fp-severity fp-severity--${c.severity}">${c.severity}</span>
              ${c.section ? `<span class="fp-clause-section">${escapeHtml(c.section)}</span>` : ""}
            </div>
            <p class="fp-clause-explanation">${escapeHtml(c.explanation)}</p>
            ${c.quote ? `<p class="fp-clause-quote">${escapeHtml(c.quote.slice(0, 300))}${c.quote.length > 300 ? "..." : ""}</p>` : ""}
            ${c.recommendation ? `<p class="fp-clause-rec">${escapeHtml(c.recommendation)}</p>` : ""}
          </div>
        `,
        )
        .join("");

      body.innerHTML += `
        <div class="fp-section">
          <h3 class="fp-section-title">Risky Clauses (${data.clauses.length})</h3>
          ${clausesHtml}
        </div>
      `;
    }

    // Action items
    if (data.action_items?.length) {
      const actionsHtml = data.action_items
        .map(
          (a) => `
          <div class="fp-action-item">
            <div class="fp-action-priority fp-action-priority--${a.priority}"></div>
            <div class="fp-action-text">
              <p class="fp-action-title">${escapeHtml(a.title)}</p>
              <p class="fp-action-desc">${escapeHtml(a.description)}</p>
            </div>
          </div>
        `,
        )
        .join("");

      body.innerHTML += `
        <div class="fp-section">
          <h3 class="fp-section-title">Action Items</h3>
          ${actionsHtml}
        </div>
      `;
    }

    this.panel.appendChild(body);

    // Footer
    const footer = document.createElement("div");
    footer.className = "fp-footer";
    footer.id = "fp-footer";
    this.panel.appendChild(footer);
    this.renderFooter();
  }

  private renderFooter() {
    const footer = this.panel.querySelector("#fp-footer");
    if (!footer) return;

    if (this.saveState === "saved" && this.savedAppUrl) {
      footer.innerHTML = `
        <div class="fp-save-status">Saved to FinePrint</div>
        <a href="${this.savedAppUrl}" target="_blank" rel="noopener" class="fp-btn fp-btn--primary">View in App</a>
      `;
      return;
    }

    if (this.saveState === "saving") {
      footer.innerHTML = `<button class="fp-btn fp-btn--primary" disabled>Saving...</button>`;
      return;
    }

    footer.innerHTML = "";

    const saveBtn = document.createElement("button");
    saveBtn.className = "fp-btn fp-btn--primary";
    saveBtn.textContent = this.saveState === "error" ? "Retry Save" : "Save to FinePrint";
    saveBtn.addEventListener("click", () => {
      if (this.analysisData && this.onSave) {
        this.onSave({
          title: this.pageTitle,
          sourceUrl: this.pageUrl,
          rawText: this.pageText,
          analysisResult: this.analysisData,
        });
      }
    });
    footer.appendChild(saveBtn);
  }

  destroy() {
    this.shadow.host.remove();
  }
}

function escapeHtml(str: string): string {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}
