import { Tag } from '@todolist/shared-types';
import { executeSqlAsync, transactionAsync } from '../storage/db';

function rowToTag(row: any): Tag {
  return {
    id: row.id,
    label: row.label,
    color: row.color,
    chipColor: row.chipColor,
    createdAt: row.createdAt
  };
}

export async function getTags(): Promise<Tag[]> {
  const res = await executeSqlAsync('SELECT * FROM tags ORDER BY label ASC');
  const rows = (res as any).rows as any;
  const out: Tag[] = [];
  for (let i = 0; i < rows.length; i++) out.push(rowToTag(rows.item(i)));
  return out;
}

function generateId() {
  return Date.now().toString() + Math.random().toString(36).slice(2, 8);
}

export async function createTag(t: Partial<Tag>): Promise<Tag> {
  const id = t.id ?? generateId();
  const now = new Date().toISOString();
  await executeSqlAsync('INSERT INTO tags (id, label, color, chipColor, createdAt) VALUES (?, ?, ?, ?, ?)', [
    id,
    t.label || '',
    t.color ?? null,
    t.chipColor ?? null,
    now
  ]);
  const res = await executeSqlAsync('SELECT * FROM tags WHERE id = ? LIMIT 1', [id]);
  return rowToTag((res as any).rows.item(0));
}

export async function updateTag(id: string, updates: Partial<Tag>): Promise<Tag | null> {
  const res0 = await executeSqlAsync('SELECT * FROM tags WHERE id = ? LIMIT 1', [id]);
  const rows0 = (res0 as any).rows as any;
  if (rows0.length === 0) return null;
  const existing = rowToTag(rows0.item(0));
  const merged = { ...existing, ...updates } as Tag;
  await executeSqlAsync('UPDATE tags SET label=?, color=?, chipColor=? WHERE id=?', [merged.label, merged.color ?? null, merged.chipColor ?? null, id]);
  const res = await executeSqlAsync('SELECT * FROM tags WHERE id = ? LIMIT 1', [id]);
  return rowToTag((res as any).rows.item(0));
}

export async function deleteTag(id: string): Promise<void> {
  await executeSqlAsync('DELETE FROM tags WHERE id = ?', [id]);
}

export async function setTagsForTask(taskId: string, tagIds: string[]): Promise<void> {
  await transactionAsync(async (db) => {
    // remove existing
    await db.runAsync('DELETE FROM task_tags WHERE task_id = ?', [taskId]);
    // insert new
    for (const tagId of tagIds) {
      await db.runAsync('INSERT OR IGNORE INTO task_tags (task_id, tag_id) VALUES (?, ?)', [taskId, tagId]);
    }
  });
}
