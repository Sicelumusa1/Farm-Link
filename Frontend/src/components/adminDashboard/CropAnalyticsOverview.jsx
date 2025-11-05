import React, { useState, useEffect } from 'react';
import { getAvailableCrops, searchCrops } from '../../services/ProduceService';
import '../../styles/CropAnalyticsOverview.css'


export default function CropAnalyticsOverview({ theme }) {
  const [crops, setCrops] = useState([]);
  const [filteredCrops, setFilteredCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    cropType: '',
    growthStage: '',
    minAvailability: '',
    maxAvailability: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [showOverview, setShowOverview] = useState(true);

  useEffect(() => {
    fetchCrops();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [crops, filters, searchTerm]);

  const fetchCrops = async () => {
    try {
      setLoading(true);
      // Use your existing service
      const data = await getAvailableCrops();
      setCrops(data.data || data || []);
    } catch (error) {
      console.error('Error fetching crops:', error);
      // Fallback to mock data if API fails
      const mockCrops = [
        {
          id: 1,
          cropName: 'Maize',
          farmName: 'Kamau Farm',
          farmerName: 'John Kamau',
          availability: 1500,
          growthStage: 'Harvesting',
          plantedDate: '2024-01-15',
          expectedYield: 2000,
          actualYield: 1800,
          ward: 3,
          pricePerKg: 45
        },
        {
          id: 2,
          cropName: 'Beans',
          farmName: 'Green Valley Farm',
          farmerName: 'Sarah Wanjiku',
          availability: 800,
          growthStage: 'Fruiting',
          plantedDate: '2024-02-01',
          expectedYield: 1000,
          actualYield: 850,
          ward: 5,
          pricePerKg: 120
        },
        {
          id: 3,
          cropName: 'Tomatoes',
          farmName: 'Fresh Produce Co.',
          farmerName: 'Peter Mwangi',
          availability: 300,
          growthStage: 'Flowering',
          plantedDate: '2024-02-15',
          expectedYield: 500,
          actualYield: 320,
          ward: 2,
          pricePerKg: 80
        },
        {
          id: 4,
          cropName: 'Cabbage',
          farmName: 'Vegetable Haven',
          farmerName: 'Mary Akinyi',
          availability: 600,
          growthStage: 'Vegetative',
          plantedDate: '2024-02-20',
          expectedYield: 800,
          actualYield: 0,
          ward: 4,
          pricePerKg: 35
        }
      ];
      setCrops(mockCrops);
    } finally {
      setLoading(false);
    }
  };

  // Missing function: applyFilters
  const applyFilters = () => {
    let filtered = [...crops];

    // Apply search term
    if (searchTerm) {
      filtered = filtered.filter(crop => 
        crop.cropName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        crop.farmName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        crop.farmerName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply filters
    if (filters.cropType) {
      filtered = filtered.filter(crop => crop.cropName === filters.cropType);
    }
    if (filters.growthStage) {
      filtered = filtered.filter(crop => crop.growthStage === filters.growthStage);
    }
    if (filters.minAvailability) {
      filtered = filtered.filter(crop => crop.availability >= parseInt(filters.minAvailability));
    }
    if (filters.maxAvailability) {
      filtered = filtered.filter(crop => crop.availability <= parseInt(filters.maxAvailability));
    }

    setFilteredCrops(filtered);
  };

  // Missing function: handleFilterChange
  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  // Missing function: clearFilters
  const clearFilters = () => {
    setFilters({
      cropType: '',
      growthStage: '',
      minAvailability: '',
      maxAvailability: ''
    });
    setSearchTerm('');
  };

  // Missing function: getCropTypes
  const getCropTypes = () => {
    const types = [...new Set(crops.map(crop => crop.cropName))];
    return types.filter(type => type); // Remove empty/null values
  };

  // Missing function: getGrowthStages
  const getGrowthStages = () => {
    const stages = [...new Set(crops.map(crop => crop.growthStage))];
    return stages.filter(stage => stage); // Remove empty/null values
  };

  // Missing function: getYieldEfficiency
  const getYieldEfficiency = (expected, actual) => {
    if (!expected || expected === 0) return 0;
    return Math.round((actual / expected) * 100);
  };

  if (!showOverview) {
    return (
      <div className={`crop-overview-minimized ${theme}`}>
        <div className="overview-minimized-header">
          <h3>Crop Analytics & Marketplace</h3>
          <button 
            className={`toggle-overview-btn ${theme}`}
            onClick={() => setShowOverview(true)}
          >
            Show Crop Overview
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={`crop-analytics-loading ${theme}`}>
        <div className="loading-spinner"></div>
        <p>Loading crop analytics...</p>
      </div>
    );
  }

  return (
    <div className={`crop-analytics-overview ${theme}`}>
      <div className="crop-analytics-header">
        <div className="analytics-header-main">
          <h3>Crop Analytics & Marketplace</h3>
          <p>Monitor crop performance and availability across all farms</p>
        </div>
        <button 
          className={`toggle-overview-btn ${theme}`}
          onClick={() => setShowOverview(false)}
        >
          Hide Overview
        </button>
      </div>

      {/* Filters Section */}
      <div className={`crop-filters ${theme}`}>
        <div className="filter-group">
          <input
            type="text"
            placeholder="Search crops, farms, or farmers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`search-input ${theme}`}
          />
        </div>
        
        <div className="filter-row">
          <div className="filter-group">
            <label>Crop Type:</label>
            <select 
              value={filters.cropType}
              onChange={(e) => handleFilterChange('cropType', e.target.value)}
              className={`filter-select ${theme}`}
            >
              <option value="">All Crops</option>
              {getCropTypes().map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Growth Stage:</label>
            <select 
              value={filters.growthStage}
              onChange={(e) => handleFilterChange('growthStage', e.target.value)}
              className={`filter-select ${theme}`}
            >
              <option value="">All Stages</option>
              {getGrowthStages().map(stage => (
                <option key={stage} value={stage}>{stage}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Availability (kg):</label>
            <div className="availability-range">
              <input
                type="number"
                placeholder="Min"
                value={filters.minAvailability}
                onChange={(e) => handleFilterChange('minAvailability', e.target.value)}
                className={`range-input ${theme}`}
              />
              <span>to</span>
              <input
                type="number"
                placeholder="Max"
                value={filters.maxAvailability}
                onChange={(e) => handleFilterChange('maxAvailability', e.target.value)}
                className={`range-input ${theme}`}
              />
            </div>
          </div>

          <button 
            className={`clear-filters-btn ${theme}`}
            onClick={clearFilters}
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Results Summary */}
      <div className={`results-summary ${theme}`}>
        <p>
          Showing <strong>{filteredCrops.length}</strong> of <strong>{crops.length}</strong> crops
          {searchTerm && ` matching "${searchTerm}"`}
        </p>
      </div>

      {/* Crops Grid */}
      <div className="crops-grid">
        {filteredCrops.length > 0 ? (
          filteredCrops.map(crop => (
            <div key={crop.id || crop._id} className={`crop-card ${theme}`}>
              <div className="crop-header">
                <h4 className="crop-name">{crop.cropName}</h4>
                <span className={`growth-stage-badge ${crop.growthStage?.toLowerCase()}`}>
                  {crop.growthStage || 'Not Set'}
                </span>
              </div>
              
              <div className="crop-details">
                <div className="detail-item">
                  <span className="detail-label">Farm:</span>
                  <span className="detail-value">{crop.farmName || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Farmer:</span>
                  <span className="detail-value">{crop.farmerName || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Ward:</span>
                  <span className="detail-value">{crop.ward || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Planted:</span>
                  <span className="detail-value">
                    {crop.plantedDate ? new Date(crop.plantedDate).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </div>

              <div className="crop-metrics">
                <div className="metric">
                  <span className="metric-label">Available</span>
                  <span className="metric-value availability">
                    {crop.availability || 0} kg
                  </span>
                </div>
                <div className="metric">
                  <span className="metric-label">Price</span>
                  <span className="metric-value price">
                    KSh {crop.pricePerKg || 'N/A'}/kg
                  </span>
                </div>
                <div className="metric">
                  <span className="metric-label">Yield Efficiency</span>
                  <span className={`metric-value efficiency ${
                    getYieldEfficiency(crop.expectedYield, crop.actualYield) >= 80 ? 'high' :
                    getYieldEfficiency(crop.expectedYield, crop.actualYield) >= 60 ? 'medium' : 'low'
                  }`}>
                    {getYieldEfficiency(crop.expectedYield, crop.actualYield)}%
                  </span>
                </div>
              </div>

              <div className="crop-actions">
                <button className={`action-btn view-details ${theme}`}>
                  View Details
                </button>
                <button className={`action-btn place-order ${theme}`}>
                  Place Order
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="no-crops-message">
            <p>No crops found matching your criteria.</p>
            <button 
              className={`clear-filters-btn ${theme}`}
              onClick={clearFilters}
            >
              Clear filters to see all crops
            </button>
          </div>
        )}
      </div>
    </div>
  );
}