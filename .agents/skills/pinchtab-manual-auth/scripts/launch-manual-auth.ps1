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

$chromePath = "C:\Program Files\Google\Chrome\Application\chrome.exe"
$userDirArg = "--user-data-dir=`"$baseDir`""

Start-Process $chromePath -ArgumentList $userDirArg
Write-Host "Opened un-monitored manual Chrome session for profile: $baseDir" -ForegroundColor Green
