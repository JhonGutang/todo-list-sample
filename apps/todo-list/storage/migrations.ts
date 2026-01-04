export const migrations = [
  {
    name: '001_create_schema.sql',
    sql: `
BEGIN TRANSACTION;

CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  priority TEXT CHECK (priority IN ('low','medium','high')) DEFAULT 'medium',
  startDate TEXT,
  endDate TEXT,
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  updatedAt TEXT,
  completed INTEGER NOT NULL DEFAULT 0,
  pomodoro_estimated INTEGER,
  pomodoro_completed INTEGER
);

CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_startDate ON tasks(startDate);
CREATE INDEX IF NOT EXISTS idx_tasks_createdAt ON tasks(createdAt);

CREATE TABLE IF NOT EXISTS subtasks (
  id TEXT PRIMARY KEY,
  task_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  completed INTEGER NOT NULL DEFAULT 0,
  "order" INTEGER,
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_subtasks_task_id ON subtasks(task_id);

CREATE TABLE IF NOT EXISTS tags (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  color TEXT,
  chipColor TEXT,
  createdAt TEXT
);

CREATE TABLE IF NOT EXISTS task_tags (
  task_id TEXT NOT NULL,
  tag_id TEXT NOT NULL,
  PRIMARY KEY (task_id, tag_id),
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_task_tags_task ON task_tags(task_id);
CREATE INDEX IF NOT EXISTS idx_task_tags_tag ON task_tags(tag_id);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT
);

CREATE TABLE IF NOT EXISTS migrations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  applied_at TEXT NOT NULL DEFAULT (datetime('now'))
);

COMMIT;
`
  },
  {
    name: '002_create_pomodoro_sessions.sql',
    sql: `
BEGIN TRANSACTION;

CREATE TABLE IF NOT EXISTS pomodoro_sessions (
  id TEXT PRIMARY KEY,
  task_id TEXT NOT NULL,
  work_duration_minutes INTEGER NOT NULL,
  break_type TEXT CHECK (break_type IN ('short','long')) NOT NULL,
  total_iterations INTEGER NOT NULL,
  current_iteration INTEGER NOT NULL DEFAULT 1,
  current_subtask_index INTEGER,
  timer_type TEXT CHECK (timer_type IN ('work','shortBreak','longBreak')) NOT NULL DEFAULT 'work',
  remaining_seconds INTEGER NOT NULL,
  is_paused INTEGER NOT NULL DEFAULT 0,
  started_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_pomodoro_sessions_task_id ON pomodoro_sessions(task_id);

COMMIT;
`
  }
];

export default migrations;
