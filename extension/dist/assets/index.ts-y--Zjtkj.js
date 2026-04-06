(function(){var E=Object.defineProperty;var L=(i,e,t)=>e in i?E(i,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):i[e]=t;var a=(i,e,t)=>L(i,typeof e!="symbol"?e+"":e,t);const v=[/terms\s+(of\s+)?(service|use)/i,/terms\s+and\s+conditions/i,/user\s+agreement/i,/service\s+agreement/i,/subscriber\s+agreement/i,/member\s+agreement/i],A=[/\/tos\b/i,/\/terms/i,/\/legal\/terms/i,/\/user-agreement/i,/\/service-agreement/i],w=["hereby","notwithstanding","indemnify","indemnification","liability","arbitration","governing law","jurisdiction","agree to be bound","binding agreement","waive","covenant","warranties","disclaimer","limitation of liability","intellectual property","termination","severability","force majeure","confidential"];function C(){var n,l;let i=0;const e=document.title,t=window.location.href;for(const s of v)if(s.test(e)){i+=40;break}for(const s of A)if(s.test(t)){i+=30;break}const o=document.querySelectorAll("h1, h2, h3");for(const s of o){const f=s.textContent??"";for(const u of v)if(u.test(f)){i+=25;break}if(i>=50)break}const p=T().toLowerCase();if(p.split(/\s+/).length>200){let s=0;for(const u of w)p.includes(u.toLowerCase())&&s++;const f=s/w.length;i+=Math.min(30,Math.round(f*100))}const r=((l=(n=o[0])==null?void 0:n.textContent)==null?void 0:l.trim())||e||new URL(t).hostname;return{isToS:i>=40,confidence:Math.min(100,i),title:r}}function T(){const i=document.querySelector("main")??document.querySelector("article")??document.querySelector('[role="main"]');if(i)return i.innerText;const e=document.body.cloneNode(!0);for(const t of e.querySelectorAll("nav, footer, aside, header, script, style, noscript, iframe"))t.remove();return e.innerText}const M=`
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
`,k='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="fp-icon"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>',_='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="fp-icon"><polyline points="20 6 9 17 4 12"/></svg>',z='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="fp-icon"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>';class ${constructor(){a(this,"shadow");a(this,"button");a(this,"state","idle");a(this,"onClick",null);a(this,"riskScore",null);a(this,"errorMessage",null);const e=document.createElement("div");e.id="fineprint-fab-host",this.shadow=e.attachShadow({mode:"closed"});const t=document.createElement("style");t.textContent=M,this.shadow.appendChild(t),this.button=document.createElement("button"),this.button.className="fp-fab fp-fab--idle",this.button.setAttribute("aria-label","FinePrint - Analyze Terms of Service"),this.button.addEventListener("click",()=>{var o;return(o=this.onClick)==null?void 0:o.call(this)}),this.shadow.appendChild(this.button),document.body.appendChild(e),this.render()}setOnClick(e){this.onClick=e}setOverlayOpen(e){this.shadow.host.style.right=e?"444px":"24px"}setState(e,t,o){this.state=e,t!==void 0&&(this.riskScore=t),this.errorMessage=o??null,this.render()}getState(){return this.state}render(){switch(this.button.className=`fp-fab fp-fab--${this.state}`,this.state){case"idle":this.button.innerHTML=k,this.button.setAttribute("aria-label","FinePrint");break;case"detected":this.button.innerHTML=`${k}<span>Terms of Service detected</span>`,this.button.setAttribute("aria-label","Terms of Service detected - click to analyze");break;case"analyzing":this.button.innerHTML='<div class="fp-spinner"></div><span>Analyzing...</span>',this.button.setAttribute("aria-label","Analyzing terms of service");break;case"done":this.button.innerHTML=`${_}<span>Analysis ready</span>${this.riskScore!==null?`<span class="fp-badge">${this.riskScore}/100</span>`:""}`,this.button.setAttribute("aria-label","Analysis complete - click to view");break;case"error":{const e=this.errorMessage?O(this.errorMessage,50):"Analysis failed";this.button.innerHTML=`${z}<span>${H(e)}</span>`,this.button.setAttribute("aria-label",this.errorMessage??"Analysis failed - click to retry");break}}}getErrorMessage(){return this.errorMessage}destroy(){this.shadow.host.remove()}}function H(i){return i.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function O(i,e){if(i.length<=e)return i;const t=i.lastIndexOf(" ",e);return i.slice(0,t>0?t:e)+"…"}const m=`
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
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    border-radius: 50%;
    font-size: 14px;
    font-weight: 800;
    color: #fff;
    margin-left: 12px;
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
`,S='<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';class U{constructor(){a(this,"shadow");a(this,"panel");a(this,"isOpen",!1);a(this,"analysisData",null);a(this,"lastError",null);a(this,"pageTitle","");a(this,"pageUrl","");a(this,"pageText","");a(this,"onSave",null);a(this,"saveState","idle");a(this,"savedAppUrl",null);a(this,"onToggle",null);const e=document.createElement("div");e.id="fineprint-overlay-host",this.shadow=e.attachShadow({mode:"closed"});const t=document.createElement("style");t.textContent=m,this.shadow.appendChild(t),this.panel=document.createElement("div"),this.panel.className="fp-overlay",this.shadow.appendChild(this.panel),document.body.appendChild(e)}setOnSave(e){this.onSave=e}setOnToggle(e){this.onToggle=e}show(e,t,o,p){this.analysisData=e,this.lastError=null,this.pageTitle=t,this.pageUrl=o,this.pageText=p,this.saveState="idle",this.savedAppUrl=null,this.render(),requestAnimationFrame(()=>{var d;this.panel.classList.add("fp-overlay--open"),this.isOpen=!0,(d=this.onToggle)==null||d.call(this,!0)})}showError(e,t){this.analysisData=null,this.lastError=e,this.pageTitle="",this.pageUrl=t,this.pageText="",this.saveState="idle",this.savedAppUrl=null,this.renderError(e),requestAnimationFrame(()=>{var o;this.panel.classList.add("fp-overlay--open"),this.isOpen=!0,(o=this.onToggle)==null||o.call(this,!0)})}hide(){var e;this.panel.classList.remove("fp-overlay--open"),this.isOpen=!1,(e=this.onToggle)==null||e.call(this,!1)}toggle(){this.isOpen?this.hide():this.analysisData?this.show(this.analysisData,this.pageTitle,this.pageUrl,this.pageText):this.lastError&&this.showError(this.lastError,this.pageUrl)}isVisible(){return this.isOpen}setSaveState(e,t){this.saveState=e,t&&(this.savedAppUrl=t),this.renderFooter()}renderError(e){this.panel.innerHTML="";const t=document.createElement("style");t.textContent=m,this.panel.appendChild(t);const o=document.createElement("div");o.className="fp-header",o.innerHTML=`
      <div class="fp-header-left">
        <h2 class="fp-title">FinePrint</h2>
        <div class="fp-subtitle">Analysis Error</div>
      </div>
    `;const p=document.createElement("button");p.className="fp-close",p.innerHTML=S,p.addEventListener("click",()=>this.hide()),o.appendChild(p),this.panel.appendChild(o);const d=document.createElement("div");d.className="fp-error-container";const r='<svg class="fp-error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>';d.innerHTML=`
      ${r}
      <h3 class="fp-error-title">Couldn't analyze this page</h3>
      <p class="fp-error-message">${h(e)}</p>
      ${this.pageUrl?`<p class="fp-error-context">${h(this.pageUrl)}</p>`:""}
    `,this.panel.appendChild(d)}render(){var s,f,u,g,y;if(!this.analysisData)return;const e=this.analysisData,t=e.overall_risk_score,o=t>=7?"high":t>=4?"medium":"low";this.panel.innerHTML="";const p=document.createElement("style");p.textContent=m,this.panel.appendChild(p);const d=document.createElement("div");d.className="fp-header",d.innerHTML=`
      <div class="fp-header-left">
        <h2 class="fp-title">${h(this.pageTitle)}</h2>
        <div class="fp-subtitle">Terms of Service Analysis</div>
      </div>
      <div class="fp-score-badge fp-score--${o}">${t}</div>
    `;const r=document.createElement("button");r.className="fp-close",r.innerHTML=S,r.addEventListener("click",()=>this.hide()),d.appendChild(r),this.panel.appendChild(d);const n=document.createElement("div");if(n.className="fp-body",(s=e.summary)!=null&&s.overview&&(n.innerHTML+=`
        <div class="fp-section">
          <h3 class="fp-section-title">Summary</h3>
          <p class="fp-overview">${h(e.summary.overview)}</p>
        </div>
      `),(u=(f=e.summary)==null?void 0:f.plain_english)!=null&&u.length&&(n.innerHTML+=`
        <div class="fp-section">
          <h3 class="fp-section-title">Key Points</h3>
          <ul class="fp-bullets">
            ${e.summary.plain_english.map(b=>`<li>${h(b)}</li>`).join("")}
          </ul>
        </div>
      `),(g=e.clauses)!=null&&g.length){const b=e.clauses.slice(0,10).map(c=>`
          <div class="fp-clause">
            <div class="fp-clause-header">
              <span class="fp-severity fp-severity--${c.severity}">${c.severity}</span>
              ${c.section?`<span class="fp-clause-section">${h(c.section)}</span>`:""}
            </div>
            <p class="fp-clause-explanation">${h(c.explanation)}</p>
            ${c.quote?`<p class="fp-clause-quote">${h(c.quote.slice(0,300))}${c.quote.length>300?"...":""}</p>`:""}
            ${c.recommendation?`<p class="fp-clause-rec">${h(c.recommendation)}</p>`:""}
          </div>
        `).join("");n.innerHTML+=`
        <div class="fp-section">
          <h3 class="fp-section-title">Risky Clauses (${e.clauses.length})</h3>
          ${b}
        </div>
      `}if((y=e.action_items)!=null&&y.length){const b=e.action_items.map(c=>`
          <div class="fp-action-item">
            <div class="fp-action-priority fp-action-priority--${c.priority}"></div>
            <div class="fp-action-text">
              <p class="fp-action-title">${h(c.title)}</p>
              <p class="fp-action-desc">${h(c.description)}</p>
            </div>
          </div>
        `).join("");n.innerHTML+=`
        <div class="fp-section">
          <h3 class="fp-section-title">Action Items</h3>
          ${b}
        </div>
      `}this.panel.appendChild(n);const l=document.createElement("div");l.className="fp-footer",l.id="fp-footer",this.panel.appendChild(l),this.renderFooter()}renderFooter(){const e=this.panel.querySelector("#fp-footer");if(!e)return;if(this.saveState==="saved"&&this.savedAppUrl){e.innerHTML=`
        <div class="fp-save-status">Saved to FinePrint</div>
        <a href="${this.savedAppUrl}" target="_blank" rel="noopener" class="fp-btn fp-btn--primary">View in App</a>
      `;return}if(this.saveState==="saving"){e.innerHTML='<button class="fp-btn fp-btn--primary" disabled>Saving...</button>';return}e.innerHTML="";const t=document.createElement("button");t.className="fp-btn fp-btn--primary",t.textContent=this.saveState==="error"?"Retry Save":"Save to FinePrint",t.addEventListener("click",()=>{this.analysisData&&this.onSave&&this.onSave({title:this.pageTitle,sourceUrl:this.pageUrl,rawText:this.pageText,analysisResult:this.analysisData})}),e.appendChild(t)}destroy(){this.shadow.host.remove()}}function h(i){const e=document.createElement("div");return e.textContent=i,e.innerHTML}window.__fineprint_loaded||(window.__fineprint_loaded=!0,N());function N(){let i=null,e=null,t="";const o=C();o.isToS&&({fab:i,overlay:e}=p(),i.setState("detected"));function p(){if(i&&e)return{fab:i,overlay:e};const r=new $,n=new U;return n.setOnToggle(l=>r.setOverlayOpen(l)),n.setOnSave(async l=>{n.setSaveState("saving");const s=await x({type:"SAVE_ANALYSIS",payload:l});if((s==null?void 0:s.type)==="SAVE_RESULT"){const{appUrl:f}=s.payload;n.setSaveState("saved",f)}else n.setSaveState("error")}),r.setOnClick(()=>d()),{fab:r,overlay:n}}async function d(){var f,u;(!i||!e)&&({fab:i,overlay:e}=p());const r=i.getState();if(r==="done"||r==="error"){e.toggle();return}if(r==="analyzing")return;const n=await x({type:"GET_AUTH_STATUS"});if(!((f=n==null?void 0:n.payload)!=null&&f.authenticated)){window.open("https://fineprint.dev/extension/auth","_blank");return}i.setState("analyzing"),t=T();const l=o.title||document.title||window.location.hostname,s=await x({type:"ANALYZE_PAGE",payload:{text:t,title:l,url:window.location.href}});if((s==null?void 0:s.type)==="ANALYSIS_RESULT"){const{result:g}=s.payload;i.setState("done",g.overall_risk_score),e.show(g,l,window.location.href,t)}else{const g=((u=s==null?void 0:s.payload)==null?void 0:u.error)??"Analysis failed";i.setState("error",void 0,g),e.showError(g,window.location.href)}}chrome.runtime.onMessage.addListener((r,n,l)=>{r.type==="TRIGGER_ANALYSIS"&&(d(),l({ok:!0}))}),window.addEventListener("message",r=>{var n,l;((n=r.data)==null?void 0:n.source)==="fineprint-auth"&&((l=r.data)==null?void 0:l.type)==="AUTH_TOKEN"&&chrome.runtime.sendMessage({type:"AUTH_TOKEN",payload:{token:r.data.token}})})}function x(i){return new Promise(e=>{try{chrome.runtime.sendMessage(i,t=>{if(chrome.runtime.lastError){console.error("[FinePrint]",chrome.runtime.lastError.message),e(null);return}e(t??null)})}catch{e(null)}})}
})()
