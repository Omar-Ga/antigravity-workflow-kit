---
name: wiki-crystallize
description: Procedure for crystallizing a session's discoveries into the wiki. Use this skill whenever the user says "crystallize our session", "save what we found", "bank this session", "summarize what we learned today", or asks you to extract and document findings from the current conversation into the knowledge base. Trigger even if the user uses loose phrasing like "let's save this" or "write up what we just figured out".
---

# Wiki Crystallization Operation

This skill defines the procedure for capturing discoveries from the current conversation and filing them permanently into the `.memory/wiki/` knowledge base.

## When this triggers

- User says **"crystallize our session"** or **"crystallize"**
- User says **"save what we found"**, **"bank this"**, **"write up what we learned"**
- End of a productive debugging or research session and the user wants findings preserved
- User asks you to extract facts from the current chat into the wiki

---

## Why crystallization matters

The wiki is not chat history. Anything worth keeping must be written to disk. Crystallization is how raw conversation turns into permanent structured knowledge. Without it, findings are lost when the context window rolls over.

---

## Crystallization Procedure

Work through these steps in order.

### Step 1 — Review the current conversation

Scan the current session for discoveries, findings, corrections, and insights that haven't been written to the wiki yet. Ask yourself:
- What was the question or problem we were working on?
- What did we find or confirm?
- Which functions, systems, or concepts came up?
- What lessons or patterns emerged that are worth generalising?

### Step 2 — Write a session digest page

Create a new page at `wiki/sources/session_YYYY-MM-DD.md`. If today already has a session page, append to it or use `session_YYYY-MM-DD_2.md`.

Use the standard page frontmatter:

```yaml
---
type: source
name: "session_YYYY-MM-DD"
status: active
sources: ["conversation"]
last_confirmed: YYYY-MM-DD
tags: [session, crystallization]
---
```

The session digest page body should answer:
- **What was the question/problem?**
- **What was found or confirmed?**
- **Which functions/systems were involved?**
- **What lessons emerged?**

Keep it factual and structured. This page is a source record — future you will read it to reconstruct what happened.

### Step 3 — Extract standalone facts into entity pages

For every concrete finding (a function behaviour, a system quirk, a confirmed pattern), update the relevant entity page:

- **Page exists** → If the session confirms the existing claim, update `last_confirmed` to today and keep `status: active`. If the session contradicts a claim, apply Tier 1 supersession (strikethrough + callout) for significant changes, Tier 2 (update in place + log) for minor ones.
- **No page** → Create one. Use `status: active` for clearly observed facts, `status: uncertain` for things that were speculative or seen only once in this session.

### Step 4 — Update `wiki/index.md`

Add the session digest page (and any new entity pages) to the index.

### Step 5 — Append to `wiki/log.md`

Every crystallization must be logged:

```
## [YYYY-MM-DD] crystallize | session_YYYY-MM-DD
- Session topic: [what we were working on]
- New pages: [list or none]
- Updated pages: [list or none]
- Key findings:
  - [finding 1]
  - [finding 2]
  - [finding 3]
```

---

## Key reminders

- Crystallization is yours to do — sub-agents do NOT crystallize sessions.
- Only crystallize claims that have enough evidence to be useful. Speculative findings should be `status: uncertain`.
- Use `[[wikilinks]]` to connect the session digest to the entity pages it touches.
- The session digest is a source record, not an essay. Keep it factual.
- Never add a confidence number — use `status: active | uncertain | superseded` only.
