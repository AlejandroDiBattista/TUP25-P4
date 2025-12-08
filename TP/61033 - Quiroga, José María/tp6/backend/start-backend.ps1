#!/usr/bin/env pwsh
# start-backend.ps1
# Activates/creates the venv (if needed), installs requirements and starts uvicorn
$ErrorActionPreference = 'Stop'
Write-Output "Start backend: ensuring virtualenv and requirements"
if(-Not (Test-Path ".venv\Scripts\python.exe")) {
    Write-Output "Creating virtual environment and installing requirements..."
    python -m venv .venv
    .\.venv\Scripts\python.exe -m pip install --upgrade pip setuptools wheel
    .\.venv\Scripts\python.exe -m pip install -r requirements.txt
} else {
    Write-Output "Virtualenv exists. Installing requirements (best-effort)."
    .\.venv\Scripts\python.exe -m pip install -r requirements.txt
}

Write-Output "Starting uvicorn on 127.0.0.1:8000 (background)..."
Start-Process -NoNewWindow -FilePath ".\.venv\Scripts\python.exe" -ArgumentList "-m","uvicorn","main:app","--reload","--host","127.0.0.1","--port","8000"
Write-Output "Backend start requested. Check logs in the terminal named 'uvicorn' or run this script without Start-Process to see logs inline."
