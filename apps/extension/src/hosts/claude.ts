import {
  type HostAdapter,
  queryAllVisible,
  queryFirst,
  readEditableText,
  writeEditableText,
} from './shared';

const COMPOSER_SELECTORS = [
  'div.ProseMirror[contenteditable="true"]',
  'div[contenteditable="true"].ProseMirror',
  'fieldset div[contenteditable="true"]',
  'div[aria-label="Write your prompt to Claude"]',
  'div[aria-label*="prompt" i][contenteditable="true"]',
  'div[contenteditable="true"][translate="no"]',
];

const SEND_SELECTORS = [
  'button[aria-label="Send message"]',
  'button[aria-label="Enviar mensaje"]',
  'button[aria-label*="Send" i]',
  'button[aria-label*="Enviar" i]',
];

export const claudeHost: HostAdapter = {
  id: 'claude',
  matchHost: (h) => h === 'claude.ai' || h.endsWith('.claude.ai'),
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
