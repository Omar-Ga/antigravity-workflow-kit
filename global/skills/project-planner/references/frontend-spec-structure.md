# Frontend Design Spec Structure Reference

This document defines the strict structure for `FRONTEND_DESIGN_SPEC.md`.
It is a reference for the AI — do not present this document to the user.

---

## What FRONTEND_DESIGN_SPEC.md Is

The Frontend Design Spec is a **component inventory** for every screen in the application. It tells a designer (or frontend developer) exactly **what must exist** on each screen — every interactive element, every data display area, every action button — without dictating layout, colors, or visual style.

It is the bridge between the PRD (which defines the product) and the design work (which makes it visual). The designer reads this document and knows what to place on the canvas. The developer reads it and knows what components to build.

**Purpose:**
- Define the *what* of every screen at the component level
- Intentionally leave the *how* (positioning, styling, animations) to the designer
- Serve as a checklist to ensure no required element is forgotten

## What FRONTEND_DESIGN_SPEC.md Is NOT

- Not a design spec with pixel values, colors, or fonts (that's design.md)
- Not a task list (that's TASKS.md)
- Not a PRD (no feature logic, no algorithms)
- Not an implementation guide (no framework-specific code)
- Not a wireframe (no layout decisions)

**This document should only exist if the project has a frontend.** Backend-only or CLI-only projects skip this file.

---

## Document Header (STATIC — reproduce verbatim, changing only the project name)

```markdown
# [Project Name] — Frontend Design Component Spec

**To the Designer:**
This document outlines the required components and elements for every screen in the [Project Name] system. It specifies *what* needs to be on the page, but leaves the *how* and *where* entirely up to you. You have full creative freedom regarding layout, typography, colors, spacing, and micro-interactions.

---
```

The note to the designer is **mandatory and static**. It sets the correct expectations immediately. The only variable is `[Project Name]`.

---

## Required Sections

Organize the document by **application area**, then by **screen**, then by **component group**.

### Section Structure Pattern

Each section follows this pattern:

```markdown
## [N]. [Area Name]

### [N.M] [Screen Name]
**Required Components:**
*   **[Component Group Name]:** Brief description of purpose.
    *   [Sub-element or requirement 1]
    *   [Sub-element or requirement 2]
*   **[Another Component]:** ...
```

**Key formatting conventions:**
- Use bold (`**Component Name:**`) for named UI components
- Use asterisks (`*`) for bullet lists — this signals "these things must exist"
- Use nested bullets for sub-requirements (specific fields, behaviors, states)
- Use italics for conditional components: `*(Conditionally shown only when X)*`

---

## Mandatory Sections

### 1. Global Shell / Application Layout

This section describes the **persistent layout wrapper** — elements that appear on every authenticated screen.

**Required sub-elements to define:**
- Top Navigation / Header (logo, logout, any global actions)
- Main Navigation (sidebar, tab bar, or both) with exact links listed
- Any permission-based visibility rules (e.g., "Admin only", "greyed out for non-admins")

**Example:**
```markdown
## 1. Global Shell / Application Layout
This is the persistent layout that wraps all authenticated pages.

**Required Components:**
*   **Top Navigation / Header:** Needs to include the app name/logo and a Logout button.
*   **Main Navigation (Sidebar or Tab Bar):** Must include links to:
    *   [Link 1]
    *   [Link 2] (Visible to all. Active for Admins; greyed out for Users)
```

---

### 2. Authentication Pages

Sub-sections for each auth screen:

**2.1 Login Page** — Required: email input, password input, submit button, link to signup, error message area.

**2.2 Sign Up Page** — Required: email input, password input, confirm password input, submit button, link to login, validation message area.

If the system has no sign-up (admin-only creation), note that: `### 2.2 Sign Up — Not publicly accessible. Accounts are created by an Admin only.`

---

### Remaining Sections — One Per Feature Area

For each major feature area from the PRD (employees, campaigns, candidates, settings, etc.), create a numbered section. Within each section, create a sub-section per screen.

**Rules for each screen sub-section:**

1. **Name the screen accurately** — match the PRD's "Key Screens" table.
2. **List every interactive element** — inputs, buttons, toggles, sliders, dropdowns.
3. **List every data display area** — tables, cards, lists, counts, badges.
4. **Name component groups precisely** — "Search & Filter Area", "Action Buttons", "Data Display", "Batch Action Buttons".
5. **Specify data fields** — if a card must show "Name, Score, Top 3 Skills", list all three explicitly.
6. **Call out conditional visibility** — badges that appear only when X, sections only visible to admins, etc.
7. **Note behavioral requirements** — "Needs a hover tooltip", "Must be truncated with Expand option", "Must show a count badge".

**Do NOT specify:**
- Which side of the screen something goes on
- Specific colors or font sizes (refer to design.md for those)
- Animation specifics (refer to design.md for those)
- How a component is styled (shape, shadow, border) — only that it exists

---

## Final Note Section (STATIC — always include at the bottom)

```markdown
---
**Final Note to Designer:** Every interaction (saving, loading, processing) should have thoughtful loading states (skeletons, spinners) and success/error feedback (toast notifications or snackbars).
```

This note is **mandatory and placed at the very end** of the document. It reminds the designer that all interactive elements need feedback states, without enumerating them one by one.

---

## Formatting Rules

- Section numbering follows the PRD's feature numbering loosely, but is reorganized for UI flow
- Every screen must be its own `###` sub-section
- Required components use `**Bold:**` label + asterisk bullets
- Sub-requirements are indented two more spaces under their parent
- Conditional elements use parenthetical notes in italics
- `---` horizontal rules separate major sections (not every sub-section)
- No emojis in headers

## Length Guidance

- Simple apps (3–5 screens): ~80–120 lines
- Medium apps (8–12 screens): ~120–200 lines
- Complex apps (15+ screens): 200+ lines is acceptable

Cover every screen. If a screen exists in the PRD's UI overview, it must have an entry here.
