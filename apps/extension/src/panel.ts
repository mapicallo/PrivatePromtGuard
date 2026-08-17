import { isSupportedAiUrl } from './lib/aiHosts';
import { messagesFor, type Messages } from './lib/i18n';
import { loadPrefs, resolveLanguage, savePrefs } from './lib/prefs';
import {
  ALL_FINDING_TYPES,
  isFindingType,
  type FindingType,
  type Prefs,
  type Sensitivity,
} from './lib/types';

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;

const TYPE_LABEL: Record<FindingType, keyof Messages> = {
  email: 'typeEmail',
  phone: 'typePhone',
  dni: 'typeDni',
  iban: 'typeIban',
  card: 'typeCard',
  jwt: 'typeJwt',
  api_key: 'typeApiKey',
  pem: 'typePem',
  secret_assignment: 'typeSecret',
  nano_sensitive: 'typeNano',
};

async function lastBrowserTabUrl(refresh = false): Promise<string | null> {
  try {
    const res = await chrome.runtime.sendMessage({
      type: refresh ? 'ppg.refreshTabUrl' : 'ppg.getLastTabUrl',
    });
    if (typeof res?.url === 'string' && res.url) return res.url;
  } catch {
    /* ignore */
  }
  return null;
}

function selectedTypes(): FindingType[] {
  return [...document.querySelectorAll<HTMLInputElement>('#custom-types input[data-type]')]
    .filter((el) => el.checked)
    .map((el) => el.dataset.type)
    .filter(isFindingType);
}

function applyTypeChecks(types: FindingType[]): void {
  const set = new Set(types.length ? types : ALL_FINDING_TYPES);
  document.querySelectorAll<HTMLInputElement>('#custom-types input[data-type]').forEach((el) => {
    const t = el.dataset.type;
    el.checked = isFindingType(t) && set.has(t);
  });
}

async function paint(prefs: Prefs, refresh = false): Promise<void> {
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
  $('refresh-tab-btn').textContent = m.refreshTab;
  $('custom-types-hint').textContent = m.customTypesHint;
  $('custom-types-empty').textContent = m.customTypesEmpty;

  document.querySelectorAll<HTMLElement>('[data-type-label]').forEach((el) => {
    const key = el.getAttribute('data-type-label');
    if (isFindingType(key)) el.textContent = m[TYPE_LABEL[key]] as string;
  });

  const sens = $('sensitivity') as HTMLSelectElement;
  sens.options[0].text = m.sensitivityStrict;
  sens.options[1].text = m.sensitivityBalanced;
  sens.options[2].text = m.sensitivityRelaxed;
  sens.options[3].text = m.sensitivityCustom;

  ($('enabled') as HTMLInputElement).checked = prefs.enabled;
  sens.value = prefs.sensitivity;
  ($('nano') as HTMLInputElement).checked = prefs.nanoAssist;
  ($('locale-select') as HTMLSelectElement).value = lang;
  applyTypeChecks(prefs.enabledTypes);
  $('custom-types').hidden = prefs.sensitivity !== 'custom';

  const statusEl = $('status');
  if (!prefs.enabled) {
    statusEl.textContent = m.statusDisabled;
    statusEl.dataset.kind = 'off';
    return;
  }

  const url = await lastBrowserTabUrl(refresh);
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
    enabledTypes: selectedTypes(),
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

  $('custom-types').addEventListener('change', () => {
    const lang = ($('locale-select') as HTMLSelectElement).value as 'es' | 'en';
    void persistFromUi(lang);
  });

  $('locale-select').addEventListener('change', () => {
    const lang = ($('locale-select') as HTMLSelectElement).value as 'es' | 'en';
    void persistFromUi(lang);
  });

  $('refresh-tab-btn').addEventListener('click', () => {
    void (async () => {
      const btn = $('refresh-tab-btn') as HTMLButtonElement;
      btn.disabled = true;
      try {
        await paint(await loadPrefs(), true);
      } finally {
        btn.disabled = false;
      }
    })();
  });

  window.addEventListener('focus', () => {
    void loadPrefs().then((p) => paint(p, true));
  });

  $('privacy-link').addEventListener('click', (e) => {
    e.preventDefault();
    const lang = ($('locale-select') as HTMLSelectElement).value as 'es' | 'en';
    const file = lang === 'es' ? 'privacy.html' : 'privacy-en.html';
    window.open(chrome.runtime.getURL(file), '_blank', 'noopener,noreferrer');
  });
}

void main();
