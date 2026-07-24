---
name: wiki-review
description: Deep periodic review — dispatches research subagents to systematically compare the wiki against the live codebase, then synthesizes findings. Use when the user says "review the wiki", "deep wiki check", "weekly review", "compare wiki to code", or wants a thorough audit that goes beyond lint and reconcile.
---

# /wiki-review — Deep Periodic Review

This workflow is the heavy-duty companion to `/wiki-audit`. While audit runs lint + reconcile (things the main agent can check alone), review dispatches **research subagents** to fan out across the codebase and systematically compare reality against wiki claims.

Use this weekly, or whenever significant code changes have landed and you suspect the wiki has drifted.

## When to use

- Weekly maintenance review
- After a large refactor or migration
- After multiple phases have been completed without wiki updates
- When you suspect wiki drift but don't know where

---

## Procedure

### Step 1 — Read the wiki (main agent)

Before dispatching anyone, read:

1. `wiki/index.md` — full catalog of pages
2. `wiki/overview.md` — high-level state
3. `wiki/log.md` — last 10 entries

Build a mental map of what the wiki claims. Identify the systems, components, and concepts that have pages.

### Step 2 — Plan the review scope

Based on the wiki's content, identify the major areas to verify. Typical categories:

- **Systems** — each `wiki/systems/*.md` page describes a subsystem. Each needs a subagent to verify.
- **Components** — each `wiki/components/*.md` page describes a component. Verify it still exists and behaves as described.
- **Functions** — `wiki/functions/*.md` pages with specific behavioral claims. Spot-check the highest-confidence ones.
- **Concepts** — `wiki/concepts/*.md` pages with architectural patterns or gotchas. Verify they're still relevant.

Group related pages into scopes. Each scope becomes one subagent's assignment.

### Step 3 — Dispatch research subagents (parallel)

Dispatch one research subagent per scope. Each subagent receives:

**Persona:**
> You are a meticulous wiki auditor. Your job is to compare documented claims against the live codebase. For each claim you check, report one of: CONFIRMED (code matches the claim), STALE (code has changed, claim is outdated), MISSING (the feature/file no longer exists), or NEW (something exists in code that has no wiki coverage). Do not write or modify any files — report findings only.

**In their prompt, include:**
- The full text of the wiki pages they are verifying (copy-pasted, not file paths)
- The directories or files they should read to verify claims
- The specific questions to answer:
  - Does this system/component/function still exist?
  - Does it behave as the wiki describes?
  - Has anything been added that the wiki doesn't cover?
  - Are there any contradictions between wiki claims and actual code?

**Expected output format from each subagent:**
```
## Scope: [name]

### CONFIRMED
- [claim]: verified in [file:line]

### STALE
- [claim]: wiki says "X" but code now does "Y" (see [file:line])

### MISSING
- [page/claim]: the referenced file/function no longer exists

### NEW (no wiki coverage)
- [file/function/behavior]: exists in code but has no wiki page
```

### Step 4 — Synthesize findings (main agent)

When all subagents report back:

1. **STALE claims** — apply the supersession format on each affected wiki page. Update `last_confirmed` dates.
2. **MISSING items** — either remove the wiki page (if the feature was intentionally deleted) or mark it `status: superseded` with a note explaining what happened.
3. **NEW items** — create new wiki pages for anything significant that lacks coverage. Use `confidence: 0.7` (confirmed once by the subagent's reading).
4. **CONFIRMED claims** — bump `last_confirmed` to today's date. Optionally increase confidence by +0.1 if it was below 0.9.

### Step 5 — Update the log

Append to `wiki/log.md`:

```
## [YYYY-MM-DD] review | deep periodic review
- Subagents dispatched: N
- Scopes reviewed: [list]
- Claims confirmed: N
- Claims superseded (stale): N
- Pages removed/archived (missing): N
- New pages created: N
- Pages updated: [list]
- Key findings:
  - [1-3 bullet summary of the most important discoveries]
```

### Step 6 — Report to user

Present a concise summary:
- What was checked
- What changed (superseded, created, removed)
- Any areas of concern that need human judgment

---

## Key rules

- **Main agent writes all wiki changes** — subagents only read and report.
- **Never silently overwrite** — always use the supersession format.
- **Don't manufacture busywork** — if the wiki is small, dispatch fewer agents. One agent per 3-5 pages is a good ratio.
- **Use graphify if available** — if `graphify-out/graph.json` exists, subagents should use `graphify query` and `graphify path` to navigate the codebase faster instead of reading files blindly.
- **This is not a substitute for wiki-audit** — run `/wiki-audit` first for structural cleanup, then `/wiki-review` for deep verification. Or run review standalone if you're confident the structure is clean.
