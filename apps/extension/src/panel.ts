import { isSupportedAiUrl } from './lib/aiHosts';
import { messagesFor } from './lib/i18n';
import { loadPrefs, resolveLanguage, savePrefs } from './lib/prefs';
import type { Prefs, Sensitivity } from './lib/types';

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;

async function lastBrowserTabUrl(): Promise<string | null> {
  try {
    const res = await chrome.runtime.sendMessage({ type: 'ppg.getLastTabUrl' });
    if (typeof res?.url === 'string' && res.url) return res.url;
  } catch {
    /* ignore */
  }
  try {
    const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
    return tab?.url ?? null;
  } catch {
    return null;
  }
}

async function paint(prefs: Prefs): Promise<void> {
  const lang = resolveLanguage(prefs);
  const m = messagesFor(lang);
  document.documentElement.lang = lang;
  document.title = m.extName;

  $('title').textContent = m.extName;
  $('brand').textContent = m.byAi4Context;
  $('lbl-language').textContent = m.langLabel;
  $('help').textContent = m.helpOnDemand;
  $('lbl-enabled').textContent = m.enabled;
  $('lbl-sensitivity').textContent = m.sensitivity;
  $('lbl-nano').textContent = m.nanoAssist;
  $('hosts-hint').textContent = m.hostsHint;
  $('save-note').textContent = m.saveNote;
  $('footer-by-prefix').textContent = m.footerByPrefix;
  $('footer-support').textContent = m.footerSupport;
  $('privacy-link').textContent = m.privacy;

  const sens = $('sensitivity') as HTMLSelectElement;
  sens.options[0].text = m.sensitivityStrict;
  sens.options[1].text = m.sensitivityBalanced;
  sens.options[2].text = m.sensitivityRelaxed;

  ($('enabled') as HTMLInputElement).checked = prefs.enabled;
  sens.value = prefs.sensitivity;
  ($('nano') as HTMLInputElement).checked = prefs.nanoAssist;
  ($('locale-select') as HTMLSelectElement).value = lang;

  const statusEl = $('status');
  if (!prefs.enabled) {
    statusEl.textContent = m.statusDisabled;
    statusEl.dataset.kind = 'off';
    return;
  }

  const url = await lastBrowserTabUrl();
  if (url && isSupportedAiUrl(url)) {
    statusEl.textContent = m.statusActive;
    statusEl.dataset.kind = 'active';
  } else {
    statusEl.textContent = m.statusInactivePage;
    statusEl.dataset.kind = 'inactive';
  }
}

async function persistFromUi(language: Prefs['language']): Promise<void> {
  const prefs: Prefs = {
    enabled: ($('enabled') as HTMLInputElement).checked,
    sensitivity: ($('sensitivity') as HTMLSelectElement).value as Sensitivity,
    language,
    nanoAssist: ($('nano') as HTMLInputElement).checked,
  };
  await savePrefs(prefs);
  await paint(prefs);
}

async function main(): Promise<void> {
  const prefs = await loadPrefs();
  $('version-strip').textContent = `v${chrome.runtime.getManifest().version}`;
  await paint(prefs);

  ['enabled', 'sensitivity', 'nano'].forEach((id) => {
    $(id).addEventListener('change', () => {
      const lang = ($('locale-select') as HTMLSelectElement).value as 'es' | 'en';
      void persistFromUi(lang);
    });
  });

  $('locale-select').addEventListener('change', () => {
    const lang = ($('locale-select') as HTMLSelectElement).value as 'es' | 'en';
    void persistFromUi(lang);
  });

  $('privacy-link').addEventListener('click', (e) => {
    e.preventDefault();
    const lang = ($('locale-select') as HTMLSelectElement).value as 'es' | 'en';
    const file = lang === 'es' ? 'privacy.html' : 'privacy-en.html';
    window.open(chrome.runtime.getURL(file), '_blank', 'noopener,noreferrer');
  });
}

void main();
