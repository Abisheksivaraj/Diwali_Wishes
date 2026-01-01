' ========================================================
' ATPL Bulk Mail Sender - Auto-Stop Background Launcher
' ========================================================
' Servers stop automatically when browser is closed
' ========================================================

Option Explicit

Dim objShell, objFSO, strScriptPath, strProjectRoot
Dim backendPath, frontendPath
Dim backendNodeModules, frontendNodeModules

' Create objects
Set objShell = CreateObject("WScript.Shell")
Set objFSO = CreateObject("Scripting.FileSystemObject")

' Get the directory where this script is located
strScriptPath = objFSO.GetParentFolderName(WScript.ScriptFullName)
strProjectRoot = strScriptPath

' Define paths (Updated to match your folder names)
backendPath = strProjectRoot & "\Backend"
frontendPath = strProjectRoot & "\frontend"
backendNodeModules = backendPath & "\node_modules"
frontendNodeModules = frontendPath & "\node_modules"

' ========================================================
' FUNCTION: Check if Node.js is installed
' ========================================================
Function IsNodeInstalled()
    On Error Resume Next
    Dim result
    result = objShell.Run("cmd /c node --version", 0, True)
    If result = 0 Then
        IsNodeInstalled = True
    Else
        IsNodeInstalled = False
    End If
    On Error Goto 0
End Function

' ========================================================
' FUNCTION: Check if port is in use
' ========================================================
Function IsPortInUse(portNumber)
    Dim objExec, strOutput
    Set objExec = objShell.Exec("cmd /c netstat -ano | findstr :" & portNumber)
    strOutput = objExec.StdOut.ReadAll()
    IsPortInUse = (Len(strOutput) > 0)
End Function

' ========================================================
' FUNCTION: Check if browser is running
' ========================================================
Function IsBrowserRunning()
    Dim objWMIService, colProcesses
    Dim browserProcesses, browserName, i
    
    ' List of common browser process names
    browserProcesses = Array("chrome.exe", "firefox.exe", "msedge.exe", "iexplore.exe", "brave.exe", "opera.exe")
    
    Set objWMIService = GetObject("winmgmts:\\.\root\cimv2")
    
    For i = 0 To UBound(browserProcesses)
        browserName = browserProcesses(i)
        Set colProcesses = objWMIService.ExecQuery("Select * from Win32_Process Where Name = '" & browserName & "'")
        If colProcesses.Count > 0 Then
            IsBrowserRunning = True
            Exit Function
        End If
    Next
    
    IsBrowserRunning = False
End Function

' ========================================================
' FUNCTION: Kill all Node.js processes
' ========================================================
Sub KillNodeProcesses()
    objShell.Run "taskkill /F /IM node.exe", 0, True
End Sub

' ========================================================
' MAIN SCRIPT
' ========================================================

' Check if Node.js is installed
If Not IsNodeInstalled() Then
    MsgBox "Node.js is not installed!" & vbCrLf & vbCrLf & _
           "Please install Node.js from: https://nodejs.org/" & vbCrLf & _
           "Then run 'install-dependencies.bat' before launching the app.", _
           vbCritical, "Node.js Not Found"
    WScript.Quit
End If

' Check if folders exist
If Not objFSO.FolderExists(backendPath) Then
    MsgBox "Error: Backend folder not found at:" & vbCrLf & backendPath & vbCrLf & vbCrLf & _
           "Please ensure the Backend folder exists.", vbCritical, "Folder Not Found"
    WScript.Quit
End If

If Not objFSO.FolderExists(frontendPath) Then
    MsgBox "Error: frontend folder not found at:" & vbCrLf & frontendPath & vbCrLf & vbCrLf & _
           "Please ensure the frontend folder exists.", vbCritical, "Folder Not Found"
    WScript.Quit
End If

