# UI/UX Specification: Lantern Night Theme

## 1. Overview
**Goal:** Implement a new visual theme called "Lantern Night" for the existing React Native Expo To-Do application.
**Vibe:** Dreamy, calm, nocturnal, warm, "Studio Ghibli-esque" aesthetic.
**Core Concept:** Use the provided night sky lantern image as a global background. UI elements should use semi-transparent dark "glassmorphism" to allow the background to shine through, with warm golden accents to mimic lantern light.

---

## 2. Color Palette & Design Tokens

### Primary Colors (Lanterns & Glow)
* **Primary Accent (Gold/Amber):** `#FFD54F` (Used for active states, FABs, primary buttons, Timer Ring).
* **Secondary Accent (Soft Orange):** `#FFB74D` (Used for gradients or secondary highlights).
* **Glow/Shadow Color:** `#FFAB00` (Used for elevation shadows on active elements).

### Background & Surface (Night Sky)
* **App Background:** Use the provided asset `lantern_bg.jpg`.
* **Surface / Card Background:** `rgba(28, 28, 46, 0.75)` (Deep blue-black with 75% opacity).
* **Surface Border:** `rgba(255, 255, 255, 0.1)` (Subtle white stroke for definition).

### Typography
* **Text Primary (High Emphasis):** `#FFFFFF` (White).
* **Text Secondary (Medium Emphasis):** `#B0B3C6` (Light Blue-Grey).
* **Text Inverted (On Buttons):** `#1A1B2E` (Deep Navy).

### Functional Colors (Tags)
* **Work:** `#64B5F6` (Light Blue)
* **Personal:** `#BA68C8` (Light Purple)
* **Habit:** `#81C784` (Soft Green)
* **Projects:** `#FFD54F` (Gold)
* **Others:** `#90A4AE` (Grey)

---

## 3. Global Implementation Strategy

1.  **Container:** Wrap the main app navigation or root layout in an `<ImageBackground>` component utilizing the lantern image.
2.  **StatusBar:** Set `<StatusBar style="light" />`.
3.  **Styling approach:** Use standard React Native `StyleSheet`.
4.  **Glassmorphism:** To achieve the mock-design look, all cards (Tasks, Settings groups, Timer container) must use the `Surface` color defined above with a `borderRadius: 16`.

---

## 4. Screen-Specific Specs

### A. Focus Timer Screen
* **Timer Circle:**
    * Thickness: 12-15px.
    * Color: Gradient or solid `#FFD54F`.
    * Effect: Add a subtle shadow/elevation with color `#FFAB00` to make it "glow."
* **Digital Clock Text:** Large, White, Bold. Font size ~64px.
* **Mode Toggles (Focus/Break):**
    * Container: `rgba(255,255,255, 0.1)` pill shape.
    * Active Text: White.
    * Inactive Text: `#B0B3C6`.
* **Play Button:**
    * Shape: Rounded Square or Circle.
    * Background: `#FFD54F` (Solid).
    * Icon: `#1A1B2E` (Dark Navy).
* **Preset Chips (25m, 15m, 5m):**
    * Background: `rgba(28, 28, 46, 0.6)`.
    * Border: 1px solid `rgba(255,255,255,0.1)`.
    * Active State: Fill with Primary Accent opacity.

### B. Tasks Screen
* **Header:** White text.
* **Filter Chips (All, Personal, Work):**
    * Inactive: Transparent background, White border (hairline).
    * Active: `#FFD54F` background, Dark text.
* **Task List Items (Cards):**
    * Background: `rgba(28, 28, 46, 0.75)`.
    * BorderRadius: 16.
    * MarginBottom: 12.
    * Padding: 16.
    * **Text:** White title.
    * **Tag:** Rounded pill shape, distinct pastel colors (defined in Functional Colors).
    * **Checkbox:** Circular. Unchecked = White border. Checked = Filled Gold.

### C. Settings Screen
* **Section Headers:** Small caps, color `#B0B3C6`, letter spacing 1.5.
* **Menu Items:**
    * Container: Similar to Task Cards, but grouped (border radius top for first, bottom for last).
    * Background: `rgba(28, 28, 46, 0.75)`.
    * Text: White.
    * Icons: White or Light Grey.
    * Selection Indicator: Gold Checkmark or Switch.

### D. Bottom Navigation
* **Background:** Transparent (absolute positioned at bottom) or deeply blurred dark gradient.
* **Icons:**
    * Inactive: `#B0B3C6`.
    * Active: `#FFD54F` (Gold) + Text Label `#FFD54F`.
* **Border Top:** None (clean look).

---

## 5. React Native StyleSheet Snippets

**Common Card Style:**
```javascript
card: {
  backgroundColor: 'rgba(28, 28, 46, 0.75)',
  borderRadius: 16,
  borderWidth: 1,
  borderColor: 'rgba(255, 255, 255, 0.1)',
  padding: 16,
  marginBottom: 12,
}