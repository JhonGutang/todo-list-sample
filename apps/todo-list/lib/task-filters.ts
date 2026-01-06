import { TaskWithSubtasks } from '@todolist/shared-types';
import { SortOrder } from '../types/ui';

/**
 * Filters tasks by category ID
 * 
 * @param tasks - Array of tasks to filter
 * @param categoryId - Category ID to filter by, or 'all' for all non-completed tasks
 * @returns Filtered array of tasks
 */
export function filterTasksByCategory(
    tasks: TaskWithSubtasks[],
    categoryId: string
): TaskWithSubtasks[] {
    if (categoryId === 'all') {
        return tasks.filter((task) => task.category_id !== 'cat_completed');
    }
    return tasks.filter((task) => task.category_id === categoryId);
}

/**
 * Filters tasks by priority level
 * 
 * @param tasks - Array of tasks to filter
 * @param priority - Priority level to filter by, or 'all' for no filtering
 * @returns Filtered array of tasks
 */
export function filterTasksByPriority(
    tasks: TaskWithSubtasks[],
    priority: string
): TaskWithSubtasks[] {
    if (priority === 'all') return tasks;
    return tasks.filter((task) => task.priority === priority);
}

/**
 * Sorts tasks by deadline/end date
 * 
 * @param tasks - Array of tasks to sort
 * @param sortOrder - Sort order: 'asc' (earliest first), 'desc' (latest first), or 'none'
 * @returns Sorted array of tasks
 */
export function sortTasksByDeadline(
    tasks: TaskWithSubtasks[],
    sortOrder: SortOrder
): TaskWithSubtasks[] {
    if (sortOrder === 'none') return tasks;

    return [...tasks].sort((a, b) => {
        const dateA = a.endDate ? new Date(a.endDate).getTime() : Infinity;
        const dateB = b.endDate ? new Date(b.endDate).getTime() : Infinity;

        if (sortOrder === 'asc') return dateA - dateB;
        if (sortOrder === 'desc') return dateB - dateA;
        return 0;
    });
}

/**
 * Applies all filters and sorting to tasks
 * 
 * @param tasks - Array of tasks to process
 * @param categoryId - Category ID to filter by
 * @param priority - Priority level to filter by
 * @param sortOrder - Deadline sort order
 * @returns Filtered and sorted array of tasks
 */
export function applyTaskFilters(
    tasks: TaskWithSubtasks[],
    categoryId: string,
    priority: string,
    sortOrder: SortOrder
): TaskWithSubtasks[] {
    let filtered = filterTasksByCategory(tasks, categoryId);
    filtered = filterTasksByPriority(filtered, priority);
    filtered = sortTasksByDeadline(filtered, sortOrder);
    return filtered;
}
