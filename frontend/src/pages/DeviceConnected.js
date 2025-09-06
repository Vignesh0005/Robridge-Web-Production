import React, { useState, useEffect } from 'react';
import { 
  FaBarcode,
  FaWifi,
  FaTimesCircle,
  FaSync,
  FaSearch,
  FaFilter,
  FaDownload,
  FaPlus,
  FaEdit,
  FaTrash,
  FaInfoCircle,
  FaCheckCircle,
  FaExclamationTriangle,
  FaCog,
  FaSignal,
  FaBatteryFull,
  FaBatteryThreeQuarters,
  FaBatteryHalf,
  FaBatteryQuarter,
  FaBatteryEmpty,
  FaClock,
  FaMapMarkerAlt
} from 'react-icons/fa';
import './DeviceConnected.css';

const DeviceConnected = () => {
  const [devices, setDevices] = useState([
    {
      id: 1,
      name: 'Barcode Scanner 1',
      deviceId: 'BCS-2024-001',
      type: 'Handheld Scanner',
      status: 'online',
      lastSeen: '2024-01-15 14:30:25',
      batteryLevel: 85,
      signalStrength: 95,
      location: 'Warehouse Floor A',
      firmware: 'v2.1.4',
      serialNumber: 'SN-2024001',
      ipAddress: '192.168.1.101',
      macAddress: '00:1B:44:11:3A:B7',
      scanCount: 1247,
      lastScan: '2024-01-15 14:29:15'
    },
    {
      id: 2,
      name: 'Barcode Scanner 2',
      deviceId: 'BCS-2024-002',
      type: 'Fixed Scanner',
      status: 'online',
      lastSeen: '2024-01-15 14:28:10',
      batteryLevel: 100,
      signalStrength: 88,
      location: 'Loading Dock 1',
      firmware: 'v1.8.2',
      serialNumber: 'SN-2024002',
      ipAddress: '192.168.1.102',
      macAddress: '00:1B:44:11:3A:B8',
      scanCount: 892,
      lastScan: '2024-01-15 14:27:45'
    },
    {
      id: 3,
      name: 'Barcode Scanner 3',
      deviceId: 'BCS-2024-003',
      type: 'Mobile Device',
      status: 'offline',
      lastSeen: '2024-01-15 13:45:30',
      batteryLevel: 23,
      signalStrength: 0,
      location: 'Unknown',
      firmware: 'v2.0.1',
      serialNumber: 'SN-2024003',
      ipAddress: '192.168.1.103',
      macAddress: '00:1B:44:11:3A:B9',
      scanCount: 456,
      lastScan: '2024-01-15 13:44:20'
    },
    {
      id: 4,
      name: 'Barcode Scanner 4',
      deviceId: 'BCS-2024-004',
      type: 'Industrial Scanner',
      status: 'online',
      lastSeen: '2024-01-15 14:32:15',
      batteryLevel: 92,
      signalStrength: 76,
      location: 'Production Line B',
      firmware: 'v3.2.1',
      serialNumber: 'SN-2024004',
      ipAddress: '192.168.1.104',
      macAddress: '00:1B:44:11:3A:BA',
      scanCount: 2156,
      lastScan: '2024-01-15 14:31:50'
    },
    {
      id: 5,
      name: 'Barcode Scanner 5',
      deviceId: 'BCS-2024-005',
      type: 'Pocket Scanner',
      status: 'maintenance',
      lastSeen: '2024-01-15 12:15:45',
      batteryLevel: 67,
      signalStrength: 45,
      location: 'Maintenance Bay',
      firmware: 'v1.5.3',
      serialNumber: 'SN-2024005',
      ipAddress: '192.168.1.105',
      macAddress: '00:1B:44:11:3A:BB',
      scanCount: 789,
      lastScan: '2024-01-15 12:14:30'
    },
    {
      id: 6,
      name: 'Barcode Scanner 6',
      deviceId: 'BCS-2024-006',
      type: 'Desktop Scanner',
      status: 'online',
      lastSeen: '2024-01-15 14:31:20',
      batteryLevel: 100,
      signalStrength: 98,
      location: 'Office Desk 1',
      firmware: 'v2.3.0',
      serialNumber: 'SN-2024006',
      ipAddress: '192.168.1.106',
      macAddress: '00:1B:44:11:3A:BC',
      scanCount: 3421,
      lastScan: '2024-01-15 14:30:55'
    }
  ]);

  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setDevices(prevDevices => 
        prevDevices.map(device => {
          if (device.status === 'online') {
            return {
              ...device,
              lastSeen: new Date().toLocaleString(),
              batteryLevel: Math.max(0, Math.floor(device.batteryLevel - Math.random() * 0.5)),
              signalStrength: Math.max(0, Math.min(100, device.signalStrength + (Math.random() - 0.5) * 10)),
              scanCount: device.scanCount + Math.floor(Math.random() * 3),
              lastScan: Math.random() > 0.7 ? new Date().toLocaleString() : device.lastScan
            };
          }
          return device;
        })
      );
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'online':
        return <FaWifi className="status-icon online" />;
      case 'offline':
        return <FaTimesCircle className="status-icon offline" />;
      case 'maintenance':
        return <FaCog className="status-icon maintenance" />;
      default:
        return <FaInfoCircle className="status-icon" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'online':
        return '#34A853';
      case 'offline':
        return '#EA4335';
      case 'maintenance':
        return '#FBBC05';
      default:
        return '#9AA0A6';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'online':
        return 'Online';
      case 'offline':
        return 'Offline';
      case 'maintenance':
        return 'Maintenance';
      default:
        return 'Unknown';
    }
  };

  const getBatteryIcon = (level) => {
    if (level > 80) return <FaBatteryFull />;
    if (level > 60) return <FaBatteryThreeQuarters />;
    if (level > 40) return <FaBatteryHalf />;
    if (level > 20) return <FaBatteryQuarter />;
    return <FaBatteryEmpty />;
  };

  const getBatteryColor = (level) => {
    if (level > 60) return '#34A853';
    if (level > 30) return '#FBBC05';
    return '#EA4335';
  };

  const getSignalStrength = (strength) => {
    if (strength > 80) return 'Excellent';
    if (strength > 60) return 'Good';
    if (strength > 40) return 'Fair';
    if (strength > 20) return 'Poor';
    return 'No Signal';
  };

  const getSignalColor = (strength) => {
    if (strength > 60) return '#34A853';
    if (strength > 40) return '#FBBC05';
    return '#EA4335';
  };

  const filteredDevices = devices.filter(device => {
    const matchesStatus = filterStatus === 'all' || device.status === filterStatus;
    const matchesSearch = device.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         device.deviceId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         device.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         device.location.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const refreshData = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setDevices(prevDevices => 
        prevDevices.map(device => ({
          ...device,
          lastSeen: new Date().toLocaleString()
        }))
      );
      setIsRefreshing(false);
    }, 1000);
  };

  const exportData = () => {
    const csvContent = [
      ['Device Name', 'Device ID', 'Type', 'Status', 'Battery Level', 'Signal Strength', 'Location', 'Last Seen', 'Scan Count'],
      ...filteredDevices.map(device => [
        device.name,
        device.deviceId,
        device.type,
        getStatusText(device.status),
        device.batteryLevel + '%',
        device.signalStrength + '%',
        device.location,
        device.lastSeen,
        device.scanCount
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `device-status-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const stats = {
    total: devices.length,
    online: devices.filter(d => d.status === 'online').length,
    offline: devices.filter(d => d.status === 'offline').length,
    maintenance: devices.filter(d => d.status === 'maintenance').length,
    avgBattery: Math.floor(devices.reduce((sum, d) => sum + d.batteryLevel, 0) / devices.length),
    totalScans: devices.reduce((sum, d) => sum + d.scanCount, 0)
  };

  return (
    <div className="device-connected-container">
      <div className="device-header">
        <div className="header-content">
          <h1>Device Connected</h1>
          <p>Monitor barcode scanner devices and their connection status</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-secondary" onClick={refreshData} disabled={isRefreshing}>
            <FaSync className={isRefreshing ? 'spinning' : ''} />
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </button>
          <button className="btn btn-success" onClick={exportData}>
            <FaDownload />
            Export CSV
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon total">
            <FaBarcode />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total Devices</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon online">
            <FaWifi />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.online}</div>
            <div className="stat-label">Online</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon offline">
            <FaTimesCircle />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.offline}</div>
            <div className="stat-label">Offline</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon maintenance">
            <FaCog />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.maintenance}</div>
            <div className="stat-label">Maintenance</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon battery">
            <FaBatteryFull />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.avgBattery}%</div>
            <div className="stat-label">Avg Battery</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon scans">
            <FaBarcode />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.totalScans.toLocaleString()}</div>
            <div className="stat-label">Total Scans</div>
          </div>
        </div>
      </div>

      <div className="controls-section">
        <div className="search-controls">
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search devices by name, ID, type, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filter-controls">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Status</option>
              <option value="online">Online</option>
              <option value="offline">Offline</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>
        </div>
      </div>

      <div className="devices-grid">
        {filteredDevices.map(device => (
          <div 
            key={device.id} 
            className={`device-card ${device.status} ${selectedDevice?.id === device.id ? 'selected' : ''}`}
            onClick={() => setSelectedDevice(device)}
          >
            <div className="device-header">
              <div className="device-name">{device.name}</div>
              <div className="device-status">
                {getStatusIcon(device.status)}
                <span style={{ color: getStatusColor(device.status) }}>
                  {getStatusText(device.status)}
                </span>
              </div>
            </div>
            
            <div className="device-details">
              <div className="detail-item">
                <FaBarcode className="detail-icon" />
                <span className="detail-label">Device ID:</span>
                <span className="detail-value">{device.deviceId}</span>
              </div>
              
              <div className="detail-item">
                <FaInfoCircle className="detail-icon" />
                <span className="detail-label">Type:</span>
                <span className="detail-value">{device.type}</span>
              </div>
              
              <div className="detail-item">
                <FaMapMarkerAlt className="detail-icon" />
                <span className="detail-label">Location:</span>
                <span className="detail-value">{device.location}</span>
              </div>
              
              <div className="detail-item">
                <div className="detail-icon battery">
                  {getBatteryIcon(device.batteryLevel)}
                </div>
                <span className="detail-label">Battery:</span>
                <span 
                  className="detail-value"
                  style={{ color: getBatteryColor(device.batteryLevel) }}
                >
                  {Math.floor(device.batteryLevel)}%
                </span>
              </div>
              
              <div className="detail-item">
                <FaSignal className="detail-icon" />
                <span className="detail-label">Signal:</span>
                <span 
                  className="detail-value"
                  style={{ color: getSignalColor(device.signalStrength) }}
                >
                  {device.signalStrength}% ({getSignalStrength(device.signalStrength)})
                </span>
              </div>
              
              <div className="detail-item">
                <FaBarcode className="detail-icon" />
                <span className="detail-label">Scans:</span>
                <span className="detail-value">{device.scanCount.toLocaleString()}</span>
              </div>
            </div>
            
            <div className="device-footer">
              <div className="last-seen">
                Last seen: {device.lastSeen}
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedDevice && (
        <div className="device-modal-overlay" onClick={() => setSelectedDevice(null)}>
          <div className="device-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedDevice.name} - Device Details</h2>
              <button 
                className="close-btn"
                onClick={() => setSelectedDevice(null)}
              >
                ×
              </button>
            </div>
            <div className="modal-content">
              <div className="modal-section">
                <h3>Device Information</h3>
                <div className="modal-details">
                  <div className="modal-detail-item">
                    <span className="modal-label">Device ID:</span>
                    <span className="modal-value">{selectedDevice.deviceId}</span>
                  </div>
                  <div className="modal-detail-item">
                    <span className="modal-label">Type:</span>
                    <span className="modal-value">{selectedDevice.type}</span>
                  </div>
                  <div className="modal-detail-item">
                    <span className="modal-label">Serial Number:</span>
                    <span className="modal-value">{selectedDevice.serialNumber}</span>
                  </div>
                  <div className="modal-detail-item">
                    <span className="modal-label">Firmware:</span>
                    <span className="modal-value">{selectedDevice.firmware}</span>
                  </div>
                  <div className="modal-detail-item">
                    <span className="modal-label">Location:</span>
                    <span className="modal-value">{selectedDevice.location}</span>
                  </div>
                </div>
              </div>
              
              <div className="modal-section">
                <h3>Network Information</h3>
                <div className="modal-details">
                  <div className="modal-detail-item">
                    <span className="modal-label">IP Address:</span>
                    <span className="modal-value">{selectedDevice.ipAddress}</span>
                  </div>
                  <div className="modal-detail-item">
                    <span className="modal-label">MAC Address:</span>
                    <span className="modal-value">{selectedDevice.macAddress}</span>
                  </div>
                  <div className="modal-detail-item">
                    <span className="modal-label">Signal Strength:</span>
                    <span 
                      className="modal-value"
                      style={{ color: getSignalColor(selectedDevice.signalStrength) }}
                    >
                      {selectedDevice.signalStrength}% ({getSignalStrength(selectedDevice.signalStrength)})
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="modal-section">
                <h3>Performance Data</h3>
                <div className="modal-details">
                  <div className="modal-detail-item">
                    <span className="modal-label">Battery Level:</span>
                    <span 
                      className="modal-value"
                      style={{ color: getBatteryColor(selectedDevice.batteryLevel) }}
                    >
                      {Math.floor(selectedDevice.batteryLevel)}%
                    </span>
                  </div>
                  <div className="modal-detail-item">
                    <span className="modal-label">Total Scans:</span>
                    <span className="modal-value">{selectedDevice.scanCount.toLocaleString()}</span>
                  </div>
                  <div className="modal-detail-item">
                    <span className="modal-label">Last Scan:</span>
                    <span className="modal-value">{selectedDevice.lastScan}</span>
                  </div>
                  <div className="modal-detail-item">
                    <span className="modal-label">Last Seen:</span>
                    <span className="modal-value">{selectedDevice.lastSeen}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeviceConnected;
