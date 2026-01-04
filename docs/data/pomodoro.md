# Pomodoro Timer Feature

## Overview

The Pomodoro Timer feature provides a time management system based on the Pomodoro Technique, allowing users to work in focused intervals with scheduled breaks. The implementation supports both standalone focus sessions and task-linked sessions that track progress against specific tasks and subtasks.

## Data Schema

### PomodoroConfig

Configuration object for starting a new Pomodoro session.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `workDurationMinutes` | `number` | **Required** | Duration of each work session in minutes (typically 15, 25, or 45) |
| `breakType` | `'short' \| 'long'` | **Required** | Type of break to take after work sessions |
| `totalIterations` | `number` | **Required** | Total number of work/break cycles to complete |

**Example:**
```json
{
  "workDurationMinutes": 25,
  "breakType": "short",
  "totalIterations": 3
}
```

### PomodoroSession

Active Pomodoro session stored in the backend.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` (UUID) | **Required** | Unique session identifier |
| `task_id` | `string` (UUID) | **Required** | Associated task ID |
| `work_duration_minutes` | `number` | **Required** | Work duration in minutes |
| `break_type` | `BreakType` | **Required** | Type of break ('short' or 'long') |
| `total_iterations` | `number` | **Required** | Total number of iterations planned |
| `current_iteration` | `number` | **Required** | Current iteration (1-indexed) |
| `current_subtask_index` | `number \| null` | **Required** | Index of current subtask being worked on, or null |
| `timer_type` | `TimerType` | **Required** | Current timer phase: 'work', 'shortBreak', or 'longBreak' |
| `remaining_seconds` | `number` | **Required** | Seconds remaining in current timer phase |
| `is_paused` | `boolean` | **Required** | Whether the timer is currently paused |
| `started_at` | `string` (ISO8601) | **Required** | Session start timestamp |
| `updated_at` | `string` (ISO8601) | **Required** | Last update timestamp |

**Example:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "task_id": "123e4567-e89b-12d3-a456-426614174000",
  "work_duration_minutes": 25,
  "break_type": "short",
  "total_iterations": 3,
  "current_iteration": 1,
  "current_subtask_index": 0,
  "timer_type": "work",
  "remaining_seconds": 1500,
  "is_paused": false,
  "started_at": "2026-01-04T05:00:00Z",
  "updated_at": "2026-01-04T05:00:00Z"
}
```

### PomodoroSessionWithTask

Extended session object that includes task and subtask details for UI display.

Extends `PomodoroSession` with:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `task` | `object` | **Required** | Task information object |
| `task.id` | `string` | **Required** | Task ID |
| `task.name` | `string` | **Required** | Task name |
| `task.description` | `string \| null` | Optional | Task description |
| `subtasks` | `array` | **Required** | Array of subtask objects |
| `subtasks[].id` | `string` | **Required** | Subtask ID |
| `subtasks[].title` | `string` | **Required** | Subtask title |
| `subtasks[].completed` | `boolean` | **Required** | Completion status |
| `subtasks[].order` | `number \| null` | Optional | Display order |

