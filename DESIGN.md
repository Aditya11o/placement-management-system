# Design System Specification: The Academic Authority

## 1. Overview & Creative North Star
**The Creative North Star: "The Digital Curator"**

This design system rejects the cluttered, utility-first aesthetic common in academic software. Instead, it adopts the persona of a high-end editorial publication—think *Harvard Business Review* meets modern FinTech. We achieve "Trustworthy" not through heavy borders and boxes, but through **authoritative typography, expansive negative space, and tonal depth.**

The system moves beyond the "template" look by utilizing intentional asymmetry. For instance, large `display-lg` headlines should often sit in wide margins, while data-heavy tables are nested within "sunken" containers (`surface-container-low`) to create a sense of focused immersion. The interface should feel like a curated workspace where information breathes and security is felt through the precision of the layout.

---

## 2. Colors & Surface Philosophy

### The Tonal Palette
Our primary anchor is the deep, commanding `#001f3f`. However, we avoid using it as a flat fill. 

*   **Primary (`#000613`) & Primary Container (`#001f3f`):** Used for high-impact brand moments and primary actions.
*   **Surface (`#f8f9fa`):** Our soft white canvas. It is designed to reduce eye strain during long sessions of resume reviewing or application tracking.

### The "No-Line" Rule
**Standard 1px solid borders are strictly prohibited for sectioning.** To separate a sidebar from a main content area, or a header from a body, use a background color shift. 
*   *Example:* A sidebar using `surface-container` (`#edeeef`) against a main body of `surface` (`#f8f9fa`). This creates a cleaner, more sophisticated boundary that feels "architectural" rather than "drawn."

### Surface Hierarchy & Nesting
Treat the UI as a physical stack of premium cardstock.
*   **Level 0 (Base):** `surface` (#f8f9fa)
*   **Level 1 (Sectioning):** `surface-container-low` (#f3f4f5) for large layout blocks.
*   **Level 2 (Interaction):** `surface-container-lowest` (#ffffff) for cards and input fields to make them "pop" against the background.

### The "Glass & Gradient" Rule
For floating elements (like role-selection modals or notification toasts), use **Glassmorphism**. Apply `surface_variant` at 70% opacity with a `20px` backdrop-blur. This ensures the academic context of the page remains visible behind the utility.

---

## 3. Typography: Editorial Precision

We utilize a dual-font pairing to balance academic heritage with modern efficiency.

*   **Display & Headlines (Manrope):** This is our "Editorial" voice. Use `display-lg` (3.5rem) for dashboard greetings or empty states. The wide apertures of Manrope convey openness and modernity.
*   **Body & Titles (Inter):** This is our "Functional" voice. Inter is chosen for its exceptional readability in data-heavy placement tables and student profiles.

**Hierarchy as Identity:**
*   Use `label-sm` (#43474e) in all-caps with `0.05rem` letter-spacing for category headers.
*   Ensure a high contrast ratio between `on_surface` (#191c1d) and the background to maintain ADA compliance for university accessibility standards.

---

## 4. Elevation & Depth

### The Layering Principle
Depth is achieved via **Tonal Layering**. Avoid shadows for static elements. Instead, nest a `surface-container-highest` (#e1e3e4) element inside a `surface-container-low` (#f3f4f5) area to denote a "pressed" or "well" effect, perfect for search bars or filter zones.

### Ambient Shadows
When an element must float (e.g., a "Profile Quick View" card), use a "Ghost Shadow":
*   **Shadow:** `0px 12px 32px rgba(0, 31, 63, 0.06)`
*   This uses a tinted version of our `primary_container` color, making the shadow feel like a natural reflection of the brand color rather than a generic grey smudge.

### The "Ghost Border" Fallback
If a border is required for input field clarity, use `outline_variant` (#c4c6cf) at **20% opacity**. It should be felt, not seen.

---

## 5. Components

### Primary Buttons
*   **Style:** `primary` (#000613) background with `on_primary` (#ffffff) text.
*   **Refinement:** Apply a subtle linear gradient from `primary` to `primary_container` (#001f3f) at a 135-degree angle. This gives the button a "weight" that flat colors lack.
*   **Radius:** `md` (0.375rem).

### Sleek Input Fields
*   **Background:** `surface_container_lowest` (#ffffff).
*   **Border:** Ghost Border (outline-variant at 20%).
*   **State:** On focus, transition the border to `surface_tint` (#476083) and add a `2px` soft glow using the primary color at 5% opacity.

### Role-Selection Toggles
*   Move away from standard radio buttons. Use large, tactile **Segmented Selection Chips**.
*   **Inactive:** `surface_container_high` (#e7e8e9) with `on_surface_variant` text.
*   **Active:** `primary_container` (#001f3f) with `on_primary` text. This provides a clear, secure "locked-in" feeling.

### Placement Status Cards
*   **No Dividers:** Use `8` (2rem) of vertical white space to separate content blocks. 
*   **Status Indicators:** Use `tertiary_fixed` (#ffdbce) for pending items and `error_container` (#ffdad6) for rejected items, keeping the tones muted and professional.

---

## 6. Do's and Don'ts

### Do
*   **DO** use `surface-container-lowest` (#ffffff) for main content cards to create a "lift" against the `surface` background.
*   **DO** use `display-md` for numerical data (like "98% Placement Rate") to give it an authoritative, proud presence.
*   **DO** respect the `24` (6rem) spacing scale for page margins to ensure the "Editorial" feel.

### Don't
*   **DON'T** use 1px black or dark grey borders. This shatters the premium, soft-minimalist aesthetic.
*   **DON'T** use standard "drop shadows" with 20%+ opacity. They look "cheap" and dated.
*   **DON'T** use `primary` (#000613) for large blocks of text; use it only for accents, buttons, and headers to maintain visual "soul."
*   **DON'T** use dividers in lists. Use the background color shift between `surface-container-low` and `surface-container-high` to define list item boundaries.