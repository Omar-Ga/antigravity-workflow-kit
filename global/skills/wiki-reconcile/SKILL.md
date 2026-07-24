---
name: wiki-reconcile
description: >-
  Procedure for reconciling the wiki knowledge base against reality — the codebase, migration files, and the audit log. Use this skill when the user says "reconcile the wiki", "sync the wiki", "check if the wiki is accurate", "is the wiki up to date", "update the wiki after this fix", "the wiki might be lying", or "check for stale claims". Also trigger proactively after completing a phase, after a bug fix session, after applying database migrations, or any time significant code changes have been made that wiki pages may not yet reflect. This is the companion skill to wiki-lint: lint checks structure, reconcile checks truth.
---

# Wiki Reconcile Operation

This skill checks whether claims in the wiki are still **true against reality**. It is fundamentally different from `wiki-lint`, which only checks structural health (broken links, missing frontmatter, orphan pages). Reconcile checks *semantic accuracy* — does the wiki reflect what the code actually does right now?

## The core question

> *"Has the codebase moved on since this wiki claim was written?"*

Wiki drift is silent. A page can have perfect structure, zero broken links, and still be lying because a bug was fixed, a migration was applied, or a phase was completed and no one updated the relevant page. Reconcile hunts these lies down and applies the supersession protocol to replace them with truth.

---

## Reconcile Procedure

Work through each check in order. Fix issues as you find them — do not just generate a report and stop. For every resolved or outdated claim, apply the supersession format defined in the AGENTS.md rules.

### Check 1 — Log cross-reference (resolved issues)

This is the highest-yield check. The log is a ground-truth audit trail of what was done.

1. Read all entries in `wiki/log.md`.
2. For each entry containing words like `resolved`, `fixed`, `implemented`, `applied`, `patched`, `corrected`, `verified`, `completed`, look at what was changed (file names, table names, function names, vulnerability names).
3. Search every wiki page for language that describes that item as an **open problem, vulnerability, defect, or gap**.
4. If a wiki page still presents a resolved item as an open issue, supersede it immediately using the supersession format.

**Example pattern to catch:**
- Log says: *"Meta webhook signature verification validated as correct"*
- Wiki says: *"Critical Security: Missing Webhook Signature Verification"* (as an open gap)
- → Supersede the wiki claim.

### Check 2 — TASKS.md cross-reference (phase drift)

1. Read `docs/TASKS.md` (if it exists). Identify all phases/tasks marked as complete (`[x]`).
2. Read `wiki/overview.md`. Compare the list of completed phases there against what TASKS.md says is done.
3. For every phase marked complete in TASKS.md but absent or missing from `overview.md`, add it to the overview with a brief summary of what was built (pull from the log if needed).
4. Update `overview.md`'s `last_confirmed` date.

### Check 3 — Schema reconciliation (database drift)

1. Read `wiki/systems/Database.md`.
2. List all migration files in `backend/migrations/` (or wherever migrations live in this project).
3. For each migration file not yet reflected in `Database.md`:
   - Identify what tables were created, altered, or dropped.
   - Update `Database.md` accordingly — add new tables, mark dropped columns as superseded.
4. For each table listed in `Database.md`, check if any migration has since altered or removed it. Supersede accordingly.

### Check 4 — Code spot-checks (named file claims)

1. Find any wiki claim that references a specific source file by name (e.g., *"messaging.py queries the `clients` table"*).
2. Open that source file and verify the claim is still true.
3. If the code no longer matches the claim, supersede the claim with what the code currently does.

Focus on pages with `type: system` or `type: concept` that contain code snippets or inline function references — these are the most likely to have drifted.

### Check 5 — Open vulnerability / defect sweep

1. Grep all wiki pages for sections using headings or bullet language that signals an **unresolved problem**: words like `vulnerability`, `defect`, `bug`, `gap`, `bottleneck`, `missing`, `broken`, `fails`, `risk`.
2. For each one found, cross-check against the log: has this been resolved? Has a fix been verified?
3. If resolved → supersede. If genuinely still open → leave it, but verify its confidence score is still accurate.

### Check 6 — overview.md completeness

A quick final check: read `wiki/overview.md` and ask whether it reads as an accurate current-state summary. It should reflect:
- Which phases are complete
- Major architectural decisions that are now locked in
- Any resolved security/stability issues

If it is missing significant recent context that exists in the log but not the overview, add it.

---

## Supersession format

Use the **two-tier model** from AGENTS.md:

**Tier 1 — Significant changes** (security fixes, architectural decisions, behavioral changes with future debugging value):
```
~~Old stale claim text here~~

> 🔄 **Superseded [YYYY-MM-DD]:** Old claim: "...". New finding: "...". Source: [log entry / file checked].
```

For an entire section that has been resolved: add `(RESOLVED YYYY-MM-DD)` to the heading and strikethrough the body.

**Tier 2 — Minor changes** (renamed fields, shifted routes, parameter changes):
- Update the page directly.
- Update `last_confirmed` to today.
- Log a one-line note in `log.md`.

**Default rule:** If you're unsure, ask: *"Would someone need to know what this used to be six months from now?"* Yes → Tier 1. No → Tier 2.

When a claim is **confirmed** (code matches the wiki): update `last_confirmed` to today and ensure `status: active`.

---

## After reconcile — Update the log

Append an entry to `wiki/log.md`:

```
## [YYYY-MM-DD] reconcile | pass N
- Log cross-reference: N items superseded
- Phase drift fixed: N phases added to overview.md
- Schema drift fixed: N tables added/updated in Database.md
- Code spot-checks: N claims verified, N superseded
- Vulnerability sweep: N resolved items superseded
- Pages updated: [list]
```

---

## Key differences from wiki-lint

| | wiki-lint | wiki-reconcile |
|---|---|---|
| **Checks** | Structure, links, frontmatter | Semantic truth, code accuracy |
| **Source of truth** | The wiki itself | The codebase, migrations, log, TASKS.md |
| **Reads code?** | No | Yes — spot-checks specific files |
| **Speed** | Fast | Slower — reads external files |
| **When to run** | After large ingest sessions, periodically | After phases complete, after bug fixes |
| **What it fixes** | Orphans, broken links, missing stubs | Stale claims, resolved vulnerabilities, schema drift |

Run `wiki-lint` first for structural hygiene, then `wiki-reconcile` for semantic accuracy.

---

## Key reminders

- Fix as you go — do not produce a report and stop.
- Use Tier 1 supersession for significant changes; Tier 2 (update-in-place + log) for minor ones.
- When a claim is confirmed against real code, update `last_confirmed` to today and keep `status: active`.
- When in doubt whether a fix is resolved, check the actual source file — don't just trust the log summary.
- After reconcile, always update the log. This creates the paper trail that makes the next reconcile faster.
- If you discover something that belongs in a new wiki page, create it. Reconcile is also a good time to fill gaps.
- Never add a confidence number — use `status: active | uncertain | superseded` only.
