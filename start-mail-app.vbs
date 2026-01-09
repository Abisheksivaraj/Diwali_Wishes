Set WshShell = CreateObject("WScript.Shell")
Set objFSO = CreateObject("Scripting.FileSystemObject")

' ============================================
' AUTO-DETECT PROJECT LOCATION
' ============================================
' Get the folder where this VBS script is located
Dim scriptPath, projectRoot, backendPath, frontendPath
scriptPath = objFSO.GetParentFolderName(WScript.ScriptFullName)
projectRoot = scriptPath

' ============================================
' SEARCH FOR BACKEND AND FRONTEND FOLDERS
' ============================================
' Try to find backend folder
backendPath = ""
Dim backendPossibleNames
backendPossibleNames = Array("backend", "server", "api", "Backend", "Server", "API", "bulk-mail-backend")

For Each folderName In backendPossibleNames
    Dim testPath
    testPath = projectRoot & "\" & folderName
    If objFSO.FolderExists(testPath) Then
        ' Check if it contains server.js or index.js
        If objFSO.FileExists(testPath & "\server.js") Or objFSO.FileExists(testPath & "\index.js") Or objFSO.FileExists(testPath & "\app.js") Then
            backendPath = testPath
            Exit For
        End If
    End If
Next

' Try to find frontend folder
frontendPath = ""
Dim frontendPossibleNames
frontendPossibleNames = Array("frontend", "client", "web", "ui", "Frontend", "Client", "Web", "UI", "bulk-mail-frontend")

For Each folderName In frontendPossibleNames
    testPath = projectRoot & "\" & folderName
    If objFSO.FolderExists(testPath) Then
        ' Check if it contains package.json
        If objFSO.FileExists(testPath & "\package.json") Then
            frontendPath = testPath
            Exit For
        End If
    End If
Next

' ============================================
' VALIDATE AUTO-DETECTED PATHS
' ============================================
If backendPath = "" Then
    MsgBox "Backend folder not found!" & vbCrLf & vbCrLf & "Searched in: " & projectRoot & vbCrLf & vbCrLf & "Please ensure:" & vbCrLf & "1. This script is in the same folder as your backend/frontend folders" & vbCrLf & "2. Backend folder contains server.js or index.js" & vbCrLf & vbCrLf & "Folder structure should be:" & vbCrLf & "Project Root/" & vbCrLf & "  backend/ (or server/)" & vbCrLf & "  frontend/ (or client/)" & vbCrLf & "  start-mail-app.vbs (this file)", vbCritical, "Setup Error"
    WScript.Quit
End If

If frontendPath = "" Then
    MsgBox "Frontend folder not found!" & vbCrLf & vbCrLf & "Searched in: " & projectRoot & vbCrLf & vbCrLf & "Please ensure:" & vbCrLf & "1. This script is in the same folder as your backend/frontend folders" & vbCrLf & "2. Frontend folder contains package.json" & vbCrLf & vbCrLf & "Folder structure should be:" & vbCrLf & "Project Root/" & vbCrLf & "  backend/ (or server/)" & vbCrLf & "  frontend/ (or client/)" & vbCrLf & "  start-mail-app.vbs (this file)", vbCritical, "Setup Error"
    WScript.Quit
End If

' ============================================
' CHECK NODE.JS INSTALLATION
' ============================================
On Error Resume Next
WshShell.Run "cmd /c node --version", 0, True
If Err.Number <> 0 Then
    MsgBox "Node.js is not installed or not in PATH!" & vbCrLf & vbCrLf & "Please install Node.js from:" & vbCrLf & "https://nodejs.org" & vbCrLf & vbCrLf & "After installation, restart your computer.", vbCritical, "Error - Node.js Not Found"
    WScript.Quit
End If
On Error GoTo 0

' ============================================
' START BACKEND SERVER
' ============================================
WshShell.CurrentDirectory = backendPath

' Find the correct server file
Dim serverFile
If objFSO.FileExists(backendPath & "\server.js") Then
    serverFile = "server.js"
ElseIf objFSO.FileExists(backendPath & "\index.js") Then
    serverFile = "index.js"
ElseIf objFSO.FileExists(backendPath & "\app.js") Then
    serverFile = "app.js"
Else
    MsgBox "No server file found!" & vbCrLf & vbCrLf & "Looking for: server.js, index.js, or app.js" & vbCrLf & "In: " & backendPath, vbCritical, "Error"
    WScript.Quit
End If

WshShell.Run "cmd /c node " & serverFile, 0, False

' Wait for backend to initialize
WScript.Sleep 3000

' ============================================
' START FRONTEND SERVER
' ============================================
WshShell.CurrentDirectory = frontendPath
WshShell.Run "cmd /c npm run dev", 0, False

' Wait for frontend to initialize
WScript.Sleep 5000

' ============================================
' OPEN CHROME BROWSER
' ============================================
Dim chromePath, chromeProcess

' Try common Chrome installation paths
chromePath = ""
If objFSO.FileExists("C:\Program Files\Google\Chrome\Application\chrome.exe") Then
    chromePath = "C:\Program Files\Google\Chrome\Application\chrome.exe"
ElseIf objFSO.FileExists("C:\Program Files (x86)\Google\Chrome\Application\chrome.exe") Then
    chromePath = "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"
ElseIf objFSO.FileExists(WshShell.ExpandEnvironmentStrings("%LOCALAPPDATA%") & "\Google\Chrome\Application\chrome.exe") Then
    chromePath = WshShell.ExpandEnvironmentStrings("%LOCALAPPDATA%") & "\Google\Chrome\Application\chrome.exe"
End If

If chromePath = "" Then
    ' Chrome not found, use default browser
    MsgBox "Opening in default browser..." & vbCrLf & vbCrLf & "Close the browser window to stop the servers.", vbInformation, "Browser Opening"
    chromeProcess = WshShell.Run("http://localhost:5173", 1, False)
Else
    ' Open Chrome in app mode (clean window without tabs)
    MsgBox "Starting ATPL Mail Application..." & vbCrLf & vbCrLf & "Chrome will open shortly." & vbCrLf & vbCrLf & "Close Chrome window to stop the servers.", vbInformation, "Application Starting"
    chromeProcess = WshShell.Run("""" & chromePath & """ --new-window --app=http://localhost:5173", 1, False)
End If

' ============================================
' MONITOR CHROME PROCESS
' ============================================
' Wait a moment for Chrome to fully start
WScript.Sleep 2000

' Create a function to check if Chrome is running
Function IsChromeRunning()
    Dim objWMI, colProcesses, objProcess
    Set objWMI = GetObject("winmgmts:\\.\root\cimv2")
    Set colProcesses = objWMI.ExecQuery("Select * from Win32_Process Where Name = 'chrome.exe'")
    
    IsChromeRunning = (colProcesses.Count > 0)
End Function

' Keep checking if Chrome is still running
Do While IsChromeRunning()
    WScript.Sleep 2000  ' Check every 2 seconds
Loop

' ============================================
' CHROME CLOSED - STOP SERVERS AUTOMATICALLY
' ============================================
MsgBox "Chrome window closed." & vbCrLf & vbCrLf & "Stopping servers...", vbInformation, "Shutting Down"

' Kill all node.js processes
On Error Resume Next
WshShell.Run "taskkill /F /IM node.exe", 0, True
On Error GoTo 0

' Wait a moment
WScript.Sleep 1000

MsgBox "Application stopped successfully!" & vbCrLf & vbCrLf & "All servers have been shut down.", vbInformation, "Shutdown Complete"