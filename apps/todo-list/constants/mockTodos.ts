export type Priority = 'low' | 'medium' | 'high';

export type Todo = {
  id: string;
  name: string;
  description?: string;
  priority: Priority;
  startDate: string; // ISO string
  endDate?: string; // ISO string
  subtasks?: {
    id: string;
    title: string;
    description?: string;
    completed?: boolean;
  }[];
};

const mockTodos: Todo[] = [
  {
    id: '1',
    name: 'Buy groceries',
    description: 'Milk, eggs, bread, and fruits',
    priority: 'medium',
    startDate: '2026-01-03T09:00:00.000Z',
    endDate: '2026-01-03T10:00:00.000Z',
    subtasks: [
      { id: '1', title: 'Buy milk', description: '2L whole milk', completed: true },
      { id: '2', title: 'Buy eggs', description: 'Pack of 12', completed: false },
    ],
  },
  {
    id: '2',
    name: 'Morning run',
    description: '3km around the park',
    priority: 'low',
    startDate: '2026-01-03T06:30:00.000Z',
    endDate: '2026-01-03T07:00:00.000Z',
  },
  {
    id: '3',
    name: 'Prepare presentation',
    description: 'Slides for Monday meeting',
    priority: 'high',
    startDate: '2026-01-04T14:00:00.000Z',
    endDate: '2026-01-04T16:00:00.000Z',
    subtasks: [
      { id: '1', title: 'Draft slides', description: 'Outline main points', completed: false },
    ],
  },
  {
    id: '4',
    name: 'Call plumber',
    priority: 'medium',
    startDate: '2026-01-05T11:00:00.000Z',
  },
];

export default mockTodos;
