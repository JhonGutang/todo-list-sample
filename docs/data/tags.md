# Tag Schema

Tags are small metadata labels users assign to tasks for filtering and grouping.

Fields

- `id` (string, required): Unique tag key (slug-friendly).
- `name` (string, required): Human-readable name.
- `color` (string, optional): Hex or named color used in UI.
- `createdAt` (ISO8601, optional)

Usage

- Tasks reference tags by id (`task.tags`).
- Tags are shown as chips and in filter lists. See [apps/todo-list/constants/tags.ts](apps/todo-list/constants/tags.ts).

Example

{
  "id": "work",
  "name": "Work",
  "color": "#ff7a59"
}
