export type Priority = 'low' | 'medium' | 'high';

export interface Category {
  id: string;
  name: string;
  color?: string | null;
  isDefault?: boolean;
  createdAt?: string | null;
}

export interface Task {
  id: string;
  name: string;
  description?: string | null;
  priority?: Priority;
  /** @deprecated Use endDate instead. Kept for backward compatibility. */
  startDate?: string | null;
  endDate?: string | null;
  category_id?: string | null;
  createdAt?: string;
  updatedAt?: string | null;
  completed?: boolean;
  pomodoro_estimated?: number | null;
  pomodoro_completed?: number | null;
}

export interface Subtask {
  id: string;
  task_id: string;
  title: string;
  completed?: boolean;
  order?: number | null;
}

export interface Tag {
  id: string;
  label: string;
  color?: string | null;
  chipColor?: string | null;
  createdAt?: string | null;
}

/**
 * Helper type for components that need a task with its subtasks
 */
export type TaskWithSubtasks = Task & {
  subtasks: Subtask[];
};

/**
 * Helper type for components that need a task with its category details
 */
export type TaskWithCategory = Task & {
  category?: Category | null;
};

// Pomodoro Types
export type TimerType = 'work' | 'shortBreak' | 'longBreak';
export type BreakType = 'short' | 'long';

export interface PomodoroConfig {
  workDurationMinutes: number;
  breakType: BreakType;
  totalIterations: number;
}

export interface PomodoroSession {
  id: string;
  task_id: string;
  work_duration_minutes: number;
  break_type: BreakType;
  total_iterations: number;
  current_iteration: number;
  current_subtask_index: number | null;
  timer_type: TimerType;
  remaining_seconds: number;
  is_paused: boolean;
  started_at: string;
  updated_at: string;
}

export interface PomodoroSessionWithTask extends PomodoroSession {
  task: {
    id: string;
    name: string;
    description?: string | null;
  };
  subtasks: Array<{
    id: string;
    title: string;
    completed: boolean;
    order: number | null;
  }>;
}


