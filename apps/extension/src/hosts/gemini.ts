import {
  type HostAdapter,
  queryAllVisible,
  queryFirst,
  readEditableText,
  writeEditableText,
} from './shared';

const COMPOSER_SELECTORS = [
  'rich-textarea div[contenteditable="true"]',
  'div.ql-editor[contenteditable="true"]',
  'div[contenteditable="true"][aria-label*="prompt" i]',
  'div[contenteditable="true"][aria-label*="Prompt" i]',
  'div[contenteditable="true"][data-placeholder]',
  'textarea',
];

const SEND_SELECTORS = [
  'button[aria-label="Send message"]',
  'button[aria-label="Enviar mensaje"]',
  'button[aria-label*="Send" i]',
  'button.send-button',
  'button[mattooltip*="Send" i]',
];

export const geminiHost: HostAdapter = {
  id: 'gemini',
  matchHost: (h) =>
    h === 'gemini.google.com' ||
    h.endsWith('.gemini.google.com') ||
    h === 'bard.google.com',
  getComposer: () => queryFirst(COMPOSER_SELECTORS),
  getComposerText: () => {
    const el = queryFirst(COMPOSER_SELECTORS);
    return el ? readEditableText(el) : '';
  },
  setComposerText: (text) => {
    const el = queryFirst(COMPOSER_SELECTORS);
    if (el) writeEditableText(el, text);
  },
  findSendButtons: () => queryAllVisible(SEND_SELECTORS),
};
