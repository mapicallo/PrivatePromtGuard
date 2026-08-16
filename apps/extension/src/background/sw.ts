import { DEFAULT_PREFS, STORAGE_KEY } from '../lib/types';

chrome.runtime.onInstalled.addListener(() => {
  void chrome.storage.local.get(STORAGE_KEY).then((data) => {
    if (!data[STORAGE_KEY]) {
      void chrome.storage.local.set({ [STORAGE_KEY]: DEFAULT_PREFS });
    }
  });
});

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg?.type === 'ppg_ping') {
    sendResponse({ ok: true, version: chrome.runtime.getManifest().version });
    return true;
  }
  return false;
});
