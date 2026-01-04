# Pomodoro Components Architecture

## Overview

The Pomodoro feature is built with a modular component architecture that separates concerns between timer logic, task selection, session configuration, and session display. This document describes each component's responsibilities, props, and implementation details.

## Component Hierarchy

```
PomodoroTimerPage (Screen)
├── TabNavigation
├── Focus Mode
│   └── CircularTimer (mode="focus")
└── Task Mode
    ├── TaskSelector (when no active session)
    │   ├── TaskList
    │   └── SessionConfig
    └── Active Session View
        ├── CircularTimer (mode="task")
        └── SessionDisplay
```

## Components

### PomodoroTimerPage
**Location:** `apps/todo-list/app/(tabs)/pomodoro-timer.tsx`

Main screen component that orchestrates the Pomodoro timer experience.

#### Responsibilities
- Manage tab switching between Focus and Task modes
- Prevent navigation when timer is running
- Coordinate between CircularTimer, TaskSelector, and SessionDisplay
- Handle session lifecycle (start, cancel)

#### State
```typescript
const [mode, setMode] = useState<'focus' | 'task'>('focus');
```

#### Context Dependencies
- `useTimer()` - Global timer running state
- `usePomodoro()` - Session management
- `useNavigation()` - React Navigation

#### Key Features
- **Navigation Blocking**: Uses `beforeRemove` listener to prevent leaving screen during active timer
- **Mode Switching**: Prevents switching tabs when timer is running
- **Auto-switching**: Automatically switches to Task mode when session is active
- **Alert Dialogs**: Shows confirmation dialogs for destructive actions

#### Props
None (root screen component)

---

### CircularTimer
**Location:** `apps/todo-list/components/pomodoro/CircularTimer.tsx`

Reusable circular timer component with visual progress indicator.

#### Props
```typescript
interface CircularTimerProps {
  mode: 'focus' | 'task';
  onTimerComplete?: () => void;
  onRunningStateChange?: (isRunning: boolean) => void;
}
```

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `mode` | `'focus' \| 'task'` | **Required** | Timer mode affecting behavior and data source |
| `onTimerComplete` | `() => void` | Optional | Callback when timer reaches zero |
| `onRunningStateChange` | `(isRunning: boolean) => void` | Optional | Callback when timer starts/stops |

#### State
```typescript
const [timeLeft, setTimeLeft] = useState(25 * 60); // seconds
const [isRunning, setIsRunning] = useState(false);
const [totalTime, setTotalTime] = useState(25 * 60);
const [selectedPreset, setSelectedPreset] = useState(25);
```

#### Key Features
- **Dual Mode Operation**:
  - **Focus Mode**: Standalone timer with local state
  - **Task Mode**: Syncs with PomodoroContext session state
- **Visual Progress**: SVG circular progress indicator
- **Preset Buttons**: Quick selection for 15, 25, 45 minute durations
- **Play/Pause/Reset**: Full timer controls
- **Animations**: Smooth progress updates using Animated API
- **Vibration**: Haptic feedback on completion
- **Alerts**: Notification when timer completes

#### Implementation Details

**Timer Logic:**
```typescript
useEffect(() => {
  if (!isRunning || timeLeft <= 0) return;
  
  const interval = setInterval(() => {
    setTimeLeft(prev => {
      if (prev <= 1) {
        handleTimerComplete();
        return 0;
      }
      return prev - 1;
    });
  }, 1000);
  
  return () => clearInterval(interval);
}, [isRunning, timeLeft]);
```

**Progress Calculation:**
```typescript
const progress = totalTime > 0 ? (totalTime - timeLeft) / totalTime : 0;
const circumference = 2 * Math.PI * radius;
const strokeDashoffset = circumference * (1 - progress);
```

**Mode-Specific Behavior:**
- Focus mode: Uses local state, allows preset changes
- Task mode: Reads from `session.remaining_seconds`, disables presets

---

### TaskSelector
**Location:** `apps/todo-list/components/pomodoro/TaskSelector.tsx`

Orchestrates the two-phase task selection and session configuration flow.

#### Props
```typescript
interface TaskSelectorProps {
  onStartSession: (taskId: string, config: PomodoroConfig) => void;
}
```

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `onStartSession` | `(taskId: string, config: PomodoroConfig) => void` | **Required** | Callback to start a new session |

#### State
```typescript
const [tasks, setTasks] = useState<Task[]>([]);
const [selectedTask, setSelectedTask] = useState<Task | null>(null);
const [subtaskCount, setSubtaskCount] = useState(0);
const [duration, setDuration] = useState(25);
const [iterations, setIterations] = useState(3);
const [breakType, setBreakType] = useState<'short' | 'long'>('short');
```