' Check if dependencies are installed
If Not objFSO.FolderExists(backendNodeModules) Or Not objFSO.FolderExists(frontendNodeModules) Then
    Dim response
    response = MsgBox("Dependencies are not installed!" & vbCrLf & vbCrLf & _
                     "Would you like to install them now?" & vbCrLf & vbCrLf & _
                     "Click YES to run the installer" & vbCrLf & _
                     "Click NO to exit", _
                     vbYesNo + vbQuestion, "Dependencies Required")
    
    If response = vbYes Then
        ' Run the BAT file to install dependencies
        Dim batFile
        batFile = strProjectRoot & "\install-dependencies.bat"
        If objFSO.FileExists(batFile) Then
            objShell.Run """" & batFile & """", 1, True
        Else
            MsgBox "Error: install-dependencies.bat not found!" & vbCrLf & vbCrLf & _
                   "Please run 'install-dependencies.bat' manually first.", _
                   vbCritical, "Installer Not Found"
            WScript.Quit
        End If
    Else
        WScript.Quit
    End If
End If

' Check if servers are already running
If IsPortInUse(1234) Or IsPortInUse(5173) Then
    MsgBox "Servers are already running!" & vbCrLf & vbCrLf & _
           "Backend: http://localhost:1234" & vbCrLf & _
           "Frontend: http://localhost:5173" & vbCrLf & vbCrLf & _
           "Opening browser...", _
           vbInformation, "Already Running"
    objShell.Run "http://localhost:5173", 1, False
    WScript.Quit
End If

' Show starting message
MsgBox "Starting ATPL Bulk Mail Sender..." & vbCrLf & vbCrLf & _
       "The servers will start in the background." & vbCrLf & _
       "Your browser will open automatically." & vbCrLf & vbCrLf & _
       "⚠️ IMPORTANT: When you close the browser," & vbCrLf & _
       "the servers will automatically stop!", _
       vbInformation, "ATPL Bulk Mail Sender"

' Start Backend Server (Hidden)
Dim cmdBackend
cmdBackend = "cmd.exe /c cd /d """ & backendPath & """ && npm start"
objShell.Run cmdBackend, 0, False

' Wait 4 seconds for backend to initialize
WScript.Sleep 4000

' Start Frontend Server (Hidden)
Dim cmdFrontend
cmdFrontend = "cmd.exe /c cd /d """ & frontendPath & """ && npm run dev"
objShell.Run cmdFrontend, 0, False

' Wait 6 seconds for frontend to start
WScript.Sleep 6000

' Count initial browser processes
Dim initialBrowserCheck
initialBrowserCheck = IsBrowserRunning()

' Open browser
objShell.Run "http://localhost:5173", 1, False

' Wait a moment for browser to fully open
WScript.Sleep 3000

' Show monitoring message
MsgBox "Application launched successfully!" & vbCrLf & vbCrLf & _
       "Backend: http://localhost:1234" & vbCrLf & _
       "Frontend: http://localhost:5173" & vbCrLf & vbCrLf & _
       "✅ Servers are running in the background" & vbCrLf & _
       "✅ Monitoring browser status..." & vbCrLf & vbCrLf & _
       "Close ALL browser windows to stop the servers automatically.", _
       vbInformation, "Running"

' ========================================================
' BROWSER MONITORING LOOP
' ========================================================
' This loop checks if browser is still running
' When all browsers are closed, it stops the servers

Dim monitorCount
monitorCount = 0

Do While True
    ' Wait 5 seconds between checks
    WScript.Sleep 5000
    
    ' Check if any browser is running
    If Not IsBrowserRunning() Then
        ' Browser closed - stop servers
        MsgBox "Browser closed!" & vbCrLf & vbCrLf & _
               "Stopping servers...", _
               vbInformation, "Auto-Stop"
        
        KillNodeProcesses()
        
        MsgBox "Servers stopped successfully!" & vbCrLf & vbCrLf & _
               "All Node.js processes have been terminated." & vbCrLf & _
               "You can restart by running start-app.vbs again.", _
               vbInformation, "Stopped"
        
        Exit Do
    End If
    
    ' Safety limit - stop after 12 hours (8640 checks)
    monitorCount = monitorCount + 1
    If monitorCount > 8640 Then
        Exit Do
    End If
Loop

' Cleanup
Set objShell = Nothing
Set objFSO = Nothing