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
$defaultProfile = if ($config.profiles.defaultProfile) { $config.profiles.defaultProfile } else { "default" }

if ($accounts.ContainsKey($Account)) {
    $baseDir = $accounts[$Account]
} else {
    $baseDir = $config.profiles.baseDir
}

# PinchTab joins baseDir + defaultProfile
$fullProfilePath = Join-Path $baseDir $defaultProfile

# Launch standalone Chrome directly into full profile directory without automation flags
$chromePath = "C:\Program Files\Google\Chrome\Application\chrome.exe"
$chromeArgs = @(
    "--user-data-dir=`"$fullProfilePath`"",
    "--disable-blink-features=AutomationControlled",
    "--excludeSwitches=enable-automation"
)

Start-Process $chromePath -ArgumentList $chromeArgs
Write-Host "Opened un-monitored manual Chrome session for profile: $fullProfilePath" -ForegroundColor Green
