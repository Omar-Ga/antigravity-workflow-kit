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
   Invoke-RestMethod -Uri "http://localhost:9867/health" -Headers @{ Authorization = "Bearer <token>" }
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
