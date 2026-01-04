# Pomodoro Feature - Quick Reference

## Quick Start

### Using the Pomodoro Timer

**Focus Timer (Standalone):**
1. Navigate to Pomodoro tab
2. Select "Focus Timer"
3. Choose duration (15, 25, or 45 min)
4. Press play
5. Work until timer completes

**Task Timer (Task-Linked):**
1. Navigate to Pomodoro tab
2. Select "Task Timer"
3. Choose a task from the list
4. Configure session settings
5. Press "Start Session"
6. Work through iterations

---

## Common Code Patterns

### Starting a Pomodoro Session

```typescript
import { usePomodoro } from '@/contexts/PomodoroContext';
import { PomodoroConfig } from '@todolist/shared-types';

function MyComponent() {
  const { startSession } = usePomodoro();
  
  const handleStart = async () => {
    const config: PomodoroConfig = {
      workDurationMinutes: 25,
      breakType: 'short',
      totalIterations: 3,
    };
    
    try {
      await startSession('task-id-here', config);
    } catch (error) {
      console.error('Failed to start session:', error);
    }
  };
  
  return <Button onPress={handleStart}>Start Session</Button>;
}
```

### Checking for Active Session

```typescript
import { usePomodoro } from '@/contexts/PomodoroContext';

function MyComponent() {
  const { session } = usePomodoro();
  
  const hasActiveSession = session !== null;
  
  if (hasActiveSession) {
    return <Text>Session in progress: {session.task.name}</Text>;
  }
  
  return <Text>No active session</Text>;
}
```

### Preventing Navigation During Timer

```typescript
import { useTimer } from '@/contexts/TimerContext';
import { useNavigation } from '@react-navigation/native';
import { useEffect } from 'react';

function MyComponent() {
  const { isTimerRunning } = useTimer();
  const navigation = useNavigation();
  
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      if (!isTimerRunning) return;
      
      e.preventDefault();
      Alert.alert(
        'Timer Running',
        'Please stop the timer before leaving.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Stop Timer',
            style: 'destructive',
            onPress: () => {
              setTimerRunning(false);
              navigation.dispatch(e.data.action);
            },
          },
        ]
      );
    });
    
    return unsubscribe;
  }, [navigation, isTimerRunning]);
}
```

### Displaying Session Information

```typescript
import { PomodoroSessionWithTask } from '@todolist/shared-types';

function SessionInfo({ session }: { session: PomodoroSessionWithTask }) {
  const { task, subtasks, current_iteration, total_iterations, timer_type } = session;
  
  const currentSubtask = 
    session.current_subtask_index !== null
      ? subtasks[session.current_subtask_index]
      : null;
  
  const completedSubtasks = subtasks.filter(s => s.completed).length;
  
  return (
    <View>
      <Text>{task.name}</Text>
      <Text>Iteration: {current_iteration}/{total_iterations}</Text>
      <Text>Type: {timer_type}</Text>
      {currentSubtask && (
        <Text>Current: {currentSubtask.title}</Text>
      )}
      <Text>Subtasks: {completedSubtasks}/{subtasks.length}</Text>
    </View>
  );
}
```

---

## API Quick Reference

### Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `POST` | `/api/pomodoro/sessions` | Start new session |
| `GET` | `/api/pomodoro/sessions/active` | Get active session |
| `PATCH` | `/api/pomodoro/sessions/:id` | Update session |
| `DELETE` | `/api/pomodoro/sessions/:id` | Cancel session |

### Request/Response Examples

**Start Session:**
```typescript
// Request
POST /api/pomodoro/sessions
{
  "taskId": "task-001",
  "config": {
    "workDurationMinutes": 25,
    "breakType": "short",
    "totalIterations": 3
  }
}

// Response: PomodoroSessionWithTask
{
  "id": "session-001",
  "task_id": "task-001",
  "current_iteration": 1,
  "timer_type": "work",
  "remaining_seconds": 1500,
  // ... more fields
}
```

**Get Active Session:**
```typescript
// Request
GET /api/pomodoro/sessions/active

// Response: PomodoroSessionWithTask | null
{
  "id": "session-001",
  // ... session data
}
// or
null
```

