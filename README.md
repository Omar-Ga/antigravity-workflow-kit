# Antigravity Workflow Kit

A complete, copy-paste AI agent workflow system for software projects. Drop this into any project and immediately get a production-grade AI assistant with persistent memory, structured project planning, codebase intelligence, and disciplined sub-agent orchestration.

---

## What's Inside

| Layer | What it gives you |
|---|---|
| **Agent Brain (AGENTS.md)** | The AI's operating doctrine — memory management, sub-agent orchestration, session protocols, supersession rules |
| **Wiki Memory System** | A persistent, structured knowledge base that survives across sessions |
| **Project Planner** | A wizard that generates PRD → Design → Frontend Spec → Tasks (with intra-phase ordering) |
| **Graphify Integration** | AST-based codebase knowledge graph — query relationships, trace call chains |
| **Sub-agent Dispatch** | Persona-based specialist agents for research, debugging, QA, and verification |
| **Task Workflows** | `/start-phase`, `/verify`, `/mark-off` — structured phase-by-phase development |
| **Wiki Workflows** | `/wiki-audit`, `/wiki-review` — keep the knowledge base accurate and current |
| **Coding Conventions** | Strict, language-agnostic rules enforced on every code generation |
| **Ponytail** | Anti-bloat discipline — forces the laziest solution that actually works |
| **Playwright CLI Bridge** | Browser automation through a persistent CLI bridge — attaches to a live browser via CDP |

---

## Prerequisites

