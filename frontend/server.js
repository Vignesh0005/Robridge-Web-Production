const express = require('express');
const { spawn } = require('child_process');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('build')); // Serve React build files

// Store the Python process
let pythonProcess = null;

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start Python backend endpoint
app.post('/api/start-backend', async (req, res) => {
  try {
    // Kill existing process if running
    if (pythonProcess) {
      pythonProcess.kill();
      pythonProcess = null;
    }

    // Path to your Python backend
    const pythonPath = path.join(__dirname, '..', 'Barcode generator&Scanner', 'start_server.py');
    const pythonDir = path.join(__dirname, '..', 'Barcode generator&Scanner');

    console.log('Starting Python backend...');
    console.log('Python file:', pythonPath);
    console.log('Working directory:', pythonDir);

    // Start Python process
    pythonProcess = spawn('py', [pythonPath], {
      cwd: pythonDir,
      stdio: 'pipe'
    });

    // Handle process events
    pythonProcess.stdout.on('data', (data) => {
      console.log('Python stdout:', data.toString());
    });

    pythonProcess.stderr.on('data', (data) => {
      console.log('Python stderr:', data.toString());
    });

    pythonProcess.on('close', (code) => {
      console.log('Python process closed with code:', code);
      pythonProcess = null;
    });

    pythonProcess.on('error', (error) => {
      console.error('Failed to start Python process:', error);
      pythonProcess = null;
    });

    // Wait a bit for the process to start
    setTimeout(() => {
      if (pythonProcess && !pythonProcess.killed) {
        res.json({ 
          success: true, 
          message: 'Python backend started successfully',
          pid: pythonProcess.pid
        });
      } else {
        res.status(500).json({ 
          success: false, 
          message: 'Failed to start Python backend' 
        });
      }
    }, 2000);

  } catch (error) {
    console.error('Error starting backend:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error starting backend',
      error: error.message 
    });
  }
});

// Stop Python backend endpoint
app.post('/api/stop-backend', (req, res) => {
  try {
    if (pythonProcess) {
      pythonProcess.kill();
      pythonProcess = null;
      res.json({ success: true, message: 'Python backend stopped' });
    } else {
      res.json({ success: false, message: 'No Python backend running' });
    }
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error stopping backend',
      error: error.message 
    });
  }
});

// Get backend status
app.get('/api/backend-status', (req, res) => {
  const isRunning = pythonProcess && !pythonProcess.killed;
  res.json({ 
    running: isRunning,
    pid: isRunning ? pythonProcess.pid : null
  });
});

// Check if Python backend is running on port 5000
const checkPythonBackend = async () => {
  try {
    const response = await fetch('http://localhost:5000/health', {
      method: 'GET',
      signal: AbortSignal.timeout(2000)
    });
    return response.ok;
  } catch (error) {
    return false;
  }
};

// Proxy endpoints to Python backend
app.post('/api/generate_barcode', async (req, res) => {
  try {
    const isBackendRunning = await checkPythonBackend();
    if (!isBackendRunning) {
      return res.status(503).json({ 
        success: false, 
        error: 'Python backend is not running on port 5000' 
      });
    }

    // Forward request to Python backend
    const response = await fetch('http://localhost:5000/generate_barcode', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body)
    });

    const result = await response.json();
    res.json(result);
  } catch (error) {
    console.error('Error proxying to Python backend:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to communicate with Python backend' 
    });
  }
});

app.get('/api/get_barcode/:filename', async (req, res) => {
  try {
    const isBackendRunning = await checkPythonBackend();
    if (!isBackendRunning) {
      return res.status(503).json({ 
        success: false, 
        error: 'Python backend is not running on port 5000' 
      });
    }

    // Forward request to Python backend
    const response = await fetch(`http://localhost:5000/get_barcode/${req.params.filename}`);
    
    if (response.ok) {
      const buffer = await response.arrayBuffer();
      res.set('Content-Type', response.headers.get('Content-Type'));
      res.send(Buffer.from(buffer));
    } else {
      res.status(response.status).json({ 
        success: false, 
        error: 'Failed to get barcode image' 
      });
    }
  } catch (error) {
    console.error('Error proxying to Python backend:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to communicate with Python backend' 
    });
  }
});

app.get('/api/list_barcodes', async (req, res) => {
  try {
    const isBackendRunning = await checkPythonBackend();
    if (!isBackendRunning) {
      return res.status(503).json({ 
        success: false, 
        error: 'Python backend is not running on port 5000' 
      });
    }

    // Forward request to Python backend
    const response = await fetch('http://localhost:5000/list_barcodes');
    const result = await response.json();
    res.json(result);
  } catch (error) {
    console.error('Error proxying to Python backend:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to communicate with Python backend' 
    });
  }
});

// Serve React app for all other routes (only if build exists)
app.get('*', (req, res) => {
  const buildPath = path.join(__dirname, 'build', 'index.html');
  if (require('fs').existsSync(buildPath)) {
    res.sendFile(buildPath);
  } else {
    res.json({ 
      message: 'React build not found. Run "npm run build" first, or use development mode.',
      endpoints: {
        health: '/api/health',
        startBackend: '/api/start-backend',
        stopBackend: '/api/stop-backend',
        backendStatus: '/api/backend-status'
      }
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Python backend control available at http://localhost:${PORT}/api/`);
});