**Update Session:**
```typescript
// Request
PATCH /api/pomodoro/sessions/session-001
{
  "is_paused": true,
  "remaining_seconds": 847
}

// Response: PomodoroSessionWithTask
{
  "id": "session-001",
  "is_paused": true,
  "remaining_seconds": 847,
  // ... more fields
}
```

**Cancel Session:**
```typescript
// Request
DELETE /api/pomodoro/sessions/session-001

// Response
{
  "success": true
}
```

---

## Type Definitions Cheat Sheet

```typescript
// Timer phase
type TimerType = 'work' | 'shortBreak' | 'longBreak';

// Break preference
type BreakType = 'short' | 'long';

// Session configuration
interface PomodoroConfig {
  workDurationMinutes: number;    // 15, 25, or 45
  breakType: BreakType;            // 'short' or 'long'
  totalIterations: number;         // 1-10
}

// Active session
interface PomodoroSession {
  id: string;
  task_id: string;
  work_duration_minutes: number;
  break_type: BreakType;
  total_iterations: number;
  current_iteration: number;
  current_subtask_index: number | null;
  timer_type: TimerType;
  remaining_seconds: number;
  is_paused: boolean;
  started_at: string;
  updated_at: string;
}

// Session with task details
interface PomodoroSessionWithTask extends PomodoroSession {
  task: {
    id: string;
    name: string;
    description?: string | null;
  };
  subtasks: Array<{
    id: string;
    title: string;
    completed: boolean;
    order: number | null;
  }>;
}
```

---

## Component Props Quick Reference

### CircularTimer
```typescript
<CircularTimer
  mode="focus" | "task"
  onTimerComplete={() => console.log('Done!')}
  onRunningStateChange={(running) => console.log(running)}
/>
```

### TaskSelector
```typescript
<TaskSelector
  onStartSession={(taskId, config) => {
    // Start session logic
  }}
/>
```

### TaskList
```typescript
<TaskList
  tasks={tasks}
  onSelectTask={(task) => setSelectedTask(task)}
  selectedTaskId={selectedTask?.id}
/>
```

### SessionConfig
```typescript
<SessionConfig
  selectedTask={task}
  subtaskCount={4}
  duration={25}
  iterations={3}
  breakType="short"
  onDurationChange={setDuration}
  onIterationsChange={setIterations}
  onBreakTypeChange={setBreakType}
  onChangeTask={() => setSelectedTask(null)}
  onStartSession={handleStart}
  animationOpacity={opacity}
  animationTranslateY={translateY}
/>
```

### SessionDisplay
```typescript
<SessionDisplay
  session={session}
  onCancel={async () => {
    await cancelSession();
  }}
/>
```

---

## Context Hooks

### useTimer()
```typescript
const { isTimerRunning, setTimerRunning } = useTimer();

// Check if timer is running
if (isTimerRunning) {
  // Disable certain actions
}

// Update timer state
setTimerRunning(true);  // Timer started
setTimerRunning(false); // Timer stopped
```

### usePomodoro()
```typescript
const { session, startSession, cancelSession, isLoading } = usePomodoro();

// Check for active session
const hasSession = session !== null;

// Start new session
await startSession(taskId, config);

// Cancel current session
await cancelSession();

// Show loading state
if (isLoading) {
  return <ActivityIndicator />;
}
```

---

## Validation Rules

### PomodoroConfig
- ✅ `workDurationMinutes`: 15, 25, or 45
- ✅ `totalIterations`: 1-10
- ✅ `breakType`: 'short' or 'long'

### Session State
- ✅ `current_iteration` ≤ `total_iterations`
- ✅ `current_subtask_index` < `subtasks.length` or `null`
- ✅ `remaining_seconds` ≥ 0
- ✅ Cannot start session if one exists
- ✅ Cannot update non-existent session

---

## Common Calculations

### Progress Percentage
```typescript
const progressPercent = ((current_iteration - 1) / total_iterations) * 100;
```

### Time Display (MM:SS)
```typescript
const minutes = Math.floor(timeLeft / 60);
const seconds = timeLeft % 60;
const display = `${minutes}:${seconds.toString().padStart(2, '0')}`;
```

