---
description: Run integration and verification using an unbiased subagent.
---

Locate the phase number provided in the user's prompt (e.g., if the user types "3", the phase is 3). Read `docs/TASKS.md` to find the "Integration and Verification" checkpoint specifically for that phase. Run a subagent with the proper persona to execute only that specific integration and verification checkpoint. Do not verify any other integrations or checkpoints outside of the phase the user chose. Keep the subagent in the dark without giving it information about the implementation done so far, so that it is as unbiased as possible and does true testing.

If the user's request mentions or implies using Playwright, browser automation, or the Playwright CLI bridge, you MUST explicitly include in the subagent's prompt a directive to use `view_file` to read both skill instruction files before taking any action:
1. `.agents/skills/playwright-cli/SKILL.md`
2. `.agents/skills/playwright-cli-bridge/SKILL.md`
Instruct the subagent to read both SKILL.md files first so it uses native, interactive Playwright CLI commands (`snapshot`, `click`, `fill`, `goto`) through `.\bridge\pw-bridge.bat` rather than writing custom scratch scripts.
