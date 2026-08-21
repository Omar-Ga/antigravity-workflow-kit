---
name: pinchtab-account-setup
description: >
  How to configure PinchTab to always open with a specific Google account
  by giving it a dedicated, isolated browser User Data directory. Covers the
  correct architecture (Brave + named profiles registered via the HTTP API),
  all failed approaches to avoid, the one-time manual sign-in flow, and
  multi-account switching.
---

# PinchTab Account Setup & Switching

## Browser: Brave (not Chrome)

PinchTab runs on **Brave**, configured via `browser.binary` in
`C:\Users\Omar\AppData\Roaming\pinchtab\config.json`:

```json
"browser": {
  "binary": "C:\\Users\\Omar\\AppData\\Local\\BraveSoftware\\Brave-Browser\\Application\\brave.exe"
}
```

Why Brave over Chrome/Edge (verified empirically on pinchtab 0.15.1, 2026-08-20):

- PinchTab's Brave launch profile ships **bubble-suppression flags** natively:
  `--hide-crash-restore-bubble`, `--disable-session-crashed-bubble`,
  `--noerrdialogs` — kills the profile-picker / crash-restore windows that
  plagued Chrome.
- Better stealth defaults out of the box: `--disable-automation`,
  `--enable-automation=false`, `--disable-blink-features=AutomationControlled`.
- Brave is Chromium — DPAPI/App-Bound Encryption, isolated `--user-data-dir`,
  and one-time sign-in persistence behave identically to Chrome.
- Chrome's real profile picker used to open as a separate window because
  Chrome fell back to the real `User Data\`; with Brave + named profiles this
  never happens.

After changing `browser.binary`, restart the server (via schtasks — see below).

## Core Concept

Each PinchTab instance launches with:

```
--user-data-dir="<profiles.baseDir>\<profileDir>"
```

Chromium's **App-Bound Encryption** (DPAPI) ties cookie decryption to the
**exact path string** of the profile directory. This means:

- You **cannot** copy/junction another profile's cookies in — the browser will
  refuse to decrypt them.
- The only reliable way to have a persistent, specific Google account is to
  **sign into it once inside PinchTab's own isolated directory**, and let the
  browser save the encrypted session there.
- The directory must be **stable across launches** — see the named-profile
  section below. This is the whole ballgame for persistence.

## Critical: Named profiles (fixes the ephemeral instance dir)

**The bug:** if PinchTab's profile registry is empty, `pinchtab instance start`
creates a throwaway `instance-<timestamp>` directory under `profiles.baseDir`
every single launch. Every session is a blank slate — logins never persist.

**The fix:** register a **named profile** via the server's HTTP API. The CLI has
no `profiles create` subcommand (only `profiles` / `profiles prune`), so use:

```powershell
$token = (Get-Content "$env:APPDATA\pinchtab\config.json" -Raw | ConvertFrom-Json).server.token
$h = @{ Authorization = "Bearer $token" }
Invoke-RestMethod -Uri "http://127.0.0.1:9867/profiles" -Method Post -Headers $h `
  -ContentType "application/json" -Body '{"name":"islorian"}'
```

Response:

```json
{"id":"prof_f3dfeebe","name":"islorian","status":"created"}
```

This creates a **stable** directory at `<profiles.baseDir>\prof_<id>` (e.g.
`...\PinchTab User Data - islorian\prof_f3dfeebe`) and registers it. From then
on, ALWAYS launch with the profile name:

```powershell
pinchtab instance start --mode headed --profile islorian
```

Verified behavior: stop → start again with `--profile islorian` reuses the
**same** `--user-data-dir` (confirmed via brave.exe command line across
restarts). No more `instance-<timestamp>` dirs.

Notes:

- `POST /profiles` accepts only `{"name": "..."}`. Extra fields like `baseDir`
  return 409; unknown fields return 400.
- `instance start --profile <name>` returns `Error 404: profile "<name>" not
  found` if the registry is empty — register first.
- The old `profiles.defaultProfile` config key and the `--profile default`
  convention from pinchtab ≤0.14 no longer work on 0.15.1 (404). Use named
  profiles.

## Architecture: One Named Profile Per Account

```
C:\Users\Omar\AppData\Local\Google\Chrome\
  ├── User Data\                          ← real Chrome, untouched
  └── PinchTab User Data - islorian\      ← profiles.baseDir (config.json)
      ├── prof_f3dfeebe\                  ← named profile "islorian" (stable)
      └── instance-<timestamp>\           ← EPHEMERAL — only when no --profile given
```

`config.json` holds the base directory:

```json
"profiles": {
  "baseDir": "C:\\Users\\Omar\\AppData\\Local\\Google\\Chrome\\PinchTab User Data - islorian",
  "defaultProfile": "default",
  "quarantineKeep": 1
}
```

Each Google account = one named profile registered via the API.

### Current registry (verified 2026-08-20)

| Profile name | Profile ID | Google account | Signed-in persistence tested |
|---|---|---|---|
| `islorian` | `prof_f3dfeebe` | islorian@gmail.com | yes (stop → start → AccountChooser shows account) |
| `omargamalsvc` | `prof_6c78a0d6` | omargamalsvc@gmail.com | yes |
| `oomarolayan` | `prof_0d63f3fb` | oomarolayan.gamal@gmail.com | yes |

