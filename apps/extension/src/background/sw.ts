/**
 * PrivatePrompt Guard — floating panel (AI4Context family pattern).
 */
import { DEFAULT_PREFS, STORAGE_KEY } from '../lib/types';

const PANEL_PAGE = 'panel.html';
const SESSION_PANEL_KEY = 'ppg_panel_window_id';
const SESSION_TAB_URL_KEY = 'ppg_last_tab_url';

function sessionLike(): chrome.storage.StorageArea {
  return chrome.storage.session ?? chrome.storage.local;
}

function isHttpUrl(url: string | undefined): url is string {
  return Boolean(url && (url.startsWith('http://') || url.startsWith('https://')));
}

async function storeTabUrl(url: string | undefined): Promise<void> {
  if (!isHttpUrl(url)) return;
  await sessionLike().set({ [SESSION_TAB_URL_KEY]: url });
}

async function captureBrowserTabUrl(preferred?: chrome.tabs.Tab): Promise<string | null> {
  if (isHttpUrl(preferred?.url)) {
    await storeTabUrl(preferred.url);
    return preferred.url;
  }

  const panelPrefix = chrome.runtime.getURL(PANEL_PAGE).split(/[?#]/)[0];

  const takeFromWindow = async (win: chrome.windows.Window | undefined): Promise<string | null> => {
    if (!win || win.type !== 'normal') return null;
    const tab = win.tabs?.find((t) => t.active);
    if (!tab?.url || tab.url.split(/[?#]/)[0] === panelPrefix) return null;
    if (!isHttpUrl(tab.url)) return null;
    await storeTabUrl(tab.url);
    return tab.url;
  };

  try {
    const last = await chrome.windows.getLastFocused({ populate: true });
    const fromLast = await takeFromWindow(last);
    if (fromLast) return fromLast;
  } catch {
    /* ignore */
  }

  try {
    const [active] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (isHttpUrl(active?.url) && active.url.split(/[?#]/)[0] !== panelPrefix) {
      await storeTabUrl(active.url);
      return active.url;
    }
  } catch {
    /* ignore */
  }

  try {
    const wins = await chrome.windows.getAll({ populate: true });
    for (const w of wins) {
      const fromWin = await takeFromWindow(w);
      if (fromWin) return fromWin;
    }
  } catch (e) {
    console.warn('[PrivatePrompt Guard] capture tab url', e);
  }

  try {
    const data = await sessionLike().get(SESSION_TAB_URL_KEY);
    const stored = data[SESSION_TAB_URL_KEY] as string | undefined;
    if (isHttpUrl(stored)) return stored;
  } catch {
    /* ignore */
  }

  return null;
}

async function clearStoredPanelWindowId(): Promise<void> {
  try {
    await sessionLike().remove(SESSION_PANEL_KEY);
  } catch {
    /* ignore */
  }
}

async function tryFocusStoredPanel(): Promise<boolean> {
  try {
    const data = await sessionLike().get(SESSION_PANEL_KEY);
    const wid = data[SESSION_PANEL_KEY] as number | undefined;
    if (typeof wid !== 'number') return false;

    const w = await chrome.windows.get(wid, { populate: true });
    const tabUrl = w.tabs?.[0]?.url ?? '';
    const ours = chrome.runtime.getURL(PANEL_PAGE);
    if (!tabUrl || tabUrl.split(/[?#]/)[0] !== ours.split(/[?#]/)[0]) {
      await sessionLike().remove(SESSION_PANEL_KEY);
      return false;
    }

    await chrome.windows.update(wid, { focused: true });
    return true;
  } catch {
    try {
      await sessionLike().remove(SESSION_PANEL_KEY);
    } catch {
      /* ignore */
    }
    return false;
  }
}

async function findExistingPanelWindow(): Promise<number | undefined> {
  const url = chrome.runtime.getURL(PANEL_PAGE);
  const windows = await chrome.windows.getAll({ populate: true });
  for (const win of windows) {
    for (const tab of win.tabs ?? []) {
      if (tab.url === url && win.id != null) return win.id;
    }
  }
  return undefined;
}

async function openPanel(fromTab?: chrome.tabs.Tab): Promise<void> {
  await captureBrowserTabUrl(fromTab);

  if (await tryFocusStoredPanel()) return;

  const existing = await findExistingPanelWindow();
  if (existing != null) {
    await chrome.windows.update(existing, { focused: true });
    await sessionLike().set({ [SESSION_PANEL_KEY]: existing });
    return;
  }

  const panelUrl = chrome.runtime.getURL(PANEL_PAGE);
  const remember = async (windowId: number | undefined) => {
    if (windowId !== undefined) {
      await sessionLike().set({ [SESSION_PANEL_KEY]: windowId });
    }
  };

  const attempts: chrome.windows.CreateData[] = [
    { url: panelUrl, type: 'popup', width: 420, height: 560, focused: true },
    { url: panelUrl, type: 'normal', width: 440, height: 580, focused: true },
  ];

  for (const createData of attempts) {
    try {
      const created = await chrome.windows.create(createData);
      await remember(created.id);
      return;
    } catch (e) {
      console.warn('[PrivatePrompt Guard] window create failed', createData.type, e);
    }
  }

  try {
    await chrome.tabs.create({ url: panelUrl, active: true });
  } catch (e) {
    console.error('[PrivatePrompt Guard] could not open panel', e);
  }
}

chrome.action.onClicked.addListener((tab) => {
  void openPanel(tab);
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type === 'ppg.getLastTabUrl') {
    void (async () => {
      const data = await sessionLike().get(SESSION_TAB_URL_KEY);
      let url = (data[SESSION_TAB_URL_KEY] as string | undefined) ?? null;
      const fresh = await captureBrowserTabUrl();
      if (fresh) url = fresh;
      sendResponse({ url });
    })();
    return true;
  }
  if (message?.type === 'ppg_ping') {
    sendResponse({ ok: true, version: chrome.runtime.getManifest().version });
    return true;
  }
  return false;
});

chrome.windows.onRemoved.addListener(async (windowId) => {
  try {
    const data = await sessionLike().get(SESSION_PANEL_KEY);
    if (data[SESSION_PANEL_KEY] === windowId) {
      await sessionLike().remove(SESSION_PANEL_KEY);
    }
  } catch {
    /* ignore */
  }
});

chrome.runtime.onInstalled.addListener(() => {
  void clearStoredPanelWindowId();
  void chrome.storage.local.get(STORAGE_KEY).then((data) => {
    if (!data[STORAGE_KEY]) {
      void chrome.storage.local.set({ [STORAGE_KEY]: DEFAULT_PREFS });
    }
  });
});

chrome.runtime.onStartup.addListener(() => {
  void clearStoredPanelWindowId();
});
