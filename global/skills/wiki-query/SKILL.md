---
name: wiki-query
description: Procedure for answering knowledge questions by searching the wiki. Use this skill whenever the user asks about a specific function, system, opcode, pattern, or concept that has likely been documented — phrases like "what does X do", "how does Y work", "do we know anything about Z", "what did we find about", "is there a page on", or "look this up in the wiki". Trigger proactively when a question is factual and the answer might already exist in the knowledge base rather than requiring fresh research.
---

# Wiki Query Operation

This skill defines the procedure for answering knowledge questions using the `.memory/wiki/` knowledge base rather than reasoning from scratch or dispatching a sub-agent.

## When this triggers

- User asks a factual question about a function, system, opcode, or concept
- User says **"what does X do"**, **"how does Y work"**, **"do we know about Z"**
- User says **"look this up"**, **"check the wiki"**, **"is there a page on X"**
- A question arises mid-session that the wiki might already answer

---

## Why this matters

The wiki is the accumulated knowledge base. Answering from the wiki is faster, more reliable, and reinforces the knowledge structure. Only escalate to fresh research (sub-agent or web) if the wiki genuinely doesn't cover it.

---

## Query Procedure

### Step 1 — Read `wiki/index.md`

Start here. Scan the index for pages that are relevant to the question. Note any candidate pages — functions, systems, concepts, or source summaries that touch on what the user asked.

### Step 2 — Read the relevant pages

Read the candidate pages. Follow `[[wikilinks]]` to related pages where needed to get full context. Pay attention to:
- **Status** — `superseded` pages contain dead information; `uncertain` pages need caution; prefer `active` pages
- **`last_confirmed` dates** — old dates on `active` pages mean the claim hasn't been verified recently. Treat with appropriate caution.

### Step 3 — Synthesise and answer

Give the user a direct answer with citations to the specific wiki pages you drew from. For example:
> *"According to `wiki/functions/GetActorValue.md` (status: active, last confirmed 2026-07-23), this function..."*

If a page is `uncertain` or hasn't been confirmed recently, say so clearly. Don't present uncertain findings as facts.

### Step 4 — Offer to file valuable insights

If answering the question required reasoning beyond what was directly in the wiki (connecting dots, filling a gap, making an inference), offer to file that reasoning as a new concept page. New insights shouldn't live only in chat.

### Step 5 — Note gaps

If the wiki doesn't cover the topic at all, or only covers it superficially:
- Tell the user the gap exists
- Offer to dispatch a research sub-agent to fill it, or suggest they add raw sources for ingestion

---

## Key reminders

- Quick knowledge lookups are yours to handle directly — don't delegate to sub-agents.
- Always cite which wiki page a claim came from.
- `uncertain` status or old `last_confirmed` dates must be flagged, not presented as fact.
- If a gap is found, log it or offer to act on it — don't just shrug.
- Never reference a confidence number — use `status` and `last_confirmed` only.
