const AI_HOST =
  /(?:^|\.)(chatgpt\.com|chat\.openai\.com|claude\.ai|gemini\.google\.com|bard\.google\.com)$/i;

export function isSupportedAiHost(hostname: string): boolean {
  return AI_HOST.test(hostname);
}

export function isSupportedAiUrl(url: string | undefined): boolean {
  if (!url) return false;
  try {
    return isSupportedAiHost(new URL(url).hostname);
  } catch {
    return false;
  }
}
