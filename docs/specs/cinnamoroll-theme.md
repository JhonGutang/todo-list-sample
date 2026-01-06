# UI Specification: Momentum App - Cinnamoroll Theme
**Theme ID:** `theme_cinnamoroll_v1`
**Application:** Momentum (To-Do / Focus)
**Design Philosophy:** "Minimalist Kawaii" — Soft, airy, and calming. Prioritizes readability while injecting character charm through specific accents.

---

## 1. Global Design Tokens

### 1.1 Color Palette
Use these specific hex codes to achieve the "Sanrio" aesthetic without overwhelming the eye.

| Token Name | Hex Code | Usage description |
| :--- | :--- | :--- |
| **Background Primary** | `#E0F4FF` | Main screen background (Pale Sky Blue). |
| **Background Gradient** | `#F0F8FF` | Bottom of screen gradient (Alice Blue). |
| **Surface Card** | `#FFFFFF` | Task cards, settings containers (Pure White). |
| **Primary Brand** | `#89CFF0` | Header backgrounds, active states, checkboxes (Baby Blue). |
| **Border Accent** | `#EEDC9A` | **Thin** borders on cards (Soft Gold/Sand). |
| **Text Primary** | `#4A5D75` | Main titles and task names (Slate Blue). |
| **Text Secondary** | `#8FA3B8` | Dates, subtitles, inactive icons. |
| **Success/Habit** | `#98FB98` | "Habit" tags, completed checks. |
| **Warning/Work** | `#ADD8E6` | "Work" tags (Light Blue). |
| **Danger/Personal** | `#DDA0DD` | "Personal" tags (Plum). |

### 1.2 Typography
* **Font Family:** *Nunito*, *Quicksand*, or System Rounded.
* **Headings:** Bold, Rounded.
* **Body:** Medium weight for readability.

---

## 2. Component Specifications

### 2.1 The "Cloud" Task Card (Custom Design)
This is the core UI element. It must look distinct but not cluttered.

* **Geometry:**
    * `border-radius`: **20px** (Pill-like shape).
    * `margin-bottom`: **12px**.
    * `padding`: **16px**.
* **Border Styling (Crucial):**
    * **Width:** **1.5px** (Reduced from original 3px for a lighter feel).
    * **Color:** `#EEDC9A` (Soft Gold).
    * **Style:** Solid.
* **Elevation/Shadow:**
    * `box-shadow`: `0px 4px 12px rgba(137, 207, 240, 0.25)` (Soft blue glow, no harsh black shadows).
* **Checkbox Interaction:**
    * **Unchecked:** A cloud-shaped outline stroke (`#B0C4DE`).
    * **Checked:** A solid blue cloud with a white tick or star inside.

### 2.2 Navigation & Tabs
* **Filter Tabs (All/Personal/Work):**
    * **Shape:** Cloud silhouettes or fully rounded pills (`border-radius: 50px`).
    * **Active:** White background, Gold Border, Black Text.
    * **Inactive:** Transparent background, Blue-Grey Text.

### 2.3 Decorative Elements
* **Background Wallpaper:**
    * A repeating pattern of very faint (opacity 20%) white clouds and small 4-point stars (`✨`) on the blue background.
* **Mascot Placement:**
    * **Restricted:** Do not place the mascot on every card.
    * **Placement:** 1 Main Cinnamoroll asset sitting atop the first "Active" task or anchoring the Header area.

---

## 3. Screen-Specific Instructions

### 3.1 Screen: Tasks (Dashboard)
* **Header:**
    * Background: `#89CFF0` (Solid Baby Blue).
    * Bottom Shape: Rounded corners (`border-bottom-left-radius: 25px`, `border-bottom-right-radius: 25px`).
    * Progress Bar: Track is White (opacity 0.3), Fill is `#FDFD96` (Pastel Yellow).
* **FAB (Add Button):**
    * White circle, Blue `+` icon, Subtle wing icons flanking the button (optional).

### 3.2 Screen: Pomodoro (Focus)
* **Timer Visual:**
    * A large ring with a gradient stroke (Blue to Pink).
    * **Center:** A sleepy Cinnamoroll illustration.
* **Controls:**
    * Play/Pause buttons should be shaped like fluffy clouds.

### 3.3 Screen: Settings
* **List Items:**
    * Standard styling but with `border-radius: 15px`.
    * Remove gold borders here to reduce visual noise; use simple grey dividers.
* **Toggles/Switches:**
    * **Track:** Light Grey (Off) -> Sky Blue (On).
    * **Thumb:** White circle.

---

## 4. Implementation Snippets (CSS/Styling)

**Card CSS:**
```css
.task-card {
  background-color: #FFFFFF;
  border: 1.5px solid #EEDC9A; /* Thin gold border */
  border-radius: 20px;
  box-shadow: 0px 4px 12px rgba(137, 207, 240, 0.25);
  display: flex;
  align-items: center;
  padding: 16px;
}