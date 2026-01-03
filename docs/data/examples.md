# Example Payloads

This file shows minimal and full examples combining Tasks, Subtasks, Tags, and Settings.

Minimal Task List (frontend required fields)

[
  {
    "id": "t1",
    "title": "Buy groceries",
    "completed": false,
    "createdAt": "2026-01-02T10:00:00.000Z"
  }
]

Full Example (tasks, subtasks, tags)

{
  "tasks": [
    {
      "id": "t1",
      "title": "Prepare presentation",
      "description": "Slides + handout",
      "completed": false,
      "dueDate": "2026-01-05T09:00:00.000Z",
      "priority": "high",
      "tags": ["work"],
      "subtasks": [
        { "id": "s1", "title": "Create slides", "completed": false },
        { "id": "s2", "title": "Write script", "completed": false }
      ],
      "pomodoro": { "estimated": 3, "completed": 1 },
      "createdAt": "2026-01-01T08:00:00.000Z"
    }
  ],
  "tags": [
    { "id": "work", "name": "Work", "color": "#ff7a59" }
  ],
  "settings": {
    "theme": "system",
    "defaultPomodoroMins": 25
  }
}

Notes for integration

- If the backend is present, align the API contract with these shapes. See [apps/backend/src/index.ts](apps/backend/src/index.ts) for the backend entrypoint.
- The frontend will accept both embedded and referenced subtasks; map accordingly.
