export type Messages = {
  extName: string;
  brand: string;
  byAi4Context: string;
  langLabel: string;
  helpOnDemand: string;
  title: string;
  findingsCount: (n: number) => string;
  review: string;
  redact: string;
  sendAnyway: string;
  cancel: string;
  nanoBasic: string;
  nanoOn: string;
  disclaimer: string;
  enabled: string;
  sensitivity: string;
  sensitivityStrict: string;
  sensitivityBalanced: string;
  sensitivityRelaxed: string;
  nanoAssist: string;
  statusActive: string;
  statusInactivePage: string;
  statusDisabled: string;
  hostsHint: string;
  privacy: string;
  saveNote: string;
  footerByPrefix: string;
  footerSupport: string;
  dragHint: string;
};

export const es: Messages = {
  extName: 'PrivatePrompt Guard',
  brand: 'By AI4Context',
  byAi4Context: 'By AI4Context',
  langLabel: 'Idioma',
  helpOnDemand:
    'Revisa el cuadro de mensaje solo al enviar. No vigilamos tus pestañas en segundo plano.',
  title: 'Posible información sensible',
  findingsCount: (n) => `${n} hallazgo${n === 1 ? '' : 's'}`,
  review: 'Revisar en el cuadro',
  redact: 'Anonimizar y pegar',
  sendAnyway: 'Enviar igualmente',
  cancel: 'Cancelar',
  nanoBasic: 'Detección básica (IA local no disponible)',
  nanoOn: 'Incluye ayuda de IA local (opcional)',
  disclaimer: 'Puede fallar. No es DLP empresarial. Tú decides si enviar.',
  enabled: 'Activado',
  sensitivity: 'Sensibilidad',
  sensitivityStrict: 'Estricta (incluye emails/teléfonos)',
  sensitivityBalanced: 'Equilibrada (recomendada)',
  sensitivityRelaxed: 'Relajada (solo alto riesgo)',
  nanoAssist: 'Usar Gemini Nano si está disponible',
  statusActive: 'Listo en sitios de IA compatibles',
  statusInactivePage: 'Inactivo en esta página (solo ChatGPT, Claude, Gemini)',
  statusDisabled: 'Desactivado — los envíos no se revisan',
  hostsHint: 'Solo actúa en ChatGPT, Claude y Gemini web. El texto no se envía a AI4Context.',
  privacy: 'Privacidad',
  saveNote: 'Los cambios se guardan en este dispositivo.',
  footerByPrefix: 'por',
  footerSupport: 'Apoyar',
  dragHint: 'Arrastra esta ventana para ver el texto del cuadro',
};

export const en: Messages = {
  extName: 'PrivatePrompt Guard',
  brand: 'By AI4Context',
  byAi4Context: 'By AI4Context',
  langLabel: 'Language',
  helpOnDemand:
    'Reviews the message box only when you send. We do not monitor your tabs in the background.',
  title: 'Possible sensitive information',
  findingsCount: (n) => `${n} finding${n === 1 ? '' : 's'}`,
  review: 'Review in the box',
  redact: 'Anonymize & paste',
  sendAnyway: 'Send anyway',
  cancel: 'Cancel',
  nanoBasic: 'Basic detection (on-device AI unavailable)',
  nanoOn: 'Includes optional on-device AI assist',
  disclaimer: 'May miss secrets. Not enterprise DLP. You decide whether to send.',
  enabled: 'Enabled',
  sensitivity: 'Sensitivity',
  sensitivityStrict: 'Strict (includes emails/phones)',
  sensitivityBalanced: 'Balanced (recommended)',
  sensitivityRelaxed: 'Relaxed (high risk only)',
  nanoAssist: 'Use Gemini Nano when available',
  statusActive: 'Ready on supported AI sites',
  statusInactivePage: 'Inactive on this page (ChatGPT, Claude, Gemini only)',
  statusDisabled: 'Disabled — sends are not reviewed',
  hostsHint: 'Only runs on ChatGPT, Claude, and Gemini web. Text is not sent to AI4Context.',
  privacy: 'Privacy',
  saveNote: 'Changes are saved on this device.',
  footerByPrefix: 'by',
  footerSupport: 'Support',
  dragHint: 'Drag this window to see the message box',
};

export function messagesFor(lang: 'es' | 'en'): Messages {
  return lang === 'es' ? es : en;
}
