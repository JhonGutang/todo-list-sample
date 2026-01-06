# Refactoring Documentation

This directory contains documentation for all major refactoring efforts on the todo-list application.

## Purpose

Document architectural changes, principles, and guidelines to ensure:
- Future refactoring work follows consistent patterns
- Knowledge is preserved for both humans and AI
- Clean code principles are maintained
- Changes don't get lost or forgotten

## Refactoring History

1. **[Phase 1: Utils, Lib, and Types Extraction](./01-utils-lib-types-extraction.md)** (Jan 6, 2026)
   - Created `utils/`, `lib/`, and `types/` directories
   - Extracted business logic and utilities from components
   - Eliminated ~80 lines of duplicate code
   - Status: ✅ Completed

## Core Principles

> [!IMPORTANT]
> **All refactoring work must follow these rules:**
>
> 1. ✅ **Extract from components** - Keep components focused on UI
> 2. ✅ **Follow clean code principles** - Readable by humans and AI
> 3. ✅ **Don't overcomplicate** - Simple, practical solutions
> 4. ✅ **Maintain functionality** - No breaking changes

## How to Use

When starting a new refactoring:
1. Read the latest refactoring document
2. Follow the established patterns and guidelines
3. Create a new numbered document (e.g., `02-next-refactor.md`)
4. Update this README with the new entry
5. Document what was done and next steps

## Quick Links

- [Project Root](../../README.md)
- [Current Task Tracker](../../.gemini/antigravity/brain/.../task.md)
- [Implementation Plans](../../.gemini/antigravity/brain/.../implementation_plan.md)
