import { executeSqlAsync } from '../storage/db';
import { PomodoroSession, PomodoroConfig, TimerType, PomodoroSessionWithTask } from '@todolist/shared-types';
import { getTaskById } from './tasks';
import { getSubtasksForTask, updateSubtask } from './subtasks';

const ACTIVE_SESSION_ID = 'active';

function rowToSession(row: any): PomodoroSession {
    return {
        id: row.id,
        task_id: row.task_id,
        work_duration_minutes: row.work_duration_minutes,
        break_type: row.break_type as 'short' | 'long',
        total_iterations: row.total_iterations,
        current_iteration: row.current_iteration,
        current_subtask_index: row.current_subtask_index,
        timer_type: row.timer_type as TimerType,
        remaining_seconds: row.remaining_seconds,
        is_paused: !!row.is_paused,
        started_at: row.started_at,
        updated_at: row.updated_at,
    };
}

export async function getActiveSession(): Promise<PomodoroSession | null> {
    const res = await executeSqlAsync(
        'SELECT * FROM pomodoro_sessions WHERE id = ? LIMIT 1',
        [ACTIVE_SESSION_ID]
    );
    const rows = (res as any).rows as any;
    if (rows.length === 0) return null;
    return rowToSession(rows.item(0));
}

export async function getSessionWithTask(): Promise<PomodoroSessionWithTask | null> {
    const session = await getActiveSession();
    if (!session) return null;

    const task = await getTaskById(session.task_id);
    if (!task) return null;

    const subtasks = await getSubtasksForTask(session.task_id);

    return {
        ...session,
        task: {
            id: task.id,
            name: task.name,
            description: task.description,
        },
        subtasks: subtasks.map(s => ({
            id: s.id,
            title: s.title,
            completed: !!s.completed,
            order: s.order ?? null,
        })),
    };
}

export async function createSession(
    taskId: string,
    config: PomodoroConfig
): Promise<PomodoroSession> {
    // Delete any existing session first
    await deleteSession();

    const now = new Date().toISOString();
    const remainingSeconds = config.workDurationMinutes * 60;

    await executeSqlAsync(
        `INSERT INTO pomodoro_sessions (
      id, task_id, work_duration_minutes, break_type, total_iterations,
      current_iteration, current_subtask_index, timer_type, remaining_seconds,
      is_paused, started_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            ACTIVE_SESSION_ID,
            taskId,
            config.workDurationMinutes,
            config.breakType,
            config.totalIterations,
            1, // current_iteration starts at 1
            0, // current_subtask_index starts at 0
            'work', // timer_type starts with work
            remainingSeconds,
            0, // is_paused
            now,
            now,
        ]
    );

    return (await getActiveSession())!;
}

export async function updateSession(updates: Partial<PomodoroSession>): Promise<void> {
    const session = await getActiveSession();
    if (!session) return;

    const merged = { ...session, ...updates, updated_at: new Date().toISOString() };

    await executeSqlAsync(
        `UPDATE pomodoro_sessions SET
      current_iteration = ?,
      current_subtask_index = ?,
      timer_type = ?,
      remaining_seconds = ?,
      is_paused = ?,
      updated_at = ?
    WHERE id = ?`,
        [
            merged.current_iteration,
            merged.current_subtask_index,
            merged.timer_type,
            merged.remaining_seconds,
            merged.is_paused ? 1 : 0,
            merged.updated_at,
            ACTIVE_SESSION_ID,
        ]
    );
}

export async function updateSessionTimer(
    remainingSeconds: number,
    isPaused: boolean
): Promise<void> {
    await executeSqlAsync(
        `UPDATE pomodoro_sessions SET
      remaining_seconds = ?,
      is_paused = ?,
      updated_at = ?
    WHERE id = ?`,
        [remainingSeconds, isPaused ? 1 : 0, new Date().toISOString(), ACTIVE_SESSION_ID]
    );
}

export async function completeWorkSession(): Promise<void> {
    const sessionWithTask = await getSessionWithTask();
    if (!sessionWithTask) return;

    const { current_subtask_index, subtasks, break_type, work_duration_minutes } = sessionWithTask;

    // Complete current subtask if applicable
    if (current_subtask_index !== null && current_subtask_index < subtasks.length) {
        const currentSubtask = subtasks[current_subtask_index];
        if (currentSubtask && !currentSubtask.completed) {
            await updateSubtask(currentSubtask.id, { completed: true });
        }
    }

    // Calculate break duration
    const breakSeconds = break_type === 'short' ? 120 : 300; // 2min or 5min

    // Update session: increment iteration, move to next subtask, switch to break
    await updateSession({
        current_iteration: sessionWithTask.current_iteration + 1,
        current_subtask_index:
            current_subtask_index !== null ? current_subtask_index + 1 : null,
        timer_type: break_type === 'short' ? 'shortBreak' : 'longBreak',
        remaining_seconds: breakSeconds,
        is_paused: false,
    });
}

export async function completeBreakSession(): Promise<boolean> {
    const session = await getActiveSession();
    if (!session) return false;

    // Check if we have more iterations to do
    if (session.current_iteration > session.total_iterations) {
        // Session complete - will be handled by caller
        return true; // indicates session should end
    }

    // Switch back to work timer
    const workSeconds = session.work_duration_minutes * 60;
    await updateSession({
        timer_type: 'work',
        remaining_seconds: workSeconds,
        is_paused: false,
    });

    return false; // session continues
}

export async function deleteSession(): Promise<void> {
    await executeSqlAsync('DELETE FROM pomodoro_sessions WHERE id = ?', [ACTIVE_SESSION_ID]);
}
