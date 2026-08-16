export type HostAdapter = {
  id: 'chatgpt' | 'claude' | 'gemini';
  matchHost: (hostname: string) => boolean;
  getComposer: () => HTMLElement | null;
  getComposerText: () => string;
  setComposerText: (text: string) => void;
  findSendButtons: () => HTMLElement[];
};

function isVisible(el: Element | null): el is HTMLElement {
  if (!(el instanceof HTMLElement)) return false;
  const st = getComputedStyle(el);
  if (st.display === 'none' || st.visibility === 'hidden') return false;
  const r = el.getBoundingClientRect();
  return r.width > 0 && r.height > 0;
}

export function readEditableText(el: HTMLElement): string {
  if (el instanceof HTMLTextAreaElement || el instanceof HTMLInputElement) return el.value;
  return el.innerText || el.textContent || '';
}

export function writeEditableText(el: HTMLElement, text: string): void {
  if (el instanceof HTMLTextAreaElement || el instanceof HTMLInputElement) {
    el.focus();
    el.value = text;
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
    return;
  }
  el.focus();
  // Prefer execCommand for contenteditable sites that track history
  try {
    const sel = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(el);
    sel?.removeAllRanges();
    sel?.addRange(range);
    const ok = document.execCommand('insertText', false, text);
    if (!ok) {
      el.textContent = text;
      el.dispatchEvent(new InputEvent('input', { bubbles: true, data: text, inputType: 'insertText' }));
    }
  } catch {
    el.textContent = text;
    el.dispatchEvent(new Event('input', { bubbles: true }));
  }
}

export function queryFirst(selectors: string[]): HTMLElement | null {
  for (const s of selectors) {
    const el = document.querySelector(s);
    if (isVisible(el)) return el;
  }
  return null;
}

export function queryAllVisible(selectors: string[]): HTMLElement[] {
  const out: HTMLElement[] = [];
  for (const s of selectors) {
    document.querySelectorAll(s).forEach((el) => {
      if (isVisible(el)) out.push(el);
    });
  }
  return out;
}

export { isVisible };
