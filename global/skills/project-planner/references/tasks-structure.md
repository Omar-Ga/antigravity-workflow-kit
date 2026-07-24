# Task Breakdown Structure Reference

This document defines the strict structure for `TASKS.md`.
It is a reference for the AI — do not present this document to the user.

This content is reproduced verbatim from the standalone `task-breakdown-generator` skill.

---

# Task Breakdown Generator

This skill converts any project plan, PRD, feature description, or architecture document into a structured, phased task breakdown document following a strict template.

The generated document is designed to be used as a living checklist — phases are worked through sequentially, tasks within a phase can be parallelized, and nothing moves forward until the verification checkpoint at the end of each phase passes.

## What TASKS.md Is

A TASKS.md is a **living implementation checklist**. It breaks the entire project into sequential phases, where each phase delivers a working, testable vertical slice. Tasks within a phase are **ordered top-to-bottom** — the order they appear is the order they should be built. It is consumed by developers (and AI) during implementation.

## What TASKS.md Is NOT

- Not a PRD (no feature logic, no data models)
- Not a design doc
- Not a kanban board or sprint plan

---

## Template

Every generated document MUST follow this structure exactly. The static header block, phase structure, task formatting, and verification checkpoints are non-negotiable. Only the actual task content changes between projects.

### 1. Document Header (STATIC — never change this)

The document always begins with:

```markdown
# [Project Name] — Task Breakdown

**How to use this document:**
Each phase is a vertical slice — it delivers a working, testable feature. Tasks within a phase are listed top-to-bottom in the order they should be built. Backend and frontend tasks at the same level can be worked on in parallel unless marked with a `*(requires)*` annotation. At the end of each phase, there is a **Verification Checkpoint** that describes exactly what you should be able to do to confirm the phase works before moving on.

Tasks marked with 🔵 are **backend** tasks. Tasks marked with 🟢 are **frontend** tasks. Tasks marked with 🔗 are **integration** tasks.

---
```

The only variable is `[Project Name]` in the H1 title. Everything else in this header block is reproduced verbatim, word-for-word, every single time.

### 2. Phase Structure

Each phase follows this exact skeleton:

```markdown
## Phase N — [Short Descriptive Name]

**Goal:** [One or two sentences describing what the system can do once this phase is complete. Written in present tense as if describing the end state.]

### Tasks

- [ ] 🔵 **PN-B1:** [Task title]
  - [ ] [Sub-task 1]
  - [ ] [Sub-task 2]

- [ ] 🟢 **PN-F1:** [Task title]
  - [ ] [Sub-task 1]

- [ ] 🔗 **PN-I1:** [Integration verification task]

### ✅ Verification Checkpoint
- [ ] [Testable assertion 1]
- [ ] [Testable assertion 2]

---
```

### 3. Phase Numbering

- Phases start at `Phase 0` (scaffolding / project setup / dev environment).
- Increment sequentially: Phase 0, Phase 1, Phase 2, ...
- Phase 0 is always about getting the project skeleton running with no real features — just the foundation, tooling, and connectivity.
- The final phase is always about polish, UX, error handling, and production-readiness.

### 4. Task ID Format

Every task gets a unique ID following this pattern:

```
P{phase_number}-{type}{sequential_number}
```

Where:
- `{phase_number}` = the phase number (0, 1, 2, ...)
- `{type}` = `B` for backend, `F` for frontend, `I` for integration
- `{sequential_number}` = sequential within that type in that phase (1, 2, 3, ...)

**Examples:**
- `P0-B1` = Phase 0, Backend task 1
- `P3-F2` = Phase 3, Frontend task 2
- `P5-I1` = Phase 5, Integration task 1

### 5. Task Formatting Rules

