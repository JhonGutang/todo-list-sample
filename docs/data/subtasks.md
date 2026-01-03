# Subtask Schema

Subtasks are lightweight child items of a Task used for checklists and progress tracking.

Fields

- `id` (UUID or string, required): Unique identifier within the task's subtask list.
- `title` (string, required): Short label for the subtask.
- `completed` (boolean, required): Whether the subtask is done.
- `order` (number, optional): Display order index.

Notes

- Subtasks can be embedded inline in a Task (`task.subtasks`) or stored separately by id depending on backend design.
- The frontend components expect either a minimal object (`{id,title,completed}`) or an id array; `apps/todo-list/components/SubtaskItem.tsx` reads these fields.

Example

{
  "id": "s1",
  "title": "Draft outline",
  "completed": false,
  "order": 1
}
