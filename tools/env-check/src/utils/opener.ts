import open from 'open';

export async function openDocsIfPossible(mdPath: string, _reason: string, allowOpen: boolean) {
  if (!allowOpen) return;
  if (process.env.CI === 'true') return;
  try { await open(mdPath); } catch { /* never fail on docs open */ }
}
