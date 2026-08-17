/**
 * PrivatePrompt Guard — floating panel (AI4Context family pattern).
 */
import { DEFAULT_PREFS, STORAGE_KEY } from '../lib/types';

const PANEL_PAGE = 'panel.html';
const SESSION_PANEL_KEY = 'ppg_panel_window_id';
const SESSION_TAB_URL_KEY = 'ppg_last_tab_url';
const SESSION_NORMAL_WID_KEY = 'ppg_last_normal_window_id';

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

async function panelWindowId(): Promise<number | undefined> {
  const data = await sessionLike().get(SESSION_PANEL_KEY);
  const wid = data[SESSION_PANEL_KEY];
  return typeof wid === 'number' ? wid : undefined;
}

async function rememberNormalWindow(windowId: number | undefined): Promise<void> {
  if (typeof windowId !== 'number') return;
  await sessionLike().set({ [SESSION_NORMAL_WID_KEY]: windowId });
}

function isPanelPage(url: string | undefined): boolean {
  if (!url) return true;
  const panelPrefix = chrome.runtime.getURL(PANEL_PAGE).split(/[?#]/)[0];
  return url.split(/[?#]/)[0] === panelPrefix;
}

async function rememberTabId(tabId: number): Promise<void> {
  try {
    const tab = await chrome.tabs.get(tabId);
    const panelId = await panelWindowId();
    if (typeof panelId === 'number' && tab.windowId === panelId) return;
    const win = await chrome.windows.get(tab.windowId);
    if (win.type !== 'normal') return;
    await rememberNormalWindow(tab.windowId);
    await storeTabUrl(tab.url);
  } catch {
    /* tab gone */
  }
}

async function liveNormalTabUrl(): Promise<string | null> {
  const panelId = await panelWindowId();
  const stored = await sessionLike().get([SESSION_NORMAL_WID_KEY]);
  const lastNormalId = stored[SESSION_NORMAL_WID_KEY] as number | undefined;

  let wins: chrome.windows.Window[] = [];
  try {
    wins = await chrome.windows.getAll({ populate: true });
  } catch {
    return null;
  }

  const normals = wins.filter((w) => w.type === 'normal' && w.id !== panelId);
  const preferred =
    typeof lastNormalId === 'number' ? normals.find((w) => w.id === lastNormalId) : undefined;
  const focused = normals.find((w) => w.focused);
  const ordered = [
    ...(preferred ? [preferred] : []),
    ...(focused && focused !== preferred ? [focused] : []),
    ...normals.filter((w) => w !== preferred && w !== focused),
  ];

  for (const win of ordered) {
    const tab = win.tabs?.find((t) => t.active);
    if (!isHttpUrl(tab?.url) || isPanelPage(tab?.url)) continue;
    await rememberNormalWindow(win.id);
    await storeTabUrl(tab.url);
    return tab.url;
  }
  return null;
}

async function storedTabUrl(): Promise<string | null> {
  try {
    const data = await sessionLike().get(SESSION_TAB_URL_KEY);
    const stored = data[SESSION_TAB_URL_KEY] as string | undefined;
    return isHttpUrl(stored) ? stored : null;
  } catch {
    return null;
  }
}

async function captureBrowserTabUrl(preferred?: chrome.tabs.Tab): Promise<string | null> {
  if (isHttpUrl(preferred?.url) && !isPanelPage(preferred.url)) {
    if (typeof preferred.windowId === 'number') await rememberNormalWindow(preferred.windowId);
    await storeTabUrl(preferred.url);
    return preferred.url;
  }

  const live = await liveNormalTabUrl();
  if (live) return live;
  return storedTabUrl();
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
    { url: panelUrl, type: 'popup', width: 420, height: 720, focused: true },
    { url: panelUrl, type: 'normal', width: 440, height: 740, focused: true },
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

chrome.tabs.onActivated.addListener((info) => {
  void rememberTabId(info.tabId);
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.status === 'complete' || changeInfo.url) void rememberTabId(tabId);
});

chrome.windows.onFocusChanged.addListener((windowId) => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) return;
  void (async () => {
    const panelId = await panelWindowId();
    if (windowId === panelId) return;
    try {
      const win = await chrome.windows.get(windowId, { populate: true });
      if (win.type !== 'normal') return;
      await rememberNormalWindow(windowId);
      const tab = win.tabs?.find((t) => t.active);
      await storeTabUrl(tab?.url);
    } catch {
      /* ignore */
    }
  })();
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type === 'ppg.getLastTabUrl' || message?.type === 'ppg.refreshTabUrl') {
    void (async () => {
      const live = await liveNormalTabUrl();
      const url = live ?? (await storedTabUrl());
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
