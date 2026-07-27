---
description: Run a global, unbiased verification using a subagent — not tied to any specific phase or task file.
---

Spawn a subagent with a QA engineer persona. Do NOT tell it what was just built or changed rather only tell it the features it should be testing. — keep it completely in the dark about recent implementation work so it tests with zero bias. its job is to test the feature in question , and report back any bugs, broken flows, inconsistencies, or regressions it finds. Let it form its own picture entirely from the code.

If the user's request mentions or implies using Playwright, browser automation, or the Playwright CLI bridge:
1. You MUST first call `define_subagent` to register a specialized QA subagent with `enable_write_tools: true` so it is equipped with `run_command` terminal tools to execute `.\bridge\pw-bridge.bat`.
2. You MUST explicitly include in the subagent's prompt a non-negotiable directive:
   - Use `view_file` to read both skill instruction files before taking any action: `.agents/skills/playwright-cli/SKILL.md` and `.agents/skills/playwright-cli-bridge/SKILL.md`.
   - **STRICT NEGATIVE CONSTRAINT**: DO NOT create, write, or run custom `.js` or `.py` Playwright automation scripts. You MUST execute ONLY `.\bridge\pw-bridge.bat` CLI commands directly in the shell terminal (e.g. `.\bridge\pw-bridge.bat attach`, `.\bridge\pw-bridge.bat snapshot`, `.\bridge\pw-bridge.bat click`, `.\bridge\pw-bridge.bat eval`).
3. The subagent must attach to the browser using `.\bridge\pw-bridge.bat attach --cdp=http://localhost:9222` and perform live page interactions to verify the feature.
