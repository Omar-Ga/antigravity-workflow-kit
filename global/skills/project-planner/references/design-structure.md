# Design System Document Structure Reference

This document defines the strict structure for `design.md` — the design system token file.
It is a reference for the AI — do not present this document to the user.

---

## What design.md Is

`design.md` is the **design system specification** for the project's frontend. It defines:
- The visual identity: colors, typography, spacing, rounding
- The tone and brand intent
- Rules for component appearance
- Motion/animation philosophy
- Accessibility requirements
- Do/Don't guidelines

It is **consumed by frontend developers and designers** to ensure visual consistency across the entire UI. It is the single source of truth for every visual decision.

## What design.md Is NOT

- Not a component inventory (that goes in FRONTEND_DESIGN_SPEC.md)
- Not a task list
- Not a PRD
- Not a Figma replacement — it defines tokens and rules, not pixel-perfect layouts
- Not a CSS file — values are specified in plain language or token notation, not raw CSS

**This document should only exist if the project has a frontend.** If the project is backend-only or CLI-only, skip it.

---

## Document Structure

The file uses a **hybrid format**: YAML frontmatter for machine-readable design tokens, followed by markdown for human-readable guidelines.

### Part 1 — YAML Frontmatter (Design Tokens)

The file MUST begin with a YAML frontmatter block (between `---` markers). This block defines all quantitative design tokens.

**Required token groups:**

```yaml
---
version: "alpha" | "1.0" | "2.0"  # Increment on major design changes
name: "[System Name]"              # A named design system (e.g., "Kafaa Emerald Glass")
description: "[Short tagline]"     # One sentence describing the feel

colors:
  primary: "[hex]"           # Main brand color — CTAs, active nav, focus states
  primary-strong: "[hex]"    # Darker variant for hover/press states
  primary-soft: "[hex]"      # Lighter variant for subtle highlights
  accent: "[hex]"            # Secondary highlight color
  surface: "[hex]"           # Main page background
  surface-alt: "[hex]"       # Alternate/subtle surface (zebra rows, panels)
  surface-muted: "[hex]"     # Even more subtle variant
  surface-strong: "[hex]"    # Brightest surface (card backgrounds, modals)
  on-surface: "[hex]"        # Primary text color on surfaces
  on-surface-muted: "[hex]"  # Secondary/muted text color
  border: "[hex]"            # Default border/divider color
  error: "[hex]"             # Error states and destructive actions

typography:
  display:
    fontFamily: "[font]"
    fontSize: "[px]"
    fontWeight: [number]
    lineHeight: [number]
    letterSpacing: "[em]"   # optional
  h1:
    fontFamily: "[font]"
    fontSize: "[px]"
    fontWeight: [number]
    lineHeight: [number]
    letterSpacing: "[em]"   # optional
  h2: { ... }  # Same fields
  h3: { ... }
  body: { ... }
  body-sm: { ... }
  label:
    fontFamily: "[font]"
    fontSize: "[px]"
    fontWeight: [number]
    lineHeight: [number]
    letterSpacing: "[em]"   # Required for labels — usually 0.08em
  overline:
    fontFamily: "[font]"
    fontSize: "[px]"
    fontWeight: [number]
    lineHeight: [number]
    letterSpacing: "[em]"   # Required for overlines — usually 0.12em+

rounded:
  sm: "[px]"
  md: "[px]"
  lg: "[px]"
  xl: "[px]"
  pill: "999px"   # Always 999px for pill-shaped elements

spacing:
  xs: "[px]"
  sm: "[px]"
  md: "[px]"
  lg: "[px]"
  xl: "[px]"
  2xl: "[px]"

components:
  button-primary:
    backgroundColor: "[hex or token reference like {colors.primary}]"
    textColor: "[hex or token]"
    rounded: "[token]"
    padding: "[px px]"
    shadow: "[shadow value]"
  button-ghost:
    backgroundColor: "[transparent or color]"
    textColor: "[token]"
    borderColor: "[rgba or token]"
    rounded: "[token]"
    padding: "[px px]"
  card:
    backgroundColor: "[token]"
    borderColor: "[token]"
    rounded: "[token]"
    shadow: "[shadow value]"
  # Add any other globally reusable component tokens
  # (sidebar, modal, glass-panel, input, etc.)
---
```

**Token reference notation:** Use `{token.path}` to reference other tokens (e.g., `{colors.primary}`, `{rounded.pill}`). This signals to developers that the value should come from the design system variable, not be hardcoded.

---

### Part 2 — Markdown Guidelines

After the closing `---` of the frontmatter, write the markdown body. This is the human-readable companion to the tokens.

**Required sections (in this order):**

#### # Design System

The H1 title. No project name needed — just "Design System".

#### ## Overview

2–4 sentences describing the **feel and intent** of the design. Answer: What does this interface feel like to use? What emotions should it evoke? What real-world references (calm, confident, airy, bold)?

#### ## Brand Tone

3–5 bullet points describing the brand personality. Written as adjectives or short statements, not instructions.

**Example:**
```markdown
- Clear, reassuring, and analytical
- Modern enterprise without harsh or overly corporate styling
- Friendly intelligence: soft edges, subtle glow, and humanized copy
```

#### ## Color

Prose description of **how to use** the color tokens — not what the colors are (those are in the YAML). Explain:
- What the primary color is used for (CTAs, active states, focus)
- What surfaces create depth instead of shadows
- What text color rules apply
- What the error color is reserved for

#### ## Typography

Prose description of **how to use** the typographic scale. Explain:
- The font choice and why (consistency, clarity, etc.)
- How headlines behave (tight, compact, loose)
- What overlines and labels do (uppercase, high letter spacing, etc.)

#### ## Layout & Grid

Prose description of the layout philosophy:
- The shell structure (sidebar + content, tabs, etc.)
- Gutters and breathing room philosophy
- Where primary actions are positioned
- Any RTL or internationalization requirements

#### ## Surfaces & Elevation

How the UI creates depth without heavy shadows:
- How layers are separated (gradients, borders, translucency)
- Card and panel treatment
- Glass/blur effects if any

#### ## Components

A brief description of each major UI component category:
- **Buttons:** Shape, fill, hierarchy rules
- **Navigation:** Active states, icon treatment
- **Forms:** Input style, label style
- **Modals:** Size, scrim, rounding

Do not list every prop — that's for the spec. Just the visual personality.

#### ## Motion

How animations and transitions should feel:
- Duration range (e.g., "600–900ms for entrances")
- Easing type (ease-out, spring, etc.)
- What kinds of motion are appropriate (slides, fades, lifts)
- What to avoid (sharp bounces, over-animation)

#### ## Iconography & Imagery

The icon style (geometric, outlined, filled, playful):
- What library or style to use
- What to avoid

#### ## Accessibility

Minimum requirements:
- Contrast ratio for text on surfaces (minimum 4.5:1)
- Focus ring style
- RTL support if applicable

#### ## Do and Do Not

A short list of dos and don'ts that enforces the design intent. 3–6 of each.

**Format:**
```markdown
- Do [positive rule]
- Do not [negative rule]
```

---

## Formatting Rules

- The YAML frontmatter is machine-readable — keep values exact (hex codes, pixel values, named numbers)
- The markdown body is human-readable — use prose, not bullet dumps
- No emojis in section headers
- Section order must match the spec above
- The entire document should feel like a design brief, not a config file

## Length Guidance

- YAML frontmatter: ~40–80 lines depending on component count
- Markdown body: ~50–80 lines
- Total: ~100–160 lines is typical

Never pad. Every line must convey a design decision or constraint that a developer or designer needs to know.
