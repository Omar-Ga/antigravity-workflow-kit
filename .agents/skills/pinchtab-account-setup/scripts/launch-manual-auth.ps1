param(
    [string]$Profile = "omargamalsvc",
    [string]$Url = ""
)

$bravePath = "$env:LOCALAPPDATA\BraveSoftware\Brave-Browser\Application\brave.exe"
$baseDir = "$env:LOCALAPPDATA\Google\Chrome\PinchTab User Data - islorian"

$profileDirs = @{
    "omargamalsvc" = "$baseDir\prof_6c78a0d6"
    "islorian"     = "$baseDir\prof_f3dfeebe"
    "oomarolayan"  = "$baseDir\prof_0d63f3fb"
}

if (-not $profileDirs.ContainsKey($Profile)) {
    Write-Error "Profile '$Profile' not found. Available: $($profileDirs.Keys -join ', ')"
    exit 1
}

$targetDir = $profileDirs[$Profile]

# Stop active PinchTab daemon and Brave instances to release profile lock
Get-Process brave,pinchtab-windows-amd64 -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 1

# Launch standalone Brave without remote debugging / automation flags
$argList = "`"--user-data-dir=$targetDir`""
if ($Url) {
    $argList += " `"$Url`""
}

Start-Process -FilePath $bravePath -ArgumentList $argList
Write-Host "Opened standalone Brave session for profile '$Profile' ($targetDir)" -ForegroundColor Green
Write-Host "Complete your sign-in/sign-up in Brave, then close the window before resuming PinchTab." -ForegroundColor Yellow
