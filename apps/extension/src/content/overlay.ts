import type { Finding } from '../lib/types';
import { maskPreview } from '../lib/detect/patterns';
import type { Messages } from '../lib/i18n';

export type OverlayAction = 'review' | 'redact' | 'send' | 'cancel';

export type OverlayResult = {
  action: OverlayAction;
};

const HOST_ID = 'ppg-overlay-host';

export function dismissOverlay(): void {
  document.getElementById(HOST_ID)?.remove();
}

export function showOverlay(opts: {
  findings: Finding[];
  messages: Messages;
  nanoUsed: boolean;
}): Promise<OverlayResult> {
  dismissOverlay();

  return new Promise((resolve) => {
    const host = document.createElement('div');
    host.id = HOST_ID;
    host.style.cssText = 'all:initial;position:fixed;inset:0;z-index:2147483646;';
    const shadow = host.attachShadow({ mode: 'closed' });

    const style = document.createElement('style');
    style.textContent = `
      :host { all: initial; }
      * { box-sizing: border-box; font-family: system-ui, Segoe UI, Roboto, sans-serif; }
      .backdrop {
        position: fixed; inset: 0;
        background: rgba(15, 23, 42, 0.55);
        display: flex; align-items: center; justify-content: center;
        padding: 16px;
      }
      .card {
        width: min(440px, 100%);
        background: #0f172a;
        color: #e2e8f0;
        border: 1px solid #334155;
        border-radius: 12px;
        padding: 18px 18px 14px;
      }
      .hdr { display: flex; justify-content: space-between; gap: 8px; align-items: baseline; margin-bottom: 6px; }
      .name { font-size: 15px; font-weight: 650; color: #f8fafc; }
      .brand { font-size: 11px; color: #94a3b8; }
      .title { font-size: 14px; font-weight: 600; margin: 8px 0 4px; }
      .meta { font-size: 12px; color: #94a3b8; margin-bottom: 10px; }
      ul { list-style: none; margin: 0 0 12px; padding: 0; max-height: 180px; overflow: auto; }
      li {
        font-size: 12px; padding: 8px 10px; margin-bottom: 6px;
        background: #1e293b; border-radius: 8px; border: 1px solid #334155;
        display: flex; gap: 8px; justify-content: space-between;
      }
      .sev-high { border-left: 3px solid #f87171; }
      .sev-medium { border-left: 3px solid #fbbf24; }
      .sev-low { border-left: 3px solid #60a5fa; }
      .label { font-weight: 600; color: #f1f5f9; }
      .preview { color: #94a3b8; font-family: ui-monospace, monospace; }
      .actions { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
      button {
        appearance: none; border: 1px solid #475569; background: #1e293b; color: #f8fafc;
        border-radius: 8px; padding: 9px 10px; font-size: 12px; font-weight: 600; cursor: pointer;
      }
      button:hover { background: #334155; }
      button.primary { background: #2563eb; border-color: #2563eb; }
      button.primary:hover { background: #1d4ed8; }
      button.danger { background: #7f1d1d; border-color: #991b1b; }
      .disc { font-size: 11px; color: #64748b; margin-top: 10px; line-height: 1.35; }
      .badge { font-size: 11px; color: #94a3b8; margin-bottom: 8px; }
    `;

    const wrap = document.createElement('div');
    wrap.className = 'backdrop';
    wrap.innerHTML = `
      <div class="card" role="dialog" aria-modal="true" aria-labelledby="ppg-title">
        <div class="hdr">
          <div class="name">${escapeHtml(opts.messages.extName)}</div>
          <div class="brand">${escapeHtml(opts.messages.brand)}</div>
        </div>
        <div class="title" id="ppg-title">${escapeHtml(opts.messages.title)}</div>
        <div class="meta">${escapeHtml(opts.messages.findingsCount(opts.findings.length))}</div>
        <div class="badge">${escapeHtml(opts.nanoUsed ? opts.messages.nanoOn : opts.messages.nanoBasic)}</div>
        <ul>
          ${opts.findings
            .slice(0, 12)
            .map(
              (f) => `<li class="sev-${f.severity}">
              <span class="label">${escapeHtml(f.label)}</span>
              <span class="preview">${escapeHtml(maskPreview(f.match))}</span>
            </li>`,
            )
            .join('')}
        </ul>
        <div class="actions">
          <button type="button" data-act="review">${escapeHtml(opts.messages.review)}</button>
          <button type="button" class="primary" data-act="redact">${escapeHtml(opts.messages.redact)}</button>
          <button type="button" class="danger" data-act="send">${escapeHtml(opts.messages.sendAnyway)}</button>
          <button type="button" data-act="cancel">${escapeHtml(opts.messages.cancel)}</button>
        </div>
        <div class="disc">${escapeHtml(opts.messages.disclaimer)}</div>
      </div>
    `;

    const finish = (action: OverlayAction) => {
      dismissOverlay();
      resolve({ action });
    };

    wrap.addEventListener('click', (e) => {
      if (e.target === wrap) finish('cancel');
    });
    wrap.querySelectorAll('button[data-act]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const act = (btn as HTMLElement).dataset.act as OverlayAction;
        finish(act);
      });
    });

    shadow.append(style, wrap);
    document.documentElement.appendChild(host);
  });
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
