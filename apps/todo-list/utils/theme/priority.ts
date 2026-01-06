import { ThemeColors } from '../../constants/Colors';

/**
 * Gets the color for a given priority level from the theme
 * 
 * @param priority - The priority level ('low', 'medium', 'high')
 * @param theme - The active theme colors
 * @returns The hex color for the priority, or 'transparent' if priority is invalid
 */
export function getPriorityColor(priority: string, theme: ThemeColors): string {
    switch (priority) {
        case 'high':
            return theme.priorityHigh;
        case 'medium':
            return theme.priorityMedium;
        case 'low':
            return theme.priorityLow;
        default:
            return 'transparent';
    }
}
