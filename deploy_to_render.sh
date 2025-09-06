#!/bin/bash
# RobBridge Deployment Script for Render.com

echo "🚀 RobBridge Deployment to Render.com"
echo "======================================"

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "❌ Git repository not initialized. Please run:"
    echo "   git init"
    echo "   git add ."
    echo "   git commit -m 'Initial commit'"
    exit 1
fi

# Check if files exist
echo "🔍 Checking required files..."

required_files=(
    "render.yaml"
    "Barcode generator&Scanner/wsgi.py"
    "Barcode generator&Scanner/Procfile"
    "Barcode generator&Scanner/requirements.txt"
    "Robridge web/package.json"
    "Robridge web/build.sh"
)

missing_files=()
for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        missing_files+=("$file")
    fi
done

if [ ${#missing_files[@]} -ne 0 ]; then
    echo "❌ Missing required files:"
    printf '   %s\n' "${missing_files[@]}"
    exit 1
fi

echo "✅ All required files present"

# Check git status
echo "📊 Checking git status..."
if [ -n "$(git status --porcelain)" ]; then
    echo "⚠️  Uncommitted changes detected. Please commit them first:"
    echo "   git add ."
    echo "   git commit -m 'Prepare for Render deployment'"
    exit 1
fi

echo "✅ Git repository is clean"

# Check if remote is set
if ! git remote get-url origin > /dev/null 2>&1; then
    echo "⚠️  No remote origin set. Please add your GitHub repository:"
    echo "   git remote add origin https://github.com/yourusername/your-repo.git"
    exit 1
fi

echo "✅ Remote origin configured"

# Push to GitHub
echo "📤 Pushing to GitHub..."
git push origin main

if [ $? -eq 0 ]; then
    echo "✅ Code pushed to GitHub successfully"
else
    echo "❌ Failed to push to GitHub"
    exit 1
fi

echo ""
echo "🎯 Next Steps:"
echo "1. Go to https://render.com/dashboard"
echo "2. Create a new Web Service"
echo "3. Connect your GitHub repository"
echo "4. Use the configuration from RENDER_DEPLOYMENT_GUIDE.md"
echo "5. Deploy both backend and frontend services"
echo ""
echo "📚 For detailed instructions, see: RENDER_DEPLOYMENT_GUIDE.md"
echo ""
echo "🎉 Ready for deployment!"
