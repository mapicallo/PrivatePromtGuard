import type { Finding, FindingSeverity, FindingType } from '../types';

const EMAIL_RE =
  /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;

const PHONE_RE =
  /(?:\+|00)?\d{1,3}[\s.-]?(?:\(?\d{2,4}\)?[\s.-]?)?\d{3}[\s.-]?\d{2,4}[\s.-]?\d{2,4}\b/g;

const DNI_RE = /\b\d{8}[A-Z]\b/gi;
const NIE_RE = /\b[XYZ]\d{7}[A-Z]\b/gi;

const IBAN_RE = /\b[A-Z]{2}\d{2}[A-Z0-9]{10,30}\b/gi;

const JWT_RE = /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/g;

const API_KEY_RE =
  /\b(?:sk-[A-Za-z0-9]{16,}|sk-proj-[A-Za-z0-9_-]{16,}|AIza[0-9A-Za-z_-]{20,}|ghp_[A-Za-z0-9]{20,}|gho_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,}|xox[baprs]-[A-Za-z0-9-]{10,}|Bearer\s+[A-Za-z0-9._\-]{20,})\b/gi;

const PEM_RE = /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----[\s\S]*?-----END (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/g;

const SECRET_ASSIGN_RE =
  /(?:^|[\s;])(?:password|passwd|pwd|secret|api[_-]?key|access[_-]?token|auth[_-]?token|private[_-]?key)\s*[:=]\s*['"]?[^\s'"]{6,}/gim;

const CARD_CANDIDATE_RE = /\b(?:\d[ -]*?){13,19}\b/g;

const LABELS: Record<FindingType, string> = {
  email: 'Email',
  phone: 'Phone',
  dni: 'DNI/NIE',
  iban: 'IBAN',
  card: 'Card number',
  jwt: 'JWT',
  api_key: 'API key / token',
  pem: 'Private key (PEM)',
  secret_assignment: 'Secret assignment',
  nano_sensitive: 'Possibly sensitive',
};

function luhnOk(digits: string): boolean {
  let sum = 0;
  let alt = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let n = digits.charCodeAt(i) - 48;
    if (alt) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alt = !alt;
  }
  return sum % 10 === 0;
}

function pushMatch(
  out: Finding[],
  text: string,
  re: RegExp,
  type: FindingType,
  severity: FindingSeverity,
  validate?: (m: string) => boolean,
): void {
  re.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    const match = m[0];
    if (validate && !validate(match)) continue;
    out.push({
      type,
      severity,
      start: m.index,
      end: m.index + match.length,
      match,
      label: LABELS[type],
    });
  }
}

function overlaps(a: Finding, b: Finding): boolean {
  return a.start < b.end && b.start < a.end;
}

function preferType(a: FindingType, b: FindingType): FindingType {
  const rank: FindingType[] = [
    'pem',
    'api_key',
    'jwt',
    'card',
    'iban',
    'dni',
    'secret_assignment',
    'email',
    'phone',
    'nano_sensitive',
  ];
  const ia = rank.indexOf(a);
  const ib = rank.indexOf(b);
  return ia <= ib ? a : b;
}

/** Merge overlapping spans; keep the more specific / severe finding. */
export function dedupeFindings(findings: Finding[]): Finding[] {
  const sorted = [...findings].sort((a, b) => a.start - b.start || b.end - a.end);
  const kept: Finding[] = [];
  for (const f of sorted) {
    const clash = kept.find((k) => overlaps(k, f));
    if (!clash) {
      kept.push(f);
      continue;
    }
    const prefer =
      clash.severity !== f.severity
        ? clash.severity === 'high' || (clash.severity === 'medium' && f.severity === 'low')
          ? clash
          : f
        : preferType(clash.type, f.type) === clash.type
          ? clash
          : f;
    if (prefer !== clash) {
      kept.splice(kept.indexOf(clash), 1, f);
    }
  }
  return kept.sort((a, b) => a.start - b.start);
}

export function detectDeterministic(text: string): Finding[] {
  if (!text || !text.trim()) return [];
  const out: Finding[] = [];

  pushMatch(out, text, EMAIL_RE, 'email', 'low');
  pushMatch(out, text, PHONE_RE, 'phone', 'low', (m) => {
    const digits = m.replace(/\D/g, '');
    return digits.length >= 9 && digits.length <= 15 && !/^0+$/.test(digits);
  });
  pushMatch(out, text, DNI_RE, 'dni', 'medium');
  pushMatch(out, text, NIE_RE, 'dni', 'medium');
  pushMatch(out, text, IBAN_RE, 'iban', 'medium', (m) => {
    const compact = m.replace(/\s+/g, '');
    return compact.length >= 15 && compact.length <= 34;
  });
  pushMatch(out, text, JWT_RE, 'jwt', 'high');
  pushMatch(out, text, API_KEY_RE, 'api_key', 'high');
  pushMatch(out, text, PEM_RE, 'pem', 'high');
  pushMatch(out, text, SECRET_ASSIGN_RE, 'secret_assignment', 'high');

  pushMatch(out, text, CARD_CANDIDATE_RE, 'card', 'high', (m) => {
    const digits = m.replace(/\D/g, '');
    if (digits.length < 13 || digits.length > 19) return false;
    // Avoid matching long pure IBANs already caught
    if (/^[A-Z]{2}/i.test(m.trim())) return false;
    return luhnOk(digits);
  });

  return dedupeFindings(out);
}

export function maskPreview(value: string, keepStart = 2, keepEnd = 2): string {
  const v = value.replace(/\s+/g, ' ').trim();
  if (v.length <= keepStart + keepEnd + 1) return '••••';
  return `${v.slice(0, keepStart)}••••${v.slice(-keepEnd)}`;
}
