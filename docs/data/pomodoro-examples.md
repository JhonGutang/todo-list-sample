# Pomodoro Feature Examples

This document provides complete example payloads for the Pomodoro timer feature, showing how data flows through the system from session creation to completion.

## Example 1: Starting a Task Session

### Step 1: User Selects Task

**Task Data (from tasks API):**
```json
{
  "id": "task-001",
  "name": "Build user authentication system",
  "description": "Implement login, registration, and password reset",
  "priority": "high",
  "startDate": "2026-01-04T00:00:00Z",
  "endDate": "2026-01-10T00:00:00Z",
  "completed": false,
  "pomodoro_estimated": 8,
  "pomodoro_completed": 0
}
```

**Associated Subtasks:**
```json
[
  {
    "id": "sub-001",
    "task_id": "task-001",
    "title": "Design login form UI",
    "description": "Create responsive login form with email and password fields",
    "completed": false,
    "order": 0
  },
  {
    "id": "sub-002",
    "task_id": "task-001",
    "title": "Implement backend authentication endpoints",
    "description": "POST /login, POST /register, POST /reset-password",
    "completed": false,
    "order": 1
  },
  {
    "id": "sub-003",
    "task_id": "task-001",
    "title": "Add JWT token management",
    "description": "Store tokens securely, handle refresh logic",
    "completed": false,
    "order": 2
  },
  {
    "id": "sub-004",
    "task_id": "task-001",
    "title": "Write unit tests",
    "description": "Test all authentication flows",
    "completed": false,
    "order": 3
  }
]
```

### Step 2: User Configures Session

**Configuration Input:**
```json
{
  "workDurationMinutes": 25,
  "breakType": "short",
  "totalIterations": 4
}
```

### Step 3: Session Created

**POST /api/pomodoro/sessions Request:**
```json
{
  "taskId": "task-001",
  "config": {
    "workDurationMinutes": 25,
    "breakType": "short",
    "totalIterations": 4
  }
}
```

**Response (PomodoroSessionWithTask):**
```json
{
  "id": "session-001",
  "task_id": "task-001",
  "work_duration_minutes": 25,
  "break_type": "short",
  "total_iterations": 4,
  "current_iteration": 1,
  "current_subtask_index": 0,
  "timer_type": "work",
  "remaining_seconds": 1500,
  "is_paused": false,
  "started_at": "2026-01-04T09:00:00Z",
  "updated_at": "2026-01-04T09:00:00Z",
  "task": {
    "id": "task-001",
    "name": "Build user authentication system",
    "description": "Implement login, registration, and password reset"
  },
  "subtasks": [
    {
      "id": "sub-001",
      "title": "Design login form UI",
      "completed": false,
      "order": 0
    },
    {
      "id": "sub-002",
      "title": "Implement backend authentication endpoints",
      "completed": false,
      "order": 1
    },
    {
      "id": "sub-003",
      "title": "Add JWT token management",
      "completed": false,
      "order": 2
    },
    {
      "id": "sub-004",
      "title": "Write unit tests",
      "completed": false,
      "order": 3
    }
  ]
}
```

---

## Example 2: Session Progression

### After First Work Session (25 minutes)

**PATCH /api/pomodoro/sessions/session-001 Request:**
```json
{
  "timer_type": "shortBreak",
  "remaining_seconds": 300,
  "current_subtask_index": 1,
  "updated_at": "2026-01-04T09:25:00Z"
}
```

**Response:**
```json
{
  "id": "session-001",
  "task_id": "task-001",
  "work_duration_minutes": 25,
  "break_type": "short",
  "total_iterations": 4,
  "current_iteration": 1,
  "current_subtask_index": 1,
  "timer_type": "shortBreak",
  "remaining_seconds": 300,
  "is_paused": false,
  "started_at": "2026-01-04T09:00:00Z",
  "updated_at": "2026-01-04T09:25:00Z",
  "task": {
    "id": "task-001",
    "name": "Build user authentication system",
    "description": "Implement login, registration, and password reset"
  },
  "subtasks": [
    {
      "id": "sub-001",
      "title": "Design login form UI",
      "completed": true,
      "order": 0
    },
    {
      "id": "sub-002",
      "title": "Implement backend authentication endpoints",
      "completed": false,
      "order": 1
    },
    {
      "id": "sub-003",
      "title": "Add JWT token management",
      "completed": false,
      "order": 2
    },
    {
      "id": "sub-004",
      "title": "Write unit tests",
      "completed": false,
      "order": 3
    }
  ]
}
```

