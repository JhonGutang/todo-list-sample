# Task (Todo) Schema

Purpose: Represents a user's task in lists, calendar views, and detail modals.

Fields

- `id` (UUID, required): Unique identifier for the task.
- `title` (string, required): Short title shown in lists.
- `description` (string, optional): Full description / notes (markdown allowed).
- `completed` (boolean, required): Completion state.
- `dueDate` (ISO8601 string, optional): When the task is due.
- `startDate` (ISO8601 string, optional): When the task starts (for scheduling).
- `createdAt` (ISO8601 string, required): Creation timestamp.
- `updatedAt` (ISO8601 string, optional): Last update timestamp.
- `priority` (string, optional): One of `low`, `medium`, `high`.
- `tags` (array of Tag `id` strings, optional): Tag ids associated with the task.
- `subtasks` (array of Subtask objects or ids, optional): Subtasks belonging to this task.
- `reminders` (array of ISO8601 strings, optional): Notification times.
- `recurrence` (object, optional): If repeating; shape depends on app recurrence UI (e.g., `{ freq: 'daily'|'weekly'|'monthly', interval: number }`).
- `pomodoro` (object, optional): Pomodoro-related fields:
  - `estimated` (number, optional): estimated pomodoros
  - `completed` (number, optional): completed pomodoros
- `attachments` (array, optional): lightweight list of urls and names if used.

Validation notes

- `title` must be non-empty.
- `dueDate` >= `startDate` when both present.
- `tags` must reference valid `Tag.id` values.

Example

{
  "id": "a1b2c3",
  "title": "Write monthly report",
  "description": "Collect figures and write summary.",
  "completed": false,
  "dueDate": "2026-01-10T09:00:00.000Z",
  "priority": "high",
  "tags": ["work", "reports"],
  "subtasks": [
    { "id": "s1", "title": "Export data", "completed": true }
  ],
  "createdAt": "2026-01-01T12:00:00.000Z"
}

Location note: The frontend currently uses mock tasks in [apps/todo-list/constants/mockTodos.ts](apps/todo-list/constants/mockTodos.ts).
