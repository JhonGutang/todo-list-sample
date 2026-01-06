/**
 * Date formatting utilities
 */

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Parses a date string to a local Date object
 * 
 * @param dateStr - ISO date string or YYYY-MM-DD format
 * @returns Date object or undefined if invalid
 */
export function parseToLocalDate(dateStr?: string): Date | undefined {
    if (!dateStr) return undefined;
    const ymdMatch = /^\d{4}-\d{2}-\d{2}$/.test(dateStr);
    if (ymdMatch) {
        const [y, m, d] = dateStr.split('-').map(Number);
        return new Date(y, m - 1, d);
    }
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return undefined;
    return d;
}

/**
 * Converts a date to local midnight (00:00:00)
 * 
 * @param d - Date to convert
 * @returns New Date object set to midnight
 */
export function toLocalMidnight(d: Date): Date {
    const nd = new Date(d);
    nd.setHours(0, 0, 0, 0);
    return nd;
}

/**
 * Formats an end date into a human-readable string
 * 
 * @param endIso - ISO date string
 * @returns Formatted date string (e.g., "Today", "Tomorrow", "Monday", "Jan 15")
 */
export function formatEndDate(endIso?: string): string {
    if (!endIso) return '';
    const date = parseToLocalDate(endIso);
    if (!date) return '';
    const today = toLocalMidnight(new Date());
    const target = toLocalMidnight(date);
    const diffDays = Math.round((target.getTime() - today.getTime()) / MS_PER_DAY);

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays > 1 && diffDays <= 6) {
        return new Intl.DateTimeFormat(undefined, { weekday: 'long' }).format(date);
    }

    return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(date);
}

/**
 * Formats a date range, prioritizing end date
 * 
 * @param startIso - ISO start date string (optional)
 * @param endIso - ISO end date string (optional)
 * @returns Formatted date string
 */
export function formatRange(startIso?: string, endIso?: string): string {
    // For ranges, display only the end date per spec; fall back to start if no end
    if (endIso) return formatEndDate(endIso);
    if (startIso) return formatEndDate(startIso);
    return '';
}
