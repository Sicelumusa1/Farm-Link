import React, { useState, useEffect } from 'react';
import { getRevenueAnalytics, getOrderStatistics } from '../../services/DataVisualizationService';
import '../../styles/DataVisualization.css'

export default function RevenueAnalytics({ theme }) {
  const [revenueData, setRevenueData] = useState(null);
  const [orderStats, setOrderStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeFrame, setTimeFrame] = useState('monthly');
  const [showAnalytics, setShowAnalytics] = useState(true);

  useEffect(() => {
    fetchRevenueData();
  }, [timeFrame]);

  const fetchRevenueData = async () => {
    try {
      setLoading(true);
      
      // Fetch real data from your services
      const [revenueAnalytics, orderStatistics] = await Promise.all([
        getRevenueAnalytics(timeFrame),
        getOrderStatistics()
      ]);

      // Use actual data or fallback to transformed mock data
      const transformedRevenueData = revenueAnalytics.data || getMockRevenueData();
      const transformedOrderStats = orderStatistics.data || getMockOrderStats();

      setRevenueData(transformedRevenueData);
      setOrderStats(transformedOrderStats);
    } catch (error) {
      console.error('Error fetching revenue data:', error);
      // Fallback to mock data
      setRevenueData(getMockRevenueData());
      setOrderStats(getMockOrderStats());
    } finally {
      setLoading(false);
    }
  };

  // Mock data fallback
  const getMockRevenueData = () => ({
    revenue: [45000, 52000, 48000, 61000, 58000, 72000, 68000, 79000],
    expenses: [12000, 15000, 13000, 14000, 16000, 18000, 17000, 19000],
    profit: [33000, 37000, 35000, 47000, 42000, 54000, 51000, 60000],
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug']
  });

  const getMockOrderStats = () => ({
    totalRevenue: 456000,
    totalOrders: 89,
    averageOrderValue: 5123,
    conversionRate: 68,
    topProducts: [
      { name: 'Premium Maize', revenue: 156000 },
      { name: 'Organic Beans', revenue: 124000 },
      { name: 'Fresh Tomatoes', revenue: 89000 },
      { name: 'Green Cabbage', revenue: 57000 },
      { name: 'Sweet Potatoes', revenue: 30000 }
    ]
  });

  const formatCurrency = (amount) => {
    return `R ${amount?.toLocaleString()}`;
  };

  if (!showAnalytics) {
    return (
      <div className={`revenue-analytics-minimized ${theme}`}>
        <div className="minimized-header">
          <h3>Revenue Analytics</h3>
          <button 
            className={`toggle-analytics-btn ${theme}`}
            onClick={() => setShowAnalytics(true)}
          >
            Show Revenue Analytics
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={`revenue-analytics-loading ${theme}`}>
        <div className="loading-spinner"></div>
        <p>Loading revenue analytics...</p>
      </div>
    );
  }

  return (
    <div className={`revenue-analytics ${theme}`}>
      <div className="analytics-header">
        <div className="header-main">
          <h3>Revenue Analytics</h3>
          <p>Track financial performance, revenue trends, and order statistics</p>
        </div>
        <div className="analytics-controls">
          <select 
            value={timeFrame}
            onChange={(e) => setTimeFrame(e.target.value)}
            className={`chart-select ${theme}`}
          >
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
          </select>
          <button 
            className={`toggle-analytics-btn ${theme}`}
            onClick={() => setShowAnalytics(false)}
          >
            Hide Analytics
          </button>
        </div>
      </div>

      <div className="revenue-grid">
        {/* Revenue vs Expenses Chart */}
        <div className={`chart-container large ${theme}`}>
          <h4>Revenue vs Expenses</h4>
          <div className="revenue-chart">
            <div className="chart-bars">
              {revenueData?.labels?.map((label, index) => (
                <div key={label} className="bar-group">
                  <div className="bar-label">{label}</div>
                  <div className="bars-container">
                    <div 
                      className="bar revenue-bar"
                      style={{ height: `${(revenueData.revenue[index] / 90000) * 100}%` }}
                      title={`Revenue: ${formatCurrency(revenueData.revenue[index])}`}
                    >
                      <span className="bar-value">{formatCurrency(revenueData.revenue[index])}</span>
                    </div>
                    <div 
                      className="bar expense-bar"
                      style={{ height: `${(revenueData.expenses[index] / 90000) * 100}%` }}
                      title={`Expenses: ${formatCurrency(revenueData.expenses[index])}`}
                    >
                      <span className="bar-value">{formatCurrency(revenueData.expenses[index])}</span>
                    </div>
                    <div 
                      className="bar profit-bar"
                      style={{ height: `${(revenueData.profit[index] / 90000) * 100}%` }}
                      title={`Profit: ${formatCurrency(revenueData.profit[index])}`}
                    >
                      <span className="bar-value">{formatCurrency(revenueData.profit[index])}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="chart-legend">
              <div className="legend-item">
                <div className="legend-color revenue"></div>
                <span>Revenue</span>
              </div>
              <div className="legend-item">
                <div className="legend-color expense"></div>
                <span>Expenses</span>
              </div>
              <div className="legend-item">
                <div className="legend-color profit"></div>
                <span>Profit</span>
              </div>
            </div>
          </div>
        </div>

        {/* Key Financial Metrics */}
        <div className={`metrics-container ${theme}`}>
          <h4>Financial Overview</h4>
          <div className="financial-metrics">
            <div className="financial-card total-revenue">
              <div className="metric-icon"></div>
              <div className="metric-content">
                <h5>Total Revenue</h5>
                <div className="metric-value">{formatCurrency(orderStats?.totalRevenue)}</div>
                <div className="metric-trend positive">+18.5% from last period</div>
              </div>
            </div>
            <div className="financial-card total-orders">
              <div className="metric-icon"></div>
              <div className="metric-content">
                <h5>Total Orders</h5>
                <div className="metric-value">{orderStats?.totalOrders}</div>
                <div className="metric-trend positive">+12 orders this month</div>
              </div>
            </div>
            <div className="financial-card avg-order">
              <div className="metric-icon"></div>
              <div className="metric-content">
                <h5>Avg Order Value</h5>
                <div className="metric-value">{formatCurrency(orderStats?.averageOrderValue)}</div>
                <div className="metric-trend positive">+8.2% increase</div>
              </div>
            </div>
            <div className="financial-card conversion">
              <div className="metric-icon"></div>
              <div className="metric-content">
                <h5>Conversion Rate</h5>
                <div className="metric-value">{orderStats?.conversionRate}%</div>
                <div className="metric-trend neutral">Stable performance</div>
              </div>
            </div>
          </div>
        </div>

        {/* Top Products */}
        <div className={`chart-container ${theme}`}>
          <h4>Top Performing Products</h4>
          <div className="top-products">
            {orderStats?.topProducts?.map((product, index) => (
              <div key={product.name} className="product-item">
                <div className="product-info">
                  <span className="product-rank">#{index + 1}</span>
                  <span className="product-name">{product.name}</span>
                </div>
                <div className="product-revenue">
                  <span className="revenue-amount">{formatCurrency(product.revenue)}</span>
                  <div 
                    className="revenue-bar"
                    style={{ 
                      width: `${(product.revenue / orderStats.topProducts[0].revenue) * 100}%` 
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Profit Margin Analysis */}
        <div className={`chart-container ${theme}`}>
          <h4>Profit Margin Analysis</h4>
          <div className="profit-margins">
            <div className="margin-item">
              <span className="margin-label">Overall Margin</span>
              <div className="margin-bar-container">
                <div 
                  className="margin-bar"
                  style={{ width: '72%' }}
                ></div>
              </div>
              <span className="margin-percentage">72%</span>
            </div>
            <div className="margin-item">
              <span className="margin-label">Maize Products</span>
              <div className="margin-bar-container">
                <div 
                  className="margin-bar"
                  style={{ width: '68%' }}
                ></div>
              </div>
              <span className="margin-percentage">68%</span>
            </div>
            <div className="margin-item">
              <span className="margin-label">Vegetables</span>
              <div className="margin-bar-container">
                <div 
                  className="margin-bar"
                  style={{ width: '75%' }}
                ></div>
              </div>
              <span className="margin-percentage">75%</span>
            </div>
            <div className="margin-item">
              <span className="margin-label">Organic Products</span>
              <div className="margin-bar-container">
                <div 
                  className="margin-bar"
                  style={{ width: '82%' }}
                ></div>
              </div>
              <span className="margin-percentage">82%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}