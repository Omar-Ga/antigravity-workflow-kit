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

# Determine target profile directory
if ($accounts.ContainsKey($Account)) {
    $targetDir = $accounts[$Account]
} else {
    $config = Get-Content $configPath -Raw | ConvertFrom-Json
    $targetDir = $config.profiles.baseDir
}

# Launch standalone Chrome stripped of all automation switches and banners
$chromePath = "C:\Program Files\Google\Chrome\Application\chrome.exe"
$chromeArgs = @(
    "--user-data-dir=`"$targetDir`"",
    "--disable-blink-features=AutomationControlled",
    "--excludeSwitches=enable-automation"
)

Start-Process $chromePath -ArgumentList $chromeArgs
Write-Host "Opened un-monitored manual Chrome session for profile: $targetDir" -ForegroundColor Green
