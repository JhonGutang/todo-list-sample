import { Subtask } from '@todolist/shared-types';
import { executeSqlAsync } from '../storage/db';

function rowToSubtask(row: any): Subtask {
  return {
    id: row.id,
    task_id: row.task_id,
    title: row.title,
    completed: !!row.completed,
    order: row.order
  };
}

export async function getSubtasksForTask(taskId: string): Promise<Subtask[]> {
  const res = await executeSqlAsync('SELECT * FROM subtasks WHERE task_id = ? ORDER BY "order" ASC', [taskId]);
  const rows = (res as any).rows as any;
  const out: Subtask[] = [];
  for (let i = 0; i < rows.length; i++) out.push(rowToSubtask(rows.item(i)));
  return out;
}

function generateId() {
  return Date.now().toString() + Math.random().toString(36).slice(2, 8);
}

export async function addSubtask(taskId: string, s: { title: string; order?: number | null }): Promise<Subtask> {
  const id = generateId();
  await executeSqlAsync('INSERT INTO subtasks (id, task_id, title, completed, "order") VALUES (?, ?, ?, ?, ?)', [
    id,
    taskId,
    s.title,
    0,
    s.order ?? null
  ]);
  const res = await executeSqlAsync('SELECT * FROM subtasks WHERE id = ? LIMIT 1', [id]);
  return rowToSubtask((res as any).rows.item(0));
}

export async function updateSubtask(id: string, updates: Partial<Subtask>): Promise<Subtask | null> {
  const res0 = await executeSqlAsync('SELECT * FROM subtasks WHERE id = ? LIMIT 1', [id]);
  const rows0 = (res0 as any).rows as any;
  if (rows0.length === 0) return null;
  const existing = rowToSubtask(rows0.item(0));
  const merged = { ...existing, ...updates } as Subtask;
  await executeSqlAsync('UPDATE subtasks SET title=?, completed=?, "order"=? WHERE id=?', [
    merged.title,
    merged.completed ? 1 : 0,
    merged.order ?? null,
    id
  ]);
  const res = await executeSqlAsync('SELECT * FROM subtasks WHERE id = ? LIMIT 1', [id]);
  return rowToSubtask((res as any).rows.item(0));
}

export async function toggleSubtask(id: string): Promise<Subtask | null> {
  const res0 = await executeSqlAsync('SELECT * FROM subtasks WHERE id = ? LIMIT 1', [id]);
  const rows0 = (res0 as any).rows as any;
  if (rows0.length === 0) return null;
  const cur = rowToSubtask(rows0.item(0));
  return updateSubtask(id, { completed: !cur.completed });
}

export async function deleteSubtask(id: string): Promise<void> {
  await executeSqlAsync('DELETE FROM subtasks WHERE id = ?', [id]);
}
