import React, { useState, useEffect, useContext } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUsers, 
  faCheckCircle, 
  faSeedling, 
  faBox, 
  faChartLine, 
  faBalanceScale 
} from '@fortawesome/free-solid-svg-icons';
// import { ThemeContext } from '../contexts/ThemeContext';
// import { getDashboardStats } from '../services/dashboardService';

export default function DashboardStats({ theme }) {
  return (
    <div className={`dashboard-stats ${theme}`}>
      <div className="stats-grid">
        {/* Total Farmers */}
        <div className={`stat-card ${theme}`}>
          <div className="stat-icon">
            <FontAwesomeIcon icon={faUsers} />
          </div>
          <div className="stat-content">
            <h3 className="stat-value">156</h3>
            <p className="stat-label">Total Farmers</p>
            <div className="stat-trend">
              <span className="trend-positive">
                <FontAwesomeIcon icon={faChartLine} /> +142 active
              </span>
            </div>
          </div>
        </div>

        {/* Active Farmers */}
        <div className={`stat-card ${theme}`}>
          <div className="stat-icon">
            <FontAwesomeIcon icon={faCheckCircle} />
          </div>
          <div className="stat-content">
            <h3 className="stat-value">142</h3>
            <p className="stat-label">Active Farmers</p>
            <div className="stat-trend">
              <span className="trend-positive">
                <FontAwesomeIcon icon={faChartLine} /> 91% active
              </span>
            </div>
          </div>
        </div>

        {/* Total Crops */}
        <div className={`stat-card ${theme}`}>
          <div className="stat-icon">
            <FontAwesomeIcon icon={faSeedling} />
          </div>
          <div className="stat-content">
            <h3 className="stat-value">89</h3>
            <p className="stat-label">Active Crops</p>
            <div className="stat-trend">
              <span className="trend-neutral">
                Across all farms
              </span>
            </div>
          </div>
        </div>

        {/* Total Yield */}
        <div className={`stat-card ${theme}`}>
          <div className="stat-icon">
            <FontAwesomeIcon icon={faBox} />
          </div>
          <div className="stat-content">
            <h3 className="stat-value">12,560 kg</h3>
            <p className="stat-label">Total Yield</p>
            <div className="stat-trend">
              <span className="trend-positive">
                <FontAwesomeIcon icon={faBalanceScale} /> Avg: 86.4 kg/farm
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}