1. **[Antigravity](https://antigravity.dev)** — the AI coding agent that reads `.agents/` and the global skills directory
2. **[Graphify](https://github.com/anthonymayer/graphify)** — codebase knowledge graph CLI tool

   ```bash
   pip install graphify-cli
   ```

---

## Installation

### Step 1 — Copy project-scoped files

Copy the `.agents/` folder into your project root:

```
your-project/
└── .agents/
    ├── AGENTS.md
    ├── rules/
    │   ├── coding-conventions.md
    │   └── graphify-template.md   ← rename to graphify.md after setup
    └── workflows/
        └── graphify.md
```

### Step 2 — Copy global skills

Copy the contents of `global/skills/` into your Antigravity global skills directory:

```
~/.gemini/config/skills/          (macOS/Linux)
C:\Users\<you>\.gemini\config\skills\    (Windows)
```

Copy the contents of `global/workflows/` into your global workflows directory:

```
~/.gemini/config/global_workflows/
C:\Users\<you>\.gemini\config\global_workflows\
```

### Step 3 — Configure graphify

1. Rename `.agents/rules/graphify-template.md` to `.agents/rules/graphify.md`
2. Open it and replace every instance of `<YOUR_CODE_DIRS>` with your actual code directories (e.g., `backend frontend`, `src`, `app`)
3. In a new session, run `/graphify <your_dirs>` to build the initial knowledge graph

### Step 4 — Initialise the wiki

Create the memory structure in your project root:

```
your-project/
└── .memory/
    ├── raw/          ← drop source documents here for ingestion
    └── wiki/
        ├── index.md
        ├── log.md
        ├── overview.md
        ├── functions/
        ├── systems/
        ├── concepts/
        └── sources/
```

Minimum content for `wiki/index.md`:

```markdown
# Wiki Index

*No pages yet. Run `/wiki-ingest` on your first raw source to begin.*
```

Minimum content for `wiki/log.md`:

```markdown
# Wiki Log

*Append-only audit trail. Never delete entries.*
```

---

## How It Works

### The Agent Brain

`AGENTS.md` is the AI's operating doctrine. It defines:

- **Session Start Protocol** — what the AI reads at the start of every session (wiki index, recent log, active tasks)
- **Memory System** — three-layer knowledge base (`raw/` → `wiki/` → `AGENTS.md`)
- **Sub-agent Delegation** — what to delegate vs. handle directly, how to dispatch, how to harvest results
- **Critical Rules** — 15 non-negotiable rules the AI follows at all times

### The Wiki Memory System

The wiki persists knowledge across sessions. Every page has:

```yaml
---
type: function | component | system | concept | source
name: "ExactName"
status: active | uncertain | superseded
sources: ["raw/filename.md"]
last_confirmed: YYYY-MM-DD
tags: [backend, frontend, api, ...]
---
```

**Trust signals** (instead of numeric confidence):
- `status: active` — confirmed, trust it
- `status: uncertain` — not recently confirmed, treat with caution
- `status: superseded` — dead information, kept for audit history
- `last_confirmed` — any page not confirmed in 30+ days should be reviewed

**Supersession model** (two tiers):
- **Tier 1** (significant changes): Inline history with strikethrough + callout block. Use when future readers need to know *why* something changed.
- **Tier 2** (minor changes): Update in place + append to `log.md`. Use for renamed variables, shifted routes, small fixes.

### Slash Commands

| Command | What it does |
|---|---|
| `/graphify <dirs>` | Build or rebuild the codebase knowledge graph |
| `/wiki-audit` | Structural lint + semantic reconcile of the wiki |
| `/wiki-review` | Deep periodic review — sub-agents compare wiki claims to live code |
| `/start-phase <n>` | Plan Phase N from TASKS.md |
| `/verify <n>` | Run an unbiased sub-agent verification of Phase N's checkpoint |
| `/verify-no-tasks` | Global unbiased verification not tied to a phase |
| `/mark-off <n>` | Mark all of Phase N's tasks as complete |
| `/push-to-gh` | Stage, commit, and push to GitHub |
| `/prompt-write` | Write a new workflow, rule, or skill |
| `/create-customization` | Full guide for creating new skills, rules, and workflows |

### Sub-agent Delegation

The AI follows a strict two-tier model:

- **Main agent** → writes all code, maintains the wiki, orchestrates
- **Sub-agents** → read, analyze, test, verify, and report — never write code

When dispatching sub-agents, the AI:
1. Assigns an expert persona (debugger, researcher, QA engineer, etc.)
2. Points them at specific files/sections to read — never says "read the whole PRD"
3. Waits for results before writing any code
4. Harvests findings into the wiki

### Project Planning

Run `/project-planner` (or ask "let's plan this project") to generate:

1. `docs/PRD.md` — Product requirements, data models, API surface
2. `docs/design.md` — Design tokens and visual system *(frontend projects only)*
3. `docs/FRONTEND_DESIGN_SPEC.md` — Component inventory per screen *(frontend projects only)*
4. `docs/TASKS.md` — Phased implementation checklist with **intra-phase ordering**
5. `docs/DEPENDENCY_TREE.md` — Phase dependencies and critical path *(opt-in, ask explicitly)*

**TASKS.md intra-phase ordering:** Tasks within a phase are listed top-to-bottom in build order. The `*(requires PX-BY)*` annotation marks non-obvious intra-phase dependencies.

---

## Customising for Your Project

### Graphify scope

Edit `.agents/rules/graphify.md` — change `<YOUR_CODE_DIRS>` to your actual code directories.

### Coding conventions

Edit `.agents/rules/coding-conventions.md` — the default conventions are language-agnostic. Add language-specific tooling (formatters, linters) relevant to your stack in Section 6.

### MCP tools

If your project uses specific MCP tools (Supabase, Playwright, etc.), add an `.agents/rules/mcp-usage.md` rule to mandate their use over manual alternatives.

---

## File Structure Reference

```
your-project/
├── .agents/                          # Project-scoped agent config
│   ├── AGENTS.md                     # The agent's operating doctrine
│   ├── rules/
│   │   ├── coding-conventions.md     # Always-on coding rules
│   │   └── graphify.md               # Always-on graphify rules
│   └── workflows/
│       └── graphify.md               # /graphify slash command
│
├── .memory/                          # Persistent knowledge base
│   ├── raw/                          # Immutable source documents (never edit)
│   └── wiki/                         # Agent-maintained knowledge pages
│       ├── index.md
│       ├── log.md
│       ├── overview.md
│       ├── functions/
│       ├── systems/
│       ├── concepts/
│       └── sources/
│
└── docs/                             # Project planning documents
    ├── PRD.md
    ├── design.md
    ├── FRONTEND_DESIGN_SPEC.md
    └── TASKS.md

# Global (installed once, works across all projects)
~/.gemini/config/
├── skills/
│   ├── wiki-ingest/
│   ├── wiki-query/
│   ├── wiki-lint/
│   ├── wiki-reconcile/
│   ├── wiki-crystallize/
│   ├── subagent-dispatch/
│   ├── ponytail/
│   ├── graphify/
│   ├── playwright-cli/                # Full Playwright CLI command reference
│   │   └── references/               # Advanced patterns (tests, mocking, video, etc.)
│   ├── playwright-cli-bridge/         # Thin bridge layer for attaching to live browsers
│   └── project-planner/
│       └── references/
└── global_workflows/
    ├── wiki-audit.md
    ├── wiki-review.md
    ├── mark-off.md
    ├── start-phase.md
    ├── verify.md
    ├── verify-no-tasks.md
    ├── push-to-gh.md
    ├── create-customization.md
    └── prompt-write.md
```

---

## Tips

- **At every session start**, the AI will read `wiki/index.md`, the last 10 entries of `wiki/log.md`, and `docs/TASKS.md` automatically — no prompting needed.
- **At session end**, the AI will offer to crystallize session findings into the wiki. Accept it.
- **For new projects**, always run `/project-planner` first before writing any code.
- **For existing projects**, drop raw documentation into `.memory/raw/` and run `/wiki-ingest` to build the initial knowledge base.
- **Graphify is code-only** — don't include docs or config directories. Point it only at your source code.
- **The wiki is append-only in spirit** — never delete pages, only supersede them with attribution.
