import React, { useState, useEffect } from 'react';
import { getYieldTrends, getCropDistribution } from '../../services/DataVisualizationService';
import '../../styles/DataVisualization.css'

export default function YieldTrendsChart({ theme }) {
  const [yieldData, setYieldData] = useState(null);
  const [cropDistribution, setCropDistribution] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timePeriod, setTimePeriod] = useState('monthly');
  const [selectedCrop, setSelectedCrop] = useState('all');
  const [showCharts, setShowCharts] = useState(true);

  useEffect(() => {
    fetchChartData();
  }, [timePeriod]);

  const fetchChartData = async () => {
    try {
      setLoading(true);
      
      // Fetch real data from your services
      const [yieldTrends, cropDist] = await Promise.all([
        getYieldTrends(timePeriod),
        getCropDistribution()
      ]);

      // Use actual data or fallback to transformed mock data
      const transformedYieldData = yieldTrends.data || getMockYieldData();
      const transformedCropDist = cropDist.data || getMockCropDistribution();

      setYieldData(transformedYieldData);
      setCropDistribution(transformedCropDist);
    } catch (error) {
      console.error('Error fetching chart data:', error);
      // Fallback to mock data
      setYieldData(getMockYieldData());
      setCropDistribution(getMockCropDistribution());
    } finally {
      setLoading(false);
    }
  };

  // Mock data fallback (remove when APIs are ready)
  const getMockYieldData = () => ({
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
    datasets: [
      {
        label: 'Maize',
        data: [1200, 1900, 1500, 2100, 1800, 2200, 2400, 2600],
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4
      },
      {
        label: 'Beans',
        data: [800, 1200, 900, 1100, 1000, 1300, 1500, 1700],
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4
      },
      {
        label: 'Tomatoes',
        data: [400, 600, 500, 700, 650, 800, 900, 1000],
        borderColor: '#EF4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.4
      }
    ]
  });

  const getMockCropDistribution = () => ({
    labels: ['Maize', 'Beans', 'Tomatoes', 'Cabbage', 'Potatoes', 'Other'],
    data: [35, 25, 15, 12, 8, 5],
    colors: ['#10B981', '#3B82F6', '#EF4444', '#8B5CF6', '#F59E0B', '#6B7280']
  });

  const calculateGrowthRate = (current, previous) => {
    if (!previous || previous === 0) return 0;
    return ((current - previous) / previous * 100).toFixed(1);
  };

  if (!showCharts) {
    return (
      <div className={`yield-charts-minimized ${theme}`}>
        <div className="minimized-header">
          <h3>Yield Trends & Analytics</h3>
          <button 
            className={`toggle-charts-btn ${theme}`}
            onClick={() => setShowCharts(true)}
          >
            Show Yield Analytics
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={`yield-charts-loading ${theme}`}>
        <div className="loading-spinner"></div>
        <p>Loading yield analytics...</p>
      </div>
    );
  }

  return (
    <div className={`yield-trends-chart ${theme}`}>
      <div className="charts-header">
        <div className="header-main">
          <h3>Yield Trends & Analytics</h3>
          <p>Track crop yield performance and distribution across your municipality</p>
        </div>
        <div className="chart-controls">
          <select 
            value={timePeriod}
            onChange={(e) => setTimePeriod(e.target.value)}
            className={`chart-select ${theme}`}
          >
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
            <option value="yearly">Yearly</option>
          </select>
          <select 
            value={selectedCrop}
            onChange={(e) => setSelectedCrop(e.target.value)}
            className={`chart-select ${theme}`}
          >
            <option value="all">All Crops</option>
            <option value="maize">Maize</option>
            <option value="beans">Beans</option>
            <option value="tomatoes">Tomatoes</option>
          </select>
          <button 
            className={`toggle-charts-btn ${theme}`}
            onClick={() => setShowCharts(false)}
          >
            Hide Charts
          </button>
        </div>
      </div>

      <div className="charts-grid">
        {/* Yield Trends Line Chart */}
        <div className={`chart-container large ${theme}`}>
          <h4>Crop Yield Trends (kg)</h4>
          <div className="line-chart-visual">
            <div className="chart-areas">
              {yieldData?.datasets?.map((dataset, index) => (
                <div key={dataset.label} className="chart-area">
                  <div className="area-label">{dataset.label}</div>
                  <div className="area-bars">
                    {dataset.data.map((value, valueIndex) => (
                      <div 
                        key={valueIndex}
                        className="area-bar"
                        style={{
                          height: `${(value / 3000) * 100}%`,
                          backgroundColor: dataset.backgroundColor
                        }}
                        title={`${dataset.label}: ${value}kg`}
                      >
                        <div className="bar-value">{value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="chart-labels">
              {yieldData?.labels?.map((label, index) => (
                <div key={label} className="chart-label">{label}</div>
              ))}
            </div>
          </div>
          <div className="chart-stats">
            <div className="stat-item">
              <span className="stat-label">Total Production</span>
              <span className="stat-value">
                {yieldData?.datasets?.reduce((total, dataset) => 
                  total + dataset.data.reduce((sum, val) => sum + val, 0), 0
                ).toLocaleString()} kg
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Avg Monthly Growth</span>
              <span className="stat-value positive">+12.5%</span>
            </div>
          </div>
        </div>

        {/* Crop Distribution Pie Chart */}
        <div className={`chart-container ${theme}`}>
          <h4>Crop Distribution</h4>
          <div className="pie-chart-visual">
            <div className="pie-chart">
              {cropDistribution?.data?.map((percentage, index) => (
                <div 
                  key={index}
                  className="pie-segment"
                  style={{
                    backgroundColor: cropDistribution.colors[index],
                    transform: `rotate(${cropDistribution.data.slice(0, index).reduce((a, b) => a + b, 0) * 3.6}deg)`,
                    clipPath: `conic-gradient(from 0deg at 50% 50%, ${cropDistribution.colors[index]} 0% ${percentage}%, transparent ${percentage}% 100%)`
                  }}
                ></div>
              ))}
            </div>
            <div className="pie-legend">
              {cropDistribution?.labels?.map((label, index) => (
                <div key={label} className="legend-item">
                  <div 
                    className="legend-color"
                    style={{ backgroundColor: cropDistribution.colors[index] }}
                  ></div>
                  <span className="legend-label">{label}</span>
                  <span className="legend-percentage">{cropDistribution.data[index]}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className={`chart-container ${theme}`}>
          <h4>Performance Metrics</h4>
          <div className="performance-metrics">
            <div className="metric-card">
              <div className="metric-icon"></div>
              <div className="metric-content">
                <h5>Highest Yield</h5>
                <div className="metric-value">2,600 kg</div>
                <div className="metric-crop">Maize (Aug)</div>
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-icon"></div>
              <div className="metric-content">
                <h5>Average Yield</h5>
                <div className="metric-value">1,450 kg</div>
                <div className="metric-crop">Per Crop/Month</div>
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-icon"></div>
              <div className="metric-content">
                <h5>Active Crops</h5>
                <div className="metric-value">6</div>
                <div className="metric-crop">Types Cultivated</div>
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-icon"></div>
              <div className="metric-content">
                <h5>Growth Rate</h5>
                <div className="metric-value positive">+15.2%</div>
                <div className="metric-crop">Since Last Month</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}