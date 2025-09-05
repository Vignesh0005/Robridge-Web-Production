import React, { useState, useEffect } from 'react';
import { 
  FaWarehouse,
  FaMapMarkerAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationTriangle,
  FaSync,
  FaSearch,
  FaFilter,
  FaDownload,
  FaPlus,
  FaEdit,
  FaTrash,
  FaInfoCircle
} from 'react-icons/fa';
import './RackStatus.css';

const RackStatus = () => {
  const [racks, setRacks] = useState([
    {
      id: 1,
      name: 'Rack A-01',
      location: 'Warehouse Section 1',
      coordinates: { x: 10, y: 15 },
      status: 'occupied',
      occupiedBy: 'Robot-001',
      lastUpdated: '2024-01-15 14:30:25',
      capacity: 100,
      currentLoad: 85,
      temperature: 22.5,
      humidity: 45
    },
    {
      id: 2,
      name: 'Rack A-02',
      location: 'Warehouse Section 1',
      coordinates: { x: 25, y: 15 },
      status: 'free',
      occupiedBy: null,
      lastUpdated: '2024-01-15 14:28:10',
      capacity: 100,
      currentLoad: 0,
      temperature: 21.8,
      humidity: 42
    },
    {
      id: 3,
      name: 'Rack B-01',
      location: 'Warehouse Section 2',
      coordinates: { x: 10, y: 35 },
      status: 'maintenance',
      occupiedBy: null,
      lastUpdated: '2024-01-15 14:25:45',
      capacity: 100,
      currentLoad: 0,
      temperature: 23.1,
      humidity: 48
    },
    {
      id: 4,
      name: 'Rack B-02',
      location: 'Warehouse Section 2',
      coordinates: { x: 25, y: 35 },
      status: 'occupied',
      occupiedBy: 'Robot-003',
      lastUpdated: '2024-01-15 14:32:15',
      capacity: 100,
      currentLoad: 92,
      temperature: 22.3,
      humidity: 44
    },
    {
      id: 5,
      name: 'Rack C-01',
      location: 'Warehouse Section 3',
      coordinates: { x: 10, y: 55 },
      status: 'free',
      occupiedBy: null,
      lastUpdated: '2024-01-15 14:29:30',
      capacity: 100,
      currentLoad: 0,
      temperature: 21.5,
      humidity: 41
    },
    {
      id: 6,
      name: 'Rack C-02',
      location: 'Warehouse Section 3',
      coordinates: { x: 25, y: 55 },
      status: 'occupied',
      occupiedBy: 'Robot-002',
      lastUpdated: '2024-01-15 14:31:20',
      capacity: 100,
      currentLoad: 78,
      temperature: 22.8,
      humidity: 46
    }
  ]);

  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRack, setSelectedRack] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setRacks(prevRacks => 
        prevRacks.map(rack => ({
          ...rack,
          lastUpdated: new Date().toLocaleString(),
          temperature: (rack.temperature + (Math.random() - 0.5) * 0.5).toFixed(1),
          humidity: Math.max(30, Math.min(60, rack.humidity + (Math.random() - 0.5) * 2))
        }))
      );
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'occupied':
        return <FaCheckCircle className="status-icon occupied" />;
      case 'free':
        return <FaTimesCircle className="status-icon free" />;
      case 'maintenance':
        return <FaExclamationTriangle className="status-icon maintenance" />;
      default:
        return <FaInfoCircle className="status-icon" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'occupied':
        return '#EA4335';
      case 'free':
        return '#34A853';
      case 'maintenance':
        return '#FBBC05';
      default:
        return '#9AA0A6';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'occupied':
        return 'Occupied';
      case 'free':
        return 'Free';
      case 'maintenance':
        return 'Maintenance';
      default:
        return 'Unknown';
    }
  };

  const filteredRacks = racks.filter(rack => {
    const matchesStatus = filterStatus === 'all' || rack.status === filterStatus;
    const matchesSearch = rack.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         rack.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (rack.occupiedBy && rack.occupiedBy.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const refreshData = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setRacks(prevRacks => 
        prevRacks.map(rack => ({
          ...rack,
          lastUpdated: new Date().toLocaleString()
        }))
      );
      setIsRefreshing(false);
    }, 1000);
  };

  const exportData = () => {
    const csvContent = [
      ['Rack Name', 'Location', 'Status', 'Occupied By', 'Capacity', 'Current Load', 'Temperature', 'Humidity', 'Last Updated'],
      ...filteredRacks.map(rack => [
        rack.name,
        rack.location,
        getStatusText(rack.status),
        rack.occupiedBy || 'N/A',
        rack.capacity,
        rack.currentLoad,
        rack.temperature,
        rack.humidity,
        rack.lastUpdated
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rack-status-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const stats = {
    total: racks.length,
    occupied: racks.filter(r => r.status === 'occupied').length,
    free: racks.filter(r => r.status === 'free').length,
    maintenance: racks.filter(r => r.status === 'maintenance').length,
    utilization: Math.round((racks.filter(r => r.status === 'occupied').length / racks.length) * 100)
  };

  return (
    <div className="rack-status-container">
      <div className="rack-status-header">
        <div className="header-content">
          <h1>Rack Status</h1>
          <p>Monitor warehouse rack occupancy and status in real-time</p>
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
            <FaWarehouse />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total Racks</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon occupied">
            <FaCheckCircle />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.occupied}</div>
            <div className="stat-label">Occupied</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon free">
            <FaTimesCircle />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.free}</div>
            <div className="stat-label">Free</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon maintenance">
            <FaExclamationTriangle />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.maintenance}</div>
            <div className="stat-label">Maintenance</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon utilization">
            <FaInfoCircle />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.utilization}%</div>
            <div className="stat-label">Utilization</div>
          </div>
        </div>
      </div>

      <div className="controls-section">
        <div className="search-controls">
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search racks by name, location, or robot..."
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
              <option value="occupied">Occupied</option>
              <option value="free">Free</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>
        </div>
      </div>

      <div className="racks-grid">
        {filteredRacks.map(rack => (
          <div 
            key={rack.id} 
            className={`rack-card ${rack.status} ${selectedRack?.id === rack.id ? 'selected' : ''}`}
            onClick={() => setSelectedRack(rack)}
          >
            <div className="rack-header">
              <div className="rack-name">{rack.name}</div>
              <div className="rack-status">
                {getStatusIcon(rack.status)}
                <span style={{ color: getStatusColor(rack.status) }}>
                  {getStatusText(rack.status)}
                </span>
              </div>
            </div>
            
            <div className="rack-details">
              <div className="detail-item">
                <FaMapMarkerAlt className="detail-icon" />
                <span className="detail-label">Location:</span>
                <span className="detail-value">{rack.location}</span>
              </div>
              
              {rack.occupiedBy && (
                <div className="detail-item">
                  <FaWarehouse className="detail-icon" />
                  <span className="detail-label">Occupied by:</span>
                  <span className="detail-value">{rack.occupiedBy}</span>
                </div>
              )}
              
              <div className="detail-item">
                <span className="detail-label">Capacity:</span>
                <span className="detail-value">{rack.currentLoad}% / {rack.capacity}%</span>
              </div>
              
              <div className="detail-item">
                <span className="detail-label">Temperature:</span>
                <span className="detail-value">{rack.temperature}°C</span>
              </div>
              
              <div className="detail-item">
                <span className="detail-label">Humidity:</span>
                <span className="detail-value">{rack.humidity}%</span>
              </div>
            </div>
            
            <div className="rack-footer">
              <div className="last-updated">
                Last updated: {rack.lastUpdated}
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedRack && (
        <div className="rack-modal-overlay" onClick={() => setSelectedRack(null)}>
          <div className="rack-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedRack.name} - Details</h2>
              <button 
                className="close-btn"
                onClick={() => setSelectedRack(null)}
              >
                ×
              </button>
            </div>
            <div className="modal-content">
              <div className="modal-section">
                <h3>Status Information</h3>
                <div className="modal-details">
                  <div className="modal-detail-item">
                    <span className="modal-label">Status:</span>
                    <span 
                      className="modal-value"
                      style={{ color: getStatusColor(selectedRack.status) }}
                    >
                      {getStatusText(selectedRack.status)}
                    </span>
                  </div>
                  <div className="modal-detail-item">
                    <span className="modal-label">Location:</span>
                    <span className="modal-value">{selectedRack.location}</span>
                  </div>
                  <div className="modal-detail-item">
                    <span className="modal-label">Coordinates:</span>
                    <span className="modal-value">X: {selectedRack.coordinates.x}, Y: {selectedRack.coordinates.y}</span>
                  </div>
                  {selectedRack.occupiedBy && (
                    <div className="modal-detail-item">
                      <span className="modal-label">Occupied by:</span>
                      <span className="modal-value">{selectedRack.occupiedBy}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="modal-section">
                <h3>Environmental Data</h3>
                <div className="modal-details">
                  <div className="modal-detail-item">
                    <span className="modal-label">Temperature:</span>
                    <span className="modal-value">{selectedRack.temperature}°C</span>
                  </div>
                  <div className="modal-detail-item">
                    <span className="modal-label">Humidity:</span>
                    <span className="modal-value">{selectedRack.humidity}%</span>
                  </div>
                  <div className="modal-detail-item">
                    <span className="modal-label">Capacity:</span>
                    <span className="modal-value">{selectedRack.currentLoad}% / {selectedRack.capacity}%</span>
                  </div>
                </div>
              </div>
              
              <div className="modal-section">
                <h3>Last Updated</h3>
                <div className="modal-details">
                  <div className="modal-detail-item">
                    <span className="modal-value">{selectedRack.lastUpdated}</span>
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

export default RackStatus;
