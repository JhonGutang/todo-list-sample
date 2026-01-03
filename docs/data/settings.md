# Persisted App Settings

Settings the frontend reads and writes (local storage or synced):

Fields

- `theme` (string): `light` | `dark` | `system`.
- `defaultPomodoroMins` (number): default pomodoro length in minutes (e.g., 25).
- `shortBreakMins` (number): short break length.
- `longBreakMins` (number): long break length.
- `pomodorosBeforeLongBreak` (number): how many pomodoros before a long break.
- `notificationsEnabled` (boolean): whether push/OS notifications are enabled.
- `dateFormat` (string): user preferred date format (e.g., `YYYY-MM-DD` or `MM/DD/YYYY`).
- `firstDayOfWeek` (number): 0 (Sunday) - 6 (Saturday).
- `timezone` (string, optional): IANA timezone string for calendar normalization.

Example

{
  "theme": "system",
  "defaultPomodoroMins": 25,
  "shortBreakMins": 5,
  "longBreakMins": 15,
  "pomodorosBeforeLongBreak": 4,
  "notificationsEnabled": true,
  "dateFormat": "YYYY-MM-DD",
  "firstDayOfWeek": 1
}

Location note: The pomodoro UI is in [apps/todo-list/app/(tabs)/pomodoro-timer.tsx](apps/todo-list/app/(tabs)/pomodoro-timer.tsx).
