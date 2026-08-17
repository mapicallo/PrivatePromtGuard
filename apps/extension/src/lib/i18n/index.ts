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
  refreshTab: string;
  sensitivityCustom: string;
  customTypesHint: string;
  customTypesEmpty: string;
  typeEmail: string;
  typePhone: string;
  typeDni: string;
  typeIban: string;
  typeCard: string;
  typeJwt: string;
  typeApiKey: string;
  typePem: string;
  typeSecret: string;
  typeNano: string;
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
  sensitivityCustom: 'Personalizada (elige qué detectar)',
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
  refreshTab: 'Actualizar pestaña activa',
  customTypesHint: 'Marca los tipos que quieres avisar al enviar.',
  customTypesEmpty: 'Si no marcas ninguno, no habrá avisos.',
  typeEmail: 'Correos electrónicos',
  typePhone: 'Teléfonos',
  typeDni: 'DNI / NIE',
  typeIban: 'IBAN',
  typeCard: 'Números de tarjeta',
  typeJwt: 'JWT',
  typeApiKey: 'API keys y tokens',
  typePem: 'Claves privadas (PEM)',
  typeSecret: 'Asignaciones tipo password=',
  typeNano: 'Posiblemente sensible (IA local)',
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
  sensitivityCustom: 'Custom (choose what to detect)',
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
  refreshTab: 'Refresh active tab',
  customTypesHint: 'Tick the types you want to be warned about when sending.',
  customTypesEmpty: 'If none are ticked, there will be no warnings.',
  typeEmail: 'Email addresses',
  typePhone: 'Phone numbers',
  typeDni: 'DNI / NIE',
  typeIban: 'IBAN',
  typeCard: 'Card numbers',
  typeJwt: 'JWT',
  typeApiKey: 'API keys and tokens',
  typePem: 'Private keys (PEM)',
  typeSecret: 'password= style assignments',
  typeNano: 'Possibly sensitive (on-device AI)',
};

export function messagesFor(lang: 'es' | 'en'): Messages {
  return lang === 'es' ? es : en;
}
