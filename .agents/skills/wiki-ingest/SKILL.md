---
name: wiki-ingest
description: Procedure for ingesting a raw file into the wiki knowledge base. Use this skill whenever the user says "ingest [file]", "process this file", "add this to the wiki", drops a file in raw/, or asks you to extract and document findings from a source document. Even if the user just says "ingest" without specifying a file, trigger this skill and ask them which file to process.
---

# Wiki Ingest Operation

This skill defines the step-by-step procedure for ingesting a raw source file into the `.memory/wiki/` knowledge base.

## When this triggers

- User says **"ingest [file or filename]"**
- User says **"process this file"**, **"add this to the wiki"**, **"document this"**
- A new file appears in `.memory/raw/` that hasn't been logged yet
- User drops a raw document and wants it catalogued

---

## Ingest Procedure

Work through these steps in order. Don't skip steps even if the file seems simple — every ingest must be fully logged.

### Step 1 — Read the raw file

Open and read the file from `.memory/raw/`. Do not modify it. This directory is immutable ground truth.

### Step 2 — Discuss key takeaways (if complex)

If the file contains non-obvious findings, contradictions, or is very large, briefly surface the key takeaways with the user before proceeding. For straightforward files, proceed directly.

### Step 3 — Create a source summary page

Write a new page at `wiki/sources/SourceName.md` (use the filename as the page name). This page summarises what was found in the raw file.

Use the standard page frontmatter:

```yaml
---
type: source
name: "SourceName"
status: active
sources: ["raw/filename.ext"]
last_confirmed: YYYY-MM-DD
tags: [...]
---
```

### Step 4 — Extract all entities

Go through the file and identify every entity of these types:

| Type | Where to file it |
|---|---|
| Function / opcode | `wiki/functions/FunctionName.md` |
| Game system | `wiki/systems/SystemName.md` |
| Pattern / gotcha / concept | `wiki/concepts/ConceptName.md` |

### Step 5 — Create or update entity pages

For each entity extracted:

- **Page already exists** → Check for contradictions. If new info confirms the existing claim, update `last_confirmed` to today and keep `status: active`. If new info contradicts, apply the supersession procedure — Tier 1 for significant changes (strikethrough + callout), Tier 2 for minor ones (update in place + log note).
- **No page yet** → Create a new page. Use `status: active` if the claim is clearly evidenced, `status: uncertain` if it's speculative or observed only once.

### Step 6 — Update `wiki/overview.md`

If the findings are significant enough to change the big picture of what's known, update `wiki/overview.md` to reflect that.

### Step 7 — Update `wiki/index.md`

Add any new pages to the index. Every page in the wiki must appear in `index.md`.

### Step 8 — Append to `wiki/log.md`

Every ingest must be logged. Append an entry using this format:

```
## [YYYY-MM-DD] ingest | SourceName
- New pages: [list or none]
- Updated pages: [list or none]
- Contradictions found: [list or none]
- Key findings:
  - [finding 1]
  - [finding 2]
  - [finding 3]
```

---

## Key reminders

- Never modify `.memory/raw/` — it is read-only ground truth.
- Use Tier 1 supersession for significant changes; Tier 2 (update-in-place + log) for minor ones.
- Every page must have YAML frontmatter with `status` and `last_confirmed`.
- Use `[[wikilinks]]` to link related pages.
- Cite the source file in every page you create or update.
- Never add a confidence number — use `status: active | uncertain | superseded` only.
