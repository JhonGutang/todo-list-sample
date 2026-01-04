# Todo List (Expo) — Learning Project


A small, project-based React Native app built with Expo to practice core concepts: navigation, state management, TypeScript, custom components, and native integrations. This repo is intended for learning and experimentation rather than production use.

**What you'll learn**
- Building screens with Expo Router and TypeScript
- Using React Navigation and bottom tabs
- Working with date/time pickers and calendar components
- Creating reusable components and UI patterns
- Running the app on device, emulator, or Expo Go

**Quick features**
- Add, edit and view tasks
- Subtasks and due dates
- Tags and chips for filtering
- Pomodoro timer with Focus and Task modes ([Use Guide](../../docs/data/pomodoro.md))

**Project layout (key paths)**
- `app/` — file-based routes and screens
- `components/` — reusable UI components (TaskModal, SubtaskItem, etc.)
- `constants/` — mock data and app constants
- `hooks/` — custom hooks like `useDateFormatter`
- `docs/` — supporting documentation and examples

**Prerequisites**
- Node.js (recommended LTS)
- pnpm (this workspace uses pnpm)
- Expo CLI (optional, `npx expo` works too)
- Android Studio (for Android emulator) or Xcode (for iOS simulator)

## Getting started
1. From the repository root, install dependencies for the workspace:

```bash
pnpm install
```

2. Run the mobile app (two options):

- From repo root (pnpm workspace):

```bash
pnpm --filter todo-list dev
```

- Or from the app folder:

```bash
cd apps/todo-list
pnpm install
pnpm dev
```

3. Open on device/emulator using the Expo Metro UI, or use these scripts:

```bash
pnpm --filter todo-list android
pnpm --filter todo-list ios
```

If you run into caching issues, restart the packager with:

```bash
npx expo start -c
```

## Running the backend
If you want to run the backend in this workspace (located under `apps/backend`), from the repo root:

```bash
pnpm dev
```

## Dependencies and notable libraries
- Expo (managed workflow)
- expo-router — file-based routing
- React Navigation (`@react-navigation/native`, bottom-tabs)
- react-native-modal-datetime-picker and `@react-native-community/datetimepicker` — date/time pickers
- react-native-calendars — calendar UI
- react-native-reanimated, gesture-handler, safe-area-context — native UX
- @expo/vector-icons — icons

## Developer tips
- Lint: `pnpm --filter todo-list lint`
- TypeScript config is in `apps/todo-list/tsconfig.json`
- Components live in `apps/todo-list/components/` and can be reused across screens
- Read the `docs/` folder for examples and guidance on chips, subtasks, and tags

## Next steps
- Explore `app/` to see route-based screens and edit them to learn updates live.
- Add unit tests or Storybook for component-driven development.

Questions or changes? Tell me what to expand (root README, contributor guide, or CI scripts).