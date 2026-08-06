---
name: pinchtab-account-setup
description: >
  How to configure PinchTab to always open with a specific Google account
  by giving it a dedicated, isolated Chrome User Data directory. Covers the
  correct architecture, all failed approaches to avoid, the one-time manual
  sign-in flow, and multi-account switching via a PowerShell script.
---

# PinchTab Account Setup & Switching

## Core Concept

PinchTab constructs its Chrome launch argument as:
```
--user-data-dir="<profiles.baseDir>\<profiles.defaultProfile>"
```

Chrome's **App-Bound Encryption** (DPAPI) ties cookie decryption to the **exact path string** of the profile directory. This means:
- You **cannot** copy/junction another profile's cookies in — Chrome will refuse to decrypt them.
- The only reliable way to have a persistent, specific Google account is to **sign into it once inside PinchTab's own isolated directory**, and let Chrome save the encrypted session there.

---

## Architecture: One Directory Per Account

Each Google account gets its own isolated Chrome User Data directory:

```
C:\Users\<user>\AppData\Local\Google\Chrome\
  ├── User Data\                         ← your real Chrome, untouched
  ├── PinchTab User Data\                ← account A (e.g. omargamalsvc@gmail.com)
  └── PinchTab User Data - oomarolayan\  ← account B (e.g. oomarolayan.gamal@gmail.com)
```

`config.json` always points at whichever account is currently active:
```json
"profiles": {
  "baseDir": "C:\\Users\\Omar\\AppData\\Local\\Google\\Chrome\\PinchTab User Data",
  "defaultProfile": "default"
}
```

---

## One-Time Setup for Each Account

### 1. Create the isolated directory
```powershell
New-Item -ItemType Directory -Path "C:\Users\Omar\AppData\Local\Google\Chrome\PinchTab User Data" -Force
```

### 2. Point `config.json` at it
Edit `C:\Users\Omar\AppData\Roaming\pinchtab\config.json`:
```json
"profiles": {
  "baseDir": "C:\\Users\\Omar\\AppData\\Local\\Google\\Chrome\\PinchTab User Data",
  "defaultProfile": "default",
  "quarantineKeep": 1
}
```

### 3. Start PinchTab (always via schtasks — see the GUI launch rule)
```powershell
schtasks /Run /TN "LaunchPinchTabGUI"
```

### 4. Sign in manually — ONE TIME ONLY
```powershell
pinchtab nav https://accounts.google.com/
```
Sign in to the target Google account inside the browser window.

### 5. Close Chrome **gracefully**
Click the **X** button on the browser window. Do NOT force-kill (`taskkill /F` or `Stop-Process -Force`).

> **Why**: Force-killing sets `"exit_type": "Crashed"` in Chrome's profile files. On next startup Chrome shows a Profile Chooser / Crash Restore bubble for 3-5 seconds before PinchTab suppresses it. A graceful close writes `"exit_type": "Normal"` and avoids this entirely.

The session is now permanently saved. Every future `pinchtab server` launch will open directly into this account.

---

## Multi-Account Switching

### The Switcher Script
Save this as `C:\Users\Omar\AppData\Roaming\pinchtab\switch-account.ps1`:

```powershell
param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("omargamalsvc", "oomarolayan")]
    [string]$Account
)

$configPath = "C:\Users\Omar\AppData\Roaming\pinchtab\config.json"
$accounts = @{
    "omargamalsvc"  = "C:\\Users\\Omar\\AppData\\Local\\Google\\Chrome\\PinchTab User Data"
    "oomarolayan"   = "C:\\Users\\Omar\\AppData\\Local\\Google\\Chrome\\PinchTab User Data - oomarolayan"
}

$baseDir = $accounts[$Account]

# Stop PinchTab and Chrome
Get-Process chrome,pinchtab-windows-amd64 -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# Patch config.json
$config = Get-Content $configPath -Raw | ConvertFrom-Json
$config.profiles.baseDir = $baseDir
$config | ConvertTo-Json -Depth 20 | Set-Content $configPath -Encoding UTF8

# Relaunch PinchTab
schtasks /Run /TN "LaunchPinchTabGUI" | Out-Null
Write-Host "Switched to: $Account ($baseDir)" -ForegroundColor Green
```

### Usage
```powershell
& "C:\Users\Omar\AppData\Roaming\pinchtab\switch-account.ps1" -Account omargamalsvc
& "C:\Users\Omar\AppData\Roaming\pinchtab\switch-account.ps1" -Account oomarolayan
```

### Adding a New Account
1. Create a new directory: `PinchTab User Data - <nickname>\`
2. Add it to the `$accounts` hashtable in `switch-account.ps1`
3. Switch to it, sign in once, close gracefully — done forever

---

## Known Accounts (Omar's Machine)

| Nickname | Email | Directory |
|---|---|---|
| `omargamalsvc` | omargamalsvc@gmail.com | `PinchTab User Data\` |
| `oomarolayan` | oomarolayan.gamal@gmail.com | `PinchTab User Data - oomarolayan\` |

---

## ❌ Failed Approaches — DO NOT Repeat

### 1. `.cmd` wrapper as `browser.binary`
Setting `browser.binary` in `config.json` to a `.cmd` script. PinchTab validates the binary is a real browser executable and **silently ignores** `.cmd` wrappers, falling back to the system `chrome.exe`.

### 2. Windows Junction `default → Profile X`
Creating an NTFS junction so `User Data\default` points to `Profile 7`. Chrome's App-Bound Encryption validates the **path string** at decryption time. Even though the files are physically identical, Chrome sees `\default` not `\Profile 7` and refuses to decrypt the cookies → loads as guest/no account.

### 3. Bridge mode with `--profile-directory`
Launching Chrome manually with `--profile-directory="Profile 7"` then attaching `pinchtab bridge --cdp-attach`. If any other Chrome window is already open on the desktop, Chrome **delegates** the new launch to the existing process, so CDP port 9869 never opens and PinchTab falls back to auto-launching its own Chrome with the default profile.

### 4. Copying profile files across directories
Copying cookies/session files from `Profile 7` into `default`. Chrome's DPAPI encryption is tied to the signed Chrome binary + OS user session + profile path. File copies do not transfer the decrypted session — they are unreadable in the new path.

---

## Important Notes

### Stopping processes correctly
The PinchTab daemon process name is `pinchtab-windows-amd64` (NOT `pinchtab`). Always stop with:
```powershell
Get-Process chrome,pinchtab-windows-amd64 -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
```

### PinchTab must be started via schtasks
Per the GUI launch rule, always use `schtasks /Run /TN "LaunchPinchTabGUI"` — never run `pinchtab server` directly from a subshell. Direct subshell launches are invisible desktop sessions that cause `0xc0000142` errors.

### The Profile Chooser bubble (3-5 second delay on startup)
This happens when Chrome was previously force-killed (sets `exit_type: Crashed`). It is harmless — PinchTab suppresses it automatically. Prevent it by always closing Chrome gracefully via the X button.
