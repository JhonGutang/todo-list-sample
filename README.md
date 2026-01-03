# TodoList Workspace

This repository contains a small learning-focused Todo List application built with Expo (React Native) and a minimal Node/TypeScript backend. Use this project to practice React Native concepts, TypeScript, routing, native integrations, and workspace tooling.

Contents
- `apps/todo-list/` — Expo app (mobile UI, TypeScript, components)
- `apps/backend/` — Minimal Express + TypeScript backend
- `docs/` — Documentation, examples and feature notes

Prerequisites
- Node.js (recommended LTS)
- pnpm (workspace package manager)
- Expo CLI or `npx expo` (optional)
- Android Studio or Xcode for simulators (optional)

Setup
1. Install workspace dependencies from the repo root:

```bash
pnpm install
```

2. Run the mobile app (from repo root):

```bash
pnpm --filter todo-list dev
```

Or run from the app folder:

```bash
cd apps/todo-list
pnpm install
pnpm dev
```

3. Run the backend (from repo root):

```bash
pnpm --filter backend dev
```

Notable libraries
- Expo, expo-router — app shell and file-based routing
- React Navigation — navigation and bottom tabs
- react-native-modal-datetime-picker and @react-native-community/datetimepicker — date/time pickers
- react-native-calendars — calendar UI
- react-native-reanimated, gesture-handler — native interactions
- Express, dotenv — backend server

Common commands
- Install dependencies: `pnpm install`
- Run mobile app: `pnpm --filter todo-list dev`
- Run backend: `pnpm --filter backend dev`
- Lint app: `pnpm --filter todo-list lint`

Troubleshooting
- If the Metro bundler has stale cache, restart with:

```bash
npx expo start -c
```
- For native build problems, ensure Android Studio / Xcode tools are installed and up-to-date.

Where to look next
- App routes and screens: `apps/todo-list/app/`
- Reusable components: `apps/todo-list/components/`
- Backend entry: `apps/backend/src/index.ts`

If you'd like, I can also add a CONTRIBUTING guide, CI scripts, or expand the developer tips in `apps/todo-list/README.md`.