#### Animation State
```typescript
const settingsOpacity = useRef(new Animated.Value(0)).current;
const settingsTranslateY = useRef(new Animated.Value(30)).current;
```

#### Key Features
- **Two-Phase UI**: Switches between TaskList and SessionConfig
- **Smooth Transitions**: LayoutAnimation for phase switching
- **Entrance Animations**: Fade + slide for SessionConfig
- **Data Loading**: Fetches tasks and subtask counts
- **State Management**: Maintains configuration across phases

#### Phase Logic
```typescript
// Phase 1: No task selected
if (!selectedTask) {
  return <TaskList tasks={tasks} onSelectTask={handleTaskSelect} />;
}

// Phase 2: Task selected
return <SessionConfig {...configProps} />;
```

---

### TaskList
**Location:** `apps/todo-list/components/pomodoro/TaskList.tsx`

Displays scrollable list of tasks for selection.

#### Props
```typescript
interface TaskListProps {
  tasks: Task[];
  onSelectTask: (task: Task) => void;
  selectedTaskId?: string;
}
```

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `tasks` | `Task[]` | **Required** | Array of tasks to display |
| `onSelectTask` | `(task: Task) => void` | **Required** | Callback when task is tapped |
| `selectedTaskId` | `string` | Optional | Currently selected task ID (for highlighting) |

#### Key Features
- **90% Width**: Centered container for visual consistency
- **Hidden Scrollbar**: Clean appearance with `showsVerticalScrollIndicator={false}`
- **Task Cards**: Each task shows:
  - Name (bold, 16px)
  - Description (gray, 14px, truncated to 2 lines)
  - Subtask count badge
- **Slide Animation**: Smooth slide-right effect on tap
- **Empty State**: Message when no tasks available

#### Styling
```typescript
container: {
  width: '90%',
  alignSelf: 'center',
}
```

---

### SessionConfig
**Location:** `apps/todo-list/components/pomodoro/SessionConfig.tsx`

Configuration interface for Pomodoro session settings.

#### Props
```typescript
interface SessionConfigProps {
  selectedTask: Task;
  subtaskCount: number;
  duration: number;
  iterations: number;
  breakType: 'short' | 'long';
  onDurationChange: (duration: number) => void;
  onIterationsChange: (iterations: number) => void;
  onBreakTypeChange: (breakType: 'short' | 'long') => void;
  onChangeTask: () => void;
  onStartSession: () => void;
  animationOpacity: Animated.Value;
  animationTranslateY: Animated.Value;
}
```

#### Key Features
- **Selected Task Card**: Displays task name, description, subtask count
- **Duration Presets**: Buttons for 15, 25, 45 minutes
- **Iteration Counter**: +/- buttons (range: 1-10)
- **Break Type Toggle**: Switch between short/long breaks
- **Change Task Link**: Returns to task selection
- **Start Button**: Primary CTA to begin session
- **Animated Entrance**: Uses passed Animated values for smooth appearance

#### Layout Structure
```
┌─────────────────────────────────┐
│ Selected Task Card              │
│  ├─ Task Name                   │
│  ├─ Description                 │
│  └─ Subtask Count               │
├─────────────────────────────────┤
│ Duration Presets                │
│  [15] [25] [45]                 │
├─────────────────────────────────┤
│ Iterations: [−] 3 [+]           │
├─────────────────────────────────┤
│ Break Type: ○ Short ● Long      │
├─────────────────────────────────┤
│ [Change Task]                   │
│ [Start Session Button]          │
└─────────────────────────────────┘
```

---

### SessionDisplay
**Location:** `apps/todo-list/components/pomodoro/SessionDisplay.tsx`

Displays active session information during timer execution.

#### Props
```typescript
interface SessionDisplayProps {
  session: PomodoroSessionWithTask;
  onCancel: () => void;
}
```

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `session` | `PomodoroSessionWithTask` | **Required** | Current active session data |
| `onCancel` | `() => void` | **Required** | Callback to cancel session |

