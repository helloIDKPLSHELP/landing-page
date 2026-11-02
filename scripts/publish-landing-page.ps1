# Publish UPLIFT project to GitHub as "landing-page"
# Run in PowerShell from the project root (or this script will cd there).

$ProjectRoot = Split-Path $PSScriptRoot -Parent
$Git = Join-Path $ProjectRoot ".tools\mingit\cmd\git.exe"
$Gh = Join-Path $ProjectRoot ".tools\gh\gh.exe"

if (-not (Test-Path $Git)) {
  Write-Host "Portable Git not found. Install Git: https://git-scm.com/download/win" -ForegroundColor Red
  exit 1
}

Set-Location $ProjectRoot

Write-Host "Project: $ProjectRoot" -ForegroundColor Cyan
& $Git status -sb

if (-not (Test-Path $Gh)) {
  Write-Host "GitHub CLI not found at $Gh" -ForegroundColor Red
  Write-Host "Create the repo manually at https://github.com/new?name=landing-page then run:"
  Write-Host "  git remote set-url origin https://github.com/adityabahukhandi2010-a11y/landing-page.git"
  Write-Host "  git push -u origin main"
  exit 1
}

Write-Host "`nStep 1: Log in to GitHub (browser will open)..." -ForegroundColor Yellow
& $Gh auth login -h github.com -p https -w

Write-Host "`nStep 2: Create repo landing-page and push..." -ForegroundColor Yellow
& $Gh repo create landing-page `
  --public `
  --description "UPLIFT landing page - Next.js" `
  --source $ProjectRoot `
  --remote origin `
  --push

if ($LASTEXITCODE -eq 0) {
  Write-Host "`nDone! Repo: https://github.com/adityabahukhandi2010-a11y/landing-page" -ForegroundColor Green
} else {
  Write-Host "`nIf the repo already exists, try:" -ForegroundColor Yellow
  Write-Host "  git push -u origin main"
}
