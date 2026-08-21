---
description: Run integration and verification using an unbiased subagent.
---

Locate the phase number provided in the user's prompt (e.g., if the user types "3", the phase is 3). Read `docs/TASKS.md` to find the "Integration and Verification" checkpoint specifically for that phase. Run a subagent with the proper persona to execute only that specific integration and verification checkpoint. Do not verify any other integrations or checkpoints outside of the phase the user chose. Keep the subagent in the dark without giving it information about the implementation done so far, so that it is as unbiased as possible and does true testing.

If the user's request mentions or implies browser automation or UI verification:
1. You MUST first call `define_subagent` to register a specialized QA subagent with `enable_write_tools: true` so it is equipped with `run_command` terminal tools to execute browser commands.
2. Direct the subagent to read the PinchTab skill instructions before taking any action: `.agents/skills/pinchtab/SKILL.md` (and adhere strictly to `.agents/rules/pinchtab_gui_launch.md`).
3. The subagent must interact with the live browser instance via PinchTab to verify the checkpoint.
