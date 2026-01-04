import * as SQLite from 'expo-sqlite';

const DB_NAME = 'todo.db';

let db: SQLite.SQLiteDatabase | null = null;
let initPromise: Promise<SQLite.SQLiteDatabase> | null = null;

async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (db) return db;

  if (initPromise) {
    return initPromise;
  }

  initPromise = (async () => {
    try {
      const database = await SQLite.openDatabaseAsync(DB_NAME);

      if (!database) {
        throw new Error('expo-sqlite: failed to open database');
      }

      db = database;
      return database;
    } catch (error) {
      initPromise = null;
      throw error;
    }
  })();

  return initPromise;
}

interface SqlResult {
  rows: {
    length: number;
    item: (index: number) => any;
  };
}

export async function executeSqlAsync(sql: string, params: any[] = []): Promise<SqlResult> {
  const runQuery = async (database: SQLite.SQLiteDatabase) => {
    const trimmedSql = sql.trim().toUpperCase();

    // For SELECT queries, use getAllAsync
    if (trimmedSql.startsWith('SELECT')) {
      const rows = await database.getAllAsync(sql, params);
      return {
        rows: {
          length: rows.length,
          item: (index: number) => rows[index]
        }
      };
    }

    // For INSERT, UPDATE, DELETE, use runAsync
    await database.runAsync(sql, params);
    return {
      rows: {
        length: 0,
        item: () => null
      }
    };
  };

  try {
    const database = await getDb();
    return await runQuery(database);
  } catch (error: any) {
    // Handle stale database connection
    if (error?.message?.includes('Cannot use shared object that was already released') ||
      error?.message?.includes('NativeDatabase')) {
      console.warn('Database connection stale, reconnecting...');
      db = null;
      initPromise = null;
      const database = await getDb();
      return await runQuery(database);
    }
    throw error;
  }
}

export async function transactionAsync(fn: (db: SQLite.SQLiteDatabase) => Promise<void>): Promise<void> {
  const database = await getDb();
  await database.withTransactionAsync(async () => {
    await fn(database);
  });
}

export { getDb };
