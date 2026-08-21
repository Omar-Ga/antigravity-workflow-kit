---
trigger: model_decision
description: MUST be activated WHENEVER starting, initializing, or opening PinchTab server or a PinchTab browser for ANY web automation task on Windows. Mandates using Windows Task Scheduler (schtasks) as the initial launcher, enforcing single-browser instance discipline, and using the default 'omargamalsvc' profile.
---

# Interactive GUI Desktop Launcher & Single-Instance Rule (Windows)

When a task requires launching or interacting with PinchTab or Brave on Windows:

## 1. Single Browser & Default Profile Constraint (Strict)
- **Single Instance Discipline**: NEVER open or spawn multiple browser windows or instances unless the user EXPLICITLY requests multiple browsers.
- **Default Profile**: ALWAYS use the **`omargamalsvc`** (`omargamalsvc@gmail.com`) profile by default.
  - Launch command: `pinchtab instance start --mode headed --profile omargamalsvc`
  - Never launch without `--profile omargamalsvc` (which creates throwaway ephemeral profiles).
- **Targeting / Port Pinning Discipline**:
  - Always check running instances first: `pinchtab instances --json`
  - When an instance is active (e.g. on port 9868), **ALWAYS** prefix all commands with `--server http://127.0.0.1:<port>` (e.g., `pinchtab --server http://127.0.0.1:9868 nav <url>`).
  - **NEVER** run bare `pinchtab nav <url>` without `--server http://127.0.0.1:<port>` when an instance exists, as bare `nav` triggers auto-start of a secondary browser window.

## 2. Background & Problem Context
Commands executed inside agent background subshells inherit non-interactive window attributes (`SW_HIDE`). While headful browser processes render in memory, Windows hides the window from the user's foreground desktop. Attempting `cmd.exe /c start` from background subshells triggers application error `0xc0000142`.

## 3. Mandatory Launcher Workflow
Whenever starting a visible GUI server or browser process on Windows from an agent:

1. **Launch Server via Windows Task Scheduler (`schtasks`)**:
   Schedule and immediately execute a task to run the server directly inside the active user desktop session (`WinSta0\Default`):
   ```powershell
   schtasks /Create /TN "LaunchPinchTabGUI" /TR "pinchtab server" /SC ONCE /ST 23:59 /F
   schtasks /Run /TN "LaunchPinchTabGUI"
   ```

2. **Verify Server Health Endpoint**:
   Confirm that the server is up:
   ```powershell
   $token = (Get-Content "$env:APPDATA\pinchtab\config.json" -Raw | ConvertFrom-Json).server.token
   Invoke-RestMethod -Uri "http://127.0.0.1:9867/health" -Headers @{ Authorization = "Bearer $token" }
   ```

3. **Check/Start Single Instance with `omargamalsvc`**:
   ```powershell
   # Check if omargamalsvc is already running
   pinchtab instances --json
   # If not running, start exactly one instance:
   pinchtab instance start --mode headed --profile omargamalsvc
   ```

4. **Target the Instance Explicitly**:
   Identify the instance port (e.g., 9868) and route all subsequent commands to it:
   ```powershell
   pinchtab --server http://127.0.0.1:9868 nav <url> --snap
   pinchtab --server http://127.0.0.1:9868 click <ref> --snap-diff
   ```

## 4. Tab Management & Clean Startup
All PinchTab Brave profiles (`omargamalsvc`, `islorian`, `oomarolayan`) are configured with `restore_on_startup: 1` and `"instanceDefaults": { "noRestore": true }` to always start with 1 clean tab and prevent accumulating stale tabs across sessions.

## 5. Manual Sign-In / CAPTCHA Bypass Workflow (Clean Standalone Mode)
When an automated sign-in, sign-up, Google OAuth, 2FA, passkey, or Cloudflare challenge cannot be completed automatically by PinchTab (e.g. anti-bot scripts silently drop automated CDP clicks or disable buttons):

### Usage Constraint (Strict)
The manual standalone helper script is **NOT to be used unless explicitly requested by the user, or when an automated sign-in is blocked and requires manual user intervention**.

### Execution Protocol
1. **Stop Active Instances to Release Lockfile**:
   ```powershell
   Get-Process brave,pinchtab-windows-amd64 -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
   ```
2. **Launch Standalone Clean Brave via Task Scheduler**:
   Run `launch-manual-auth.ps1` with NO remote debugging / NO CDP flags:
   ```powershell
   schtasks /Create /TN "LaunchManualBrave" /TR 'powershell.exe -ExecutionPolicy Bypass -File "%APPDATA%\pinchtab\launch-manual-auth.ps1" -Profile omargamalsvc -Url "<target_url>"' /SC ONCE /ST 23:59 /F
   schtasks /Run /TN "LaunchManualBrave"
   ```
3. **Notify the User**:
   Tell the user that the standalone Brave window is open for the specified profile. Instruct them to complete the sign-in / verification, close the window, and say *"I'm done"* in chat.
4. **Resume PinchTab Upon Confirmation**:
   When the user confirms they are done:
   - Ensure the standalone Brave window is closed.
   - Start the PinchTab GUI server: `schtasks /Run /TN "LaunchPinchTabGUI"`
   - Start the instance: `pinchtab instance start --mode headed --profile omargamalsvc`
   - Re-target the instance port and resume normal automated operation on the authenticated session.
