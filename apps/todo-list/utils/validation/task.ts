/**
 * Task validation utilities
 */

/**
 * Validates if a task name is valid (non-empty after trimming)
 * 
 * @param name - Task name to validate
 * @returns true if valid, false otherwise
 */
export function isValidTaskName(name: string): boolean {
    return name.trim().length > 0;
}

/**
 * Sanitizes task input by trimming whitespace
 * 
 * @param input - Input string to sanitize
 * @returns Sanitized string
 */
export function sanitizeTaskInput(input: string): string {
    return input.trim();
}
