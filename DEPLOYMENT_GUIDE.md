# 🚀 RobBridge Deployment Guide for Vercel

## Prerequisites
- [Vercel account](https://vercel.com) (free tier available)
- [GitHub account](https://github.com) (to host your code)
- [Heroku account](https://heroku.com) (for Python backend - free tier available)

## Step 1: Prepare Your Code

### 1.1 Build the React App
```bash
cd "Robridge web"
npm run build
```

### 1.2 Test the Build Locally
```bash
npx serve -s build
```

## Step 2: Deploy Python Backend to Heroku

### 2.1 Create Heroku App
1. Go to [Heroku Dashboard](https://dashboard.heroku.com)
2. Click "New" → "Create new app"
3. Name your app (e.g., `robridge-python-backend`)
4. Choose region and create app

### 2.2 Prepare Python Backend for Heroku
Create these files in your `Barcode generator&Scanner` folder:

**Procfile** (no extension):
```
web: python start_server.py
```

**runtime.txt**:
```
python-3.11.0
```

### 2.3 Deploy to Heroku
```bash
cd "Barcode generator&Scanner"
git init
git add .
git commit -m "Initial commit"
heroku git:remote -a your-app-name
git push heroku main
```

## Step 3: Deploy Frontend to Vercel

### 3.1 Push to GitHub
1. Create a new repository on GitHub
2. Push your code:
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/robridge.git
git push -u origin main
```

### 3.2 Deploy to Vercel
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Configure settings:
   - **Framework Preset**: Create React App
   - **Root Directory**: `Robridge web`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
   - **Install Command**: `npm install`

### 3.3 Set Environment Variables
In Vercel dashboard, go to your project → Settings → Environment Variables:
```
PYTHON_BACKEND_URL=https://your-heroku-app.herokuapp.com
NODE_ENV=production
```

## Step 4: Update Frontend Code

### 4.1 Update API URLs
In your React components, update the API base URL:
```javascript
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-vercel-app.vercel.app/api'
  : 'http://localhost:3001/api';
```

### 4.2 Update BarcodeGenerator.js
Replace the hardcoded URLs with environment variables.

## Step 5: Test Your Deployment

### 5.1 Test Frontend
- Visit your Vercel URL
- Test login functionality
- Test barcode generation

### 5.2 Test Backend
- Check Heroku logs: `heroku logs --tail -a your-app-name`
- Test API endpoints directly

## Step 6: Custom Domain (Optional)

### 6.1 Add Custom Domain in Vercel
1. Go to your project → Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed

## Troubleshooting

### Common Issues:

1. **Build Failures**
   - Check build logs in Vercel dashboard
   - Ensure all dependencies are in package.json

2. **API Connection Issues**
   - Verify PYTHON_BACKEND_URL environment variable
   - Check CORS settings in Python backend

3. **Python Backend Issues**
   - Check Heroku logs for errors
   - Ensure all Python dependencies are in requirements.txt

### Environment Variables Checklist:
- [ ] `PYTHON_BACKEND_URL` set in Vercel
- [ ] `NODE_ENV=production` set in Vercel
- [ ] Python backend deployed and accessible

## Production URLs
- **Frontend**: `https://your-app.vercel.app`
- **Backend**: `https://your-app.herokuapp.com`
- **API Health**: `https://your-app.vercel.app/api/health`

## Support
If you encounter issues:
1. Check Vercel function logs
2. Check Heroku application logs
3. Verify environment variables
4. Test API endpoints individually
