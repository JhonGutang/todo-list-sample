import { executeSqlAsync } from './db';

export async function getSetting(key: string): Promise<string | null> {
  const res = await executeSqlAsync('SELECT value FROM settings WHERE key = ? LIMIT 1', [key]);
  const rows = (res as any).rows as any;
  if (rows.length === 0) return null;
  return rows.item(0).value;
}

export async function setSetting(key: string, value: string): Promise<void> {
  await executeSqlAsync('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', [key, value]);
}
