---
name: pinchtab-mcp
description: "Use this skill when a task requires browser automation through PinchTab's MCP server connected to a remote browser instance. Covers navigation, element interaction, data extraction, form filling, multi-step flows, and session management via MCP tools."
metadata:
  mcp:
    servers:
      - name: pinchtab
        config:
          command: pinchtab
          args: ["mcp"]
---

# Browser Automation via PinchTab MCP

Use MCP tools to control a browser through the PinchTab HTTP API. The MCP server defaults to `http://127.0.0.1:9867`; for remote or containerized PinchTab instances, override with the `PINCHTAB_SERVER` env var (e.g. `PINCHTAB_SERVER=http://pinchtab:9867`).

## Core Workflow

1. **Navigate**: `pinchtab_navigate(url="https://example.com")` — auto-creates a session and tab.
2. **Observe**: `pinchtab_snapshot(interactive=true, compact=true)` — returns numbered refs like `e5`, `e12`.
3. **Interact**: `pinchtab_click(selector="e5")` — use refs from the snapshot.
4. **Verify**: `pinchtab_get_text()` or re-snapshot to confirm the action succeeded.

**Critical rule**: An element ref (`e5`, `e12`) denotes a DOM node, so the same node keeps its ref across `interactive` vs full, a `selector` scope and a `depth` limit — a filtered view is therefore sparse (`e0, e1, e6`), never assume refs are contiguous. What a ref does NOT survive is navigation to a new document: refs expire on page load, so always re-call `pinchtab_snapshot` afterwards. A ref that can no longer resolve to its node is refused with `vocab_superseded` (or `ref not found`), never acted on positionally — the tools carry each snapshot's vocabulary token forward so a filter-only re-read keeps a ref valid while a new document supersedes it.

---

## Tool Selection Guide

Choose the cheapest tool that satisfies your goal:

| Goal | Tool | Token Cost |
|------|------|------------|
| Check a specific value | `pinchtab_eval(expression="document.title")` | Lowest |
| Find a specific element | `pinchtab_find(query="login button")` | Low |
| Read page text only | `pinchtab_get_text()` | Low |
| Read a whole site to markdown | `pinchtab_scrape(url=..., preview=true)` then expand | Varies |
| Find interactive elements | `pinchtab_snapshot(interactive=true, compact=true)` | Medium |
| Full page structure | `pinchtab_snapshot()` | Medium-High |
| Visual verification | `pinchtab_screenshot()` | Highest |

**Default observation**: `pinchtab_snapshot(interactive=true, compact=true)` — returns only interactive elements in compact format. Use this as your starting point.

---

## Navigation

```
pinchtab_navigate(url="https://example.com")
```

- Always include `http://` or `https://` scheme.
- Returns the tab ID and a basic confirmation.
- Follow with `pinchtab_snapshot()` to get element refs.
- For read-heavy tasks, consider blocking images (set via config on the server).

**After navigation**: Always call `pinchtab_snapshot()` before interacting. The page may have redirects, modals, or cookie banners.

---

## Site scrape

To read a **whole site** (not one page) into markdown, use `pinchtab_scrape` — it crawls over HTTP first and browser-renders only the pages that need it (thin, blocked, or JS-only).

```
pinchtab_scrape(url="https://example.com", preview=true)
```

- **Large sites**: call with `preview=true` first for a token-cheap outline (per-page titles, sizes, snippets, and which pages need the browser — no full bodies). Full reports can be large; don't scrape everything blind.
- **Drill down**: expand the pages you picked from the preview with `only` (comma-separated URLs): `pinchtab_scrape(url="https://example.com", only="https://example.com/a, https://example.com/b")`.
- `noBrowser=true` for an HTTP-only crawl; `enrichAll=true` to browser-render every page. Multi-page crawls run for minutes.

---

## Observation

### Snapshot (primary)

```
pinchtab_snapshot(interactive=true, compact=true)
```

Returns an accessibility tree with numbered refs:
```
[0]<a href="/about" />
	About
[2]<button aria-label="Sign in" />
	Sign in
[5]<input type="text" placeholder="Search" />
```

**Key rules**:
- Only elements with `[index]` are interactive.
- Refs are the fastest way to target elements.
- Use `diff=true` after an interaction to see only changed elements (saves tokens).
- Use `selector` to scope the snapshot to a specific section.

### Text extraction

```
pinchtab_get_text()
```

Use when you only need to read content (articles, dashboards, results). Cheaper than snapshot when you won't interact with elements.

### Find elements

```
pinchtab_find(query="submit button")
```

Semantic search for elements without a full snapshot. Returns matching refs. Great for known targets.

### Screenshots

```
pinchtab_screenshot()
```

Returns an MCP image (image/jpeg by default) — clients render it inline. The text block is always the JSON envelope `{"format": "jpeg"|"png", "annotations": [...]}`; `annotations` is `[]` by default and becomes `[{ref, role, name, tag, box: {x, y, w, h}}, ...]` with `annotate=true` so refs in the picture map back to the same selectors used by `pinchtab_click` etc. Screenshots are heavy (500KB–2MB per image), so use sparingly.

- Add `quality=60` to reduce file size for JPEG screenshots.
- Use `selector="e5"` to capture a specific element instead of the viewport.
