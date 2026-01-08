import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { TaskWithSubtasks, Subtask } from '@todolist/shared-types';
import { getAllTasks, getSubtasksForTask } from '../services';
import { initDb } from '../services';

interface TasksContextType {
  tasks: TaskWithSubtasks[];
  loading: boolean;
  tasksLoaded: boolean;
  loadTasks: () => Promise<void>;
  updateTaskSubtasks: (taskId: string, subtasks: Subtask[]) => void;
  getTask: (taskId: string) => TaskWithSubtasks | undefined;
}

const TasksContext = createContext<TasksContextType | undefined>(undefined);

export function TasksProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<TaskWithSubtasks[]>([]);
  const [loading, setLoading] = useState(false);
  const [tasksLoaded, setTasksLoaded] = useState(false);

  const loadTasks = useCallback(async () => {
    try {
      setLoading(true);
      await initDb();
      const loadedTasks = await getAllTasks();

      const tasksWithSubs = await Promise.all(
        loadedTasks.map(async (task) => {
          const subtasks = await getSubtasksForTask(task.id);
          return { ...task, subtasks };
        })
      );
      setTasks(tasksWithSubs);
      setTasksLoaded(true);
    } catch (error) {
      console.error('Failed to load tasks:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const updateTaskSubtasks = useCallback((taskId: string, subtasks: Subtask[]) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, subtasks } : task
      )
    );
  }, []);

  const getTask = useCallback((taskId: string) => {
    return tasks.find((task) => task.id === taskId);
  }, [tasks]);

  return (
    <TasksContext.Provider
      value={{
        tasks,
        loading,
        tasksLoaded,
        loadTasks,
        updateTaskSubtasks,
        getTask,
      }}
    >
      {children}
    </TasksContext.Provider>
  );
}

export function useTasks() {
  const context = useContext(TasksContext);
  if (context === undefined) {
    throw new Error('useTasks must be used within a TasksProvider');
  }
  return context;
}

