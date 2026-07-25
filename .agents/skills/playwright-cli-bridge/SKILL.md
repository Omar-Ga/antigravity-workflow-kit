---
name: playwright-cli-bridge
description: Guide for browser automation through the pw-bridge.bat persistent CLI bridge. Use whenever the task involves navigating, clicking, filling forms, running JavaScript in a live browser, or extracting data from a page — all through the playwright-cli bridge rather than writing custom scripts.
---

# Playwright CLI Bridge

The bridge (`pw-bridge.bat`) connects `playwright-cli` to the **user's visible browser** via Chrome DevTools Protocol (CDP). It proxies all `playwright-cli` commands through a persistent bridge server.

> 📍 **Bridge Location:** The bridge files (`pw-bridge.bat`, `pw-bridge.ps1`, `pw_bridge_server.py`, `launch_brave_rp.bat`) are located in the `./bridge/` folder at the root of the project.

**For the full command reference and all capabilities, read the `playwright-cli` skill at `.agents/skills/playwright-cli/SKILL.md`.** That skill is the authoritative guide — this document only covers how to set up and route commands through the bridge.

---

## CRITICAL RULES — Read First

1. **ALWAYS use the bridge.** Every browser command goes through `.\bridge\pw-bridge.bat`. Never use `playwright-cli` directly, never use `npx playwright`, never use `npx` anything. The bridge is the only way to interact with the browser.
2. **NEVER launch your own browser.** Do not use `playwright-cli open` or `.\bridge\pw-bridge.bat open`. The user will launch their own browser with `launch_brave_rp.bat`. You only **attach** to it.
3. **NEVER fall back to npx.** If the bridge or browser is not available, **stop and ask the user**. Do not attempt `npx playwright`, `npx --no-install`, or any npm-based workaround.
4. **NEVER write custom scripts** to automate the browser. The CLI provides everything you need.
5. **Always snapshot after actions** to verify page state before proceeding.

---

## How It Works

```
AI  →  .\bridge\pw-bridge.bat <command>  →  bridge server (localhost:8080)  →  user's browser (CDP :9222)
```

Every `playwright-cli` command works identically through the bridge. Replace `playwright-cli` with `.\bridge\pw-bridge.bat`:

| In the docs | What you actually run |
|---|---|
| `playwright-cli snapshot` | `.\bridge\pw-bridge.bat snapshot` |
| `playwright-cli click e5` | `.\bridge\pw-bridge.bat click e5` |
| `playwright-cli goto https://example.com` | `.\bridge\pw-bridge.bat goto https://example.com` |
| `playwright-cli --raw eval "document.title"` | `.\bridge\pw-bridge.bat --raw eval "document.title"` |

---

## Setup — Attaching to the User's Browser

### Step 1 — Check if browser debug port is open

Use a quick TCP port check. **Do NOT use `Invoke-WebRequest`** — it hangs on refused connections in PowerShell.

```powershell
$tcp = New-Object System.Net.Sockets.TcpClient
try {
    $tcp.Connect("127.0.0.1", 9222)
    $tcp.Close()
    Write-Output "Browser debug session found on port 9222."
} catch {
    Write-Output "No browser debug session found on port 9222."
}
```

- **If it succeeds:** Proceed to Step 2.
- **If it fails:** Stop and ask the user:
  > *"I don't see a browser running with remote debugging. Please run `.\bridge\launch_brave_rp.bat` to open Brave with the debug port, then let me know when it's ready."*

  **Do NOT try to launch the browser yourself. Do NOT fall back to npx or playwright-cli open. Wait for the user.**

### Step 2 — Start bridge server and attach

```powershell
# Check if bridge server is running (quick TCP check, same pattern)
$tcp = New-Object System.Net.Sockets.TcpClient
try {
    $tcp.Connect("127.0.0.1", 8080)
    $tcp.Close()
    Write-Output "Bridge server already running."
} catch {
    Write-Output "Starting bridge server..."
    Start-Process python -ArgumentList ".\bridge\pw_bridge_server.py" -WindowStyle Hidden
    Start-Sleep -Seconds 2
}

# Attach to the user's browser
.\bridge\pw-bridge.bat attach --cdp=http://localhost:9222
```

After this, all `.\bridge\pw-bridge.bat` commands will route to the user's visible browser. The user will see every action — clicks, navigations, form fills — happen in their actual browser window.

---

## Quick Reference

```powershell
.\bridge\pw-bridge.bat attach --cdp=http://localhost:9222   # Attach to user's browser
.\bridge\pw-bridge.bat snapshot                              # Dump accessibility tree
.\bridge\pw-bridge.bat goto <url>                            # Navigate
.\bridge\pw-bridge.bat click <ref>                           # Click element
.\bridge\pw-bridge.bat fill <ref> "<value>"                  # Fill input
.\bridge\pw-bridge.bat hover <ref>                           # Hover element
.\bridge\pw-bridge.bat find "<text>"                         # Search snapshot
.\bridge\pw-bridge.bat eval "document.title"                 # Run JS expression
.\bridge\pw-bridge.bat requests                              # List network requests
.\bridge\pw-bridge.bat screenshot                            # Take screenshot
.\bridge\pw-bridge.bat --raw eval "<expr>"                   # Raw output (no formatting)
```

For the complete command set (tabs, storage, network mocking, tracing, video, etc.), read `.agents/skills/playwright-cli/SKILL.md`.
