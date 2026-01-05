import { Task, Subtask } from '@todolist/shared-types';

// Mock tasks data
const mockTasks: Task[] = [
  {
    id: '1',
    name: 'Buy groceries',
    description: 'Milk, eggs, bread, and fruits',
    priority: 'medium',
    startDate: '2026-01-03T09:00:00.000Z',
    endDate: '2026-01-03T10:00:00.000Z',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    completed: false,
  },
  {
    id: '2',
    name: 'Morning run',
    description: '3km around the park',
    priority: 'low',
    startDate: '2026-01-03T06:30:00.000Z',
    endDate: '2026-01-03T07:00:00.000Z',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    completed: false,
  },
  {
    id: '3',
    name: 'Prepare presentation',
    description: 'Slides for Monday meeting',
    priority: 'high',
    startDate: '2026-01-04T14:00:00.000Z',
    endDate: '2026-01-04T16:00:00.000Z',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    completed: false,
  },
  {
    id: '4',
    name: 'Call plumber',
    priority: 'medium',
    startDate: '2026-01-05T11:00:00.000Z',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    completed: false,
  },
];

// Mock subtasks data (separate from tasks)
const mockSubtasks: Subtask[] = [
  { id: '1', task_id: '1', title: 'Buy milk', description: '2L whole milk', completed: true, order: 0 },
  { id: '2', task_id: '1', title: 'Buy eggs', description: 'Pack of 12', completed: false, order: 1 },
  { id: '3', task_id: '3', title: 'Draft slides', description: 'Outline main points', completed: false, order: 0 },
];

export default mockTasks;
export { mockSubtasks };


