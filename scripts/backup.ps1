# Project: Placement Management System
# Purpose: Create an automated, timestamped zip backup, excluding heavy folders.
# Features: 
#   - Excludes node_modules, .git, and current backup folder.
#   - Includes source code, .env files, and documentation.
#   - Keeps only the last 5 backups (rotation).

# --- Configuration ---
$ProjectRoot = Get-Location
$BackupDir = Join-Path $ProjectRoot "backup"
$Timestamp = Get-Date -Format "yyyyMMdd_HHmm"
$BackupFile = Join-Path $BackupDir "pms_backup_$Timestamp.zip"
$MaxBackups = 5

# Create backup directory if it doesn't exist
if (!(Test-Path $BackupDir)) {
    New-Item -ItemType Directory -Path $BackupDir | Out-Null
    Write-Host "Created backup directory: $BackupDir" -ForegroundColor Green
}

Write-Host "Starting backup process..." -ForegroundColor Cyan

# --- Prepare Exclusions & Compress ---
# We use 'tar' as it's available on Windows 10/11 and handles exclusions robustly.
$ExcludeList = @(
    "--exclude=.git",
    "--exclude=node_modules",
    "--exclude=backup",
    "--exclude=tmp",
    "--exclude=frontend/node_modules",
    "--exclude=backend/node_modules"
)

# Build command parts
$TarCommand = "tar -acf `"$BackupFile`" $($ExcludeList -join ' ') ."

Write-Host "Compressing files into $BackupFile..." -ForegroundColor Gray
Invoke-Expression $TarCommand

if ($LASTEXITCODE -eq 0) {
    $FileSize = (Get-Item $BackupFile).Length / 1MB
    Write-Host "Backup successful: $BackupFile ($($FileSize.ToString('F2')) MB)" -ForegroundColor Green
} else {
    Write-Host "Backup failed! Tar exited with code $LASTEXITCODE." -ForegroundColor Red
    exit 1
}

# --- Backup Rotation ---
# Keep only the latest $MaxBackups files that match the pattern pms_backup_*.zip
$ExistingBackups = Get-ChildItem -Path $BackupDir -Filter "pms_backup_*.zip" | Sort-Object LastWriteTime -Descending

if ($ExistingBackups.Count -gt $MaxBackups) {
    Write-Host "Cleaning up old backups (Keeping latest $MaxBackups)..." -ForegroundColor Yellow
    $ExistingBackups | Select-Object -Skip $MaxBackups | Remove-Item -Force
    Write-Host "Old backups removed." -ForegroundColor Gray
}

Write-Host "Backup completed!" -ForegroundColor Green
