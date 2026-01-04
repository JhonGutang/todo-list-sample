# Task Tag & Filtering System – Remodification Specification

## Overview
This document defines the redesigned task creation and filtering behavior.  
The system prioritizes **categories** as the primary organization mechanism while keeping **priority** as a secondary attribute.

---

## 1. Task Categorization & Data Model

### Categories
- Tasks must support **category tags**.
- Predefined categories:
  - Work
  - Personal
- Users can create **custom categories**.
- Each task must store:
  - `title`
  - `description`
  - `category` (single category)
  - `priority` (low, medium, high)
  - `deadline` (end date only)
  - `subtasks` (optional)

### Priority
- Priority levels:
  - Low
  - Medium
  - High
- Priority must **not** be used as a top-level filter.

---

## 2. Task List Filtering Behavior

### Top-Level Filters
Replace priority-based filters with **category-based filters**:
- All
- Personal
- Work
- User-created categories

### Filters Inside Each Category
Each category view must support:
- Priority filter:
  - Low
  - Medium
  - High
- Deadline sorting:
  - Ascending
  - Descending

---

## 3. Field Removal

- Remove `start date` from the task model and UI.
- Retain only:
  - `deadline` (end date)

---

## 4. Create Task Sheet – UI Redesign

### 4.1 Initial Focus
When opening the Create Task sheet:
1. Title input
2. Description input

These fields appear at the top and are immediately editable.

---

### 4.2 Sticky Bottom Toolbar
- All secondary task options must be placed in a **sticky bottom toolbar**.
- The toolbar must:
  - Remain visible at all times
  - Stick above the keyboard when typing

#### Toolbar Actions
- Category
- Deadline (Date)
- Subtasks
- Priority

---

## 5. Toolbar Behaviors

### 5.1 Categories
- Tapping the category icon opens a **dropdown menu**.
- Dropdown includes:
  - Predefined categories
  - User-created categories
  - Option to create a new category

#### Create New Category
- Opens a modal
- Modal contains:
  - Single input field: **Category Name**
- On save:
  - Category becomes immediately selectable in the dropdown

---

### 5.2 Priority
- Tapping the priority icon opens a **dropdown**.
- Options:
  - Low
  - Medium
  - High

---

### 5.3 Deadline (Date)
- Tapping the date icon opens a **calendar modal**.
- Only allows selection of:
  - Deadline / End Date
- Start date selection is not allowed.

---

### 5.4 Subtasks
- Tapping the subtask icon displays:
  - One empty input field
  - A radio button on the left of each subtask
- Constraints:
  - Maximum of **3 visible subtask inputs**
  - Additional subtasks appear in a **dropdown or expandable list**

---

## 6. Things to Consider (Implementation Notes)

### Existing Database & Types
- The project uses an **existing database schema**.
- Before making changes:
  - Review current **type declarations** (models, interfaces, DTOs).
  - Check any existing **documentation or comments** related to tasks and filters.
- Avoid unnecessary schema changes unless required.

### Scope of Changes
- Be cautious with modifications:
  - Changes may affect unrelated features if not scoped correctly.
- Only update:
  - Task-related models
  - Task creation UI
  - Task filtering logic
- Do **not** refactor unrelated files.

### Implementation Strategy
- Implement changes in the **simplest possible way**.
- Prefer incremental updates over large refactors.
- Reuse existing components and patterns where possible.

### Code Quality
- Follow **clean code principles**:
  - Clear naming
  - Small, focused functions
  - Minimal side effects
- Adhere to existing project conventions and best practices.

### Backward Compatibility
- Ensure existing tasks remain functional:
  - Default category assignment may be required for older tasks.
- Avoid breaking existing task queries and views.

---

## 7. UX Constraints & Notes
- Categories are the primary task organizer.
- Priority is a secondary filter used only within category views.
- UI interactions should be minimal, clear, and non-disruptive.

---
