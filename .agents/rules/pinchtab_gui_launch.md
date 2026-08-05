---
trigger: model_decision
description: MUST be activated WHENEVER starting, initializing, or opening PinchTab server or a PinchTab browser for ANY web automation task on Windows. Mandates using Windows Task Scheduler (schtasks) as the initial launcher to open PinchTab in a visible interactive desktop session, bypassing background subshell process isolation (SW_HIDE) and preventing 0xc0000142 application errors.
---

# Interactive GUI Desktop Launcher Rule (Windows)

When a task requires launching an interactive, headful GUI application or server (such as `pinchtab server` or Chrome in headed mode) that must be visible on the user's desktop screen on Windows:

## Background & Problem Context
Commands executed inside agent background subshells inherit non-interactive window attributes (`SW_HIDE`). While headful browser processes render in memory, Windows hides the window from the user's foreground desktop. Attempting `cmd.exe /c start` from background subshells triggers application error `0xc0000142`.

## Mandatory Launcher Workflow
Whenever starting a visible GUI server or browser process on Windows from an agent:

1. **Launch via Windows Task Scheduler (`schtasks`)**:
   Schedule and immediately execute a task to run the command directly inside the active user desktop session (`WinSta0\Default`):
   ```powershell
   schtasks /Create /TN "LaunchPinchTabGUI" /TR "pinchtab server" /SC ONCE /ST 23:59 /F
   schtasks /Run /TN "LaunchPinchTabGUI"
   ```

2. **Verify Health Endpoint**:
   Confirm that the server is up by querying the local API:
   ```powershell
   Invoke-RestMethod -Uri "http://localhost:9867/health" -Headers @{ Authorization = "Bearer <token>" }
   ```

3. **Resume Standard Tool Operations**:
   Once the server process is active in the desktop session, proceed with standard MCP tools (`pinchtab_navigate`, `pinchtab_click`, `pinchtab_snapshot`, etc.).