**Example:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "task_id": "123e4567-e89b-12d3-a456-426614174000",
  "work_duration_minutes": 25,
  "break_type": "short",
  "total_iterations": 3,
  "current_iteration": 1,
  "current_subtask_index": 0,
  "timer_type": "work",
  "remaining_seconds": 1500,
  "is_paused": false,
  "started_at": "2026-01-04T05:00:00Z",
  "updated_at": "2026-01-04T05:00:00Z",
  "task": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "Implement authentication",
    "description": "Add user login and registration"
  },
  "subtasks": [
    {
      "id": "sub-001",
      "title": "Design login form",
      "completed": false,
      "order": 0
    },
    {
      "id": "sub-002",
      "title": "Implement API endpoints",
      "completed": false,
      "order": 1
    }
  ]
}
```

## Type Definitions

### TimerType
```typescript
type TimerType = 'work' | 'shortBreak' | 'longBreak';
```

Represents the current phase of the Pomodoro timer:
- `work` - Active work session
- `shortBreak` - Short break (typically 5 minutes)
- `longBreak` - Long break (typically 15-30 minutes)

### BreakType
```typescript
type BreakType = 'short' | 'long';
```

Configuration for break duration preference.

## User Flows

### Focus Timer Flow (Standalone)

1. User navigates to Pomodoro Timer screen
2. User selects "Focus Timer" tab
3. User sees circular timer with preset options (15, 25, 45 minutes)
4. User selects a preset or uses current setting
5. User taps play button to start timer
6. Timer counts down with visual progress indicator
7. User can pause/resume or reset timer
8. When timer completes:
   - Vibration feedback
   - Alert notification
   - Option to start break or new session

**Restrictions while timer is running:**
- Cannot change timer presets
- Cannot switch between Focus/Task tabs
- Cannot navigate away from Pomodoro screen (shows alert)

### Task Timer Flow (Task-Linked)

1. User navigates to Pomodoro Timer screen
2. User selects "Task Timer" tab
3. **Phase 1: Task Selection**
   - User sees list of incomplete tasks
   - Task items show name, description, and subtask count
   - User taps a task to select it
   - Smooth slide-right animation on selection
4. **Phase 2: Session Configuration**
   - Selected task card displays at top
   - User configures:
     - Work duration (15, 25, or 45 minutes)
     - Number of iterations (1-10)
     - Break type (short or long)
   - User can change task selection
   - User taps "Start Session" button
5. **Active Session**
   - Circular timer displays at top
   - Session info card displays at bottom showing:
     - Timer type badge (Work/Short Break/Long Break)
     - Current iteration progress (e.g., "2/3")
     - Task name
     - Current subtask (during work sessions)
     - Subtask completion progress
     - Progress bar
   - User can pause/resume timer
   - User can cancel session (shows confirmation)
6. **Session Progression**
   - Work session → Break → Work session → Break → ...
   - Subtasks auto-advance when work session completes
   - Session completes after all iterations

**Restrictions while session is active:**
- Cannot switch to Focus Timer tab
- Cannot change timer settings
- Cannot navigate away from screen (shows alert)
- Automatically switches to Task Timer tab

## UI/UX Requirements

### Tab Navigation
- Two tabs: "Focus Timer" and "Task Timer"
- Tabs display icons (clock for Focus, tasks for Task)
- Active tab highlighted with primary color (#6366f1)
- Disabled tabs show reduced opacity (0.4) and gray text
- Tabs disabled when timer is running (except current tab)

### Circular Timer
- Large circular progress indicator
- Time display in center (MM:SS format)
- Play/Pause button below timer
- Reset button (when paused)
- Preset buttons (15, 25, 45 min) when not running
- Active preset highlighted
- Smooth animations for progress updates

### Task Selection (90% width, centered)
- Scrollable list of incomplete tasks
- Hidden scrollbar for clean appearance
- Each task item shows:
  - Task name (bold, 16px)
  - Description (gray, 14px, truncated)
  - Subtask count badge
- Slide-right animation on tap
- Smooth transition to configuration phase

### Session Configuration
- Animated entrance (fade + slide up)
- Selected task card at top
- Duration selector with preset buttons
- Iteration counter with +/- buttons
- Break type toggle (Short/Long)
- "Change Task" link
- "Start Session" primary button

### Session Display
- Fixed at bottom of screen
- 90% width, centered
- Card with rounded corners and shadow
- Header row with:
  - Timer type badge (colored by type)
  - Iteration counter
  - Cancel button (red X icon)
- Task name (bold, 18px)
- Current subtask indicator (during work)
- Subtask progress text
- Bottom progress bar (full width of card)

## State Management

### TimerContext
Provides global timer state to prevent navigation during active timers.

**State:**
- `isTimerRunning: boolean` - Whether any timer is currently running

**Methods:**
- `setTimerRunning(running: boolean)` - Update timer running state

### PomodoroContext
Manages Pomodoro session state and backend synchronization.

**State:**
- `session: PomodoroSessionWithTask | null` - Current active session or null
- `isLoading: boolean` - Loading state for async operations

**Methods:**
- `startSession(taskId: string, config: PomodoroConfig): Promise<void>` - Start new session
- `cancelSession(): Promise<void>` - Cancel current session
- `updateSession(updates: Partial<PomodoroSession>): Promise<void>` - Update session state

## Validation Rules

### PomodoroConfig Validation
- `workDurationMinutes`: Must be 15, 25, or 45
- `totalIterations`: Must be between 1 and 10
- `breakType`: Must be 'short' or 'long'

### Session State Validation
- Cannot start new session if one already exists
- Cannot update session that doesn't exist
- `current_iteration` must be ≤ `total_iterations`
- `current_subtask_index` must be < subtasks.length or null
- `remaining_seconds` must be ≥ 0

## Backend Integration

### API Endpoints

**POST /api/pomodoro/sessions**
- Start a new Pomodoro session
- Request body: `{ taskId: string, config: PomodoroConfig }`
- Response: `PomodoroSessionWithTask`

**GET /api/pomodoro/sessions/active**
- Get current active session
- Response: `PomodoroSessionWithTask | null`

**PATCH /api/pomodoro/sessions/:id**
- Update session state (pause, resume, advance iteration, etc.)
- Request body: `Partial<PomodoroSession>`
- Response: `PomodoroSessionWithTask`

**DELETE /api/pomodoro/sessions/:id**
- Cancel/delete a session
- Response: `{ success: boolean }`

## Implementation Notes

### Timer Accuracy
- Timer uses `setInterval` with 1-second updates
- State synced with backend periodically (not every second)
- Local state used for smooth UI updates
- Backend state is source of truth on resume/reload

### Navigation Blocking
- Uses React Navigation's `beforeRemove` listener
- Maintains ref to `isTimerRunning` for latest state in listener
- Shows alert with options: "Cancel" or "Stop Timer"
- Properly cleans up state before allowing navigation

### Animation Performance
- Uses `LayoutAnimation` for smooth transitions
- Animated values with `useNativeDriver: true` where possible
- Spring animations for natural feel
- Fade + translate animations for entrance effects

### Subtask Progression
- Subtasks advance automatically after work session completes
- Only advances during work sessions (not breaks)
- Skips completed subtasks
- Wraps to null when all subtasks completed

## Related Files

**Type Definitions:**
- `packages/shared-types/index.ts` - Shared TypeScript types

**Contexts:**
- `apps/todo-list/contexts/TimerContext.tsx` - Global timer state
- `apps/todo-list/contexts/PomodoroContext.tsx` - Session management

**Components:**
- `apps/todo-list/components/pomodoro/CircularTimer.tsx` - Timer UI
- `apps/todo-list/components/pomodoro/TaskSelector.tsx` - Task selection orchestrator
- `apps/todo-list/components/pomodoro/TaskList.tsx` - Task list display
- `apps/todo-list/components/pomodoro/SessionConfig.tsx` - Configuration UI
- `apps/todo-list/components/pomodoro/SessionDisplay.tsx` - Active session info

**Screens:**
- `apps/todo-list/app/(tabs)/pomodoro-timer.tsx` - Main Pomodoro screen

**Services:**
- `apps/todo-list/services/pomodoro.ts` - API client functions
