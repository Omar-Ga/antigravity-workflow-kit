---
description: Authoritative guide and structure for creating rules, workflows, and skills within the Antigravity agent context.
---

# Create Customization

This workflow is the definitive guide on how to structure rules, workflows, and skills in Antigravity. You must adhere to these folder structures, formats, and trigger patterns when a user asks you to create a customization.

## Customization Roots
All customizations exist within a customization root:
1. **Global Customizations Root**: `C:\Users\Omar\.gemini\config` (Applies to all projects)
2. **Workspace Customizations Root**: `.agents` relative to the workspace root. (Applies only to the current project). ALWAYS default to this unless the user explicitly asks for a global rule.

---

## 1. Rules
**Purpose:** Rules define behavioral constraints, style guidelines, and non-negotiable instructions that the AI must follow.

### Option A: Appended to `AGENTS.md` (Legacy / Combined)
- **Project-scoped:** `.agents/AGENTS.md`
- **Global:** `C:\Users\Omar\.gemini\config\AGENTS.md`
- **Format:** Always wrap individual rules with XML-style comments for easy parsing and modification:
```markdown
<!-- BEGIN:my-custom-rule -->
# My Custom Rule
Explain the rule concisely. Use absolute constraints like NEVER and ALWAYS.
<!-- END:my-custom-rule -->
```

### Option B: Individual Rule Files (Modern / Modular)
- **Project-scoped:** `.agents/rules/<rule-name>.md`
- **Global:** `C:\Users\Omar\.gemini\config\global_rules/<rule-name>.md`
- **Trigger Pattern:** Rules in the `rules/` folder must use the `always_on` trigger in their YAML frontmatter so the agent automatically loads them for every prompt:
```markdown
---
trigger: always_on
---

# Rule Title
Behavioral constraints go here...
```

---

## 2. Workflows
**Purpose:** Workflows are step-by-step, actionable guides for executing complex or specialized tasks.

- **Project-scoped:** `.agents/workflows/<workflow-name>.md`
- **Global:** `C:\Users\Omar\.gemini\config\global_workflows/<workflow-name>.md`
- **Trigger Pattern:** Workflows are loaded dynamically based on description matching or manually invoked via slash commands (e.g. `/<workflow-name>`). They must begin with YAML frontmatter containing a `description`:
```markdown
---
description: Describe exactly when this workflow should be recommended or used. (e.g., "used for when the user requires the creation of rules")
---
# Workflow Title

1. **Step One:** Do this.
2. **Step Two:** Do that.
```

---

## 3. Skills
**Purpose:** Complex extensions grouping instructions, scripts, or examples. Use when a rule or workflow is insufficient.

- **Project-scoped:** `.agents/skills/<skill-name>/`
- **Global:** `C:\Users\Omar\.gemini\config\skills/<skill-name>/`
- **Trigger Pattern:** Skills are matched dynamically by name and description. The skill directory **must** contain a `SKILL.md` file with `name` and `description` YAML frontmatter:
```markdown
---
name: skill-unique-name
description: Explicitly list keywords/contexts that should trigger this skill.
---
# Skill Instructions
Detailed capabilities and instructions...
```
*Note: Supporting folders like `scripts/`, `examples/`, `resources/`, or `references/` can be added inside the skill directory.*

### Advanced: `skills.json` (Manual Registration)
If you need to load skills from non-standard folders or manage exclusions, use a `skills.json` file in the customization root:
```json
{
  "entries": [
    { "path": "path/to/custom/skills" }
  ],
  "inherits": [
    { "path": "path/to/shared/skills.json" }
  ],
  "exclude": ["some_skill_to_ignore"]
}
```
