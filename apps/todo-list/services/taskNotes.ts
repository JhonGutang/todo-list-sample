import { executeSqlAsync } from '../storage/db';

export interface TaskNote {
    id: string;
    task_id: string;
    content: string;
    character_count: number;
    created_at: string;
    updated_at: string;
}

function rowToTaskNote(row: any): TaskNote {
    return {
        id: row.id,
        task_id: row.task_id,
        content: row.content || '',
        character_count: row.character_count || 0,
        created_at: row.created_at,
        updated_at: row.updated_at,
    };
}

function generateId(): string {
    return Date.now().toString() + Math.random().toString(36).slice(2, 8);
}

/**
 * Get note for a specific task
 * Returns null if no note exists
 */
export async function getNoteForTask(taskId: string): Promise<TaskNote | null> {
    const res = await executeSqlAsync(
        'SELECT * FROM task_notes WHERE task_id = ? LIMIT 1',
        [taskId]
    );
    const rows = (res as any).rows as any;
    if (rows.length === 0) return null;
    return rowToTaskNote(rows.item(0));
}

/**
 * Create or update a task note
 * Uses UPSERT pattern (INSERT OR REPLACE)
 */
export async function saveTaskNote(
    taskId: string,
    content: string
): Promise<TaskNote> {
    const existing = await getNoteForTask(taskId);
    const now = new Date().toISOString();
    const characterCount = content.length;

    if (existing) {
        // Update existing note
        await executeSqlAsync(
            `UPDATE task_notes 
       SET content = ?, character_count = ?, updated_at = ? 
       WHERE task_id = ?`,
            [content, characterCount, now, taskId]
        );
        return {
            ...existing,
            content,
            character_count: characterCount,
            updated_at: now,
        };
    } else {
        // Create new note
        const id = generateId();
        await executeSqlAsync(
            `INSERT INTO task_notes (id, task_id, content, character_count, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
            [id, taskId, content, characterCount, now, now]
        );
        return {
            id,
            task_id: taskId,
            content,
            character_count: characterCount,
            created_at: now,
            updated_at: now,
        };
    }
}

/**
 * Delete a task note
 */
export async function deleteTaskNote(taskId: string): Promise<void> {
    await executeSqlAsync('DELETE FROM task_notes WHERE task_id = ?', [taskId]);
}