- Every task line is a markdown checkbox: `- [ ]`
- The task starts with the category emoji, then the bolded ID, then a colon, then the task title
- Format: `- [ ] 🔵 **P0-B1:** Task title here`
- Sub-tasks are indented (2 spaces) and are also checkboxes
- Sub-tasks describe specific, actionable implementation steps (files to create, endpoints to build, UI components to design, SQL to write, etc.)
- Leave a blank line between top-level tasks for readability
- Integration tasks (`🔗`) are typically the last tasks in a phase and describe end-to-end verification flows

### 6. Task Category Rules

- **🔵 Backend tasks** — API endpoints, database migrations, services, algorithms, AI integrations, server-side logic
- **🟢 Frontend tasks** — UI components, pages, forms, state management, routing, styling, client-side logic
- **🔗 Integration tasks** — End-to-end flows that verify backend and frontend work together. These describe a user journey or system flow, not isolated unit work.

If the project is backend-only, use only 🔵 and 🔗.
If the project is frontend-only, use only 🟢 and 🔗.
If the project has no clear frontend/backend split (e.g., a CLI tool, a script), use 🔵 for core logic, 🟢 for user-facing output/formatting, and 🔗 for integration.

### 7. Goal Statement Rules

- Written in present tense describing the end state ("Users can sign up, log in, and access protected pages")
- One or two sentences max
- Should make it immediately clear what is testable after this phase
- Should NOT describe implementation details — only the user-visible or system-observable outcome

### 8. Verification Checkpoint Rules

- Every phase ends with a `### ✅ Verification Checkpoint` section
- Contains a checklist of concrete, testable assertions
- Each assertion describes something a human can do or observe to confirm the phase works
- Written as action → result pairs where possible (e.g., "Upload a PDF → AI returns parsed JSON with all expected fields")
- Should cover both happy paths and key error cases
- Should be specific enough that someone unfamiliar with the codebase can verify them

### 9. Phase Design Principles (Vertical Slices)

When deciding how to split work into phases, follow these principles:

- **Each phase delivers a working, testable feature.** Never create a phase that only has backend or only has frontend work without something testable at the end.
- **Dependencies flow forward.** Phase N should never depend on work done in Phase N+1. If Phase 3 needs a database table, the table is created in Phase 3 or earlier.
- **Start with the skeleton, end with the polish.** Phase 0 is always scaffolding. The last phase is always polish, UX, error handling, accessibility, and production hardening.
- **Complex features get their own phase.** If a feature requires its own scoring algorithm, AI integration, or complex data flow, give it a dedicated phase.
- **Keep phases to 3-8 top-level tasks.** If a phase has more than 8 tasks, it's too big — split it. If it has fewer than 3, it might be too small — merge it with an adjacent phase.
- **Integration tasks come last in each phase.** They verify the whole slice works end-to-end.

### 10. Intra-Phase Task Ordering

Tasks within a phase are listed **top-to-bottom in the order they should be built**. This ordering is meaningful and must be respected during implementation.

**Rules:**
- Order tasks so that what must exist first appears first in the list.
- Backend and frontend tasks at the same position can be worked in parallel by default.
- When a task cannot start until another task in the same phase is complete, annotate it: `*(requires PX-BY)*`
- Only use the `*(requires)*` annotation when the dependency is **non-obvious** — if the order is self-evident from the task titles, the annotation is not needed.
- Integration tasks (`🔗`) always go last in the phase — they depend on backend + frontend both being done.

**Example:**
```markdown
- [ ] 🔵 **P2-B1:** Create CV parsing endpoint
- [ ] 🔵 **P2-B2:** Integrate Gemini for CV parsing *(requires P2-B1)*
- [ ] 🟢 **P2-F1:** Build CV Upload component
- [ ] 🟢 **P2-F2:** Build CV Review component *(requires P2-F1)*
- [ ] 🔗 **P2-I1:** Verify end-to-end parsing flow *(requires P2-B2, P2-F2)*
```

In this example: B1 must come before B2. F1 must come before F2. B1/B2 and F1/F2 can run in parallel. I1 waits for both tracks.

