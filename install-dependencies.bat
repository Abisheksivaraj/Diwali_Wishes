@echo off
title ATPL Bulk Mail Sender - Installing Dependencies
color 0A

echo ========================================================
echo    INSTALLING DEPENDENCIES - PLEASE WAIT
echo ========================================================
echo.

REM Change to Backend folder (note capital B)
echo Step 1: Installing BACKEND dependencies...
echo.
if exist Backend (
    cd Backend
    if exist package.json (
        echo Found package.json in Backend folder
        echo Installing... Please wait...
        echo.
        npm install
        if %ERRORLEVEL% EQU 0 (
            echo.
            echo [SUCCESS] Backend installation complete!
        ) else (
            echo.
            echo [ERROR] Backend installation failed!
            echo Trying with --force flag...
            npm install --force
        )
    ) else (
        echo [ERROR] package.json not found in Backend folder!
        echo Please create Backend\package.json first
    )
    cd ..
) else (
    echo [ERROR] Backend folder not found!
)
echo.

REM Change to frontend folder
echo Step 2: Installing FRONTEND dependencies...
echo.
if exist frontend (
    cd frontend
    if exist package.json (
        echo Found package.json in frontend folder
        echo Installing... Please wait...
        echo.
        npm install
        if %ERRORLEVEL% EQU 0 (
            echo.
            echo [SUCCESS] Frontend installation complete!
        ) else (
            echo.
            echo [ERROR] Frontend installation failed!
            echo Trying with --force flag...
            npm install --force
        )
    ) else (
        echo [ERROR] package.json not found in frontend folder!
        echo Please create frontend\package.json first
    )
    cd ..
) else (
    echo [ERROR] frontend folder not found!
)
echo.

echo ========================================================
echo    INSTALLATION COMPLETE!
echo ========================================================
echo.
echo Check above for any errors.
echo.
echo If successful, you can now run:
echo - start-app.vbs (auto-stops when browser closes)
echo - start-app-manual.vbs (keeps running until manually stopped)
echo.
echo ========================================================
echo.
pause