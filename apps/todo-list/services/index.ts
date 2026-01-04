import { executeSqlAsync, getDb } from '../storage/db';
import { migrations } from '../storage/migrations';
// import { seedIfEmpty } from '../storage/seed';

let initialized = false;

async function applyMigrations() {
  const db = await getDb();

  for (const m of migrations) {
    let applied = false;
    try {
      const check = await executeSqlAsync('SELECT COUNT(1) as c FROM migrations WHERE name = ? LIMIT 1', [m.name]);
      const rows = (check as any).rows as any;
      if (rows.length && rows.item(0).c > 0) applied = true;
    } catch (err) {
      // If the migrations table does not exist, we'll apply the migration SQL.
      applied = false;
    }
    if (applied) continue;

    // Use execAsync to execute the entire migration SQL (handles multiple statements)
    // Remove BEGIN TRANSACTION and COMMIT as withTransactionAsync handles that
    const sql = m.sql.replace(/BEGIN TRANSACTION;?\s*/i, '').replace(/COMMIT;?\s*/i, '').trim();

    try {
      await db.withTransactionAsync(async () => {
        await db.execAsync(sql);
      });
    } catch (e) {
      console.error(`Migration ${m.name} failed:`, e);
      throw e;
    }

    // record migration as applied
    await executeSqlAsync('INSERT OR IGNORE INTO migrations (name) VALUES (?)', [m.name]);
  }
}

export async function initDb() {
  if (initialized) return;
  initialized = true;
  try {
    await applyMigrations();
    // await seedIfEmpty();
  } catch (e) {
    console.warn('DB init error', e);
    throw e;
  }
}

// auto-init on import (safe to call multiple times)
initDb().catch(() => { });

export * from '@todolist/shared-types';
export * from './categories';
export * from './settings';
export * from './subtasks';
export * from './tags';
export * from './tasks';

