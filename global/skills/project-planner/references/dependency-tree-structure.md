# Dependency Tree Structure Reference

This document defines the strict structure for `DEPENDENCY_TREE.md`.
It is a reference for the AI — do not present this document to the user.

---

## What DEPENDENCY_TREE.md Is

The Dependency Tree is a **project execution map**. It answers:
- In what order can phases be worked on?
- What must be finished before something else can start?
- What can be done in parallel?
- What is the critical path (minimum time to completion)?

It is derived **directly from TASKS.md** — it describes the same phases but from the dependency/sequencing perspective, not the implementation perspective. Where TASKS.md says "here's what to build in Phase 3", the Dependency Tree says "Phase 3 cannot start until Phase 2 is done".

**Audience:** Project managers, lead developers, teams coordinating multiple developers, or AI sessions managing parallel workstreams.

## What DEPENDENCY_TREE.md Is NOT

- Not a task list (that's TASKS.md)
- Not a feature spec (that's the PRD)
- Not a design document
- Not a Gantt chart (though it feeds into one)

---

## Document Header (STATIC — reproduce verbatim, changing only the project name)

```markdown
# [Project Name] — Dependency Tree

This document shows how each phase depends on others. Use this to understand what must be completed before starting a new phase, and what can be worked on in parallel.

---
```

Only `[Project Name]` changes. The subtitle is static.

---

## Required Sections (in this order)

### Section 1 — Visual Dependency Graph

A Mermaid diagram showing all phases as nodes with arrows representing dependencies.

**Format:**
```markdown
## Visual Dependency Graph

```mermaid
graph TD
    P0["Phase 0<br/>Phase Name"]
    P1["Phase 1<br/>Phase Name"]
    ...
    PN["Phase N<br/>Phase Name"]

    P0 --> P1
    P1 --> P2
    P1 --> P3
    ...

    style P0 fill:#[color],stroke:#[color],color:#eee
    style P1 fill:#[color],stroke:#[color],color:#eee
    ...
` ` `
```

**Rules:**
- Every phase from TASKS.md must appear as a node
- Node labels use `<br/>` for line breaks between the phase number and name
- Arrows go from prerequisite to dependent (`P0 --> P1` means P1 needs P0)
- Every node must have a `style` directive with a fill color
- Color-code nodes by "era" or "layer" — earlier/simpler phases get one color family, later/complex phases get another
  - Suggested: use 3–4 color steps from dark foundation → bright polish (e.g., dark navy → mid blue → purple → red)
  - The final polish phase is typically the most visually distinct (e.g., a warm accent color)
- `color:#eee` ensures text is readable on dark fills

---

### Section 2 — Dependency Table

A markdown table with one row per phase:

| Phase | Name | Depends On | Can Start After | Parallel With |
| ----- | ---- | ---------- | --------------- | ------------- |
| 0 | [Name] | — | Immediately | — |
| 1 | [Name] | Phase 0 | Phase 0 complete | — |
| ... | ... | ... | ... | ... |

**Column rules:**
- **Phase** — The phase number (integer)
- **Name** — Short name matching the phase name in TASKS.md
- **Depends On** — List all prerequisite phases. Use "—" if none.
- **Can Start After** — When can this phase begin? Be explicit ("Both Phase 2 & 4 done")
- **Parallel With** — Which other phases can run concurrently? Use "—" if none.

After the table, add any footnotes for partial parallelism using `*` notation:
```
*Phase N and Phase M can partially overlap: explain why here.
```

---

### Section 3 — Critical Path

The critical path is the **longest chain of sequential dependencies** — the minimum number of phases that must be completed in order to ship.

**Format:**
```markdown
## Critical Path

The **critical path** is the longest chain of dependencies — it determines the minimum time to complete the project.

` ` `
Phase 0 → Phase 1 → Phase 2 → Phase 5 (needs Phase 4 too) → Phase 6 → Phase 9 → Phase N
` ` `

**Translation:** The fastest route to a complete app is:
1. [Name] (PN)
2. [Name] (PN) + [Name] (PN) **in parallel**
3. ...
```

**Rules:**
- Use a code block for the critical path chain (plain text, not mermaid)
- Follow with a numbered "Translation" list showing the optimal execution sequence
- Explicitly call out which steps can run in parallel within the critical path

---

### Section 4 — Parallel Work Opportunities

This section details every window where multiple phases can be worked on simultaneously. Organize by parallel window:

```markdown
## Parallel Work Opportunities

These are the phases where two developers (or two AI sessions — one frontend, one backend) can work simultaneously:

### Window 1: After Phase N
` ` `
Developer A: Phase X (Name)
Developer B: Phase Y (Name)
` ` `
Brief explanation of why these are independent.

### Window 2: After Phases N & M
...
```

**Rules:**
- Use code blocks for the developer assignment views — it reads cleanly as a "split assignments" format
- Name each window by which phases it unlocks ("After Phase 1", "After Phases 2 & 4")
- Explain in 1–2 sentences why the phases are independent (what prerequisite they share)
- If 3+ phases can run simultaneously, list all three developers

---

### Section 5 — Frontend / Backend Parallelism Within Phases

A table showing how, within each phase, the backend and frontend work can proceed in parallel and where they converge:

| Phase | Backend First | Frontend First | Meet at Integration |
| ----- | ------------- | -------------- | ------------------- |
| 0 | [Backend work] | [Frontend work] | [Integration point] |
| 1 | ... | ... | ... |
| N | ... | ... | ... |

**Rules:**
- Include every phase
- "Backend First" = the backend work a developer can do while frontend is building
- "Frontend First" = the frontend work a developer can do while backend is building
- "Meet at Integration" = the end-to-end flow that proves both halves work together
- Keep each cell concise — 1 line max

---

### Section 6 — Phase-by-Phase Summary

Two sub-sections:

#### What's Delivered After Each Phase

A table:

| After Phase | What You Can Do |
| ----------- | --------------- |
| 0 | [User-observable outcome] |
| 1 | [User-observable outcome] |
| ... | ... |

**Rules:**
- Outcomes must be **user-observable** — "sign up, log in, see protected pages" not "JWT middleware works"
- Written in present tense, second person or "you can" phrasing
- One row per phase, covering all phases

#### Estimated Effort Per Phase

A table:

| Phase | Estimated Effort | Complexity |
| ----- | ---------------- | ---------- |
| 0 | 0.5 – 1 day | Low |
| ... | ... | ... |
| **Total** | **~X – Y days** | |

**Rules:**
- Estimates are rough ranges assuming one developer working full-time
- Complexity is one of: Low, Low-Medium, Medium, Medium-High, High
- The final row is a **Total** row with bolded sum range
- Always include a note: "These are rough estimates assuming one developer working full-time. Adjust based on your actual pace."

---

## Formatting Rules

- `---` horizontal rules between all major sections
- Section headers are `##` (no numbering needed — the section names are self-describing)
- Sub-section headers for parallel windows are `###`
- Code blocks for the critical path chain and developer assignment tables
- Mermaid block for the visual graph
- Pipe-formatted markdown tables everywhere else
- No emojis in section headers

## Length Guidance

- Small projects (3–5 phases): ~80–120 lines
- Medium projects (6–10 phases): ~140–180 lines
- Large projects (11+ phases): 180–250 lines

The dependency tree is a planning tool — it should be dense with information, not padded with prose.
