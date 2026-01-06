import { executeSqlAsync, getDb, deleteDatabase, closeDb } from '../storage/db';
import { migrations } from '../storage/migrations';
// import { seedIfEmpty } from '../storage/seed';

let initialized = false;

export function resetInitializedFlag() {
  initialized = false;
}

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

/**
 * Resets the database by clearing all user data and resetting to default state.
 * This is useful for preparing a clean database before building an APK.
 * 
 * @param deleteFile - If true, completely deletes the database file and recreates it.
 *                     If false, only clears data but keeps the schema.
 */
export async function resetDatabase(deleteFile: boolean = false): Promise<void> {
  if (deleteFile) {
    // Completely delete and recreate the database
    await deleteDatabase();
    // Reset initialization flag so database will be recreated on next access
    resetInitializedFlag();
    // Reinitialize the database (will apply migrations)
    await initDb();
    console.log('Database file deleted and recreated successfully');
  } else {
    // Just clear data but keep schema
    const db = await getDb();
    
    await db.withTransactionAsync(async () => {
      // Clear all user data
      await db.runAsync('DELETE FROM task_tags');
      await db.runAsync('DELETE FROM subtasks');
      await db.runAsync('DELETE FROM pomodoro_sessions');
      await db.runAsync('DELETE FROM tasks');
      await db.runAsync('DELETE FROM tags');
      await db.runAsync('DELETE FROM categories');
      await db.runAsync('DELETE FROM settings');
      
      // Reset categories to defaults
      await db.runAsync(`
        INSERT INTO categories (id, name, color, isDefault, createdAt) VALUES
          ('cat_personal', 'Personal', '#8b5cf6', 1, datetime('now')),
          ('cat_work', 'Work', '#3b82f6', 1, datetime('now')),
          ('cat_habit', 'Habit', '#10b981', 1, datetime('now')),
          ('cat_projects', 'Projects', '#f59e0b', 1, datetime('now')),
          ('cat_others', 'Others', '#6b7280', 1, datetime('now')),
          ('cat_completed', 'Completed', '#94a3b8', 1, datetime('now'))
      `);
    });
    
    console.log('Database reset completed successfully');
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

