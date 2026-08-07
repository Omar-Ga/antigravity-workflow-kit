param(
    [string]$Account = "omargamalsvc"
)

$configPath = "$env:APPDATA\pinchtab\config.json"
$accounts = @{
    "omargamalsvc"  = "$env:LOCALAPPDATA\Google\Chrome\PinchTab User Data"
    "oomarolayan"   = "$env:LOCALAPPDATA\Google\Chrome\PinchTab User Data - oomarolayan"
}

# Stop active PinchTab daemon and Chrome instances completely
Get-Process chrome,pinchtab-windows-amd64 -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# Read config.json
$config = Get-Content $configPath -Raw | ConvertFrom-Json

if ($accounts.ContainsKey($Account)) {
    $baseDir = $accounts[$Account]
} else {
    $baseDir = $config.profiles.baseDir
}

# Write launcher batch file
$batContent = "@echo off`r`ntaskkill /F /IM chrome.exe /IM pinchtab-windows-amd64.exe 2>nul`r`ntimeout /t 1 /nobreak >nul`r`nstart `"`" `"C:\Program Files\Google\Chrome\Application\chrome.exe`" --user-data-dir=`"$baseDir`""
[System.IO.File]::WriteAllText("$env:APPDATA\pinchtab\launch-manual.bat", $batContent)

# Trigger Task Scheduler (GUI Session launcher)
schtasks /Run /TN "LaunchManualChrome" | Out-Null
Write-Host "Opened un-monitored manual Chrome GUI session for profile: $baseDir" -ForegroundColor Green