### After Short Break (5 minutes)

**PATCH /api/pomodoro/sessions/session-001 Request:**
```json
{
  "timer_type": "work",
  "remaining_seconds": 1500,
  "current_iteration": 2,
  "updated_at": "2026-01-04T09:30:00Z"
}
```

**Response:**
```json
{
  "id": "session-001",
  "task_id": "task-001",
  "work_duration_minutes": 25,
  "break_type": "short",
  "total_iterations": 4,
  "current_iteration": 2,
  "current_subtask_index": 1,
  "timer_type": "work",
  "remaining_seconds": 1500,
  "is_paused": false,
  "started_at": "2026-01-04T09:00:00Z",
  "updated_at": "2026-01-04T09:30:00Z",
  "task": {
    "id": "task-001",
    "name": "Build user authentication system",
    "description": "Implement login, registration, and password reset"
  },
  "subtasks": [
    {
      "id": "sub-001",
      "title": "Design login form UI",
      "completed": true,
      "order": 0
    },
    {
      "id": "sub-002",
      "title": "Implement backend authentication endpoints",
      "completed": false,
      "order": 1
    },
    {
      "id": "sub-003",
      "title": "Add JWT token management",
      "completed": false,
      "order": 2
    },
    {
      "id": "sub-004",
      "title": "Write unit tests",
      "completed": false,
      "order": 3
    }
  ]
}
```

---

## Example 3: Pausing and Resuming

### User Pauses During Work Session

**PATCH /api/pomodoro/sessions/session-001 Request:**
```json
{
  "is_paused": true,
  "remaining_seconds": 847,
  "updated_at": "2026-01-04T09:41:13Z"
}
```

**Response:**
```json
{
  "id": "session-001",
  "task_id": "task-001",
  "work_duration_minutes": 25,
  "break_type": "short",
  "total_iterations": 4,
  "current_iteration": 2,
  "current_subtask_index": 1,
  "timer_type": "work",
  "remaining_seconds": 847,
  "is_paused": true,
  "started_at": "2026-01-04T09:00:00Z",
  "updated_at": "2026-01-04T09:41:13Z",
  "task": {
    "id": "task-001",
    "name": "Build user authentication system",
    "description": "Implement login, registration, and password reset"
  },
  "subtasks": [
    {
      "id": "sub-001",
      "title": "Design login form UI",
      "completed": true,
      "order": 0
    },
    {
      "id": "sub-002",
      "title": "Implement backend authentication endpoints",
      "completed": false,
      "order": 1
    },
    {
      "id": "sub-003",
      "title": "Add JWT token management",
      "completed": false,
      "order": 2
    },
    {
      "id": "sub-004",
      "title": "Write unit tests",
      "completed": false,
      "order": 3
    }
  ]
}
```

### User Resumes

**PATCH /api/pomodoro/sessions/session-001 Request:**
```json
{
  "is_paused": false,
  "updated_at": "2026-01-04T09:45:00Z"
}
```

---

## Example 4: Canceling a Session

**DELETE /api/pomodoro/sessions/session-001**

**Response:**
```json
{
  "success": true
}
```

**Side Effects:**
- Session removed from database
- Task's `pomodoro_completed` count updated based on completed iterations
- Completed subtasks remain marked as completed

---

## Example 5: Focus Timer (No Task)

Focus timer operates independently without backend session management.

**Local Component State:**
```typescript
{
  mode: 'focus',
  timeLeft: 1500,        // 25 minutes in seconds
  isRunning: false,
  totalTime: 1500,
  selectedPreset: 25
}
```

