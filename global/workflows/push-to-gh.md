---
description: Used for when the user wants to push code changes to GitHub, including staging, committing, and pushing.
---
# Push to GitHub Workflow

This workflow ensures a safe and standard process for staging, committing, and pushing code changes to a GitHub repository.

1. **Check Status:** Run `git status` to see what files have been modified, added, or deleted. Review the output to ensure no unintended files are included.
2. **Review Changes:** Run `git diff` to review the exact code changes before staging them, ensuring everything is correct.
3. **Stage Files:** 
   - To stage specific files: `git add <file1> <file2>`
   - To stage all changes: `git add .`
4. **Commit:** Run `git commit -m "feat/fix/docs: descriptive commit message"`. Ensure the commit message is clear, concise, and accurately describes the changes made.
5. **Push:** Run `git push origin <branch-name>` (e.g., `main`, `master`, or your current working branch) to push the local commits to the remote GitHub repository.
