---
name: playwright-cli-bridge
description: Guide for browser automation through the pw-bridge.bat persistent CLI bridge. Use whenever the task involves navigating, clicking, filling forms, running JavaScript in a live browser, or extracting data from a page — all through the playwright-cli bridge rather than writing custom scripts.
---

# Playwright CLI Bridge

The bridge (`pw-bridge.bat`) connects `playwright-cli` to an **already-running browser** via Chrome DevTools Protocol (CDP). It proxies all `playwright-cli` commands through a persistent bridge server, so the AI can automate a browser the user already has open.

> ⚙️ **Setup required:** Set up the `bridge/` directory (containing `pw-bridge.bat`, `pw-bridge.ps1`, `pw_bridge_server.py`, `launch_brave_rp.bat`) in your project or workspace working directory `<BRIDGE_DIR>` (e.g. `d:\AI` or `.\bridge`).

**For the full command reference and all capabilities, read the `playwright-cli` skill at `.agents/skills/playwright-cli/SKILL.md`.** That skill is the authoritative guide — this document only covers how to set up and route commands through the bridge.

---

## How It Works

```
AI  →  pw-bridge.bat <command>  →  bridge server (localhost:8080)  →  browser (CDP :9222)
```

Every `playwright-cli` command works identically through the bridge. The only difference is the command prefix:

| Direct CLI | Through bridge |
|---|---|
| `playwright-cli snapshot` | `.\pw-bridge.bat snapshot` |
| `playwright-cli click e5` | `.\pw-bridge.bat click e5` |
| `playwright-cli goto https://example.com` | `.\pw-bridge.bat goto https://example.com` |
| `playwright-cli --raw eval "document.title"` | `.\pw-bridge.bat --raw eval "document.title"` |

**The command syntax is identical.** Only the binary name changes. All flags, options, selectors, and `--raw` mode work the same way.

---

## When to Use the Bridge vs. Direct CLI

| Scenario | Use |
|---|---|
| User has a browser already open (logged in, authenticated, specific state) | **Bridge** — attach to it via CDP |
| Fresh automation from scratch (no existing browser needed) | **Direct CLI** — `playwright-cli open` |
| Accessing a site that requires the user's cookies/session | **Bridge** — inherits the live browser's auth |
| Running tests or generating test code | **Direct CLI** — use `playwright-cli` directly |

---

## Setup — Attaching to a Running Browser

### Step 1 — Verify browser debug session

```powershell
try {
    Invoke-WebRequest -Uri "http://localhost:9222/json/version" -TimeoutSec 3 -ErrorAction Stop
    Write-Output "Browser debug session found."
} catch {
    Write-Output "No browser debug session found."
}
```

- **If it succeeds:** Proceed to Step 2.
- **If it fails:** Ask the user to open their browser in debug mode:
  > *"Please open the browser with remote debugging enabled (e.g., run `launch_brave_rp.bat` from `<BRIDGE_DIR>` or start the browser with `--remote-debugging-port=9222`). Let me know when it's ready."*

### Step 2 — Start bridge server and attach

```powershell
# Start bridge server if not already running
try {
    Invoke-WebRequest -Uri "http://127.0.0.1:8080/health" -TimeoutSec 3 -ErrorAction Stop
} catch {
    Start-Process python -ArgumentList "<BRIDGE_DIR>\pw_bridge_server.py" -WindowStyle Hidden
    Start-Sleep -Seconds 2
}

# Attach to the browser
.\pw-bridge.bat attach --cdp=http://localhost:9222
```

After this, all `pw-bridge.bat` commands will route to the attached browser.

---

## Rules

1. **Use the `playwright-cli` skill for everything.** That skill has the full command reference, all examples, all patterns, all reference docs. This skill only tells you how to connect.
2. **Replace `playwright-cli` with `.\pw-bridge.bat`** in all commands when working through the bridge. The syntax is identical otherwise.
3. **Never write custom Python/JS scripts** to automate the browser. The CLI already has `run-code`, `eval`, `screenshot`, `requests`, and everything else you need.
4. **All bridge commands run from `<BRIDGE_DIR>`** — where `pw-bridge.bat` lives.
5. **Always snapshot after actions** to verify page state before proceeding.
