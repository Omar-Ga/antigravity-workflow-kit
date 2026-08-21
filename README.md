# Antigravity Workflow Kit

A complete, AI agent workflow system for software projects. Drop the `.agents/` folder directly into any project root to immediately equip your AI assistant with persistent memory, structured project planning, codebase intelligence, browser automation, and disciplined sub-agent orchestration.

---

## Quick Setup

Copy the entire `.agents/` folder directly into your project root:

```
your-project/
├── .agents/
│   ├── AGENTS.md
│   ├── rules/
│   │   ├── coding-conventions.md
│   │   ├── graphify-template.md       ← rename to graphify.md after setup
│   │   └── pinchtab_gui_launch.md     ← Windows Task Scheduler GUI launcher rule
│   ├── skills/                        # 18 project-scoped skills
│   │   ├── graphify/
│   │   ├── pinchtab/
│   │   ├── pinchtab-account-setup/
│   │   ├── pinchtab-brave-attach/
│   │   ├── pinchtab-flow-images/
│   │   ├── pinchtab-opt/
│   │   ├── pinchtab-stealth-score/
│   │   ├── playwright-cli/
│   │   ├── playwright-cli-bridge/
│   │   ├── ponytail/
│   │   ├── project-planner/
│   │   ├── skill-creator/
│   │   ├── subagent-dispatch/
│   │   ├── wiki-crystallize/
│   │   ├── wiki-ingest/
│   │   ├── wiki-lint/
│   │   ├── wiki-query/
│   │   └── wiki-reconcile/
│   └── workflows/                     # 10 project-scoped workflows
│       ├── create-customization.md
│       ├── graphify.md
│       ├── mark-off.md
│       ├── prompt-write.md
│       ├── push-to-gh.md
│       ├── start-phase.md
│       ├── verify-no-tasks.md
│       ├── verify.md
│       ├── wiki-audit.md
│       └── wiki-review.md
```

---

## What's Inside

| Layer | What it gives you |
|---|---|
| **Agent Brain (AGENTS.md)** | The AI's operating doctrine — memory management, sub-agent orchestration, session protocols, supersession rules |
| **Wiki Memory System** | A persistent, structured knowledge base (`wiki-ingest`, `wiki-query`, `wiki-lint`, `wiki-reconcile`, `wiki-crystallize`) |
| **Project Planner** | A wizard that generates PRD → Design → Frontend Spec → Tasks (with intra-phase ordering) |
| **Graphify Integration** | AST-based codebase knowledge graph — query relationships, trace call chains |
| **Sub-agent Dispatch** | Persona-based specialist agents for research, debugging, QA, and verification |
| **PinchTab Integration** | High-performance Go browser automation (`pinchtab`, `pinchtab-account-setup`, `pinchtab-brave-attach`, `pinchtab-flow-images`, `pinchtab-opt`, `pinchtab-stealth-score`) + `schtasks` desktop GUI launcher rule |
| **Playwright CLI & Bridge** | Complete browser automation suite + CDP bridge to attach to live browser sessions |
| **Task Workflows** | `/start-phase`, `/verify`, `/mark-off` — structured phase-by-phase development |
| **Wiki Workflows** | `/wiki-audit`, `/wiki-review` — keep the knowledge base accurate and current |
| **Coding Conventions** | Strict, language-agnostic rules enforced on every code generation |
| **Ponytail** | Anti-bloat discipline — forces the laziest solution that actually works |

---

## Initializing a Project

### Step 1 — Configure Graphify
1. Rename `.agents/rules/graphify-template.md` to `.agents/rules/graphify.md`
2. Open it and replace every instance of `<YOUR_CODE_DIRS>` with your actual code directories (e.g., `backend frontend`, `src`, `app`)
3. In a new session, run `/graphify <your_dirs>` to build the initial knowledge graph

### Step 2 — Initialize the Wiki
Create the `.memory/` structure in your project root:

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

### Step 3 — Set up the Playwright bridge (optional)
If you want browser automation through the persistent CLI bridge, copy the `bridge/` files to a working directory (e.g., `d:\AI` or `~/ai-bridge`):

```
bridge/
├── pw-bridge.bat           # Entry point — run all commands through this
├── pw-bridge.ps1           # PowerShell script that proxies to the bridge server
├── pw_bridge_server.py     # Persistent Python server that holds the browser connection
└── launch_brave_rp.bat     # Launches Brave with --remote-debugging-port=9222
```

