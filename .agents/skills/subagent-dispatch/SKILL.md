---
name: subagent-dispatch
description: Step-by-step guide for dispatching sub-agents correctly — how to structure a dispatch announcement, what to include in a sub-agent prompt, the Persona Library for choosing the right expert persona, and how to harvest sub-agent results back into the wiki. Use this skill whenever you are about to invoke_subagent, need to construct a sub-agent prompt, need to pick a persona, or are processing a returned sub-agent result for wiki harvesting.
---

# Sub-agent Dispatch Guide

Use this skill every time you dispatch a sub-agent. It covers the full lifecycle: announcement → prompt construction → persona selection → result harvesting.

Sub-agents are **scouts, not coders**. They read, analyze, test, verify, and report. They never write or modify source files — that is the main agent's exclusive job.

---

## How to Dispatch a Sub-agent

1. Tell the user what you are about to do and why.
2. **State whether you are dispatching in parallel or sequentially**, and briefly explain why.
3. **Assign an expert persona** — the very first line of every sub-agent prompt must be a persona declaration. See the Persona Library below.
4. Invoke the appropriate sub-agent(s) with precise, self-contained prompts. Include all relevant context the sub-agent will need, since it cannot see the conversation history.
5. **Do not start writing code while waiting for sub-agent results** — their findings may change your implementation approach entirely.
6. When sub-agents report back:
   - Synthesize all findings together — do not treat each report in isolation.
   - Identify anything worth banking into the wiki.
   - Update the relevant wiki pages.
   - Log the session activity.
7. Report the result back to the user with citations to the wiki pages you updated.

---

## What to Include in a Sub-agent Prompt

Since sub-agents are isolated, always include in their prompt:
- **A persona declaration on the very first line** (see Persona Library below) — this is mandatory, never skip it
- The specific task and its scope
- **Precise reading guidance** — specific file paths and sections they should read (see below)
- Any constraints or conventions from the schema they should follow
- What format you want the result back in
- Explicitly tell them: **do NOT write to the wiki and do NOT write or modify any source files** — that is the main agent's job

---

## Guiding Sub-agent Context

Sub-agents can and should read files themselves — but they must be given specific direction on what to read. **You decide what’s relevant. They do the reading.**

- Give them a specific file path and section: `"Read Phase 5 in docs/TASKS.md"` not `"Read TASKS.md"`
- Give them a specific wiki page path for any background context: `".memory/wiki/systems/AuthService.md"`
- Never say `"read the docs folder"`, `"read the PRD"`, or `"understand the project"` — these are too broad
- For very targeted tasks where you know the exact content needed, paste it directly into the prompt — this saves the sub-agent a tool call

**Correct:**
> `"Your scope is Phase 5. Read docs/TASKS.md and focus on Phase 5 only. Background on the auth system is at .memory/wiki/systems/AuthService.md."`

**Wrong:**
> `"Read docs/TASKS.md and figure out what you need to do."`
> `"Read the docs folder and understand the project."`

The sub-agent reads exactly what you pointed at — no more, no less.

---

## Persona Library

Always open a sub-agent prompt with a persona tailored to the task. Match the persona to the work. You are free to adapt any persona to include project-specific context (framework, language, domain) — the more specific, the better the output.

| Task type | Persona to assign |
|---|---|
| Debugging / log analysis | `You are a senior software engineer specializing in debugging complex systems. You analyze call stacks, read logs, and isolate bugs methodically: reproduce first, hypothesize second, confirm third. You report findings only — you do not fix or write code.` |
| Codebase research / API exploration | `You are a veteran codebase researcher. You read files, trace call chains, map dependencies, and surface relevant code with precision. You are thorough, skeptical of first appearances, and always note confidence levels on your findings.` |
| Systems / data analysis | `You are a systems analysis expert with deep experience in low-level architecture analysis. You are precise and never guess — if something is uncertain, you say so explicitly. You do not write or modify any code.` |
| QA / verification / testing | `You are a meticulous QA engineer. Your job is to verify behavior, run tests, check outputs against expectations, and report exactly what passes, what fails, and why. You do not write or fix code — you only report findings.` |
| Bulk cataloging / documentation | `You are a meticulous technical writer and archivist. Your job is to produce clean, structured, consistently formatted documentation from raw findings. You prioritize accuracy over speed.` |

**Adapt the persona** — if you know more specifics about the project (framework, language, domain), work them into the persona. For example: *"You are a senior QA engineer specializing in Python FastAPI services..."* The more specific, the better the output.

---

## Harvesting Sub-agent Results into the Wiki

Every sub-agent result is a potential source. After receiving a sub-agent report:
1. Treat the report as if it were a raw source dropped in `.memory/raw/`.
2. Extract any new facts, functions, systems, or concepts discovered.
3. Check for contradictions with existing wiki pages.
4. Update or create pages as appropriate.
5. Log what was harvested:
   ```
   ## [YYYY-MM-DD] harvest | sub-agent task description
   - Task: [what the sub-agent did]
   - New pages: [list]
   - Updated pages: [list]
   - Key findings: [1-3 bullet summary]
   ```
