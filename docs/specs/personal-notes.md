# Feature Specification: Personal Notes for Task Detail Screen

## Overview
Add a **Personal Notes** feature to the Task Detail screen that allows users to attach private, long-form notes to individual tasks.  
The feature should integrate seamlessly with the existing UI, follow the current theme system, and support autosaving and large text content.

---

## Placement
- The **Personal Notes** section must appear **at the bottom of the Task Detail screen**, directly **below the Subtasks component**.

---

## Collapsed State (Preview Mode)
In its default state, the Personal Notes section should appear as a **compact preview card**.

### UI Requirements
- Display as a **glassmorphism card**:
  - Rounded corners
  - Semi-transparent background
  - Matches existing card styles
- Include:
  - Note icon
  - Label: **“PERSONAL NOTES”**
  - Placeholder text:  
    _“Add notes for this task...”_
- Preview should behave like a **textarea**, but limited in height.
- Entire card should be **clickable/tappable** to expand.

---

## Expanded State (Fullscreen Editor)
When the preview card is tapped or clicked, it should expand into a **fullscreen note editor**.

### Layout
- **Header section** containing:
  - Note icon
  - Title: **Personal Notes**
  - Live **character count**
  - Close (X) button to collapse back to preview mode
- **Main content area**:
  - Scrollable textarea
  - Fills the available screen space
  - Supports large amounts of text without performance degradation

---

## Animations & Transitions
- Use **smooth expand and collapse animations**
- Transition should feel fluid and consistent with the existing UI motion system
- Avoid abrupt layout shifts

---

## Data & Persistence
- Notes must be:
  - Stored in the database
  - Linked to the corresponding **task ID**
- The storage solution must:
  - Support **large text content**
  - Be scalable and performant

---

## Autosave Behavior
- Implement **automatic saving**:
  - Triggered while typing (debounced)
  - Also save on:
    - Screen close
    - App backgrounding (if applicable)
- No explicit “Save” button should be required
- Prevent data loss in all common navigation scenarios

---

## Theming & Styling
- Design must adapt dynamically based on the **active theme**
- Default styling should align with:
  - Dark glassmorphism UI
  - Golden / amber accent colors
  - Night sky aesthetic
- Ensure:
  - Proper contrast
  - Readable typography
  - Consistent iconography

---

## Accessibility & UX Considerations
- Textarea should:
  - Support keyboard focus
  - Handle long sessions of typing comfortably
- Character count should update in real time
- Close button should be easily reachable on mobile devices

---

## Summary of Key Requirements
- Personal Notes section below Subtasks
- Glass-card preview → fullscreen editor
- Smooth animated transitions
- Autosave enabled
- Database support for large text
- Task-ID–linked persistence
- Theme-aware design

---

## Out of Scope
- Sharing notes between users
- Rich text formatting (unless explicitly added later)
