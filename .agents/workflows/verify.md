---
description: Run integration and verification using an unbiased subagent.
---

Locate the phase number provided in the user's prompt (e.g., if the user types "3", the phase is 3). Read `docs/TASKS.md` to find the "Integration and Verification" checkpoint specifically for that phase. Run a subagent with the proper persona to execute only that specific integration and verification checkpoint. Do not verify any other integrations or checkpoints outside of the phase the user chose. Keep the subagent in the dark without giving it information about the implementation done so far, so that it is as unbiased as possible and does true testing.

If the user's request mentions or implies using Playwright, browser automation, or the Playwright CLI bridge:
1. You MUST first call `define_subagent` to register a specialized QA subagent with `enable_write_tools: true` so it is equipped with `run_command` terminal tools to execute `.\bridge\pw-bridge.bat`.
2. You MUST explicitly include in the subagent's prompt a non-negotiable directive to use `view_file` to read both skill instruction files before taking any action:
   - `.agents/skills/playwright-cli/SKILL.md`
   - `.agents/skills/playwright-cli-bridge/SKILL.md`
   Reading both skill instruction files first is non-negotiable.
3. The subagent must attach to the browser using `.\bridge\pw-bridge.bat attach --cdp=http://localhost:9222` and perform live page interactions to verify the checkpoint.

