import type { Finding } from '../types';
import { dedupeFindings, detectDeterministic } from './patterns';

export { detectDeterministic, dedupeFindings, maskPreview } from './patterns';

export function detectAll(text: string, extra: Finding[] = []): Finding[] {
  if (!extra.length) return detectDeterministic(text);
  return dedupeFindings([...detectDeterministic(text), ...extra]);
}
