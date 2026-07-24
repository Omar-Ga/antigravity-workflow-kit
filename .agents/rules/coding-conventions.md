---
trigger: always_on
description: Strict coding conventions enforcing high code quality, strict typing, and structured formatting for all codebase files.
---

# Strict Coding Conventions

This project enforces strict coding conventions. All developers (human and AI) must adhere to these rules to maintain high code quality, predictability, and consistency. These rules apply regardless of language or framework.

## 1. Strict Typing
- Use your language's type system wherever it exists. Type annotations are **mandatory** for all function arguments and return values.
- Be explicit — avoid generic or dynamic types (`any`, `object`, untyped dicts) unless absolutely necessary and documented.
- Examples by language:
  - **Python**: `def fetch_user(user_id: int) -> Optional[Dict[str, str]]:`
  - **TypeScript**: `function fetchUser(userId: number): Promise<User | null>`
  - **Go**: function signatures with explicit types
- If your language has no formal type system, use JSDoc, docstrings, or comments to make intent explicit.

## 2. Naming Conventions
- Follow the idiomatic naming convention of your language. Do not invent project-specific casing rules that fight the language defaults.
  - **Python**: `snake_case` for functions/variables/modules, `PascalCase` for classes, `UPPER_SNAKE_CASE` for constants
  - **TypeScript/JavaScript**: `camelCase` for functions/variables, `PascalCase` for classes/components, `UPPER_SNAKE_CASE` for constants
  - **Go**: `camelCase` for unexported, `PascalCase` for exported
- Descriptive names only. No single-letter variables except loop counters (`i`, `j`, `k`).
- No abbreviations unless they are universally understood in the domain (`id`, `url`, `api` are fine; `usr`, `cfg`, `mgr` are not).

## 3. Architecture & Single Responsibility
- **One purpose per file/class/function**. If a function does two things, split it.
- **File & Folder Organization**: Structure must be immediately obvious. A new developer should be able to navigate the project without asking questions.
- **No Monolithic Files**: Never create massive, monolithic files. Break logic into modular components.
- **Separation of Concerns**: Keep business logic, data access, and interface layers strictly separated.
  - Frontend and backend code live in distinct, separate top-level folders (e.g., `frontend/` and `backend/`). Never mix them.
  - Routing/controllers do not contain business logic. Services do not contain database queries directly. Data access is isolated.

## 4. Documentation & Comments
- **Docstrings/JSDoc**: Required for every class, module, and public function.
  - Must include: description, parameters (name + type + purpose), and return value.
- **Inline Comments**: Explain *why*, not *what*. Code should be self-documenting for the *what*.
- No commented-out dead code committed to the repository.

## 5. Error Handling
- Never silently swallow errors. Every caught exception must either be re-raised, logged, or explicitly handled with a documented reason.
- Never use bare catch-all exception handlers without specificity.
- Use custom exception/error types where appropriate for domain errors.
- Log errors using a proper logging framework — never use `print()`, `console.log()`, or equivalent for production error reporting.

## 6. Code Style & Formatting
- Use the idiomatic formatter for your language and run it consistently:
  - **Python**: `black` + `flake8` / `ruff`
  - **TypeScript/JavaScript**: `prettier` + `eslint`
  - **Go**: `gofmt`
- Remove all unused imports and variables before committing.
- No magic numbers or hardcoded strings. Define them as named constants with clear intent.
- Maximum line length follows your formatter's default unless a project-wide override is documented.

## 7. State and Side Effects
- Favor pure functions — given the same inputs, always produce the same outputs with no side effects.
- Minimize global/module-level mutable state.
- Side effects (network calls, file writes, DB mutations) must be explicit and isolated — never hidden inside what looks like a read-only function.

## 8. Documentation Maintenance (PRD & Tasks)
- **Task Tracking (`docs/TASKS.md`)**: Tasks are marked complete only when the user explicitly instructs it. Never pre-check tasks.
- **PRD Synchronization (`docs/PRD.md`)**: Before adding or modifying any API endpoints, read the PRD's API section to avoid duplication. If an endpoint changes, update the PRD immediately.

---

**IMPORTANT:** Before generating or reviewing code, verify compliance with all rules above. When in doubt, the stricter interpretation applies.
