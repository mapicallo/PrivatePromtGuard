import { detectAll } from '../lib/detect';
import { messagesFor } from '../lib/i18n';
import { nanoAvailable, nanoScan } from '../lib/nano';
import { loadPrefs, resolveLanguage } from '../lib/prefs';
import { redactText } from '../lib/redact';
import { filterFindings, type Prefs } from '../lib/types';
import { resolveHost, type HostAdapter } from '../hosts';
import { showOverlay, dismissOverlay } from './overlay';

const SESSION_SKIP = 'ppg_skip_tab';

let prefs: Prefs | null = null;
let host: HostAdapter | null = null;
let bypassOnce = false;
let busy = false;
let wired = false;

async function refreshPrefs(): Promise<void> {
  prefs = await loadPrefs();
}

function sessionSkipped(): boolean {
  try {
    return sessionStorage.getItem(SESSION_SKIP) === '1';
  } catch {
    return false;
  }
}

async function analyze(text: string) {
  const p = prefs || (await loadPrefs());
  let extra: Awaited<ReturnType<typeof nanoScan>> = [];
  let nanoUsed = false;
  if (p.nanoAssist) {
    const ok = await nanoAvailable();
    if (ok) {
      extra = await nanoScan(text);
      nanoUsed = true;
    }
  }
  const all = detectAll(text, extra);
  const filtered = filterFindings(all, p);
  return { findings: filtered, nanoUsed, prefs: p };
}

function resumeSend(trigger: 'enter' | 'click'): void {
  bypassOnce = true;
  queueMicrotask(() => {
    if (!host) return;
    if (trigger === 'click') {
      host.findSendButtons()[0]?.click();
      return;
    }
    const composer = host.getComposer();
    if (!composer) return;
    composer.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Enter',
        code: 'Enter',
        bubbles: true,
        cancelable: true,
      }),
    );
  });
}

/**
 * Synchronously stop the event, then analyze.
 * Returns whether the user may send (after optional overlay).
 */
async function handlePotentialSend(trigger: 'enter' | 'click'): Promise<void> {
  if (!host) return;
  if (!prefs) await refreshPrefs();
  if (!prefs?.enabled || sessionSkipped()) {
    resumeSend(trigger);
    return;
  }
  if (bypassOnce) {
    bypassOnce = false;
    return;
  }
  if (busy) return;

  const text = host.getComposerText().trim();
  if (!text) {
    resumeSend(trigger);
    return;
  }

  busy = true;
  try {
    const { findings, nanoUsed, prefs: p } = await analyze(text);
    if (!findings.length) {
      resumeSend(trigger);
      return;
    }

    const lang = resolveLanguage(p);
    const messages = messagesFor(lang);
    const { action } = await showOverlay({ findings, messages, nanoUsed });

    if (action === 'redact') {
      host.setComposerText(redactText(text, findings));
      return;
    }
    if (action === 'send') {
      resumeSend(trigger);
    }
    // review / cancel → do nothing
  } finally {
    busy = false;
  }
}

function shouldWatchKey(e: KeyboardEvent): boolean {
  if (e.key !== 'Enter' || e.shiftKey || e.isComposing || e.ctrlKey || e.metaKey || e.altKey) {
    return false;
  }
  if (!host?.getComposer()) return false;
  const t = e.target;
  if (!(t instanceof Element)) return false;
  const composer = host.getComposer();
  if (!composer) return false;
  return composer === t || composer.contains(t);
}

function onKeyDown(e: KeyboardEvent): void {
  if (bypassOnce) {
    bypassOnce = false;
    return;
  }
  if (!shouldWatchKey(e)) return;
  e.preventDefault();
  e.stopImmediatePropagation();
  void handlePotentialSend('enter');
}

function onClickCapture(e: MouseEvent): void {
  if (bypassOnce) {
    bypassOnce = false;
    return;
  }
  if (!host) return;
  const target = e.target;
  if (!(target instanceof Element)) return;
  const buttons = host.findSendButtons();
  const hit = buttons.some((b) => b === target || b.contains(target));
  if (!hit) return;
  e.preventDefault();
  e.stopImmediatePropagation();
  void handlePotentialSend('click');
}

function wire(): void {
  if (wired || !host) return;
  wired = true;
  document.addEventListener('keydown', onKeyDown, true);
  document.addEventListener('click', onClickCapture, true);
  console.info('[PrivatePrompt Guard] active on', host.id);
}

async function init(): Promise<void> {
  host = resolveHost();
  if (!host) return;
  await refreshPrefs();
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && changes.ppg_prefs_v1) void refreshPrefs();
  });
  wire();
}

void init();

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') dismissOverlay();
});
