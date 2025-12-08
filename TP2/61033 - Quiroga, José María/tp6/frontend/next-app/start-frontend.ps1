#!/usr/bin/env pwsh
# start-frontend.ps1
# Runs npm install (if needed) and starts the Next dev server.
$ErrorActionPreference = 'Stop'
Set-Location (Split-Path -Path $MyInvocation.MyCommand.Definition -Parent)
if(-Not (Test-Path "node_modules")) {
    Write-Output "Installing npm packages..."
    npm install
}
Write-Output "Starting Next dev server on port 3000 (background)..."
Start-Process -NoNewWindow -FilePath "npm" -ArgumentList "run","dev"
Write-Output "Frontend start requested. Open http://localhost:3000"