### 11. Horizontal Rule Between Phases

Always place a `---` horizontal rule after the verification checkpoint of each phase and before the next phase header. This visually separates phases.

---

## Generation Workflow

When invoked, follow these steps:

1. **Read the input** — Understand the full scope of the project or feature.
2. **Identify the feature set** — List every distinct feature, capability, or component.
3. **Order by dependency** — Determine which features depend on which. Build the dependency graph.
4. **Group into vertical slices** — Bundle related frontend + backend + integration work into phases that each deliver a testable outcome.
5. **Write Phase 0** — Scaffolding, dev environment, project setup, connectivity. No features, just the skeleton.
6. **Write feature phases** — One phase per major feature or feature group, ordered by dependency.
7. **Write the final phase** — Polish, UX, error handling, animations, responsive design, accessibility, logging, production-readiness.
8. **For each phase**, write the Goal, Tasks (with sub-tasks), and Verification Checkpoint.
9. **Review** — Check that task IDs are sequential, emojis are correct, every phase has a verification checkpoint, and the document follows the template exactly.

## Example Phase (for reference)

```markdown
## Phase 2 — CV Parsing (Core Engine)

**Goal:** Upload a single PDF, have the AI parse it, and display the extracted data in a reviewable form. This is the engine that powers everything else.

### Tasks

- [ ] 🔵 **P2-B1:** Create CV parsing endpoint
  - [ ] `POST /api/parse-cv` — accepts a PDF file upload
  - [ ] Stores the PDF in Supabase Storage (`cvs` bucket)
  - [ ] Returns the storage path along with the parsed JSON

- [ ] 🔵 **P2-B2:** Integrate Gemini for CV parsing
  - [ ] Create a `GeminiService` in `app/services/`
  - [ ] Method: `parse_cv(pdf_bytes: bytes) -> dict`
  - [ ] Send PDF bytes to Gemini with a structured prompt
  - [ ] Handle API errors, rate limits, and malformed responses
  - [ ] Validate the response against the expected schema

- [ ] 🟢 **P2-F1:** Build CV Upload component
  - [ ] Drag-and-drop zone + file picker button
  - [ ] Accepts PDF files only
  - [ ] Shows selected file name and size
  - [ ] Upload button → sends to backend
  - [ ] Loading state while AI processes

- [ ] 🟢 **P2-F2:** Build CV Review component
  - [ ] Displays all fields in editable form inputs
  - [ ] Side-by-side view: original CV preview on one side, form on the other
  - [ ] "Confirm" button to accept the data
  - [ ] "Re-parse" button to re-send to AI if results are poor

- [ ] 🔗 **P2-I1:** Verify parsing flow
  - [ ] Upload a real CV PDF → see loading state → see parsed data → edit a field → confirm

### ✅ Verification Checkpoint
- [ ] Upload a PDF → AI returns parsed JSON with all expected fields
- [ ] Parsed data displays in editable form
- [ ] Can edit any field (change a name, add/remove a skill)
- [ ] PDF is stored in storage
- [ ] Error handling works (upload a non-PDF, an image, a corrupted file)
- [ ] Loading states display correctly during AI processing

---
```

## Important Reminders

- The "How to use this document" header is **static and immutable**. Never modify it. Reproduce it exactly every time.
- All tasks start as unchecked `- [ ]`. Never pre-check tasks in a newly generated document.
- Task IDs must be globally unique within the document and follow the `P{N}-{T}{M}` pattern.
- Every phase must have at least one 🔗 integration task.
- Every phase must end with a `### ✅ Verification Checkpoint`.
- Use `---` between every phase.
- The Goal statement is **mandatory** for every phase.
- **Tasks within a phase are ordered top-to-bottom.** The order is meaningful — build them in the listed sequence.
- **Use `*(requires PX-BY)*` only for non-obvious intra-phase dependencies.** If the ordering is self-evident, the annotation adds noise — skip it.
