# UI Chips & Filter Config

The app uses chips as quick filters and presets. The frontend expects a chip object with these fields:

Fields

- `id` (string, required): Unique key for the chip.
- `label` (string, required): Text shown on the chip.
- `type` (string, required): One of `filter`, `preset`, `action`.
- `value` (any, optional): Value used by the filter logic (e.g., `"today"`, or a tag id).
- `active` (boolean, optional): Whether the chip is currently applied.

Examples

- Date filter chip: `{ id: "today", label: "Today", type: "filter", value: "today" }`
- Tag chip: `{ id: "tag-work", label: "Work", type: "filter", value: "work" }`

Location note: See [apps/todo-list/constants/chips.ts](apps/todo-list/constants/chips.ts) for the current app config.
