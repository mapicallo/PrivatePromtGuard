import type { Finding, FindingType } from './types';

const PLACEHOLDERS: Record<FindingType, string> = {
  email: '[EMAIL]',
  phone: '[PHONE]',
  dni: '[ID]',
  iban: '[IBAN]',
  card: '[CARD]',
  jwt: '[JWT]',
  api_key: '[API_KEY]',
  pem: '[PRIVATE_KEY]',
  secret_assignment: '[SECRET]',
  nano_sensitive: '[SENSITIVE]',
};

/** Replace findings from end to start so indexes stay valid. */
export function redactText(text: string, findings: Finding[]): string {
  const sorted = [...findings].sort((a, b) => b.start - a.start);
  let out = text;
  for (const f of sorted) {
    const ph = PLACEHOLDERS[f.type] || '[REDACTED]';
    out = out.slice(0, f.start) + ph + out.slice(f.end);
  }
  return out;
}

export function placeholderFor(type: FindingType): string {
  return PLACEHOLDERS[type] || '[REDACTED]';
}
