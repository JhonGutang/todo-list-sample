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
  },
  {
    name: '003_add_categories.sql',
    sql: `
BEGIN TRANSACTION;

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  color TEXT,
  isDefault INTEGER NOT NULL DEFAULT 0,
  createdAt TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Insert default categories
INSERT OR IGNORE INTO categories (id, name, color, isDefault, createdAt) VALUES
  ('cat_work', 'Work', '#3b82f6', 1, datetime('now')),
  ('cat_personal', 'Personal', '#8b5cf6', 1, datetime('now')),
  ('cat_completed', 'Completed', '#10b981', 1, datetime('now'));

-- Add category_id column to tasks table
ALTER TABLE tasks ADD COLUMN category_id TEXT REFERENCES categories(id) ON DELETE SET NULL;

-- Set default category to 'Personal' for existing tasks
UPDATE tasks SET category_id = 'cat_personal' WHERE category_id IS NULL;

-- Create index for efficient category filtering
CREATE INDEX IF NOT EXISTS idx_tasks_category_id ON tasks(category_id);

COMMIT;
`
  },
  {
    name: '004_add_completed_category.sql',
    sql: `
BEGIN TRANSACTION;

-- Add the Completed category if it doesn't exist
INSERT OR IGNORE INTO categories (id, name, color, isDefault, createdAt) VALUES
  ('cat_completed', 'Completed', '#10b981', 1, datetime('now'));

COMMIT;
`
  },
  {
    name: '005_reset_database.sql',
    sql: `
BEGIN TRANSACTION;

-- Clear all existing data
DELETE FROM task_tags;
DELETE FROM subtasks;
DELETE FROM pomodoro_sessions;
DELETE FROM tasks;
DELETE FROM tags;
DELETE FROM categories;

-- Insert predefined categories
INSERT INTO categories (id, name, color, isDefault, createdAt) VALUES
  ('cat_personal', 'Personal', '#8b5cf6', 1, datetime('now')),
  ('cat_work', 'Work', '#3b82f6', 1, datetime('now')),
  ('cat_habit', 'Habit', '#10b981', 1, datetime('now')),
  ('cat_projects', 'Projects', '#f59e0b', 1, datetime('now')),
  ('cat_others', 'Others', '#6b7280', 1, datetime('now')),
  ('cat_completed', 'Completed', '#94a3b8', 1, datetime('now'));

COMMIT;
`
  },
  {
    name: '006_add_task_reminders.sql',
    sql: `
BEGIN TRANSACTION;

-- Add reminder fields to tasks table
ALTER TABLE tasks ADD COLUMN startTime TEXT;
ALTER TABLE tasks ADD COLUMN reminderPreset TEXT CHECK (reminderPreset IN ('5min','1min','30sec'));
ALTER TABLE tasks ADD COLUMN notificationId TEXT;

-- Create index for efficient querying of upcoming tasks
CREATE INDEX IF NOT EXISTS idx_tasks_startTime ON tasks(startTime);

COMMIT;
`
  }
];

export default migrations;
