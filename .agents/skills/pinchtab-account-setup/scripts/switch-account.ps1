param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("omargamalsvc", "oomarolayan")]
    [string]$Account
)

$configPath = "$env:APPDATA\pinchtab\config.json"
$accounts = @{
    "omargamalsvc"  = "$env:LOCALAPPDATA\Google\Chrome\PinchTab User Data"
    "oomarolayan"   = "$env:LOCALAPPDATA\Google\Chrome\PinchTab User Data - oomarolayan"
}

$baseDir = $accounts[$Account]

# Stop PinchTab and Chrome
Get-Process chrome,pinchtab-windows-amd64 -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# Patch config.json
$config = Get-Content $configPath -Raw | ConvertFrom-Json
$config.profiles.baseDir = $baseDir
$config | ConvertTo-Json -Depth 20 | Set-Content $configPath -Encoding UTF8

# Relaunch PinchTab
schtasks /Run /TN "LaunchPinchTabGUI" | Out-Null
Write-Host "Switched to: $Account ($baseDir)" -ForegroundColor Green
