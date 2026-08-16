import { chatgptHost } from './chatgpt';
import { claudeHost } from './claude';
import { geminiHost } from './gemini';
import type { HostAdapter } from './shared';

const ALL: HostAdapter[] = [chatgptHost, claudeHost, geminiHost];

export function resolveHost(hostname = location.hostname): HostAdapter | null {
  return ALL.find((h) => h.matchHost(hostname)) || null;
}

export type { HostAdapter };
