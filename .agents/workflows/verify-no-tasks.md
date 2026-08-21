---
description: Run a global, unbiased verification using a subagent — not tied to any specific phase or task file.
---

Spawn a subagent with a QA engineer persona. Do NOT tell it what was just built or changed rather only tell it the features it should be testing. — keep it completely in the dark about recent implementation work so it tests with zero bias. Its job is to test the feature in question, and report back any bugs, broken flows, inconsistencies, or regressions it finds. Let it form its own picture entirely from the code.

If the user's request mentions or implies browser automation or UI testing:
1. You MUST first call `define_subagent` to register a specialized QA subagent with `enable_write_tools: true` so it is equipped with `run_command` terminal tools to execute browser commands.
2. Direct the subagent to read the PinchTab skill instructions before taking any action: `.agents/skills/pinchtab/SKILL.md` (and adhere strictly to `.agents/rules/pinchtab_gui_launch.md`).
3. The subagent must interact with the live browser instance via PinchTab to verify the feature.