**After Starting Timer:**
```typescript
{
  mode: 'focus',
  timeLeft: 1499,        // Counting down
  isRunning: true,
  totalTime: 1500,
  selectedPreset: 25
}
```

**No API calls made** - purely local state management.

---

## Example 6: Session with All Subtasks Completed

### Mid-Session State

**Current Session:**
```json
{
  "id": "session-002",
  "task_id": "task-002",
  "work_duration_minutes": 25,
  "break_type": "short",
  "total_iterations": 3,
  "current_iteration": 3,
  "current_subtask_index": null,
  "timer_type": "work",
  "remaining_seconds": 450,
  "is_paused": false,
  "started_at": "2026-01-04T10:00:00Z",
  "updated_at": "2026-01-04T10:57:30Z",
  "task": {
    "id": "task-002",
    "name": "Fix critical bugs",
    "description": "Address high-priority issues"
  },
  "subtasks": [
    {
      "id": "sub-005",
      "title": "Fix login redirect bug",
      "completed": true,
      "order": 0
    },
    {
      "id": "sub-006",
      "title": "Resolve memory leak",
      "completed": true,
      "order": 1
    }
  ]
}
```

**Note:** `current_subtask_index` is `null` because all subtasks are completed. User continues working on general task improvements.

---

## Example 7: Long Break Session

### Configuration with Long Break

**POST /api/pomodoro/sessions Request:**
```json
{
  "taskId": "task-003",
  "config": {
    "workDurationMinutes": 45,
    "breakType": "long",
    "totalIterations": 2
  }
}
```

**After First Work Session:**
```json
{
  "id": "session-003",
  "task_id": "task-003",
  "work_duration_minutes": 45,
  "break_type": "long",
  "total_iterations": 2,
  "current_iteration": 1,
  "current_subtask_index": 0,
  "timer_type": "longBreak",
  "remaining_seconds": 1800,
  "is_paused": false,
  "started_at": "2026-01-04T11:00:00Z",
  "updated_at": "2026-01-04T11:45:00Z",
  "task": {
    "id": "task-003",
    "name": "Research new framework",
    "description": "Evaluate Next.js 15 features"
  },
  "subtasks": []
}
```

**Note:** Long break is 30 minutes (1800 seconds) vs short break of 5 minutes (300 seconds).

---

## Example 8: GET Active Session

### Request
**GET /api/pomodoro/sessions/active**

### Response (Active Session Exists)
```json
{
  "id": "session-001",
  "task_id": "task-001",
  "work_duration_minutes": 25,
  "break_type": "short",
  "total_iterations": 4,
  "current_iteration": 2,
  "current_subtask_index": 1,
  "timer_type": "work",
  "remaining_seconds": 847,
  "is_paused": true,
  "started_at": "2026-01-04T09:00:00Z",
  "updated_at": "2026-01-04T09:41:13Z",
  "task": {
    "id": "task-001",
    "name": "Build user authentication system",
    "description": "Implement login, registration, and password reset"
  },
  "subtasks": [
    {
      "id": "sub-001",
      "title": "Design login form UI",
      "completed": true,
      "order": 0
    },
    {
      "id": "sub-002",
      "title": "Implement backend authentication endpoints",
      "completed": false,
      "order": 1
    },
    {
      "id": "sub-003",
      "title": "Add JWT token management",
      "completed": false,
      "order": 2
    },
    {
      "id": "sub-004",
      "title": "Write unit tests",
      "completed": false,
      "order": 3
    }
  ]
}
```

### Response (No Active Session)
```json
null
```

---

## UI State Examples

### TaskSelector - Phase 1 (Task Selection)

**Component State:**
```typescript
{
  tasks: [
    {
      id: "task-001",
      name: "Build user authentication system",
      description: "Implement login, registration, and password reset",
      completed: false
    },
    {
      id: "task-002",
      name: "Fix critical bugs",
      description: "Address high-priority issues",
      completed: false
    }
  ],
  selectedTask: null,
  subtaskCount: 0,
  duration: 25,
  iterations: 3,
  breakType: 'short'
}
```

