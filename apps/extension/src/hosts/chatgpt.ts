import {
  type HostAdapter,
  queryAllVisible,
  queryFirst,
  readEditableText,
  writeEditableText,
} from './shared';

const COMPOSER_SELECTORS = [
  '#prompt-textarea',
  'div#prompt-textarea[contenteditable="true"]',
  'textarea#prompt-textarea',
  'div[contenteditable="true"][data-id="root"]',
  'div.ProseMirror[contenteditable="true"]',
  'form textarea',
  'form div[contenteditable="true"]',
];

const SEND_SELECTORS = [
  'button[data-testid="send-button"]',
  'button[data-testid="fruitjuice-send-button"]',
  'button[aria-label="Send prompt"]',
  'button[aria-label="Enviar prompt"]',
  'form button[type="submit"]',
];

export const chatgptHost: HostAdapter = {
  id: 'chatgpt',
  matchHost: (h) =>
    h === 'chatgpt.com' ||
    h.endsWith('.chatgpt.com') ||
    h === 'chat.openai.com' ||
    h.endsWith('.chat.openai.com'),
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
