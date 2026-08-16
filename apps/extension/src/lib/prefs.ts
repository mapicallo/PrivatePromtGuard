import { DEFAULT_PREFS, STORAGE_KEY, type Prefs } from './types';

export async function loadPrefs(): Promise<Prefs> {
  try {
    const data = await chrome.storage.local.get(STORAGE_KEY);
    const raw = data[STORAGE_KEY] as Partial<Prefs> | undefined;
    return { ...DEFAULT_PREFS, ...raw };
  } catch {
    return { ...DEFAULT_PREFS };
  }
}

export async function savePrefs(prefs: Prefs): Promise<void> {
  await chrome.storage.local.set({ [STORAGE_KEY]: prefs });
}

export function resolveLanguage(prefs: Prefs): 'es' | 'en' {
  if (prefs.language === 'es' || prefs.language === 'en') return prefs.language;
  const nav = typeof navigator !== 'undefined' ? navigator.language || '' : 'en';
  return nav.toLowerCase().startsWith('es') ? 'es' : 'en';
}
