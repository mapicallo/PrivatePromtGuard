import { describe, expect, it } from 'vitest';
import { detectDeterministic } from './patterns';
import { redactText } from '../redact';
import { filterBySensitivity, filterFindings } from '../types';

describe('detectDeterministic', () => {
  it('finds email, api key and IBAN', () => {
    const text =
      'Cliente mapicalloperez1971@gmail.com IBAN ES9121000418450200051332 key sk-abcdefghijklmnopqrstuvwxyz123456';
    const f = detectDeterministic(text);
    const types = new Set(f.map((x) => x.type));
    expect(types.has('email')).toBe(true);
    expect(types.has('iban')).toBe(true);
    expect(types.has('api_key')).toBe(true);
  });

  it('validates card with Luhn', () => {
    // Visa test number
    const f = detectDeterministic('pay with 4111111111111111 please');
    expect(f.some((x) => x.type === 'card')).toBe(true);
  });

  it('ignores short numeric noise as phone', () => {
    const f = detectDeterministic('chapter 12 page 3');
    expect(f.some((x) => x.type === 'phone')).toBe(false);
  });
});

describe('redact + sensitivity', () => {
  it('redacts from the end without breaking indexes', () => {
    const text = 'a@b.co and sk-abcdefghijklmnopqrstuvwxyz123456';
    const f = detectDeterministic(text);
    const out = redactText(text, f);
    expect(out).toContain('[EMAIL]');
    expect(out).toContain('[API_KEY]');
    expect(out).not.toContain('sk-abc');
  });

  it('filters low severity in balanced mode', () => {
    const f = detectDeterministic('only mail test@example.com here');
    expect(filterBySensitivity(f, 'balanced')).toHaveLength(0);
    expect(filterBySensitivity(f, 'strict').length).toBeGreaterThan(0);
  });

  it('custom mode keeps only selected types', () => {
    const text =
      'mail test@example.com IBAN ES9121000418450200051332 key sk-abcdefghijklmnopqrstuvwxyz123456';
    const f = detectDeterministic(text);
    const onlyKeys = filterFindings(f, {
      enabled: true,
      sensitivity: 'custom',
      language: 'en',
      nanoAssist: false,
      enabledTypes: ['api_key'],
    });
    expect(onlyKeys.every((x) => x.type === 'api_key')).toBe(true);
    expect(onlyKeys.length).toBeGreaterThan(0);
  });
});
