import React, { useState, useEffect } from 'react';
import { getOrders, getOrderStatistics, getRecentOrders } from '../../services/OrderService';
import '../../styles/MarketplaceOverview.css'

export default function MarketplaceOverview({ theme }) {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    cropType: '',
    minAmount: '',
    maxAmount: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [showOverview, setShowOverview] = useState(true);

  useEffect(() => {
    fetchMarketplaceData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [orders, filters, searchTerm]);

  const fetchMarketplaceData = async () => {
    try {
      setLoading(true);
      
      // Fetch real data from OrderService
      const [ordersData, statsData, recentOrdersData] = await Promise.all([
        getOrders(),
        getOrderStatistics(),
        getRecentOrders(20)
      ]);

      // Transform orders data to match marketplace format
      const transformedOrders = ordersData.data?.map(order => ({
        id: order._id || order.id,
        orderNumber: order.orderNumber || `ORD-${order._id?.slice(-6)}`,
        buyerName: order.buyer?.name || order.buyerName || 'Unknown Buyer',
        cropName: order.crop?.cropName || order.cropName || 'Unknown Crop',
        farmerName: order.farmer?.name || order.farmerName || 'Unknown Farmer',
        farmName: order.farm?.name || order.farmName || 'Unknown Farm',
        quantity: order.quantity || 0,
        pricePerKg: order.pricePerKg || 0,
        totalAmount: order.totalAmount || 0,
        status: order.status?.toLowerCase() || 'pending',
        quality: order.quality || 'Standard',
        location: order.farm?.ward ? `Ward ${order.farm.ward}` : 'Unknown Location',
        orderDate: order.createdAt || order.orderDate,
        deliveryDate: order.deliveryDate,
        deliveryMethod: order.deliveryMethod || 'pickup',
        contact: order.buyer?.phone || order.contact || 'N/A'
      }));

      setOrders(transformedOrders || []);
      
      // Transform analytics data
      if (statsData.data) {
        setAnalytics({
          totalOrders: statsData.data.totalOrders || 0,
          pendingOrders: statsData.data.pendingOrders || 0,
          completedOrders: statsData.data.completedOrders || 0,
          totalRevenue: statsData.data.totalRevenue || 0,
          averageOrderValue: statsData.data.averageOrderValue || 0,
          monthlyGrowth: statsData.data.monthlyGrowth || 0
        });
      }

    } catch (error) {
      console.error('Error fetching marketplace data:', error);
      // fallback or show error state
      setAnalytics({
        totalOrders: 0,
        pendingOrders: 0,
        completedOrders: 0,
        totalRevenue: 0,
        averageOrderValue: 0,
        monthlyGrowth: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...orders];

    // Apply search term
    if (searchTerm) {
      filtered = filtered.filter(order => 
        order.cropName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.farmerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.buyerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.farmName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply filters
    if (filters.status) {
      filtered = filtered.filter(order => order.status === filters.status);
    }
    if (filters.cropType) {
      filtered = filtered.filter(order => order.cropName === filters.cropType);
    }
    if (filters.minAmount) {
      filtered = filtered.filter(order => order.totalAmount >= parseInt(filters.minAmount));
    }
    if (filters.maxAmount) {
      filtered = filtered.filter(order => order.totalAmount <= parseInt(filters.maxAmount));
    }

    setFilteredOrders(filtered);
  };

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      cropType: '',
      minAmount: '',
      maxAmount: ''
    });
    setSearchTerm('');
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { label: 'Pending', color: 'warning' },
      confirmed: { label: 'Confirmed', color: 'info' },
      processing: { label: 'Processing', color: 'info' },
      shipped: { label: 'Shipped', color: 'info' },
      delivered: { label: 'Delivered', color: 'success' },
      completed: { label: 'Completed', color: 'success' },
      cancelled: { label: 'Cancelled', color: 'error' },
      rejected: { label: 'Rejected', color: 'error' }
    };
    
    const config = statusConfig[status] || { label: status, color: 'neutral' };
    return (
      <span className={`status-badge ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const getCropTypes = () => {
    const types = [...new Set(orders.map(order => order.cropName))];
    return types.filter(type => type && type !== 'Unknown Crop');
  };

  if (!showOverview) {
    return (
      <div className={`marketplace-overview-minimized ${theme}`}>
        <div className="overview-minimized-header">
          <h3>Marketplace Management</h3>
          <button 
            className={`toggle-overview-btn ${theme}`}
            onClick={() => setShowOverview(true)}
          >
            Show Marketplace
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={`marketplace-loading ${theme}`}>
        <div className="loading-spinner"></div>
        <p>Loading marketplace data...</p>
      </div>
    );
  }

  return (
    <div className={`marketplace-overview ${theme}`}>
      <div className="marketplace-header">
        <div className="marketplace-header-main">
          <h3>Marketplace Management</h3>
          <p>Manage orders, track transactions, and monitor marketplace activity</p>
        </div>
        <button 
          className={`toggle-overview-btn ${theme}`}
          onClick={() => setShowOverview(false)}
        >
          Hide Marketplace
        </button>
      </div>

      {/* Marketplace Stats */}
      {analytics && (
        <div className="marketplace-stats">
          <div className={`stat-card ${theme}`}>
            <div className="stat-icon"></div>
            <div className="stat-content">
              <h4>{analytics.totalOrders}</h4>
              <p>Total Orders</p>
            </div>
          </div>
          <div className={`stat-card ${theme}`}>
            <div className="stat-icon"></div>
            <div className="stat-content">
              <h4>{analytics.pendingOrders}</h4>
              <p>Pending Orders</p>
            </div>
          </div>
          <div className={`stat-card ${theme}`}>
            <div className="stat-icon"></div>
            <div className="stat-content">
              <h4>R {analytics.totalRevenue?.toLocaleString()}</h4>
              <p>Total Revenue</p>
            </div>
          </div>
          <div className={`stat-card ${theme}`}>
            <div className="stat-icon"></div>
            <div className="stat-content">
              <h4>R {analytics.averageOrderValue?.toLocaleString()}</h4>
              <p>Avg Order Value</p>
            </div>
          </div>
        </div>
      )}

      {/* Filters Section */}
      <div className={`marketplace-filters ${theme}`}>
        <div className="filter-group">
          <input
            type="text"
            placeholder="Search crops, farmers, buyers, or farms..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`search-input ${theme}`}
          />
        </div>
        
        <div className="filter-row">
          <div className="filter-group">
            <label>Status:</label>
            <select 
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className={`filter-select ${theme}`}
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

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
            <label>Order Value (R):</label>
            <div className="price-range">
              <input
                type="number"
                placeholder="Min"
                value={filters.minAmount}
                onChange={(e) => handleFilterChange('minAmount', e.target.value)}
                className={`range-input ${theme}`}
              />
              <span>to</span>
              <input
                type="number"
                placeholder="Max"
                value={filters.maxAmount}
                onChange={(e) => handleFilterChange('maxAmount', e.target.value)}
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
          Showing <strong>{filteredOrders.length}</strong> of <strong>{orders.length}</strong> orders
          {searchTerm && ` matching "${searchTerm}"`}
        </p>
      </div>

      {/* Orders Grid */}
      <div className="orders-grid">
        {filteredOrders.length > 0 ? (
          filteredOrders.map(order => (
            <div key={order.id} className={`order-card ${theme}`}>
              <div className="order-header">
                <div className="order-title">
                  <h4 className="order-number">{order.orderNumber}</h4>
                  <div className="order-badges">
                    {getStatusBadge(order.status)}
                  </div>
                </div>
                <div className="order-price">
                  <span className="amount">R {order.totalAmount?.toLocaleString()}</span>
                  <span className="quantity">{order.quantity} kg @ R {order.pricePerKg}/kg</span>
                </div>
              </div>
              
              <div className="order-details">
                <div className="detail-item">
                  <span className="detail-label">Crop:</span>
                  <span className="detail-value">{order.cropName}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Farmer:</span>
                  <span className="detail-value">{order.farmerName}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Farm:</span>
                  <span className="detail-value">{order.farmName}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Buyer:</span>
                  <span className="detail-value">{order.buyerName}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Location:</span>
                  <span className="detail-value">{order.location}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Order Date:</span>
                  <span className="detail-value">
                    {new Date(order.orderDate).toLocaleDateString()}
                  </span>
                </div>
                {order.deliveryDate && (
                  <div className="detail-item">
                    <span className="detail-label">Delivery Date:</span>
                    <span className="detail-value">
                      {new Date(order.deliveryDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>

              <div className="delivery-info">
                <span className="delivery-label">Delivery Method:</span>
                <span className={`delivery-method ${order.deliveryMethod}`}>
                  {order.deliveryMethod === 'delivery' ? 'Delivery' : 'Pickup'}
                </span>
              </div>

              <div className="order-actions">
                <button className={`action-btn view-details ${theme}`}>
                  View Details
                </button>
                <button className={`action-btn update-status ${theme}`}>
                  Update Status
                </button>
                {order.status === 'pending' && (
                  <button className={`action-btn quick-action ${theme}`}>
                    Process
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="no-orders-message">
            <p>No orders found matching your criteria.</p>
            <button 
              className={`clear-filters-btn ${theme}`}
              onClick={clearFilters}
            >
              Clear filters to see all orders
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

