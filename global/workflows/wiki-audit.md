---
name: wiki-audit
description: Run a full wiki cleanup — structural lint followed by semantic reconcile. Use when the user says "audit the wiki", "clean up the wiki", "full wiki check", or after completing a major phase.
---

# /wiki-audit — Full Wiki Cleanup

This workflow runs **wiki-lint** (structural health) followed by **wiki-reconcile** (semantic truth) in a single pass. The main agent handles both — no subagents are dispatched.

## When to use

- After completing a project phase
- After a bug fix session that touched multiple systems
- After a large ingest session
- Whenever the wiki feels stale or untrustworthy
- As periodic maintenance (weekly recommended)

---

## Procedure

### Phase 1 — Structural Lint

Follow the `wiki-lint` skill. Run all 6 checks in order:

1. Orphan pages — find and link them
2. Broken links — fix or stub them
3. Contradictions — flag and resolve
4. Missing pages — create stubs
5. Stale confidence — add warning callouts
6. Missing frontmatter — add it

Fix issues as you go. Do not just report them.

### Phase 2 — Semantic Reconcile

Follow the `wiki-reconcile` skill. Run all 6 checks in order:

1. Log cross-reference — supersede resolved issues still marked as open
2. TASKS.md cross-reference — sync completed phases to overview.md
3. Schema reconciliation — compare migrations to Database.md
4. Code spot-checks — verify named-file claims against actual source
5. Vulnerability/defect sweep — supersede anything resolved
6. overview.md completeness — ensure it reflects current state

Fix issues as you go. Apply the supersession format for every stale claim — never silently overwrite.

### Phase 3 — Summary

After both passes, append a combined entry to `wiki/log.md`:

```
## [YYYY-MM-DD] audit | full pass (lint + reconcile)
### Lint results
- Orphans fixed: N
- Broken links fixed: N
- Contradictions found: N
- Stubs created: N
- Stale warnings added: N
- Missing frontmatter fixed: N

### Reconcile results
- Log cross-reference: N items superseded
- Phase drift fixed: N phases added to overview.md
- Schema drift fixed: N tables updated
- Code spot-checks: N verified, N superseded
- Vulnerability sweep: N resolved items superseded
- Pages updated: [list]
```

Report the summary to the user. Highlight anything that was superseded or created — those are the high-value findings.
