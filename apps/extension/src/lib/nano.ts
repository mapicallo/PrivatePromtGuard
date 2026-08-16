import type { Finding } from './types';
import { dedupeFindings } from './detect/patterns';

type LanguageModelCtor = {
  availability?: () => Promise<string>;
  create?: (opts?: { expectedInputs?: unknown[] }) => Promise<{
    prompt: (input: string, opts?: { responseConstraint?: object }) => Promise<string>;
    destroy?: () => void;
  }>;
};

declare global {
  interface Window {
    LanguageModel?: LanguageModelCtor;
  }
}

const SCHEMA = {
  type: 'object',
  properties: {
    findings: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          text: { type: 'string' },
          reason: { type: 'string' },
        },
        required: ['text'],
      },
    },
  },
  required: ['findings'],
} as const;

function getLM(): LanguageModelCtor | undefined {
  return typeof globalThis !== 'undefined'
    ? (globalThis as unknown as { LanguageModel?: LanguageModelCtor }).LanguageModel
    : undefined;
}

export async function nanoAvailable(): Promise<boolean> {
  try {
    const LM = getLM();
    if (!LM?.availability) return false;
    const a = await LM.availability();
    return a === 'available' || a === 'readily';
  } catch {
    return false;
  }
}

/**
 * Optional semantic pass. Never throws to caller; returns [] on failure/timeout.
 * Does not replace deterministic detection.
 */
export async function nanoScan(text: string, timeoutMs = 1200): Promise<Finding[]> {
  const snippet = text.slice(0, 3500);
  if (snippet.trim().length < 40) return [];

  const LM = getLM();
  if (!LM?.create) return [];

  const run = async (): Promise<Finding[]> => {
    let session: Awaited<ReturnType<NonNullable<LanguageModelCtor['create']>>> | undefined;
    try {
      session = await LM.create!();
      const prompt = `You help flag likely confidential fragments in a draft prompt before it is sent to a cloud AI.
Return JSON only. List short exact substrings that look like: customer names with contracts, internal project codes, passwords, personal addresses, or confidential business figures.
Do not invent text that is not in the input. If nothing sensitive, return {"findings":[]}.

INPUT:
"""
${snippet}
"""`;

      let raw: string;
      try {
        raw = await session.prompt(prompt, { responseConstraint: SCHEMA });
      } catch {
        raw = await session.prompt(prompt);
      }

      const parsed = JSON.parse(extractJson(raw)) as { findings?: { text?: string; reason?: string }[] };
      const out: Finding[] = [];
      for (const item of parsed.findings || []) {
        const frag = (item.text || '').trim();
        if (frag.length < 4 || frag.length > 120) continue;
        const idx = snippet.indexOf(frag);
        if (idx < 0) continue;
        out.push({
          type: 'nano_sensitive',
          severity: 'medium',
          start: idx,
          end: idx + frag.length,
          match: frag,
          label: 'Possibly sensitive',
        });
      }
      return dedupeFindings(out);
    } finally {
      try {
        session?.destroy?.();
      } catch {
        /* ignore */
      }
    }
  };

  return Promise.race([
    run().catch(() => [] as Finding[]),
    new Promise<Finding[]>((resolve) => setTimeout(() => resolve([]), timeoutMs)),
  ]);
}

function extractJson(s: string): string {
  const t = s.trim();
  if (t.startsWith('{')) return t;
  const a = t.indexOf('{');
  const b = t.lastIndexOf('}');
  if (a >= 0 && b > a) return t.slice(a, b + 1);
  return '{"findings":[]}';
}
