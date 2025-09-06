import React, { useState, useRef } from 'react';
import { FaCamera, FaUpload, FaCheck, FaTimes, FaDownload, FaBarcode } from 'react-icons/fa';
import './BarcodeScanner.css';

const BarcodeScanner = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [scannedCode, setScannedCode] = useState('');
  const [scanResult, setScanResult] = useState(null);
  const [cameraError, setCameraError] = useState('');
  const [uploadedImage, setUploadedImage] = useState(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Mock database record for demonstration
  const mockDbRecord = {
    id: 'PRD-001',
    name: 'Sample Product',
    category: 'Electronics',
    price: '$99.99',
    location: 'Warehouse A',
    lastUpdated: '2024-01-15',
    status: 'Active'
  };

  const startCamera = async () => {
    try {
      setCameraError('');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 640 },
          height: { ideal: 480 }
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsScanning(true);
      }
    } catch (err) {
      setCameraError('Failed to access camera. Please check permissions.');
      console.error('Camera error:', err);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsScanning(false);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target.result);
        // Simulate barcode detection from image
        setTimeout(() => {
          const mockCode = 'UPL-' + Math.random().toString(36).substr(2, 8).toUpperCase();
          setScannedCode(mockCode);
          setScanResult(mockDbRecord);
        }, 1000);
      };
      reader.readAsDataURL(file);
    }
  };

  const simulateBarcodeScan = () => {
    // Simulate barcode detection
    const mockCode = 'SCN-' + Math.random().toString(36).substr(2, 8).toUpperCase();
    setScannedCode(mockCode);
    setScanResult(mockDbRecord);
    stopCamera();
  };

  const resetScanner = () => {
    setScannedCode('');
    setScanResult(null);
    setUploadedImage(null);
    stopCamera();
  };

  return (
    <div className="barcode-scanner">
      <div className="scanner-header">
        <h1>Barcode Scanner</h1>
        <p>Scan barcodes using camera or upload images for processing</p>
      </div>

      <div className="scanner-container">
        {/* Left Section - Camera/Upload */}
        <div className="scan-section card">
          <h2>Scan Section</h2>
          
          {/* Camera Scanner */}
          <div className="camera-section">
            <div className="camera-container">
              {isScanning ? (
                <div className="camera-viewport">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    style={{ width: '100%', height: '400px', objectFit: 'cover' }}
                  />
                  <div className="scan-overlay">
                    <div className="scan-frame"></div>
                    <div className="scan-instructions">
                      Position barcode within the frame
                    </div>
                  </div>
                </div>
              ) : (
                <div className="camera-placeholder">
                  <FaCamera size={48} />
                  <p>Camera ready for scanning</p>
                </div>
              )}
            </div>
            
            {cameraError && (
              <div className="error-message">
                <FaTimes />
                {cameraError}
              </div>
            )}

            <div className="camera-controls">
              {!isScanning ? (
                <button className="btn btn-primary" onClick={startCamera}>
                  <FaCamera />
                  Open Camera
                </button>
              ) : (
                <div className="scanning-controls">
                  <button className="btn btn-success" onClick={simulateBarcodeScan}>
                    <FaBarcode />
                    Simulate Scan
                  </button>
                  <button className="btn btn-warning" onClick={stopCamera}>
                    <FaTimes />
                    Close Camera
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Upload Section */}
          <div className="upload-section">
            <h3>Or Upload Image</h3>
            <div className="upload-area">
              <input
                type="file"
                id="barcode-upload"
                accept="image/*"
                onChange={handleFileUpload}
                className="file-input"
              />
              <label htmlFor="barcode-upload" className="upload-label">
                <FaUpload size={32} />
                <span>Click to upload barcode image</span>
                <span className="upload-hint">or drag and drop</span>
              </label>
            </div>
            
            {uploadedImage && (
              <div className="uploaded-image">
                <img src={uploadedImage} alt="Uploaded barcode" />
              </div>
            )}
          </div>
        </div>

        {/* Right Section - Results */}
        <div className="result-section">
          {scannedCode ? (
            <div className="result-panel card fade-in">
              <h2>Scan Result</h2>
              
              <div className="barcode-info">
                <div className="barcode-code">
                  <strong>Barcode:</strong> {scannedCode}
                </div>
                <div className="barcode-image">
                  <FaBarcode size={100} />
                  <p>Barcode Image</p>
                </div>
              </div>

              {scanResult && (
                <div className="db-record">
                  <h3>Database Record</h3>
                  <div className="record-table">
                    <table>
                      <tbody>
                        <tr>
                          <td>Product ID</td>
                          <td>{scanResult.id}</td>
                        </tr>
                        <tr>
                          <td>Name</td>
                          <td>{scanResult.name}</td>
                        </tr>
                        <tr>
                          <td>Category</td>
                          <td>{scanResult.category}</td>
                        </tr>
                        <tr>
                          <td>Price</td>
                          <td>{scanResult.price}</td>
                        </tr>
                        <tr>
                          <td>Location</td>
                          <td>{scanResult.location}</td>
                        </tr>
                        <tr>
                          <td>Last Updated</td>
                          <td>{scanResult.lastUpdated}</td>
                        </tr>
                        <tr>
                          <td>Status</td>
                          <td>
                            <span className={`status-badge ${scanResult.status.toLowerCase()}`}>
                              {scanResult.status}
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="result-actions">
                <button className="btn btn-success">
                  <FaCheck />
                  Validate Record
                </button>
                
                <button className="btn btn-secondary">
                  <FaDownload />
                  Export Result
                </button>
                
                <button className="btn btn-secondary" onClick={resetScanner}>
                  <FaTimes />
                  Reset Scanner
                </button>
              </div>
            </div>
          ) : (
            <div className="no-result card">
              <FaBarcode size={64} />
              <h3>No Barcode Scanned</h3>
              <p>Open the camera and scan a barcode to see results here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BarcodeScanner;
