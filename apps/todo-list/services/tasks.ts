import { Task } from '@todolist/shared-types';
import { executeSqlAsync } from '../storage/db';

function rowToTask(row: any): Task {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    priority: row.priority,
    startDate: row.startDate,
    endDate: row.endDate,
    category_id: row.category_id,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    completed: !!row.completed,
    pomodoro_estimated: row.pomodoro_estimated,
    pomodoro_completed: row.pomodoro_completed
  };
}

export async function getAllTasks(): Promise<Task[]> {
  const res = await executeSqlAsync('SELECT * FROM tasks ORDER BY createdAt DESC');
  const rows = (res as any).rows as any;
  const out: Task[] = [];
  for (let i = 0; i < rows.length; i++) out.push(rowToTask(rows.item(i)));
  return out;
}

export async function getTaskById(id: string): Promise<Task | null> {
  const res = await executeSqlAsync('SELECT * FROM tasks WHERE id = ? LIMIT 1', [id]);
  const rows = (res as any).rows as any;
  if (rows.length === 0) return null;
  return rowToTask(rows.item(0));
}

function generateId() {
  return Date.now().toString() + Math.random().toString(36).slice(2, 8);
}

export async function createTask(data: Partial<Task>): Promise<Task> {
  const id = data.id ?? generateId();
  const now = new Date().toISOString();
  await executeSqlAsync(
    `INSERT INTO tasks (id, name, description, priority, startDate, endDate, category_id, createdAt, updatedAt, completed, pomodoro_estimated, pomodoro_completed)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      data.name || '',
      data.description || null,
      data.priority || 'medium',
      data.startDate || null,
      data.endDate || null,
      data.category_id || 'cat_personal',
      now,
      now,
      data.completed ? 1 : 0,
      data.pomodoro_estimated ?? null,
      data.pomodoro_completed ?? null
    ]
  );
  return getTaskById(id) as Promise<Task>;
}

export async function updateTask(id: string, updates: Partial<Task>): Promise<Task | null> {
  const existing = await getTaskById(id);
  if (!existing) return null;
  const merged = { ...existing, ...updates, updatedAt: new Date().toISOString() } as Task;
  await executeSqlAsync(
    `UPDATE tasks SET name=?, description=?, priority=?, startDate=?, endDate=?, category_id=?, updatedAt=?, completed=?, pomodoro_estimated=?, pomodoro_completed=? WHERE id=?`,
    [
      merged.name,
      merged.description ?? null,
      merged.priority ?? 'medium',
      merged.startDate ?? null,
      merged.endDate ?? null,
      merged.category_id ?? null,
      merged.updatedAt,
      merged.completed ? 1 : 0,
      merged.pomodoro_estimated ?? null,
      merged.pomodoro_completed ?? null,
      id
    ]
  );
  return getTaskById(id);
}

export async function deleteTask(id: string): Promise<void> {
  await executeSqlAsync('DELETE FROM tasks WHERE id = ?', [id]);
}

export async function setTaskCompletion(id: string, completed: boolean): Promise<void> {
  const task = await getTaskById(id);
  if (!task) return;

  if (completed) {
    // When completing a task, move it to the Completed category
    await executeSqlAsync(
      'UPDATE tasks SET completed = ?, category_id = ?, updatedAt = ? WHERE id = ?',
      [1, 'cat_completed', new Date().toISOString(), id]
    );
  } else {
    // When uncompleting a task, restore it to Personal category (default)
    // You could store the previous category if needed
    await executeSqlAsync(
      'UPDATE tasks SET completed = ?, category_id = ?, updatedAt = ? WHERE id = ?',
      [0, 'cat_personal', new Date().toISOString(), id]
    );
  }
}

export async function incrementPomodoroCompleted(id: string, completedCount: number): Promise<void> {
  await executeSqlAsync(
    'UPDATE tasks SET pomodoro_completed = ?, completed = 1, updatedAt = ? WHERE id = ?',
    [completedCount, new Date().toISOString(), id]
  );
}
