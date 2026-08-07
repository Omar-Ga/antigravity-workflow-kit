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

# Launch standalone Chrome using proper Chrome argument structure:
# --user-data-dir = root folder
# --profile-directory = profile subfolder
$chromePath = "C:\Program Files\Google\Chrome\Application\chrome.exe"
$argString = "--user-data-dir=`"$baseDir`" --profile-directory=`"$defaultProfile`" --disable-blink-features=AutomationControlled --excludeSwitches=enable-automation"

Start-Process $chromePath -ArgumentList $argString
Write-Host "Opened manual Chrome session for profile: $baseDir\$defaultProfile" -ForegroundColor Green
