/**
 * UI-specific type definitions for the todo-list application
 */

export type ChipId = 'low' | 'medium' | 'high';
export type FilterId = ChipId | 'all';

export type ChipDef = {
    id: ChipId;
    label: string;
    color: string; // badge background
    chipColor?: string; // filter chip color
};

export type FilterChip = {
    id: string;
    label: string;
};

export type SortOrder = 'none' | 'asc' | 'desc';
