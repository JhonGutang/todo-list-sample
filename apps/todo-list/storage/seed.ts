import { Subtask as DBSubtask, Task as DBTask } from '@todolist/shared-types';
import mockTasks, { mockSubtasks } from '../constants/mockTasks';
import mockTags from '../constants/tags';
import { executeSqlAsync, transactionAsync } from '../storage/db';

function generateId() {
  return Date.now().toString() + Math.random().toString(36).slice(2, 8);
}

export async function seedIfEmpty() {
  const res = await executeSqlAsync('SELECT COUNT(1) as c FROM tasks');
  const rows = (res as any).rows as any;
  const count = rows.item(0).c as number;
  if (count > 0) return;

  // Simple seed using transaction
  await transactionAsync(async (db) => {
    // insert tags
    for (const t of mockTags) {
      const id = t.id ?? generateId();
      await db.runAsync('INSERT OR IGNORE INTO tags (id, label, color, chipColor, createdAt) VALUES (?, ?, ?, ?, ?)', [id, t.label, t.color ?? null, t.chipColor ?? null, new Date().toISOString()]);
    }

    // insert tasks
    for (const task of mockTasks) {
      const id = task.id ?? generateId();
      const now = task.createdAt ?? new Date().toISOString();

      const taskRow: DBTask = {
        id,
        name: task.name || '',
        description: task.description ?? null,
        priority: task.priority ?? 'medium',
        startDate: task.startDate ?? null,
        endDate: task.endDate ?? null,
        createdAt: task.createdAt ?? now,
        updatedAt: task.updatedAt ?? now,
        completed: !!task.completed,
        pomodoro_estimated: task.pomodoro_estimated ?? null,
        pomodoro_completed: task.pomodoro_completed ?? null
      };

      await db.runAsync(
        'INSERT OR IGNORE INTO tasks (id, name, description, priority, startDate, endDate, createdAt, updatedAt, completed, pomodoro_estimated, pomodoro_completed) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
          taskRow.id,
          taskRow.name,
          taskRow.description ?? null,
          taskRow.priority ?? 'medium',
          taskRow.startDate ?? null,
          taskRow.endDate ?? null,
          taskRow.createdAt ?? now,
          taskRow.updatedAt ?? now,
          taskRow.completed ? 1 : 0,
          taskRow.pomodoro_estimated ?? null,
          taskRow.pomodoro_completed ?? null
        ]
      );
    }

    // insert subtasks
    for (const subtask of mockSubtasks) {
      const sub: DBSubtask = {
        id: subtask.id ?? generateId(),
        task_id: subtask.task_id,
        title: subtask.title,
        description: subtask.description ?? null,
        completed: !!subtask.completed,
        order: subtask.order ?? null
      };
      await db.runAsync('INSERT OR IGNORE INTO subtasks (id, task_id, title, description, completed, "order") VALUES (?, ?, ?, ?, ?, ?)', [sub.id, sub.task_id, sub.title, sub.description ?? null, sub.completed ? 1 : 0, sub.order ?? null]);
    }
  });
}
