param(
    [string]$Account = "omargamalsvc"
)

$configPath = "$env:APPDATA\pinchtab\config.json"
$accounts = @{
    "omargamalsvc"  = "$env:LOCALAPPDATA\Google\Chrome\PinchTab User Data"
    "oomarolayan"   = "$env:LOCALAPPDATA\Google\Chrome\PinchTab User Data - oomarolayan"
}

# Stop active PinchTab daemon and Chrome instances
Get-Process chrome,pinchtab-windows-amd64 -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# Determine target profile directory
if ($accounts.ContainsKey($Account)) {
    $targetDir = $accounts[$Account]
} else {
    $config = Get-Content $configPath -Raw | ConvertFrom-Json
    $targetDir = $config.profiles.baseDir
}

# Launch standalone Chrome without remote debugging flags
$chromePath = "C:\Program Files\Google\Chrome\Application\chrome.exe"
Start-Process $chromePath -ArgumentList "--user-data-dir=`"$targetDir`""
Write-Host "Opened manual Chrome session for profile: $targetDir" -ForegroundColor Green