### Circular Progress
```typescript
const progress = totalTime > 0 ? (totalTime - timeLeft) / totalTime : 0;
const circumference = 2 * Math.PI * radius;
const strokeDashoffset = circumference * (1 - progress);
```

### Completed Subtasks Count
```typescript
const completedCount = subtasks.filter(s => s.completed).length;
```

---

## Styling Constants

### Colors
```typescript
const COLORS = {
  primary: '#6366f1',      // Indigo - work sessions, active states
  success: '#10b981',      // Green - break sessions
  danger: '#ef4444',       // Red - cancel/destructive actions
  text: {
    primary: '#1f2937',
    secondary: '#374151',
    tertiary: '#6b7280',
    disabled: '#9ca3af',
  },
  background: {
    page: '#fafafa',
    card: '#fff',
    light: '#f3f4f6',
    border: '#e5e7eb',
  },
};
```

### Spacing
```typescript
const SPACING = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
};
```

### Border Radius
```typescript
const RADIUS = {
  small: 8,
  medium: 12,
  large: 16,
};
```

---

## Troubleshooting

### Timer Not Stopping on Navigation
**Problem:** User can navigate away while timer is running.

**Solution:** Ensure `beforeRemove` listener is set up and `isTimerRunning` ref is updated:
```typescript
const isTimerRunningRef = React.useRef(isTimerRunning);

useEffect(() => {
  isTimerRunningRef.current = isTimerRunning;
}, [isTimerRunning]);

useEffect(() => {
  const unsubscribe = navigation.addListener('beforeRemove', (e) => {
    if (!isTimerRunningRef.current) return;
    e.preventDefault();
    // Show alert
  });
  return unsubscribe;
}, [navigation]);
```

### Session Not Syncing
**Problem:** Local timer state doesn't match backend session.

**Solution:** In task mode, always read from `session.remaining_seconds`:
```typescript
useEffect(() => {
  if (mode === 'task' && session) {
    setTimeLeft(session.remaining_seconds);
    setTotalTime(session.work_duration_minutes * 60);
  }
}, [session, mode]);
```

### Animation Jank
**Problem:** Animations are choppy or slow.

**Solution:** Use `useNativeDriver: true` where possible:
```typescript
Animated.timing(opacity, {
  toValue: 1,
  duration: 400,
  useNativeDriver: true, // ✅ Enable native driver
}).start();
```

### Subtask Not Advancing
**Problem:** Subtask index doesn't update after work session.

**Solution:** Update `current_subtask_index` when transitioning to break:
```typescript
const nextIndex = current_subtask_index !== null 
  ? current_subtask_index + 1 
  : 0;

await updateSession({
  timer_type: 'shortBreak',
  current_subtask_index: nextIndex < subtasks.length ? nextIndex : null,
});
```

---

## File Locations

### Types
- `packages/shared-types/index.ts`

### Contexts
- `apps/todo-list/contexts/TimerContext.tsx`
- `apps/todo-list/contexts/PomodoroContext.tsx`

### Components
- `apps/todo-list/components/pomodoro/CircularTimer.tsx`
- `apps/todo-list/components/pomodoro/TaskSelector.tsx`
- `apps/todo-list/components/pomodoro/TaskList.tsx`
- `apps/todo-list/components/pomodoro/SessionConfig.tsx`
- `apps/todo-list/components/pomodoro/SessionDisplay.tsx`

### Screens
- `apps/todo-list/app/(tabs)/pomodoro-timer.tsx`

### Services
- `apps/todo-list/services/pomodoro.ts`

### Documentation
- `docs/data/pomodoro.md` - Feature overview and data schemas
- `docs/data/pomodoro-components.md` - Component architecture
- `docs/data/pomodoro-examples.md` - Complete examples
- `docs/data/pomodoro-quick-reference.md` - This file

---

## Related Documentation

- [Pomodoro Feature Overview](./pomodoro.md)
- [Component Architecture](./pomodoro-components.md)
- [Complete Examples](./pomodoro-examples.md)
- [Tasks Schema](./tasks.md)
- [Subtasks Schema](./subtasks.md)
