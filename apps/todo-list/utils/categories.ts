import { Category } from '@todolist/shared-types';
import { FilterChip } from '../types/ui';

/**
 * Sorts categories by a predefined order
 * 
 * @param categories - Array of categories to sort
 * @param order - Array of category IDs defining the sort order
 * @returns Sorted array of categories
 */
export function sortCategoriesByOrder(categories: Category[], order: string[]): Category[] {
    return [...categories].sort((a, b) => {
        const idxA = order.indexOf(a.id);
        const idxB = order.indexOf(b.id);
        return (idxA === -1 ? 999 : idxA) - (idxB === -1 ? 999 : idxB);
    });
}

/**
 * Builds filter chips from categories, including an "All" option
 * 
 * @param categories - Array of categories
 * @param order - Array of category IDs defining the sort order
 * @returns Array of filter chips ready for UI rendering
 */
export function buildFilterChips(categories: Category[], order: string[]): FilterChip[] {
    const sorted = sortCategoriesByOrder(
        categories.filter((cat) => cat.id !== 'cat_completed'),
        order
    );

    const completed = categories.filter((cat) => cat.id === 'cat_completed');

    return [
        { id: 'all', label: 'All' },
        ...sorted.map((cat) => ({ id: cat.id, label: cat.name })),
        ...completed.map((cat) => ({ id: cat.id, label: cat.name })),
    ];
}
