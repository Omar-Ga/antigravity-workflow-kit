---
description: Run a global, unbiased verification using a subagent — not tied to any specific phase or task file.
---

Spawn a subagent with a QA engineer persona. Do NOT tell it what was just built or changed rather only tell it the features it should be testing. — keep it completely in the dark about recent implementation work so it tests with zero bias. its job is to test the feature in question , and report back any bugs, broken flows, inconsistencies, or regressions it finds. Let it form its own picture entirely from the code.

If the user's request mentions or implies using Playwright, browser automation, or the Playwright CLI bridge, you MUST explicitly include in the subagent's prompt a non-negotiable directive to use `view_file` to read both skill instruction files before taking any action:
1. `.agents/skills/playwright-cli/SKILL.md`
2. `.agents/skills/playwright-cli-bridge/SKILL.md`
Reading both skill instruction files first is non-negotiable.
