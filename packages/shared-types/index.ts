export type Priority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  name: string;
  description?: string | null;
  priority?: Priority;
  startDate?: string | null;
  endDate?: string | null;
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
  description?: string | null;
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

