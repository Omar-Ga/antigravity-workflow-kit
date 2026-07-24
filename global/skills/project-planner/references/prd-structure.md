# PRD Structure Reference

This document defines the strict structure for a Product Requirements Document (PRD).
It is a reference for the AI — do not present this document to the user.

---

## What a PRD Is

A PRD (Product Requirements Document) is the **source of truth** for a project. It defines:
- What the product does
- Who uses it and how
- What the data looks like
- What the API surface looks like
- What is explicitly out of scope

It is a **contract between product and engineering**, not a design document. It describes the what, not the how (implementation details are left to design/spec/tasks). It should be stable enough that a new developer can read it and fully understand the product.

## What a PRD Is NOT

- Not a task list (tasks go in TASKS.md)
- Not a design doc (visuals go in design.md)
- Not a frontend spec (component details go in FRONTEND_DESIGN_SPEC.md)
- Not a dependency map (that goes in DEPENDENCY_TREE.md)
- Not a changelog or development log

---

## Document Header (STATIC — reproduce verbatim, changing only project-specific values)

```markdown
# [Project Name] — Product Requirements Document (PRD)

**Version:** 1.0
**Last Updated:** [YYYY-MM-DD]
**Status:** Approved for Development

---
```

Only `[Project Name]` and the date change. Version starts at `1.0`. Status is always `Approved for Development`.

---

## Required Sections (in this order)

### Section 1 — Project Overview

A concise (2–4 sentence) description of what the product does and why it exists. Answer:
- What problem does it solve?
- Who is the primary user?
- What is the key differentiator or mechanism (AI, algorithm, etc.)?

No sub-sections. No bullet overload. Prose or a short numbered list if the product has two distinct modes.

---

### Section 2 — Goals & Objectives

A bullet list of 4–6 high-level objectives. These are outcome-oriented (what the system achieves), not task-oriented (not "build a login page").

**Example format:**
```markdown
## 2. Goals & Objectives

- Automate X using Y
- Provide configurable Z evaluation
- Deliver consistent, algorithmic [mechanism] with [qualifier]
- Enable [capability] for [user type]
```

---

### Section 3 — Tech Stack

A markdown table listing every layer of the stack. Required columns: **Layer**, **Technology**, **Purpose**.

Layers to include (as applicable):
- Frontend
- State Management (if any)
- Backend
- Database
- Authentication
- File Storage
- AI Services (separate row per model/purpose)
- Any third-party integrations

**Anti-pattern:** Don't include implementation details (e.g., folder structure, library versions). This is just the "what we're using and why".

---

### Section 4 — User Roles & Access Control

Describe every user role the system has. For each role:
- What they CAN do
- What they CANNOT do
- Any special permissions or flags

Use numbered sub-sections (4.1, 4.2, ...) for each role.

If the system has no roles (single-user or open access), state this explicitly: `## 4. User Roles — Single-user system. All users have full access.`

---

### Section 5 — Features

The core of the PRD. Each major feature or capability gets its own numbered sub-section (5.1, 5.2, ...).

**Feature section rules:**
- Name features by what they do, not by what page they live on (e.g., "CV Upload & Parsing", not "Upload Page")
- Include **the data flow** for complex features (use indented text or a simple ASCII/text diagram)
- Include **JSON schemas** if the feature involves structured AI output or API contracts
- Include **all settings or configurations** a user can make (use a table)
- Include **edge cases and special behaviors** that a developer must know about
- Do NOT describe UI layout or visual design

**Flow diagrams** should be text-based:
```
Step 1: User does X
  │
  ▼
Step 2: System does Y
  │
  ▼
Step 3: AI returns Z
```

**Settings tables** format:
```markdown
| Setting | Type | Default | Description |
| ------- | ---- | ------- | ----------- |
| ...     | ...  | ...     | ...         |
```

---

### Section 6 — Core Algorithms (if applicable)

If the system contains a custom scoring, ranking, recommendation, or calculation algorithm, document it here with full precision.

Include:
- A table of point values or weights
- The exact calculation formula (pseudocode or mathematical notation)
- Edge cases and clamping rules

This section must be detailed enough that a developer can implement it without asking questions.

If no custom algorithm exists, omit this section entirely.

---

### Section 7 — Data Models

Two sub-sections required:

#### 7.1 — Entity Relationship Overview

A text-based ER diagram showing how entities relate:
```
ParentEntity
  │
  ├── ChildEntity (has many)
  │     └── SubChild (has many)
  │
  └── AnotherChild (has one)
```

#### 7.2 — Core Tables

A markdown table for each database table, listing columns:

| Column | Type | Notes |
| ------ | ---- | ----- |
| id | UUID (PK) | Auto-generated |
| ... | ... | ... |

**Rules:**
- Every table must list all columns
- Include FK relationships in the Notes column
- If multiple tables share the same schema (e.g., `employee_skills`, `candidate_skills`), state: "Mirrors the schema of [table], linked to [parent].id"
- Include archived/shadow tables if the system has soft-delete or archiving

---

### Section 8 — API Endpoints (High Level)

Group endpoints by domain. For each endpoint, provide the method + path and a one-line description.

Format:
```markdown
### [Domain Name]
- `METHOD /path` — Description
- `METHOD /path/{id}` — Description
```

**Rules:**
- This is a high-level surface, not full API documentation. No request/response schemas here.
- Note any permission guards inline (e.g., "Admin Only")
- Group by resource (auth, employees, campaigns, etc.)
- Do NOT include implementation notes or middleware details

---

### Section 9 — UI Overview

A high-level map of the UI — not a design spec, just enough structure for the TASKS.md to be written. Two sub-sections:

#### 9.1 — Layout

Describe the persistent shell: navigation, headers, auth vs. app layout.

#### 9.2 — Key Screens

A table of all screens:

| Screen | Description |
| ------ | ----------- |
| Login | ... |
| ... | ... |

Each row = one screen. Description = 1 sentence on what the user does there.

---

### Section 10 — Future Enhancements (Out of Scope for V1)

A numbered list of features that are **explicitly deferred**. Acknowledge them but mark them out of scope.

This section serves as a boundary setter — anything not in this list and not in Section 5 is undefined and should be flagged during development.

---

## Formatting Rules

- Use `---` horizontal rules between every top-level section
- All section headers use `## N. Title` format
- Sub-sections use `### N.M Title` format
- Tables must be pipe-formatted markdown tables
- Code blocks (JSON schemas, pseudocode, flows) use fenced ` ``` ` blocks with language hints
- Don't use emojis in section headers
- The document reads as a professional technical document, not a chat message

## Length Guidance

- Short projects: ~200–350 lines
- Medium projects: ~350–600 lines
- Complex projects: 600+ lines is acceptable if the algorithm, data model, or feature set warrants it

Never pad with filler. Every line must carry information a developer needs.
