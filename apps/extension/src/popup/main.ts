import { messagesFor } from '../lib/i18n';
import { loadPrefs, resolveLanguage, savePrefs } from '../lib/prefs';
import type { Prefs, Sensitivity } from '../lib/types';

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;

async function paint(prefs: Prefs): Promise<void> {
  const lang = resolveLanguage(prefs);
  const m = messagesFor(lang);

  $('title').textContent = m.extName;
  $('brand').textContent = m.brand;
  $('lbl-enabled').textContent = m.enabled;
  $('lbl-sensitivity').textContent = m.sensitivity;
  $('lbl-language').textContent = m.language;
  $('lbl-nano').textContent = m.nanoAssist;
  $('hosts-hint').textContent = m.hostsHint;
  $('save-note').textContent = m.saveNote;
  $('privacy').textContent = m.privacy;
  $('privacy').setAttribute('href', lang === 'es' ? 'privacy.html' : 'privacy-en.html');

  const sens = $('sensitivity') as HTMLSelectElement;
  sens.options[0].text = m.sensitivityStrict;
  sens.options[1].text = m.sensitivityBalanced;
  sens.options[2].text = m.sensitivityRelaxed;
  const language = $('language') as HTMLSelectElement;
  language.options[0].text = m.langAuto;
  language.options[1].text = m.langEs;
  language.options[2].text = m.langEn;

  ($('enabled') as HTMLInputElement).checked = prefs.enabled;
  sens.value = prefs.sensitivity;
  language.value = prefs.language;
  ($('nano') as HTMLInputElement).checked = prefs.nanoAssist;

  let status = prefs.enabled ? m.statusActive : m.statusDisabled;
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const host = tab?.url ? new URL(tab.url).hostname : '';
    const ok =
      /chatgpt\.com$|chat\.openai\.com$|claude\.ai$|gemini\.google\.com$|bard\.google\.com$/i.test(
        host,
      ) ||
      /\.chatgpt\.com$|\.claude\.ai$|\.gemini\.google\.com$/i.test(host);
    if (prefs.enabled && tab?.url && !ok) status = m.statusInactivePage;
  } catch {
    /* ignore */
  }
  $('status').textContent = status;
}

async function persistFromUi(): Promise<void> {
  const prefs: Prefs = {
    enabled: ($('enabled') as HTMLInputElement).checked,
    sensitivity: ($('sensitivity') as HTMLSelectElement).value as Sensitivity,
    language: ($('language') as HTMLSelectElement).value as Prefs['language'],
    nanoAssist: ($('nano') as HTMLInputElement).checked,
  };
  await savePrefs(prefs);
  await paint(prefs);
}

async function main(): Promise<void> {
  const prefs = await loadPrefs();
  await paint(prefs);
  ['enabled', 'sensitivity', 'language', 'nano'].forEach((id) => {
    $(id).addEventListener('change', () => void persistFromUi());
  });
}

void main();
