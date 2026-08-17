export type FindingSeverity = 'high' | 'medium' | 'low';

export type FindingType =
  | 'email'
  | 'phone'
  | 'dni'
  | 'iban'
  | 'card'
  | 'jwt'
  | 'api_key'
  | 'pem'
  | 'secret_assignment'
  | 'nano_sensitive';

export const ALL_FINDING_TYPES: FindingType[] = [
  'email',
  'phone',
  'dni',
  'iban',
  'card',
  'jwt',
  'api_key',
  'pem',
  'secret_assignment',
  'nano_sensitive',
];

export type Finding = {
  type: FindingType;
  severity: FindingSeverity;
  start: number;
  end: number;
  match: string;
  label: string;
};

export type Sensitivity = 'strict' | 'balanced' | 'relaxed' | 'custom';

export type Prefs = {
  enabled: boolean;
  sensitivity: Sensitivity;
  language: 'es' | 'en' | 'auto';
  nanoAssist: boolean;
  enabledTypes: FindingType[];
};

export const DEFAULT_PREFS: Prefs = {
  enabled: true,
  sensitivity: 'balanced',
  language: 'auto',
  nanoAssist: true,
  enabledTypes: [...ALL_FINDING_TYPES],
};

export const STORAGE_KEY = 'ppg_prefs_v1';

export function isFindingType(v: unknown): v is FindingType {
  return typeof v === 'string' && (ALL_FINDING_TYPES as string[]).includes(v);
}

export function severityRank(s: FindingSeverity): number {
  return s === 'high' ? 3 : s === 'medium' ? 2 : 1;
}

/** Which severities trigger the overlay for a given preset. */
export function minSeverityFor(sensitivity: Exclude<Sensitivity, 'custom'>): FindingSeverity {
  if (sensitivity === 'strict') return 'low';
  if (sensitivity === 'relaxed') return 'high';
  return 'medium';
}

export function filterBySensitivity(findings: Finding[], sensitivity: Sensitivity): Finding[] {
  if (sensitivity === 'custom') return findings;
  const min = severityRank(minSeverityFor(sensitivity));
  return findings.filter((f) => severityRank(f.severity) >= min);
}

export function filterFindings(findings: Finding[], prefs: Prefs): Finding[] {
  if (prefs.sensitivity === 'custom') {
    const allowed = new Set((prefs.enabledTypes || []).filter(isFindingType));
    return findings.filter((f) => allowed.has(f.type));
  }
  return filterBySensitivity(findings, prefs.sensitivity);
}
