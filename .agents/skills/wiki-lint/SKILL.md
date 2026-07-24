---
name: wiki-lint
description: Procedure for auditing and cleaning up the wiki knowledge base. Use this skill whenever the user says "lint the wiki", "clean up the wiki", "audit the wiki", "check for broken links", "find orphan pages", or asks you to validate the health and consistency of the knowledge base. Also trigger after large ingestion sessions when many pages were created or modified.
---

# Wiki Lint Operation

This skill defines the procedure for auditing the `.memory/wiki/` knowledge base for structural problems, inconsistencies, and stale content.

## When this triggers

- User says **"lint the wiki"**, **"clean up the wiki"**, **"audit the wiki"**
- User asks to **"check for broken links"** or **"find orphan pages"**
- After a large ingest session where many pages were created or modified
- Periodically as part of knowledge base maintenance

---

## Why linting matters

Over time, wikis accumulate orphan pages, broken links, contradictions, and stale claims. A wiki that isn't linted becomes untrustworthy. Linting is how we keep the knowledge base reliable and internally consistent.

---

## Lint Procedure

Work through each check in order. Fix issues as you find them — don't just report them.

### Check 1 — Orphan pages

Read `wiki/index.md` and scan all pages. An orphan is a page that has no inbound `[[wikilinks]]` from any other page.

- For each orphan: either add a wikilink from a relevant page (e.g., the index, overview, or a related entity page), or flag it in the log if it genuinely doesn't belong anywhere.

### Check 2 — Broken links

Scan all wiki pages for `[[WikiLink]]` references. Check that each linked page actually exists.

- For each broken link: either fix the link (correct spelling, rename), create a stub page for the missing entity, or remove the link if it's no longer relevant.

### Check 3 — Contradictions

Compare claims across pages. Look for cases where two pages assert opposite things about the same function, system, or concept.

- For each contradiction: mark both pages with a note, propose a resolution to the user, and update the relevant page once the contradiction is resolved. Use the supersession format if one finding replaces another.

### Check 4 — Missing pages (stub creation)

Find entities that are referenced via `[[wikilinks]]` but have no page at all.

- Create a stub page for each: frontmatter only, with `status: stub` and `confidence: 0.3`. Add a note that this page needs to be filled in.

### Check 5 — Stale pages

Find pages where:
- `status: active`, AND
- `last_confirmed` is more than 30 days ago

For each such page:
1. Flip `status` from `active` to `uncertain` in the frontmatter.
2. Add a warning callout at the top of the page body:

```
> ⚠️ This page has not been re-confirmed recently. Treat with caution.
```

### Check 6 — Missing frontmatter

Find any pages that are missing their YAML frontmatter block entirely. Add appropriate frontmatter. When in doubt, use `status: uncertain` and today's date for `last_confirmed`.

---

## After lint — Update the log

Append an entry to `wiki/log.md`:

```
## [YYYY-MM-DD] lint | pass N
- Orphans fixed: N
- Broken links fixed: N
- Contradictions found: N
- Stubs created: N
- Stale warnings added: N
- Missing frontmatter fixed: N
```

---

## Key reminders

- Fix issues as you find them — don't just generate a report and stop.
- Stub pages are better than broken links. Create them liberally.
- When resolving contradictions, always apply the supersession format — never silently overwrite.
- Keep `wiki/index.md` up to date with any new stub pages created during lint.
- The trustworthiness signal is `status` + `last_confirmed`. Never add a confidence number.
