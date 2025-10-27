@echo off
REM This script installs Tesseract OCR and Python dependencies

REM Check if Tesseract is already installed
where tesseract >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Tesseract OCR is not installed. Please download and install it from:
    echo https://github.com/UB-Mannheim/tesseract/wiki
    echo Make sure to check "Add to PATH" during installation.
    pause
    exit /b 1
)

REM Install Python dependencies
pip install -r backend/requirements.txt

echo Build process completed successfully.
pause
