@echo off
REM RobBridge Deployment Script for Render.com (Windows)

echo 🚀 RobBridge Deployment to Render.com
echo ======================================

REM Check if git is initialized
if not exist ".git" (
    echo ❌ Git repository not initialized. Please run:
    echo    git init
    echo    git add .
    echo    git commit -m "Initial commit"
    pause
    exit /b 1
)

REM Check if files exist
echo 🔍 Checking required files...

set "required_files=render.yaml Barcode generator&Scanner\wsgi.py Barcode generator&Scanner\Procfile Barcode generator&Scanner\requirements.txt Robridge web\package.json Robridge web\build.sh"

for %%f in (%required_files%) do (
    if not exist "%%f" (
        echo ❌ Missing required file: %%f
        pause
        exit /b 1
    )
)

echo ✅ All required files present

REM Check git status
echo 📊 Checking git status...
git status --porcelain > temp_status.txt
if %errorlevel% neq 0 (
    echo ❌ Git command failed
    del temp_status.txt
    pause
    exit /b 1
)

for /f %%i in (temp_status.txt) do (
    echo ⚠️  Uncommitted changes detected. Please commit them first:
    echo    git add .
    echo    git commit -m "Prepare for Render deployment"
    del temp_status.txt
    pause
    exit /b 1
)
del temp_status.txt

echo ✅ Git repository is clean

REM Check if remote is set
git remote get-url origin >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  No remote origin set. Please add your GitHub repository:
    echo    git remote add origin https://github.com/yourusername/your-repo.git
    pause
    exit /b 1
)

echo ✅ Remote origin configured

REM Push to GitHub
echo 📤 Pushing to GitHub...
git push origin main

if %errorlevel% equ 0 (
    echo ✅ Code pushed to GitHub successfully
) else (
    echo ❌ Failed to push to GitHub
    pause
    exit /b 1
)

echo.
echo 🎯 Next Steps:
echo 1. Go to https://render.com/dashboard
echo 2. Create a new Web Service
echo 3. Connect your GitHub repository
echo 4. Use the configuration from RENDER_DEPLOYMENT_GUIDE.md
echo 5. Deploy both backend and frontend services
echo.
echo 📚 For detailed instructions, see: RENDER_DEPLOYMENT_GUIDE.md
echo.
echo 🎉 Ready for deployment!
pause
