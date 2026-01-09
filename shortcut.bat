@echo off
echo ============================================
echo Creating Desktop Shortcut for Mail App
echo ============================================
echo.

REM Get the desktop path
set "DESKTOP=%USERPROFILE%\Desktop"

REM Get the current directory where this batch file is located
set "SCRIPT_DIR=%~dp0"

REM Full path to the VBS script
set "VBS_PATH=%SCRIPT_DIR%start-mail-app.vbs"

REM Check if VBS file exists
if not exist "%VBS_PATH%" (
    echo ERROR: start-mail-app.vbs not found!
    echo Expected location: %VBS_PATH%
    echo.
    echo Please ensure start-mail-app.vbs is in the same folder as this batch file.
    pause
    exit /b 1
)

REM Create the shortcut using PowerShell
powershell -Command "$WshShell = New-Object -ComObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut('%DESKTOP%\ATPL Mail App.lnk'); $Shortcut.TargetPath = '%VBS_PATH%'; $Shortcut.WorkingDirectory = '%SCRIPT_DIR%'; $Shortcut.Description = 'Launch ATPL Bulk Mail Application'; $Shortcut.IconLocation = '%SystemRoot%\System32\shell32.dll,25'; $Shortcut.Save()"

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ============================================
    echo SUCCESS!
    echo ============================================
    echo.
    echo Desktop shortcut created successfully!
    echo.
    echo Shortcut Name: ATPL Mail App
    echo Location: %DESKTOP%
    echo.
    echo You can now double-click "ATPL Mail App" on your desktop to start the application.
    echo.
) else (
    echo.
    echo ERROR: Failed to create shortcut!
    echo.
)

echo.
echo Press any key to exit...
pause >nul