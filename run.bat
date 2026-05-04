@echo off
echo.
echo ========================================
echo   Hospital Management System Launcher
echo ========================================
echo.

:: Create bin directory if it doesn't exist
if not exist "backend\bin" (
    mkdir "backend\bin"
)

echo [1/2] Compiling Java backend...
javac -cp "backend\lib\*" -d backend\bin backend\src\Main.java backend\src\dao\*.java backend\src\handlers\*.java backend\src\models\*.java backend\src\util\*.java

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Compilation failed. Please check if JDK is installed and in your PATH.
    pause
    exit /b %errorlevel%
)

echo [2/2] Starting Server...
echo.
echo Backend Server starting on http://localhost:8080
echo.
java -cp "backend\bin;backend\lib\*" Main

pause