---

## PinchTab Setup & Multi-Account Workflow (Optional)

PinchTab is a high-performance Go browser automation engine. It runs on **Brave** (set via `browser.binary` in `%APPDATA%\pinchtab\config.json`) and isolates automation sessions in dedicated named profiles, each with its own `--user-data-dir`, so your main browser tabs and profiles remain 100% untouched.

### 1. MCP Configuration
To connect PinchTab to your AI editor (Antigravity, Claude, Cursor, Windsurf, etc.), add this block to your `mcp_config.json`:

```json
{
  "mcpServers": {
    "pinchtab": {
      "command": "pinchtab",
      "args": ["mcp"]
    }
  }
}
```

> **Note**: No personal directories or hardcoded user paths belong in `mcp_config.json`. PinchTab automatically resolves its active profile directory from `%APPDATA%\pinchtab\config.json`.

### 2. First-Run Setup & Task Scheduler Rule
On Windows, launching PinchTab directly from a background subshell causes desktop process isolation (`0xc0000142` error). Per `.agents/rules/pinchtab_gui_launch.md`, PinchTab must be launched via Task Scheduler:

1. Create a Windows Task Scheduler task named `LaunchPinchTabGUI`:
   - **Program**: `pinchtab.exe` (or full path to binary)
   - **Arguments**: `server`
   - **Options**: Run only when user is logged on (Interactive Desktop Session).
2. Always trigger PinchTab via Task Scheduler:
   ```powershell
   schtasks /Run /TN "LaunchPinchTabGUI"
   ```

### 3. Account Setup & Isolation Flow (`pinchtab-account-setup`)

PinchTab uses **Brave** with **named profiles** — one registered profile per Google account, each backed by its own isolated `--user-data-dir`. There is no profile picker; the `--profile` flag at launch chooses the account.

#### First-Time Account Setup
1. **Register a named profile** via the HTTP API (there is no CLI subcommand for this). The auth token lives in `server.token` in `%APPDATA%\pinchtab\config.json`:
   ```powershell
   $token = (Get-Content "$env:APPDATA\pinchtab\config.json" -Raw | ConvertFrom-Json).server.token
   $h = @{ Authorization = "Bearer $token" }
   Invoke-RestMethod -Uri "http://127.0.0.1:9867/profiles" -Method Post -Headers $h `
     -ContentType "application/json" -Body '{"name":"<accountNickname>"}'
   ```
   This creates a stable directory `<profiles.baseDir>\prof_<id>` and registers it.
2. **Start a headed instance on it**:
   ```powershell
   schtasks /Run /TN "LaunchPinchTabGUI"   # server must already be running
   pinchtab instance start --mode headed --profile <accountNickname>
   ```
   Note: `multiInstance.strategy` is `explicit` — nothing auto-launches, and `pinchtab nav` without a running instance returns `Error 503`.
3. **Sign In (One-Time Only)**: navigate the opened Brave window to `https://accounts.google.com/` and sign in by hand. The encrypted session is saved permanently in that isolated directory. `instance stop` afterwards hard-kills the process, which is harmless under Brave's crash-bubble suppression flags.

#### Adding More Accounts & Switching
Register one named profile per account (step 1 above), then switch by flag — no config patching, no restart, and multiple accounts can even run in parallel on separate ports:
```powershell
pinchtab instance start --mode headed --profile <accountNickname>
```
Never launch without `--profile` (creates a throwaway `instance-<timestamp>` dir) and never use `--profile default` (returns 404 on pinchtab 0.15.1 — only API-registered profiles are valid). Verify login state via `https://accounts.google.com/AccountChooser`, not the registry's `hasAccount` field (it stays empty).

---

## How It Works

### The Agent Brain (`AGENTS.md`)
`AGENTS.md` is the AI's operating doctrine. It defines:
- **Session Start Protocol** — what the AI reads at the start of every session (`wiki/index.md`, recent logs, active tasks)
- **Memory System** — three-layer knowledge base (`raw/` → `wiki/` → `AGENTS.md`)
- **Sub-agent Delegation** — what to delegate vs. handle directly, how to dispatch, how to harvest results
- **Critical Rules** — 15 non-negotiable rules the AI follows at all times

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
