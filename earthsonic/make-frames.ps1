param(
    [Parameter(Mandatory=$true)]
    [string]$Video,

    [Parameter(Mandatory=$true)]
    [string]$Slug,

    [int]$Frames = 100,
    [int]$Width = 640,
    [int]$Quality = 4
)

if ($Video -like "*PASTE FULL PATH*" -or $Video -like "*[PASTE*" -or [string]::IsNullOrWhiteSpace($Video)) {
    Write-Host "Skipping ${Slug}: video path is still a placeholder." -ForegroundColor Yellow
    exit 0
}

if (-not (Test-Path $Video)) {
    Write-Host "Error: Video file not found at '$Video'." -ForegroundColor Red
    exit 1
}

$outDir = Join-Path $PSScriptRoot "public\frames\$Slug"
if (-not (Test-Path $outDir)) {
    New-Item -ItemType Directory -Force -Path $outDir | Out-Null
} else {
    Remove-Item "$outDir\*.jpg" -Force -ErrorAction SilentlyContinue
}

Write-Host "Probing video duration for $Video..." -ForegroundColor Cyan
$durStr = (ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$Video").Trim()
$duration = 0.0
if (-not [double]::TryParse($durStr, [System.Globalization.NumberStyles]::Any, [System.Globalization.CultureInfo]::InvariantCulture, [ref]$duration) -or $duration -le 0) {
    Write-Host "Warning: Could not detect duration automatically, defaulting to 10.0s." -ForegroundColor Yellow
    $duration = 10.0
}

$fps = [Math]::Round(($Frames / $duration), 4)
Write-Host "Duration: ${duration}s | Target frames: $Frames | Target fps: $fps | Width: $Width" -ForegroundColor Cyan

$pattern = Join-Path $outDir "%03d.jpg"
ffmpeg -y -i "$Video" -vf "fps=$fps,scale=${Width}:-2" -q:v $Quality -vframes 120 "$pattern"

$generated = Get-ChildItem "$outDir\*.jpg"
$count = $generated.Count
$totalBytes = ($generated | Measure-Object -Property Length -Sum).Sum
$totalMB = [Math]::Round(($totalBytes / 1MB), 2)

Write-Host "`n=== FRAME EXTRACTION SUMMARY for $Slug ===" -ForegroundColor Green
Write-Host "Frame count: $count"
Write-Host "Total size:  $totalMB MB"
if ($count -gt 0) {
    $first = $generated[0].FullName
    $dimensions = (ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=s=x:p=0 "$first").Trim()
    Write-Host "Image size:  $dimensions"
}

if ($totalMB -gt 8.0) {
    Write-Host "Warning: Folder size exceeds 8MB ($totalMB MB). Consider lower resolution or higher -Quality (lower visual quality)." -ForegroundColor Yellow
}
