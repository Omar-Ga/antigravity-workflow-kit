---
name: pinchtab-manual-auth
description: >
  Launch standard, un-monitored Chrome inside a PinchTab isolated user profile directory
  to allow human manual login (including "Sign in with Google" 3rd-party OAuth flows on sites
  like Canva, ChatGPT, Figma, Notion) without automation debugging flags blocking the login popup.
---

# PinchTab Manual Authentication Skill

## Purpose
Google blocks 3rd-party OAuth popups ("Sign in with Google" on Canva, ChatGPT, Figma, Notion) when Chrome is running under automated debugging flags (`--remote-debugging-port`).

This skill allows the agent to launch standard, un-monitored Chrome directly into a PinchTab isolated user profile folder so the user can interactively perform "Sign in with Google" or 3rd-party logins with their physical mouse/keyboard. Once finished, the agent relaunches PinchTab, inheriting all newly authenticated site sessions.

---

## Workflow

### Step 1 — Stop PinchTab & Launch Manual Chrome
Execute the PowerShell script `.agents/skills/pinchtab-manual-auth/scripts/launch-manual-auth.ps1` (or run inline):

```powershell
# Stop active PinchTab and Chrome processes
Get-Process chrome,pinchtab-windows-amd64 -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# Read active profile baseDir from config.json
$config = Get-Content "$env:APPDATA\pinchtab\config.json" -Raw | ConvertFrom-Json
$targetDir = $config.profiles.baseDir

# Launch standard Chrome without debugging flags
Start-Process "C:\Program Files\Google\Chrome\Application\chrome.exe" -ArgumentList "--user-data-dir=`"$targetDir`""
```

### Step 2 — Notify the User
Tell the user:
> *"I have opened Chrome manually targeting your PinchTab profile folder (`<targetDir>`). You can now log into any website (including 'Sign in with Google' on Canva, ChatGPT, Figma, etc.). When you're finished logging in and close Chrome, reply with **'I'm done'** so I can relaunch PinchTab."*

### Step 3 — Relaunch PinchTab on User Completion
When the user replies that they are finished:

```powershell
schtasks /Run /TN "LaunchPinchTabGUI"
```

All 3rd-party authenticated sessions are now saved inside the PinchTab profile and available for automated tasks.