There is **no profile picker** in this model — each named profile is its own
isolated `--user-data-dir` containing exactly one browser profile, so there is
nothing to pick from. "Choosing a profile" is simply the `--profile` flag at
launch, and multiple accounts can run **in parallel** (one instance per
profile, each on its own port). Note: the profile registry's `hasAccount` /
`accountEmail` fields stay empty even after a successful sign-in — don't use
them to verify login state; check `accounts.google.com/AccountChooser` instead.

## One-Time Setup for Each Account

### 1. Register the named profile (see API snippet above)

### 2. Start a headed instance on it

```powershell
pinchtab instance start --mode headed --profile islorian
```

> The server itself must already be running via schtasks (see GUI launch rule).
> `multiInstance.strategy` is `explicit`, so nothing auto-launches — you must
> start the instance. `pinchtab nav` without a running instance returns
> `Error 503: no running instances`.

### 3. Sign in manually — ONE TIME ONLY

The headed window opens; navigate it to `https://accounts.google.com/` (or
`pinchtab --server http://127.0.0.1:<instancePort> nav https://accounts.google.com/`)
and sign into the target Google account by hand. The user completes sign-in and
any human verification — the agent never touches credentials.

### 4. Close the browser

`pinchtab instance stop <id>` (or click the **X** on the window). Either is
fine — `instance stop` hard-kills the process (sets `"exit_type": "Crashed"`),
but Brave's suppression flags hide the crash-restore bubble, so a graceful
close is **not** required. Verified: the Google login persists across
stop → start cycles either way.

The session is now permanently saved. Every future
`pinchtab instance start --mode headed --profile islorian` opens directly into
this account.

## Multi-Account Switching

With named profiles, switching accounts is just a different `--profile` flag —
no config.json patching, no server restart needed:

```powershell
pinchtab instance stop <currentInstanceId>
pinchtab instance start --mode headed --profile <otherAccount>
```

Register as many named profiles as needed (one per account) via the
`POST /profiles` API.

> **Legacy:** the old `scripts/switch-account.ps1` (which killed processes and
> patched `profiles.baseDir` in config.json) was obsolete under the
> named-profile model and has been **deleted**. It only mattered for the
> ≤0.14 baseDir-switching approach.

## Failed Approaches (do not retry)

1. **Junction/symlink the real profile into PinchTab's dir.** DPAPI decryption
   fails on the new path; the browser sees a corrupt profile.
2. **`--profile-directory` into the real Chrome User Data.** If any other
   Chrome window is open, Chrome delegates the launch to the existing process,
   the CDP port never opens, and PinchTab falls back to its own blank profile.
3. **Bridge mode with `--profile-directory`.** Same delegation problem as #2 —
   `pinchtab bridge --cdp-attach` ends up auto-launching a default-profile
   browser.
4. **Copying profile files across directories.** DPAPI is bound to the signed
   binary + OS user + exact path. Copied cookies/session files are unreadable.
5. **Relying on `profiles.defaultProfile` / `--profile default` (pinchtab
   0.15.1).** Returns `Error 404: profile "default" not found`. The registry is
   separate from the config key now.
6. **Launching without `--profile` on an empty registry.** Creates an
   ephemeral `instance-<timestamp>` dir — login is lost every session.

## Important Notes

### Stopping processes correctly

The PinchTab daemon process name is `pinchtab-windows-amd64` (NOT `pinchtab`).
The browser is now `brave`. Always stop with:

```powershell
Get-Process brave,pinchtab-windows-amd64 -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
```

### PinchTab must be started via schtasks

Per the GUI launch rule, always use `schtasks /Run /TN "LaunchPinchTabGUI"` —
never run `pinchtab server` directly from a subshell. Direct subshell launches
are invisible desktop sessions that cause `0xc0000142` errors. The scheduled
task runs `pinchtab server`.

### Stale bridges squatting on port 9867

Old `pinchtab bridge` processes (sometimes with an Edge fallback on 9222) can
hold port 9867 and make the CLI report "running instance does not support
GET /instances (older version)". Kill all `pinchtab-windows-amd64` processes,
verify the port is free (`Get-NetTCPConnection -LocalPort 9867,9222`), then
relaunch via schtasks.

### The Profile Chooser bubble

Under Chrome this appeared when the profile was force-killed
(`exit_type: Crashed`) or when Chrome fell back to the real `User Data\`.
Under Brave + named profiles both causes are gone: suppression flags hide the
bubble and the isolated stable dir never touches your real profiles.

### Instance targeting

Each instance gets its own port (9868+ from `multiInstance.instancePortStart`).
Target a specific instance with `--server http://127.0.0.1:<port>` on any CLI
command. `pinchtab instances --json` lists id/profileName/port/status.

## Troubleshooting

### Hard-killing brave.exe (`Stop-Process -Name brave -Force`)

Two possible aftermaths (both verified 2026-08-20):

1. **Server auto-relaunches the killed session.** The next explicit
   `instance start --profile <name>` then fails with
   `Error 409: profile "<name>" already has an active instance (running)`.
   This is not an error — the instance is already back. Check
   `pinchtab instances --json` first.
2. **Stale "running" entries.** If the server does NOT auto-recover,
   `pinchtab instances` still lists the dead instances as `running`. Clean
   them with `pinchtab instance stop <id>` before starting anything new.

Either way, logins survive hard kills — verify with AccountChooser after
restart.

### Verifying login state

Never trust the profile registry's `hasAccount` / `accountEmail` fields (they
stay empty). Instead:

```powershell
pinchtab --server http://127.0.0.1:<instancePort> nav "https://accounts.google.com/AccountChooser"
pinchtab --server http://127.0.0.1:<instancePort> text
```

The page text lists the signed-in account (name + email) if the session
persisted.
