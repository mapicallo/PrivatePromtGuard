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

export type Finding = {
  type: FindingType;
  severity: FindingSeverity;
  start: number;
  end: number;
  match: string;
  label: string;
};

export type Sensitivity = 'strict' | 'balanced' | 'relaxed';

export type Prefs = {
  enabled: boolean;
  sensitivity: Sensitivity;
  language: 'es' | 'en' | 'auto';
  nanoAssist: boolean;
};

export const DEFAULT_PREFS: Prefs = {
  enabled: true,
  sensitivity: 'balanced',
  language: 'auto',
  nanoAssist: true,
};

export const STORAGE_KEY = 'ppg_prefs_v1';

export function severityRank(s: FindingSeverity): number {
  return s === 'high' ? 3 : s === 'medium' ? 2 : 1;
}

/** Which severities trigger the overlay for a given sensitivity. */
export function minSeverityFor(sensitivity: Sensitivity): FindingSeverity {
  if (sensitivity === 'strict') return 'low';
  if (sensitivity === 'relaxed') return 'high';
  return 'medium';
}

export function filterBySensitivity(findings: Finding[], sensitivity: Sensitivity): Finding[] {
  const min = severityRank(minSeverityFor(sensitivity));
  return findings.filter((f) => severityRank(f.severity) >= min);
}
