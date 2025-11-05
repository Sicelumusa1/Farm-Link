import React, { useState, useEffect } from 'react';
import { getCropAnalytics, getCropsByFarm } from '../../services/ProduceService';
import '../../styles/CropPerformanceCharts.css'


export default function CropPerformanceCharts({ theme }) {
  const [selectedCrop, setSelectedCrop] = useState('all');
  const [timePeriod, setTimePeriod] = useState('monthly');
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCharts, setShowCharts] = useState(true); // Toggle state

  useEffect(() => {
    fetchAnalyticsData();
  }, [selectedCrop, timePeriod]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      // Mock data - replace with actual API call
      const mockChartData = {
        yieldTrends: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          datasets: [
            {
              label: 'Maize',
              data: [1200, 1900, 1500, 2100, 1800, 2200],
              borderColor: '#10B981',
              backgroundColor: 'rgba(16, 185, 129, 0.1)'
            },
            {
              label: 'Beans',
              data: [800, 1200, 900, 1100, 1000, 1300],
              borderColor: '#3B82F6',
              backgroundColor: 'rgba(59, 130, 246, 0.1)'
            }
          ]
        },
        cropDistribution: {
          labels: ['Maize', 'Beans', 'Tomatoes', 'Cabbage', 'Other'],
          data: [35, 25, 15, 12, 13]
        },
        growthStages: {
          labels: ['Planting', 'Vegetative', 'Flowering', 'Fruiting', 'Harvesting'],
          data: [10, 25, 20, 30, 15]
        }
      };
      
      setChartData(mockChartData);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!showCharts) {
    return (
      <div className={`charts-minimized ${theme}`}>
        <div className="charts-minimized-header">
          <h3>Crop Performance Analytics</h3>
          <button 
            className={`toggle-charts-btn ${theme}`}
            onClick={() => setShowCharts(true)}
          >
            Show Analytics
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={`charts-loading ${theme}`}>
        <div className="loading-spinner"></div>
        <p>Loading performance charts...</p>
      </div>
    );
  }

  if (!chartData) {
    return (
      <div className={`no-chart-data ${theme}`}>
        <p>No analytics data available.</p>
      </div>
    );
  }

  return (
    <div className={`crop-performance-charts ${theme}`}>
      <div className="charts-header">
        <h3>Crop Performance Analytics</h3>
        <div className="charts-header-controls">
          <div className="chart-controls">
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
            <select 
              value={timePeriod}
              onChange={(e) => setTimePeriod(e.target.value)}
              className={`chart-select ${theme}`}
            >
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
            </select>
          </div>
          <button 
            className={`toggle-charts-btn ${theme}`}
            onClick={() => setShowCharts(false)}
          >
            Hide Analytics
          </button>
        </div>
      </div>

      <div className="charts-grid">
        {/* Yield Trends Chart */}
        <div className={`chart-container ${theme}`}>
          <h4>Yield Trends (kg)</h4>
          <div className="simple-chart">
            {chartData.yieldTrends.labels.map((month, index) => (
              <div key={month} className="chart-bar-group">
                <div className="chart-bar-label">{month}</div>
                <div className="chart-bars">
                  {chartData.yieldTrends.datasets.map(dataset => (
                    <div 
                      key={dataset.label}
                      className="chart-bar"
                      style={{
                        height: `${(dataset.data[index] / 2500) * 100}%`,
                        backgroundColor: dataset.backgroundColor
                      }}
                      title={`${dataset.label}: ${dataset.data[index]}kg`}
                    ></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="chart-legend">
            {chartData.yieldTrends.datasets.map(dataset => (
              <div key={dataset.label} className="legend-item">
                <div 
                  className="legend-color" 
                  style={{ backgroundColor: dataset.borderColor }}
                ></div>
                <span>{dataset.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Crop Distribution */}
        <div className={`chart-container ${theme}`}>
          <h4>Crop Distribution</h4>
          <div className="pie-chart-simple">
            {chartData.cropDistribution.labels.map((crop, index) => (
              <div key={crop} className="pie-segment">
                <div 
                  className="segment"
                  style={{
                    backgroundColor: ['#10B981', '#3B82F6', '#EF4444', '#8B5CF6', '#6B7280'][index],
                    width: `${chartData.cropDistribution.data[index]}%`
                  }}
                ></div>
                <span className="segment-label">
                  {crop}: {chartData.cropDistribution.data[index]}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Growth Stages */}
      <div className={`chart-container full-width ${theme}`}>
        <h4>Growth Stages Distribution</h4>
        <div className="growth-stages-chart">
          {chartData.growthStages.labels.map((stage, index) => (
            <div key={stage} className="stage-item">
              <span className="stage-label">{stage}</span>
              <div className="stage-bar-container">
                <div 
                  className="stage-bar"
                  style={{
                    width: `${chartData.growthStages.data[index]}%`,
                    backgroundColor: ['#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EF4444'][index]
                  }}
                ></div>
              </div>
              <span className="stage-percentage">{chartData.growthStages.data[index]}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="key-metrics">
        <div className={`metric-card ${theme}`}>
          <h5>Total Production</h5>
          <div className="metric-value">12,560 kg</div>
          <div className="metric-trend positive">+15% from last month</div>
        </div>
        <div className={`metric-card ${theme}`}>
          <h5>Average Yield/Farm</h5>
          <div className="metric-value">86.4 kg</div>
          <div className="metric-trend positive">+8% improvement</div>
        </div>
        <div className={`metric-card ${theme}`}>
          <h5>Harvest Efficiency</h5>
          <div className="metric-value">78%</div>
          <div className="metric-trend neutral">Maintained</div>
        </div>
        <div className={`metric-card ${theme}`}>
          <h5>Market Ready</h5>
          <div className="metric-value">8,420 kg</div>
          <div className="metric-trend positive">+22% available</div>
        </div>
      </div>
    </div>
  );
}