### TaskSelector - Phase 2 (Configuration)

**Component State:**
```typescript
{
  tasks: [...],
  selectedTask: {
    id: "task-001",
    name: "Build user authentication system",
    description: "Implement login, registration, and password reset",
    completed: false
  },
  subtaskCount: 4,
  duration: 25,
  iterations: 3,
  breakType: 'short'
}
```

### CircularTimer - Focus Mode

**Component State:**
```typescript
{
  mode: 'focus',
  timeLeft: 1500,
  isRunning: true,
  totalTime: 1500,
  selectedPreset: 25
}
```

**Display:**
- Time: "25:00"
- Progress: 0%
- Controls: Pause button visible

### CircularTimer - Task Mode (Active Session)

**Component State (derived from PomodoroContext):**
```typescript
{
  mode: 'task',
  timeLeft: 847,         // From session.remaining_seconds
  isRunning: true,
  totalTime: 1500,       // From session.work_duration_minutes * 60
  selectedPreset: null   // Not applicable in task mode
}
```

**Display:**
- Time: "14:07"
- Progress: 43.5%
- Controls: Pause button visible, no preset buttons

### SessionDisplay - Work Session

**Props:**
```typescript
{
  session: {
    current_iteration: 2,
    total_iterations: 4,
    timer_type: 'work',
    current_subtask_index: 1,
    task: {
      name: "Build user authentication system"
    },
    subtasks: [
      { id: "sub-001", title: "Design login form UI", completed: true, order: 0 },
      { id: "sub-002", title: "Implement backend endpoints", completed: false, order: 1 },
      { id: "sub-003", title: "Add JWT token management", completed: false, order: 2 },
      { id: "sub-004", title: "Write unit tests", completed: false, order: 3 }
    ]
  }
}
```

**Display:**
- Badge: "WORK SESSION" (blue)
- Counter: "2/4"
- Task: "Build user authentication system"
- Current Subtask: "→ Implement backend endpoints"
- Progress: "Subtasks: 1/4"
- Progress Bar: 25% filled (blue)

### SessionDisplay - Break Session

**Props:**
```typescript
{
  session: {
    current_iteration: 2,
    total_iterations: 4,
    timer_type: 'shortBreak',
    current_subtask_index: 2,
    task: {
      name: "Build user authentication system"
    },
    subtasks: [...]
  }
}
```

**Display:**
- Badge: "SHORT BREAK" (green)
- Counter: "2/4"
- Task: "Build user authentication system"
- Current Subtask: Not shown (only during work)
- Progress: "Subtasks: 2/4"
- Progress Bar: 25% filled (green)

---

## Error Scenarios

### Attempting to Start Session When One Exists

**Request:**
```json
POST /api/pomodoro/sessions
{
  "taskId": "task-002",
  "config": {
    "workDurationMinutes": 25,
    "breakType": "short",
    "totalIterations": 3
  }
}
```

**Response (400 Bad Request):**
```json
{
  "error": "Active session already exists",
  "activeSessionId": "session-001"
}
```

### Invalid Configuration

**Request:**
```json
POST /api/pomodoro/sessions
{
  "taskId": "task-001",
  "config": {
    "workDurationMinutes": 30,
    "breakType": "short",
    "totalIterations": 15
  }
}
```

**Response (400 Bad Request):**
```json
{
  "error": "Invalid configuration",
  "details": {
    "workDurationMinutes": "Must be 15, 25, or 45",
    "totalIterations": "Must be between 1 and 10"
  }
}
```

### Task Not Found

**Request:**
```json
POST /api/pomodoro/sessions
{
  "taskId": "nonexistent-task",
  "config": {
    "workDurationMinutes": 25,
    "breakType": "short",
    "totalIterations": 3
  }
}
```

**Response (404 Not Found):**
```json
{
  "error": "Task not found",
  "taskId": "nonexistent-task"
}
```
