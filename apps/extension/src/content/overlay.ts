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
    host.style.cssText = 'all:initial;position:fixed;inset:0;z-index:2147483646;pointer-events:none;';
    const shadow = host.attachShadow({ mode: 'closed' });

    const style = document.createElement('style');
    style.textContent = `
      :host { all: initial; }
      * { box-sizing: border-box; font-family: system-ui, Segoe UI, Roboto, sans-serif; }
      .stage {
        position: fixed; inset: 0;
        pointer-events: none;
      }
      .card {
        pointer-events: auto;
        position: fixed;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        width: min(440px, calc(100vw - 24px));
        background: #0f172a;
        color: #e2e8f0;
        border: 1px solid #334155;
        border-radius: 12px;
        padding: 18px 18px 14px;
        box-shadow: 0 18px 40px rgba(15, 23, 42, 0.35);
      }
      .card.is-free {
        transform: none;
      }
      .hdr {
        display: flex; justify-content: space-between; gap: 8px; align-items: baseline;
        margin: -6px -6px 6px; padding: 8px 6px;
        cursor: grab;
        user-select: none;
      }
      .hdr:active { cursor: grabbing; }
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
    wrap.className = 'stage';
    wrap.innerHTML = `
      <div class="card" role="dialog" aria-modal="false" aria-labelledby="ppg-title">
        <div class="hdr" title="${escapeHtml(opts.messages.dragHint)}">
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

    wrap.querySelectorAll('button[data-act]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const act = (btn as HTMLElement).dataset.act as OverlayAction;
        finish(act);
      });
    });

    const card = wrap.querySelector('.card') as HTMLElement;
    const handle = wrap.querySelector('.hdr') as HTMLElement;
    enableDrag(card, handle);

    shadow.append(style, wrap);
    document.documentElement.appendChild(host);
  });
}

function enableDrag(card: HTMLElement, handle: HTMLElement): void {
  let dragging = false;
  let startX = 0;
  let startY = 0;
  let origLeft = 0;
  let origTop = 0;

  const onMove = (e: PointerEvent) => {
    if (!dragging) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    const w = card.offsetWidth;
    const h = card.offsetHeight;
    const left = clamp(origLeft + dx, 8, window.innerWidth - w - 8);
    const top = clamp(origTop + dy, 8, window.innerHeight - h - 8);
    card.style.left = `${left}px`;
    card.style.top = `${top}px`;
  };

  const onUp = (e: PointerEvent) => {
    if (!dragging) return;
    dragging = false;
    handle.releasePointerCapture(e.pointerId);
    window.removeEventListener('pointermove', onMove);
    window.removeEventListener('pointerup', onUp);
  };

  handle.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    e.preventDefault();
    const rect = card.getBoundingClientRect();
    card.classList.add('is-free');
    card.style.left = `${rect.left}px`;
    card.style.top = `${rect.top}px`;
    origLeft = rect.left;
    origTop = rect.top;
    startX = e.clientX;
    startY = e.clientY;
    dragging = true;
    handle.setPointerCapture(e.pointerId);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  });
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
