# Frontend Data Overview

This folder documents all data shapes the `todo-list` frontend expects, including required fields, types, validation notes, relationships, and example payloads.

Key source references in the repo:

- Task mock data: [apps/todo-list/constants/mockTodos.ts](apps/todo-list/constants/mockTodos.ts)
- Tag constants: [apps/todo-list/constants/tags.ts](apps/todo-list/constants/tags.ts)
- UI chips: [apps/todo-list/constants/chips.ts](apps/todo-list/constants/chips.ts)
- Components consuming this data (examples):
  - [apps/todo-list/components/TaskModal.tsx](apps/todo-list/components/TaskModal.tsx)
  - [apps/todo-list/components/SubtaskItem.tsx](apps/todo-list/components/SubtaskItem.tsx)
  - [apps/todo-list/app/(tabs)/tasks.tsx](apps/todo-list/app/(tabs)/tasks.tsx)

Conventions used in these docs:

- Types: `string`, `number`, `boolean`, `ISO8601` for date/time strings, `UUID` for unique IDs.
- Fields are annotated as **required** or **optional**.
- Examples are minimal but cover common and edge-case fields.

Files in this folder:

- `tasks.md` — Task schema and validation
- `subtasks.md` — Subtask schema
- `tags.md` — Tag schema
- `chips.md` — UI chips and filter config
- `settings.md` — Persisted app settings the frontend reads/writes
- `examples.md` — Full example payloads combining the above

If you want these docs exported to another format or integrated into the backend API spec, tell me where to place the output.