#### Key Features
- **Timer Type Badge**: Color-coded by type (work/break)
  - Work: Blue (#6366f1)
  - Break: Green (#10b981)
- **Iteration Counter**: Shows current/total (e.g., "2/3")
- **Cancel Button**: Red X icon with confirmation
- **Task Information**: Name and description
- **Current Subtask**: Shows active subtask during work sessions
- **Subtask Progress**: Completion count (e.g., "Subtasks: 2/5")
- **Progress Bar**: Visual indicator of overall session progress

#### Layout Structure
```
┌─────────────────────────────────┐
│ [WORK SESSION] 2/3          [X] │
├─────────────────────────────────┤
│ Implement authentication        │
│ → Design login form             │
│ Subtasks: 1/3                   │
├─────────────────────────────────┤
│ ████████░░░░░░░░░░░░░░░░░░░░░░ │ ← Progress bar
└─────────────────────────────────┘
```

#### Progress Calculation
```typescript
const progressPercent = ((current_iteration - 1) / total_iterations) * 100;
```

#### Conditional Rendering
- Current subtask only shown during work sessions (`timer_type === 'work'`)
- Subtask progress only shown if task has subtasks
- Badge color changes based on timer type

---

## Context Integration

### TimerContext Usage

Components that use `TimerContext`:
- **PomodoroTimerPage**: Sets running state, prevents navigation
- **CircularTimer**: Updates running state on play/pause

```typescript
const { isTimerRunning, setTimerRunning } = useTimer();

// When timer starts
setTimerRunning(true);

// When timer stops
setTimerRunning(false);
```

### PomodoroContext Usage

Components that use `PomodoroContext`:
- **PomodoroTimerPage**: Starts/cancels sessions
- **CircularTimer**: Reads session state in task mode

```typescript
const { session, startSession, cancelSession, isLoading } = usePomodoro();

// Start new session
await startSession(taskId, config);

// Cancel current session
await cancelSession();

// Check if session exists
const hasActiveSession = session !== null;
```

---

## Styling Conventions

### Color Palette
- **Primary**: `#6366f1` (Indigo) - Active states, work sessions
- **Success**: `#10b981` (Green) - Break sessions
- **Danger**: `#ef4444` (Red) - Cancel actions
- **Gray Scale**:
  - `#1f2937` - Primary text
  - `#374151` - Secondary text
  - `#6b7280` - Tertiary text
  - `#9ca3af` - Disabled text
  - `#e5e7eb` - Borders
  - `#f3f4f6` - Backgrounds
  - `#fafafa` - Page background

### Spacing
- Container width: `90%` (centered)
- Border radius: `16px` (cards), `12px` (buttons), `8px` (small elements)
- Padding: `16px` (standard), `20px` (large)
- Margins: `8px`, `12px`, `16px`, `24px`

### Typography
- **Headings**: 24px, weight 700
- **Subheadings**: 18px, weight 700
- **Body**: 16px, weight 400
- **Secondary**: 14px, weight 400
- **Small**: 12px, weight 400
- **Labels**: 11px, weight 700, uppercase

### Shadows
```typescript
shadowColor: '#000',
shadowOffset: { width: 0, height: 2 },
shadowOpacity: 0.08,
shadowRadius: 8,
elevation: 3,
```

---

## Animation Patterns

### LayoutAnimation (Phase Transitions)
```typescript
LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
setSelectedTask(task);
```

### Animated API (Entrance Effects)
```typescript
Animated.parallel([
  Animated.timing(opacity, {
    toValue: 1,
    duration: 400,
    useNativeDriver: true,
  }),
  Animated.spring(translateY, {
    toValue: 0,
    friction: 8,
    tension: 40,
    useNativeDriver: true,
  }),
]).start();
```

### SVG Progress Animation
```typescript
<Circle
  stroke="#6366f1"
  strokeWidth={8}
  strokeDasharray={circumference}
  strokeDashoffset={strokeDashoffset}
  strokeLinecap="round"
/>
```

---

## Best Practices

### Component Composition
- Keep components focused on single responsibility
- Pass data down via props, events up via callbacks
- Use context for global state (timer running, session)
- Separate presentation from business logic

### Performance
- Use `useCallback` for event handlers passed to children
- Use `useMemo` for expensive calculations
- Enable `useNativeDriver` for animations when possible
- Avoid inline function definitions in render

### Accessibility
- Include `accessibilityLabel` on interactive elements
- Use semantic color coding (red for destructive actions)
- Provide clear visual feedback for all interactions
- Show confirmation dialogs for destructive actions

### Error Handling
- Wrap async operations in try/catch
- Show user-friendly error messages via Alert
- Log errors to console for debugging
- Gracefully handle missing data (null checks)

---

## Testing Considerations

### Unit Testing
- Test timer countdown logic
- Test progress calculations
- Test mode switching logic
- Test validation rules

### Integration Testing
- Test task selection flow
- Test session configuration flow
- Test session lifecycle (start → work → break → complete)
- Test navigation blocking

### E2E Testing
- Test complete Pomodoro workflow
- Test interruption scenarios (app backgrounding)
- Test multi-session scenarios
- Test error recovery

---

## Future Enhancements

### Potential Improvements
- **Notifications**: Background notifications when timer completes
- **Statistics**: Track completed sessions, total focus time
- **Customization**: Custom work/break durations
- **Sounds**: Audio alerts for timer completion
- **Themes**: Dark mode support
- **Persistence**: Save timer state on app close
- **History**: View past Pomodoro sessions
- **Analytics**: Productivity insights and trends
