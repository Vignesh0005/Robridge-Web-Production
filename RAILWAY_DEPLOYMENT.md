# Railway Deployment Guide

## Project Structure
```
Robridge-Web-Production/
├── backend/                    # Flask backend
│   ├── app.py                 # Main Flask app
│   ├── barcode_generator.py   # Barcode logic
│   ├── requirements.txt       # Python dependencies
│   ├── railway.json          # Railway config
│   └── ...
├── frontend/                   # React frontend
│   ├── package.json          # Node dependencies
│   ├── src/                  # React source code
│   ├── railway.json          # Railway config
│   └── ...
└── README.md
```

## Deployment Steps

### 1. Deploy Backend
1. Go to [Railway](https://railway.app)
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub Repo"
4. Select your repository
5. Choose the `backend` folder
6. Railway will auto-detect Python and install dependencies
7. Note the backend URL (e.g., `https://your-backend.up.railway.app`)

### 2. Deploy Frontend
1. Go to Railway → "New Project" → "Deploy from GitHub Repo"
2. Select the same repository
3. Choose the `frontend` folder
4. Railway will auto-detect Node.js
5. Set environment variable: `REACT_APP_API_URL` = your backend URL
6. Deploy

### 3. Connect Frontend to Backend
- Frontend will automatically use the `REACT_APP_API_URL` environment variable
- Update the fallback URL in `BarcodeGenerator.js` if needed

## Environment Variables

### Backend
- `PORT` (automatically set by Railway)
- `DATABASE_URL` (optional, defaults to local SQLite)

### Frontend
- `REACT_APP_API_URL` = your backend URL
- `PORT` (automatically set by Railway)

## Testing
1. Backend: Visit `https://your-backend.up.railway.app/api/health`
2. Frontend: Visit `https://your-frontend.up.railway.app`
3. Test barcode generation

## Troubleshooting
- Check Railway logs for errors
- Ensure CORS is properly configured
- Verify environment variables are set
